const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

// 遍历目录
function walk(currentDirPath, callback) {
  fs.readdir(currentDirPath, (err, files) => {
    if (err) {
      throw new Error(err)
    }
    files.forEach(name => {
      const filePath = path.join(currentDirPath, name)
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        callback(filePath, stat)
      } else if (stat.isDirectory()) {
        walk(filePath, callback)
      }
    })
  })
}

// 读取文件
const readFile = promisify(fs.readFile)

const readFileSync = (filePath, char = 'utf-8') =>
  fs.readFileSync(filePath, char)

// 路径是不是文件
const isFile = filePath => {
  try {
    const stats = fs.statSync(filePath)
    return stats.isFile()
  } catch (error) {
    console.log(__dirname, '-->', error)
  }
}

// 是不是vue文件
const isVueFile = filePath => {
  return path.extname(filePath) === '.vue'
}

module.exports = {
  walk,
  readFile,
  readFileSync,
  isFile,
  isVueFile,
}
