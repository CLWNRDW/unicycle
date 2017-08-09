const React = require('react')
const ReactDOM = require('react-dom')
const h = require('react-hyperscript')
const {
  div,
  span,
  p,
  ul,
  li,
  a,
  input,
  i,
  header,
  button,
  section,
  label,
  footer
} = require('hyperscript-helpers')(h)

const Modal = require('./modal')

class Menu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isCreateComponentOpen: false,
      createComponentName: '',
      activeComponent: '2'
    }
    this.onClick = this.onClick.bind(this)
  }

  onClick(e) {}

  render() {
    const components = [
      {
        id: '1',
        name: 'Profile'
      },
      {
        id: '2',
        name: 'Sign up'
      }
    ]
    return div([
      h(Modal, {
        title: 'New component',
        isOpen: this.state.isCreateComponentOpen,
        onCancel: () => this.setState({ isCreateComponentOpen: false }),
        onAccept: () => {
          this.setState({
            isCreateComponentOpen: false,
            createComponentName: ''
          })
        },
        acceptText: 'Create component',
        body: div('.field', [
          div('.control', [
            label('.label', ['Name']),
            input('.input', {
              type: 'text',
              value: this.state.createComponentName,
              placeholder: 'ComponentName',
              onChange: e =>
                this.setState({ createComponentName: e.target.value })
            })
          ])
        ])
      }),
      p('.menu-label', 'Globals'),
      ul('.menu-list', [
        li([a('Colors')]),
        li([a('Fonts')]),
        li([a('Images')])
      ]),
      p('.menu-label', 'Components'),
      ul(
        '.menu-list',
        components.map(component =>
          li([
            a(
              this.state.activeComponent === component.id ? '.is-active' : '.not-active',
              { onClick: () => this.setState({ activeComponent: component.id }) },
              component.name
            )
          ])
        )
      ),
      p('.new-component', [
        a(
          '.button.is-outlined.is-primary',
          {
            onClick: () => this.setState({ isCreateComponentOpen: true })
          },
          [span('.icon', [i('.fa.fa-plus')]), span('New component')]
        )
      ]),
      input('.input.is-small', { type: 'text', placeholder: 'search' })
    ])
  }
}

ReactDOM.render(React.createElement(Menu, {}), document.getElementById('menu'))
