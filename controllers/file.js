const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

//upload file
exports.uplaodSingleFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(200).json({ message: "Please upload the file" });
    }
    const url = await `${req.headers.host}/${req.file.filename}`;
    const fileName = await req.file.originalname;
    res
      .status(200)
      .json({ message: "File uplaoded", name: fileName, url: url });
  } catch (error) {
    return res.status(200).json({ message: "Unable to upload" });
  }
};

exports.uplaodFiles = async (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(200).json({ message: "Please upload the file" });
    }
    const host = await req.headers.host;
    const files = await req.files.map((result) => {
      return { name: result.originalname, url: `${host}/${result.filename}` };
    });
    res.status(200).json({ message: "File uplaoded", files });
  } catch (error) {
    return res.status(200).json({ message: "Unable to upload" });
  }
};

//download file
exports.downloadFile = (req, res, next) => {
  try {
    const date = Date.now();
    const fileName = "image-" + date + ".jpg";
    const imagePath = path.join(
      "assets",
      "uploads",
      "1672210041046_V8  Architecture.png"
    );
    const imageStream = fs.createReadStream(imagePath);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "image/jpeg");
    imageStream.pipe(res);
  } catch (error) {
    return res.status(200).json({ message: "Unable to download" });
  }
};
