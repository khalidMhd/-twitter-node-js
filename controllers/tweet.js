const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { userModel } = require("../models/user");
const { tweetModel } = require("../models/tweet");
const { pushNotification } = require("./fcm");

exports.postTweet = async (req, res, next) => {
  try {
    const { content, imageURL, isComment} = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!content || !_id) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const tweetDetails = await new tweetModel({
      postedBy: _id,
      content: content,
      imageURL: imageURL || "",
      isComment: isComment
    });

    const tweetSave = await tweetDetails.save();
    if (tweetSave) {
      pushNotification(tweetSave?.content, _id)
      return res.status(200).json({ message: "Tweet successfully!" });
    } else {
      return res.status(200).json({ message: "Unable to tweet" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.getTweet = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const tweetList = await tweetModel
      // .find({ postedBy: { $in: req.user.followers } })
      .find({isActive:true})
      .populate("poll")
      .populate("postedBy", "_id name imageURL")
      .populate("comments.postedBy", "_id name")
      .populate("reTweet", "_id postedBy content imageURL likes comments")
      .populate({
        path: "reTweet",
        populate: [
          {
            path: "postedBy",
            select: "_id name imageURL",
          },
          {
            path: "comments.postedBy",
            select: "_id name",
          },
        ],
      })
      .sort("-updatedAt");
    if (tweetList.length) {
      return res.status(200).json({ tweet: tweetList });
    }
    return res.status(422).json({ message: "Tweet not found!" });
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.getTweetByUser = async (req, res, next) => {
  try {
    const _id = req.params.userId;
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const tweetList = await tweetModel
      .find({ postedBy: _id, isActive:true })
      .populate("poll")
      .populate("postedBy", "_id name imageURL")
      .populate("comments.postedBy", "_id name")
      .populate("reTweet", "_id postedBy content imageURL likes comments")
      .populate({
        path: "reTweet",
        populate: [
          {
            path: "postedBy",
            select: "_id name imageURL",
          },
          {
            path: "comments.postedBy",
            select: "_id name",
          },
        ],
      })
      .sort("-createdAt");
    if (tweetList.length) {
      return res.status(200).json({ tweet: tweetList });
    }
    return res.status(422).json({ message: "Tweet not found!" });
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const { content, tweetId } = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!content || !_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }

    const tweetDetails = await tweetModel.findOne({ _id: tweetId });

    await tweetDetails.comments.push({ text: content, postedBy: _id });

    const tweetSave = await tweetDetails.save();
    if (tweetSave) {
      return res.status(201).json({ message: "Comment successfully!" });
    } else {
      return res.status(422).json({ message: "Unable to comment" });
    }
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.like = async (req, res, next) => {
  try {
    const { tweetId } = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }

    const matchLike = await tweetModel.findOne({
      _id: tweetId,
      likes: { $in: _id },
    });
    if (matchLike) {
      const tweetDetails = await tweetModel.findOne({ _id: tweetId });
      await tweetDetails.likes.pop(_id);
      const tweetSave = await tweetDetails.save();
      if (tweetSave) {
        return res.status(201).json({ message: "Un-like successfully!" });
      } else {
        return res.status(422).json({ message: "Unable to like" });
      }
    } else {
      const tweetDetails = await tweetModel.findOne({ _id: tweetId });
      await tweetDetails.likes.push(_id);
      const tweetSave = await tweetDetails.save();
      if (tweetSave) {
        return res.status(201).json({ message: "like successfully!" });
      } else {
        return res.status(422).json({ message: "Unable to like" });
      }
    }
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.reTweet = async (req, res, next) => {
  try {
    const { tweetId } = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!tweetId || !_id) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const tweetDetails = await new tweetModel({
      postedBy: _id,
      reTweet: tweetId,
    });
    const tweetSave = await tweetDetails.save();
    const findTweet = await tweetModel.findOne({ _id: tweetId });
    await findTweet.reTweetCount.push(_id);
    await findTweet.save();
    if (tweetSave) {
      return res.status(201).json({ message: "Re-Tweeted successfully!" });
    } else {
      return res.status(200).json({ message: "Unable to re-tweet" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.searchTweet = async (req, res, next) => {
  try {
    const { tweet } = req.body;
    if (!tweet) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const regex = new RegExp(`#${tweet}`, "i");

    const tweetDetails = await tweetModel
      .find({ content: { $regex: tweet, $options: "i" } })
      .populate("postedBy")
      .populate("reTweet")
      .populate("comments.postedBy")
      .sort("-createdAt");
    if (tweetDetails) {
      return res.status(200).json({ tweet: tweetDetails });
    } else {
      return res.status(200).json({ message: "Tweet not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "Unable to process" });
  }
};

//dashboard
exports.tweets = async (req, res, next) => {
  try {
    // const { authorization } = req.headers;
    // const { _id } = await userIdFromJWT(authorization);
    // if (!_id) {
    //   return res.status(422).json({ message: "Please fill all the fields!" });
    // }
    const { tweet } = req.body;
    if (!tweet) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const regex = new RegExp(`#${tweet}`, "i");

    const tweetDetails = await tweetModel
      .find({ content: regex })
      .populate("postedBy")
      .populate("reTweet")
      .populate("comments.postedBy")
      .sort("-createdAt")
      .limit(5);
    if (tweetDetails[0]?.postedBy) {
      const transformedTweet = await tweetDetails.map(function (tweet) {
        // if (tweet.postedBy) {
        return {
          id: tweet?._id,
          name: tweet?.postedBy?.name || "-",
          email: tweet?.postedBy?.email || "-",
          cellNo: tweet?.postedBy?.cellNo || "-",
          location: tweet?.postedBy?.location || "-",
          address: tweet?.postedBy?.address || "-",
          followings: tweet?.postedBy?.following.length || "-",
          followers: tweet?.postedBy?.followers.length || "-",
          lastLoginIp: tweet?.postedBy?.lastLoginIp || "-",
          device: tweet?.postedBy?.device || "-",
          phone: tweet?.postedBy?.phone || "-",
          image: tweet?.postedBy?.imageURL,
          education: tweet.epostedBy?.ducation || "-",
          tweet: tweet?.content || "-",
          tweetImg: tweet?.imageURL,
          likes: tweet?.likes?.length || 0,
          comments: tweet?.comments?.length || 0,
          userName: tweet?.postedBy?.name || "-",
          datatime: tweet?.createdAt || "-",
          // };
        };
        return;
      });
      return res.status(200).json(transformedTweet);
    } else {
      return res.status(422).json({ message: "Tweet not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.deleteTweet = async (req, res, next) => {
  try {
    const { tweetId } = req.body;
    // const { authorization } = req.headers;
    // const { _id } = await userIdFromJWT(authorization);
    if (!tweetId) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }

    const tweetDetails = await tweetModel.findByIdAndDelete({ _id: tweetId });
    if (tweetDetails) {
      return res.status(201).json({ message: "Tweet deleted successfully!" });
    } else {
      return res.status(422).json({ message: "Tweet not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

exports.tweetGraph = async (req, res, next) => {
  try {
    const tweetList = await tweetModel.find();
    if (tweetList.length) {
      return res.status(200).json({ tweet: tweetList });
    }
    return res.status(422).json({ message: "Tweet not found!" });
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};
