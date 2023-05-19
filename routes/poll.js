const express = require("express");
const router = express.Router();
const loginRequire = require("../middleware/jwt/loginRequire");
const { postPoll, castVote } = require("../controllers/poll");

router.post("/poll", loginRequire, postPoll);
router.post("/cast-vote", loginRequire, castVote);

module.exports = router;
