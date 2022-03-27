const { declare } = require('@babel/helper-plugin-utils')
const doctrine = require('doctrine')
const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')
const renderer = require('../renderer')

function parseComment(commentStr) {
  // console.log('parseComment', commentStr)
  if (!commentStr) {
    return
  }
  const p = doctrine.parse(commentStr, {
    unwrap: true,
  })
  // console.log('p', p)
  return doctrine.parse(commentStr, {
    unwrap: true,
  })
}

function generate(docs, format = 'json') {
  if (format === 'markdown') {
    return {
      ext: '.md',
      content: renderer.markdown(docs),
    }
  } else if (format === 'html') {
    return {
      ext: 'html',
      content: renderer.html(docs),
    }
  } else {
    return {
      ext: 'json',
      content: renderer.json(docs),
    }
  }
}

function resolveType(tsType) {
  const typeAnnotation = tsType.typeAnnotation
  if (!typeAnnotation) {
    return
  }
  switch (typeAnnotation.type) {
    case 'TSStringKeyword':
      return 'string'
    case 'TSNumberKeyword':
      return 'number'
    case 'TSBooleanKeyword':
      return 'boolean'
  }
}

const autoDocumentPlugin = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    pre(file) {
      file.set('docs', [])
    },
    visitor: {
      ImportDeclaration(path, state) {
        console.log(path.get('source').toString()) // vue-property-decorator
      },
      ClassDeclaration(path, state) {
        const docs = state.file.get('docs')
        const classInfo = {
          type: 'class',
          name: path.get('id').toString(),
          constructorInfo: {},
          methodsInfo: [],
          propertiesInfo: [],
        }
        if (path.node.leadingComments) {
          classInfo.doc = parseComment(path.node.leadingComments[0].value)
        }
        path.traverse({
          ClassProperty(path) {
            console.log('decorators-->', path.node?.decorators?.[0]?.type)
            if (!path.node.decorators) {
              return
            }
            const arr = []
            path.traverse({
              enter(path) {
                // console.log(`enter ${path.type}(${path.key})`)
                // const leix = []
                // 获取ts类型
                // if (path.type.startsWith('TSTypeAnnotation')) {
                //   // 是否存在 path.node.typeAnnotation.types
                //   if (Array.isArray(path.node.typeAnnotation.types)) {
                //     path.node.typeAnnotation.types.map(i => leix.push(i.type))
                //   } else {
                //     leix.push(path.node.typeAnnotation.type)
                //   }
                //   console.log('-->', leix)
                // }
                // 获取 @Prop(String) 中的 string
                // if (path.type == 'Decorator') {
                //   console.log('----->', path.node.expression.arguments[0].name)
                //   path.traverse({
                //     enter(path) {
                //       console.log(`enter --> ${path.type}(${path.key})`)
                //     },
                //   })
                // }
              },
              Decorator(path, state) {
                // console.log('Decorator', path.node.expression.arguments)

                if (path.node.expression.arguments[0].type === 'Identifier') {
                  arr.push(path.node.expression.arguments[0].name)
                }

                if (
                  path.node.expression.arguments[0].type === 'ObjectExpression'
                ) {
                  // arr.push(path.node.expression.arguments[0].name)
                  path.traverse({
                    ObjectProperty(path, state) {
                      arr.push({
                        key: path.get('key').toString(),
                        value: path.get('value').toString(),
                      })
                    },
                  })
                }

                if (
                  path.node.expression.arguments[0].type === 'ArrayExpression'
                ) {
                  // arr.push(path.node.expression.arguments[0].name)
                  path.traverse({
                    Identifier(path, state) {
                      if (path.node.name !== 'Prop') {
                        arr.push(path.node.name)
                      }
                    },
                  })
                }
              },
            })
            console.log('enter-over')
            classInfo.propertiesInfo.push({
              name: path.get('key').toString(),
              type: resolveType(path.getTypeAnnotation()),
              value: arr,
              doc: [path.node.leadingComments, path.node.trailingComments]
                .filter(Boolean)
                .map(comment => {
                  return parseComment(comment.value)
                })
                .filter(Boolean),
            })
          },
          ClassMethod(path) {
            if (path.node.kind === 'constructor') {
              classInfo.constructorInfo = {
                params: path.get('params').map(paramPath => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                    doc: parseComment(path.node.leadingComments[0].value),
                  }
                }),
              }
            } else {
              classInfo.methodsInfo.push({
                name: path.get('key').toString(),
                doc: parseComment(path.node.leadingComments?.[0].value),
                params: path.get('params').map(paramPath => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                  }
                }),
                return: resolveType(path.getTypeAnnotation()),
              })
            }
          },
        })
        docs.push(classInfo)
        state.file.set('docs', docs)
      },
    },
    post(file) {
      const docs = file.get('docs')
      console.log('docs', docs)
      // console.log('docs', JSON.stringify(docs))
      fs.writeFileSync(
        '/Users/jarvis/Desktop/Y/babel-study/babel/babel-study/vue-comlier/docs.json',
        JSON.stringify(docs)
      )
      // const res = generate(docs, options.format)
      // fse.ensureDirSync(options.outputDir)
      // fse.writeFileSync(
      //   path.join(options.outputDir, 'docs' + res.ext),
      //   res.content
      // )
    },
  }
})

module.exports = autoDocumentPlugin
