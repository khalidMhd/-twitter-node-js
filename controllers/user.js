const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateJWT } = require("../middleware/jwt/generateJWT");
const { parseJwt } = require("../middleware/jwt/parseJWT");
const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { userModel } = require("../models/user");

exports.changeProfilePic = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { imageURL } = req.body;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const userMatch = await userModel.findOne({
      _id: _id,
    });

    if (userMatch) {
      userMatch.imageURL = `http://${imageURL}`;
      await userMatch.save();
      return res.status(200).json({ message: "Profile updated" });
    } else {
      return res.status(200).json({ message: "User unable to update" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.changeProfile = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { name, cellNo, location, address, education, bio, isNotify } =
      req.body;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(200).json({ message: "User not valid!" });
    }
    const userMatch = await userModel.findOne({
      _id: _id,
    });

    if (userMatch) {
      userMatch.name = name;
      userMatch.cellNo = cellNo;
      userMatch.location = location;
      userMatch.address = address;
      userMatch.education = education;
      userMatch.bio = bio;
      userMatch.isNotify = isNotify;
      const upd = await userMatch.save();
      return res.status(200).json({ message: "Profile updated" });
    } else {
      return res.status(200).json({ message: "User unable to update" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.follow = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { followId } = req.body;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id || !followId) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }

    const followersMatch = await userModel.findOne({
      _id: _id,
      following: { $in: followId },
    });
    const followingMatch = await userModel.findOne({
      _id: followId,
      followers: { $in: _id },
    });
    if (followersMatch || followingMatch) {
      return res.status(422).json({ message: "User already followed" });
    } else {
      const following = await userModel.findById(_id);
      const followers = await userModel.findById(followId);
      await followers.followers.push(_id);
      await following.following.push(followId);
      await followers.save();
      await following.save();

      return res.status(201).json({ message: "User following" });
    }
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.unFollow = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { followId } = req.body;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id || !followId) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }

    const followersMatch = await userModel.findOne({
      _id: _id,
      following: { $in: followId },
    });
    const followingMatch = await userModel.findOne({
      _id: followId,
      followers: { $in: _id },
    });
    if (followersMatch || followingMatch) {
      const following = await userModel.findById(_id);
      const followers = await userModel.findById(followId);
      await followers.followers.pop(_id);
      await following.following.pop(followId);
      await followers.save();
      await following.save();

      return res.status(200).json({ message: "User unfollowing" });
    } else {
      return res.status(200).json({ message: "User not followed" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.profile = async (req, res, next) => {
  try {
    const _id = req.params.userId;
    if (!_id) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }

    const followersMatch = await userModel.findById(_id).populate([
      {
        path: "followers",
        populate: [
          {
            path: "followers",
          },
        ],
      },
      {
        path: "following",
        populate: [
          {
            path: "following",
          },
        ],
      },
    ]);
    if (followersMatch) {
      return res.status(200).json({ user: followersMatch });
    } else {
      return res.status(200).json({ message: "User not Found!" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.userSearch = async (req, res, next) => {
  try {
    const query = req.body.query;

    if (!query) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const userPattern = new RegExp("^" + query);
    userModel
      .find({ name: { $regex: query, $options: "i" } })
      .then((user) => {
        if (user.length) {
          return res.status(200).json({ user: user });
        } else {
          return res.status(200).json({ message: "User not found!" });
        }
      })
      .catch((err) => {
        return res.status(200).json({ message: "Unable to process" });
      });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "Unable to process" });
  }
};

// dashboard
exports.userGraph = async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Get the date 7 days ago
    const sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000); // Get the date 7 days ago
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000); // Get the date 5 days ago
    const fourDaysAgo = new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000); // Get the date 4 days ago
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // Get the date 3 days ago
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // Get the date 2 days ago
    const oneDaysAgo = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000); // Get the date 1 days ago

    const oneDayList = await userModel
      .find({
        createdAt: { $gte: oneDaysAgo, $lt: today },
      })
      .select("createdAt");

    const twoDayList = await userModel
      .find({
        createdAt: { $gte: twoDaysAgo, $lt: oneDaysAgo },
      })
      .select("createdAt");

    const threeDayList = await userModel
      .find({
        createdAt: { $gte: threeDaysAgo, $lt: twoDaysAgo },
      })
      .select("createdAt");

    const fourDayList = await userModel
      .find({
        createdAt: { $gte: fourDaysAgo, $lt: threeDaysAgo },
      })
      .select("createdAt");

    const fiveDayList = await userModel
      .find({
        createdAt: { $gte: fiveDaysAgo, $lt: fourDaysAgo },
      })
      .select("createdAt");

    const sixDayList = await userModel
      .find({
        createdAt: { $gte: sixDaysAgo, $lt: fiveDaysAgo },
      })
      .select("createdAt");

    const sevenDayList = await userModel
      .find({
        createdAt: { $gte: sevenDaysAgo, $lt: sixDaysAgo },
      })
      .select("createdAt");

    if (
      (oneDayList ||
        twoDayList ||
        threeDayList ||
        fourDayList ||
        fiveDayList ||
        sixDayList,
      sevenDayList)
    ) {
      const oneDay =
        (await {
          count: oneDayList?.length || 0,
          date: oneDayList[0]?.createdAt || today,
        }) || null;

      const twoDay =
        (await {
          count: twoDayList?.length || 0,
          date: twoDayList[0]?.createdAt || oneDaysAgo,
        }) || null;

      const threeDay =
        (await {
          count: threeDayList?.length || 0,
          date: threeDayList[0]?.createdAt || twoDaysAgo,
        }) || null;

      const fourDay =
        (await {
          count: fourDayList?.length || 0,
          date: fourDayList[0]?.createdAt || threeDaysAgo,
        }) || null;

      const fiveDay =
        (await {
          count: fiveDayList?.length || 0,
          date: fiveDayList[0]?.createdAt || fourDaysAgo,
        }) || null;

      const sixDay =
        (await {
          count: sixDayList?.length || 0,
          date: sixDayList[0]?.createdAt || fiveDaysAgo,
        }) || null;

      const sevenDay =
        (await {
          count: sevenDayList?.length || 0,
          date: sevenDayList[0]?.createdAt || sixDaysAgo,
        }) || null;

      return res.status(200).json({
        oneDay,
        twoDay,
        threeDay,
        fourDay,
        fiveDay,
        sixDay,
        sevenDay,
      });
    } else {
      return res.status(422).json({ message: "User not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.users = async (req, res, next) => {
  try {
    // const { authorization } = req.headers;
    // const { _id } = await userIdFromJWT(authorization);
    // if (!_id) {
    //   return res.status(422).json({ message: "Please fill all the fields!" });
    // }

    const userDetails = await userModel
      .find()
      // .select("name followers following imageURL email ")
      // .populate("followers", "name followers following imageURL")
      // .populate("following", "name followers following imageURL")
      .sort("-createdAt");
    if (userDetails) {
      const transformedUsers = await userDetails.map(function (user) {
        return {
          id: user?._id,
          name: user?.name || "-",
          email: user?.email || "-",
          cellNo: user?.cellNo || "-",
          location: user?.location || "-",
          address: user?.address || "-",
          followings: user?.following.length || "-",
          followers: user?.followers.length || "-",
          lastLoginIp: user?.lastLoginIp || "-",
          device: user?.device || "-",
          phone: user?.phone || "-",
          image: user?.imageURL,
          education: user.education || "-",
          fcmToken: user.fcmToken,
        };
      });
      return res.status(200).json(transformedUsers);
    } else {
      return res.status(422).json({ message: "User not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.deleteUsers = async (req, res, next) => {
  try {
    const { userId } = req.body;
    // const { authorization } = req.headers;
    // const { _id } = await userIdFromJWT(authorization);
    console.log(userId);
    if (!userId) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }

    const userDetails = await userModel.findByIdAndDelete({ _id: userId });
    if (userDetails) {
      return res.status(200).json({ message: "User deleted successfully!" });
    } else {
      return res.status(200).json({ message: "User not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "Unable to process" });
  }
};
