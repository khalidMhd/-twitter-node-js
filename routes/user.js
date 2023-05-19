const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  follow,
  unFollow,
  profile,
  userSearch,
  changeProfile,
  users,
  deleteUsers,
  changeProfilePic,
  userGraph,
} = require("../controllers/user");
const loginRequire = require("../middleware/jwt/loginRequire");

router.post("/change-profile-pic", loginRequire, changeProfilePic);
router.post("/change-profile", loginRequire, changeProfile);
router.post("/follow", loginRequire, follow);
router.post("/unfollow", loginRequire, unFollow);
router.get("/profile/:userId", loginRequire, profile);
router.post("/user-search", userSearch);
//dashboard
router.get("/user-graph", userGraph);
router.get("/users", users);
router.post("/user-delete", deleteUsers);
module.exports = router;
