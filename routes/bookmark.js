const express = require("express");
const router = express.Router();
const {
  postTweet,
  getTweet,
  postComment,
  like,
  reTweet,
  tweets,
  deleteTweet,
  getTweetByUser,
  searchTweet,
} = require("../controllers/tweet");
const loginRequire = require("../middleware/jwt/loginRequire");
const { getBookmark, bookmark } = require("../controllers/bookmark");

router.get("/getBookmark", loginRequire, getBookmark);
router.post("/bookmark", loginRequire, bookmark);

module.exports = router;
