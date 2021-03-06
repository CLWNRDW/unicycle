import * as prettier from 'prettier'

export type CSSMediaQuery = string // conditions

export interface CSSChunk {
  mediaQueries: string[]
  css: string
  scopedCSS?: string
}

export interface PostCSSPosition {
  column: number
  line: number
}

export interface PostCSSNode {
  type: 'root' | 'atrule' | 'rule' | 'decl' | 'comment'
  source: {
    input: {
      css: string
      id: string
    }
    start: PostCSSPosition
    end: PostCSSPosition
  }
  nodes?: PostCSSNode[]
}

export interface PostCSSRoot extends PostCSSNode {
  type: 'root'
}

export interface PostCSSAtRule extends PostCSSNode {
  type: 'atrule'
  name: string
  params: string
}

export interface PostCSSRule extends PostCSSNode {
  type: 'rule'
  selector: string
  ids?: string[] // custom: media query ids
}

export interface PostCSSDeclaration extends PostCSSNode {
  type: 'decl'
  prop: string
  value: string
}

export interface PostCSSComment extends PostCSSNode {
  type: 'comment'
  text: string
}

export interface SassResult {
  css: string
  map: sourceMap.RawSourceMap
  ast: PostCSSRoot
}

export interface Media {
  type?: string
  orientation?: string
  width?: string
  height?: string
}

export interface DiffImage {
  file: string
  resolution: string
  width: number
  height: number
  align: string
  adjustWidthPreview: boolean
}

export interface State {
  id?: string
  name: string
  hidden?: boolean
  props: { [index: string]: any }
  media?: Media
  diffImage?: DiffImage
}

export type States = State[]

export interface GeneratedCode {
  path: string
  code: string
  embeddedStyle: boolean
}

export interface ObjectStringToString {
  [index: string]: string
}

export type ErrorHandler = (e: Error) => void

export interface ComponentMetadata {
  name: string
}

export interface Metadata {
  components: ComponentMetadata[]
  general?: {
    prettier?: prettier.Options
  }
  web?: {
    dir: string
    framework: string
    style: string
    language: string
    // browserlist
  }
  reactNative?: {
    dir: string
    language: string
    iOS: boolean
    android: boolean
  }
  email?: {
    dir: string
    language: string
    inky: boolean
  }
}

export interface ReactAttributes {
  [index: string]: string | CssObject
}

export interface CssObject {
  [index: string]: string | number
}

export interface StripedCSS {
  mediaQueries: {
    [index: string]: CSSMediaQuery
  }
  chunks: CSSChunk[]
}

export interface StylePaletteEntity {
  name: string
  value: string
  hover?: string
}

export interface StylePalette {
  fonts: StylePaletteEntity[]
  colors: StylePaletteEntity[]
  shadows: StylePaletteEntity[]
  animations: StylePaletteEntity[]
}

export const INCLUDE_PREFIX = 'include:'

export const componentDataAttribute = (name: string) =>
  `data-unicycle-component-${name.toLocaleLowerCase()}`

export type AntPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'rightBottom'
  | 'rightTop'
  | 'leftTop'
  | 'leftBottom'

export type AntButtonType = 'ghost' | 'primary' | 'dashed' | 'danger' | undefined
