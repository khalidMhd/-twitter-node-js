const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { tweetModel } = require("../models/tweet");
const schedule = require("node-schedule");

const scheduleTweet = (scheduleAt, _id) => {
  const startJob = new Date(scheduleAt)
  const manageDate = new Date(startJob.getFullYear(), startJob.getMonth(), startJob.getDate(), startJob.getHours(), startJob.getMinutes(), startJob.getSeconds())
  const job = schedule.scheduleJob(
    manageDate,
    function (id) {
      console.log(id);
      tweetActive(id)
    }.bind(null, _id)
  );
}

const tweetActive = async (_id) => {
  try {
    const tweetDetails = await tweetModel.findOne({_id: _id})
    if (tweetDetails) {
      tweetDetails.isActive = true
      tweetDetails.updatedAt = tweetDetails.scheduleAt
      tweetDetails.save()
    }
  } catch (error) {
    throw error
  }
}

exports.postScheduleTweet = async (req, res, next) => {
  try {
    const { content, imageURL, scheduleAt , isComment} = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!content || !_id || !scheduleAt) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const tweetDetails = await new tweetModel({
      postedBy: _id,
      content: content,
      scheduleAt: scheduleAt,
      imageURL: imageURL || "",
      isActive: false,
      isComment: isComment
    });

    const tweetSave = await tweetDetails.save();

    if (tweetSave) {
      scheduleTweet(tweetSave.scheduleAt, tweetSave._id)
      return res.status(200).json({ message: "Tweet successfully!" });
    } else {
      return res.status(200).json({ message: "Unable to tweet" });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.getSheduleTweet = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const tweetList = await tweetModel
      // .find({ postedBy: { $in: req.user.followers } })
      .find()
      .populate("postedBy", "_id name imageURL")
      .sort("-createdAt");
    if (tweetList.length) {
      return res.status(200).json({ tweet: tweetList });
    }
    return res.status(422).json({ message: "Tweet not found!" });
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};
