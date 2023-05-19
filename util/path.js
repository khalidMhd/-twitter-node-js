const path = require("path")

// path.join(__dirname, "..", "folder", "file")

module.exports = path.dirname(process.mainModule.filename)

// import
// const rootDir = require(../util/path)
// path.join(rootDir, "folder", "file")