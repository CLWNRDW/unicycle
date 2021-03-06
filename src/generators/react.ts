import * as parse5 from 'parse5'
import * as prettier from 'prettier'

import Component from '../component'
import css2obj from '../css2obj'
import { GeneratedCode, INCLUDE_PREFIX } from '../types'
import { docComment, toReactAttributeName, toReactEventName, uppercamelcase } from '../utils'

const camelcase = require('camelcase')

const generateReact = (
  componentNames: string[],
  information: Component,
  options?: prettier.Options
): GeneratedCode => {
  const { data, markup } = information
  const states = data.getStates()
  const componentName = uppercamelcase(information.name)
  const eventHandlers = markup.calculateEventHanlders()
  const typer = information.calculateTyper(true)

  const keys = states.reduce((set: Set<string>, value) => {
    Object.keys(value.props).forEach(key => set.add(key))
    return set
  }, new Set<string>())

  const example = () => {
    const firstState = states[0]
    if (!firstState || !firstState.props) return ''
    const { props } = firstState
    let codeExample = `class MyContainer extends Component {
      render() {
      return <${componentName}`
    Object.keys(props).forEach(key => {
      const value = props[key]
      if (typeof value === 'string') {
        codeExample += ` ${key}=${JSON.stringify(value)}`
      } else if (typeof value === 'number') {
        codeExample += ` ${key}=${value}`
      } else if (typeof value === 'boolean') {
        if (value) {
          codeExample += ` ${key}`
        } else {
          codeExample += ` ${key}={${value}}`
        }
      } else {
        codeExample += ` ${key}={${JSON.stringify(value)}}`
      }
    })
    for (const key of eventHandlers.keys()) {
      codeExample += ` ${key}={() => {}}`
    }
    codeExample += '/> } }'
    return prettier.format(codeExample, options)
  }

  const exampleCode = example()
  const lines = ['This file was generated automatically. Do not change it. Use composition instead']
  if (exampleCode) {
    lines.push('')
    lines.push('This is an example of how to use the generated component:')
    lines.push('')
    lines.push(exampleCode)
  }
  const comment = docComment(lines.join('\n'))

  const dependencies = new Set<string>()

  const renderNode = (node: parse5.AST.Default.Node) => {
    if (node.nodeName === '#text') {
      const textNode = node as parse5.AST.Default.TextNode
      return textNode.value
    }
    const element = node as parse5.AST.Default.Element
    if (!element.childNodes) return ''
    const calculateElementName = () => {
      const elemName = node.nodeName
      if (!node.nodeName.startsWith(INCLUDE_PREFIX)) {
        return {
          name: elemName,
          custom: false
        }
      }
      const name = camelcase(elemName.substring(INCLUDE_PREFIX.length))
      const canonicalName = componentNames.find(comp => comp.toLowerCase() === name) || name
      dependencies.add(canonicalName)
      return {
        name: canonicalName,
        custom: true
      }
    }
    const toString = () => {
      const elementInfo = calculateElementName()
      let elementCode = `<${elementInfo.name}`
      element.attrs.forEach(attr => {
        if (attr.name.startsWith(':')) return
        if (attr.name.startsWith('@on')) {
          const required = attr.name.endsWith('!')
          const eventName = toReactEventName(
            attr.name.substring(1, attr.name.length - (required ? 1 : 0))
          )
          if (eventName) {
            elementCode += ` ${eventName}={${attr.value}}`
          }
        }
        if (attr.name.startsWith('@')) return
        const name = elementInfo.custom ? attr.name : toReactAttributeName(attr.name)
        if (name === 'style') {
          elementCode += ` ${name}={${JSON.stringify(css2obj(attr.value))}}`
        } else if (name) {
          elementCode += ` ${name}="${attr.value}"`
        }
      })
      element.attrs.forEach(attr => {
        if (!attr.name.startsWith(':')) return
        const attrName = attr.name.substring(1)
        const name = elementInfo.custom ? attrName : toReactAttributeName(attrName)
        if (name) {
          const expression = attr.value
          elementCode += ` ${name}={${expression}}`
        }
      })
      elementCode += '>'
      element.childNodes.forEach(childNode => (elementCode += renderNode(childNode)))
      elementCode += `</${elementInfo.name}>`
      return elementCode
    }
    let basicMarkup = toString()

    const ifs = element.attrs.find(attr => attr.name === '@if')
    const loop = element.attrs.find(attr => attr.name === '@loop')
    const as = element.attrs.find(attr => attr.name === '@as')
    if (loop && as) {
      basicMarkup = `{(${loop.value}).map((${as.value}, i) => ${basicMarkup})}` // TODO: key attr
    }
    if (ifs) {
      basicMarkup = `{(${ifs.value}) && (${basicMarkup})}`
    }
    return basicMarkup
  }

  const renderReturn = renderNode(markup.getDOM().childNodes[0])

  let code = `${comment}
  import React from 'react';
  import PropTypes from 'prop-types'; // eslint-disable-line no-unused-vars
  import './styles.css';
  ${[...dependencies].map(dep => `import ${dep} from '../${dep}';`).join('\n')}

  const ${componentName} = (props) => {`

  if (keys.size > 0) {
    code += `const {${Array.from(keys)
      .concat(Array.from(eventHandlers.keys()))
      .join(', ')}} = props;`
  }

  code += 'return ' + renderReturn
  code += '}\n\n'
  code += typer.createPropTypes(`${componentName}.propTypes`)
  code += '\n\n'
  code += 'export default ' + componentName
  try {
    return {
      code: prettier.format(code, options),
      path: componentName + '/index.jsx',
      embeddedStyle: false
    }
  } catch (err) {
    console.log('code', code)
    console.error(err)
    throw err
  }
}

export default generateReact
