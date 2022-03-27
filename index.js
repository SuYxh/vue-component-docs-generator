const path = require('path')
const { parseComponent } = require('vue-template-compiler')
const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core')
const { isFile, walk, isVueFile, readFileSync } = require('./utils/file')

// 解析参数
function handleParams(params) {
  const defaultParams = {
    // needParsePath: [],
    outputDir: path.resolve(__dirname, './docs'),
    format: 'markdown', // html / json
  }

  // 如果只是字符串，则为vue文件地址或者目录，采用默认配置进行解析
  if (typeof params === 'string') {
    if (isFile(params)) {
      defaultParams.needParsePath = [params]
    } else {
      const needParseFiles = []
      walk(params, filePath => {
        if (isVueFile(filePath)) {
          needParseFiles.push(filePath)
        }
      })
      defaultParams.needParsePath = needParsePath
    }
    return defaultParams
  }

  // 如果是对象，那么进行对象合并
  if (typeof params === 'object') {
    const options = Object.assign({}, defaultParams, params)
    return options
  }
}

// 解析vue文件
function parseVueComponentname(content, options) {
  let autoDocumentPlugin = null
  const result = parseComponent(content)

  if (result.script.content.includes('vue-property-decorator')) {
    autoDocumentPlugin = require('./parse/auto-document-plugin-decorators')
  }

  const ast = parser.parse(result.script.content, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript', 'decorators-legacy'],
  })

  const { code } = transformFromAstSync(ast, result.script.content, {
    plugins: [[autoDocumentPlugin, options]],
  })
}

// 读取vue文件
function readVueFile(options) {
  const { needParsePath } = options

  needParsePath.forEach(filePath => {
    const content = readFileSync(filePath)
    parseVueComponentname(content, options)
  })
}

function generateDocs(params) {
  // 1、解析参数
  const options = handleParams(params)
  // console.log('options', options)
  // 2、 读取vue文件
  readVueFile(options)
}

module.exports = generateDocs
