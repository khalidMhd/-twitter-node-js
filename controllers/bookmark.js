const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { bookmarkModel } = require("../models/bookmark");

exports.getBookmark = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const tweetList = await bookmarkModel
      .find({ user: _id })
      // .find()
      .populate({
        path: "tweet",
        populate: [
          {
            path: "postedBy",
          },
        ],
      })
      .sort("-createdAt");
    if (tweetList.length) {
      return res.status(200).json({ tweet: tweetList });
    }
    return res.status(200).json({ message: "Tweet not found!" });
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.bookmark = async (req, res, next) => {
  try {
    const { tweetId } = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id || !tweetId) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }

    const matchTweet = await bookmarkModel.find({
      tweet: tweetId,
      user: _id
    });
    console.log(matchTweet);
    if (matchTweet.length !== 0) {
      const unbookmark = await bookmarkModel.deleteMany({
        tweet: tweetId,
        user: _id
      });
      return res.status(200).json({ message: "Un-bookmarked Successfully!" });
    } else {
      const tweetDetails = await new bookmarkModel({
        user: _id,
        tweet: tweetId,
      });
      const tweetSave = await tweetDetails.save();
      return res.status(200).json({ message: "Bookmarked Successfully!" });
    }
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};
