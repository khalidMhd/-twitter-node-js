const express = require("express");
const router = express.Router();
const { postTweet, getTweet, postComment, like, reTweet, tweets, deleteTweet, getTweetByUser, searchTweet } = require("../controllers/tweet");
const loginRequire = require("../middleware/jwt/loginRequire");

router.post("/tweet", loginRequire, postTweet);
router.get("/tweet", loginRequire, getTweet);
router.get("/tweet-by-user/:userId", getTweetByUser);
router.post("/comment", loginRequire, postComment);
router.post("/like", loginRequire, like);
router.post("/retweet", loginRequire, reTweet);
router.post("/search-tweet", searchTweet);
//dashboard
router.post("/tweets-search", tweets);
router.post("/delete-tweet", deleteTweet);

module.exports = router;
