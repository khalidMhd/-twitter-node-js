const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const db = require("./config/keys");
const fcm = require("./controllers/fcm");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "assets", "uploads")));

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/file"));
app.use("/api", require("./routes/user"));
app.use("/api", require("./routes/poll"));
app.use("/api", require("./routes/tweet"));
app.use("/api", require("./routes/scheduleTweet"));
app.use("/api", require("./routes/bookmark"));

app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found!" });
});

app.listen(PORT, () => {
  console.log(`App leston on PORT: ${PORT}`);
});
