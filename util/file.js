const fs = require("fs");

exports.deleteFile = (filePath) => {
  try {
    fs.unlink(`./assets/${filePath}`);
  } catch (error) {
    return false;
  }
};
