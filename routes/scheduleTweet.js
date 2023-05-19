const express = require("express");
const router = express.Router();
const loginRequire = require("../middleware/jwt/loginRequire");
const { postScheduleTweet, getSheduleTweet } = require("../controllers/scheduleTweet");

router.post("/schedule-tweet", loginRequire, postScheduleTweet);
router.get("/schedule-tweet", loginRequire, getSheduleTweet);


module.exports = router;
