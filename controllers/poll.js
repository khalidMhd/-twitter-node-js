const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { pollModel } = require("../models/poll");
const { tweetModel } = require("../models/tweet");
const schedule = require("node-schedule");

const schedulePoll = (scheduleAt, _id) => {
  const startJob = new Date(scheduleAt)
  const manageDate = new Date(startJob.getFullYear(), startJob.getMonth(), startJob.getDate(), startJob.getHours(), startJob.getMinutes(), startJob.getSeconds())
  const job = schedule.scheduleJob(
    manageDate,
    function (id) {
      console.log(id);
      pollActive(id)
    }.bind(null, _id)
  );
}

const pollActive = async (_id) => {
  try {
    const pollDetails = await pollModel.findOne({_id: _id})
    if (pollDetails) {
      pollDetails.isActive = false
      pollDetails.save()
    }
  } catch (error) {
    throw error
  }
}

exports.postPoll = async (req, res, next) => {
  try {
    const { question, optionOne, optionTwo, optionThree, optionFour, scheduleAt } =
      req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!question || !optionOne || !optionTwo || !_id, !scheduleAt) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const pollDetails = await new pollModel({
      scheduleAt: scheduleAt,
      question: question,
      optionsOne: { text: optionOne },
      optionsTwo: { text: optionTwo },
      optionsThree: { text: optionThree },
      optionsFour: { text: optionFour },
    });

    const savePoll = await pollDetails.save();
    const tweetDetails = await new tweetModel({
      postedBy: _id,
      poll: savePoll?._id,
      isTweet: false
    });
    const tweetSave = await tweetDetails.save();
    if (tweetSave) {
      schedulePoll(savePoll.scheduleAt, savePoll._id)
      return res.status(200).json({ message: "Poll Created!" });
    } else {
      return res.status(200).json({ message: "Unable to Poll" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

exports.castVote = async (req, res, next) => {
  try {
    const { pollId, pollIndex } = req.body;
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (!_id) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    if (pollIndex == 0) {
      const checkVote = await voteOptOne(pollId, _id);
      if (checkVote == 1) {
        return res.status(201).json({ message: "Vote cast" });
      }
      if (checkVote == 0) {
        return res.status(201).json({ message: "Vote Undo" });
      }
      return res.status(201).json({ message: "went wrong" });
    }
    if (pollIndex == 1) {
      const checkVote = await voteOptTwo(pollId, _id);
      if (checkVote == 1) {
        return res.status(201).json({ message: "Vote cast" });
      }
      if (checkVote == 0) {
        return res.status(201).json({ message: "Vote Undo" });
      }
      return res.status(201).json({ message: "went wrong" });
    }
    if (pollIndex == 2) {
      const checkVote = await voteOptThree(pollId, _id);
      if (checkVote == 1) {
        return res.status(201).json({ message: "Vote cast" });
      }
      if (checkVote == 0) {
        return res.status(201).json({ message: "Vote Undo" });
      }
      return res.status(201).json({ message: "went wrong" });
    }
    if (pollIndex == 3) {
      const checkVote = await voteOptFour(pollId, _id);
      if (checkVote == 1) {
        return res.status(201).json({ message: "Vote cast" });
      }
      if (checkVote == 0) {
        return res.status(201).json({ message: "Vote Undo" });
      }
      return res.status(201).json({ message: "went wrong" });
    }
    return res.status(201).json({ message: "poll name required" });
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

const voteOptOne = async (pollId, _id) => {
  const matchPoll = await pollModel.findOne({
    _id: pollId,
    "optionsOne.votes": { $in: _id },
  });
  if (matchPoll) {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsOne.votes.pop(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 0;
    } else {
      return false;
    }
  } else {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsOne.votes.push(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 1;
    } else {
      return false;
    }
  }
};

const voteOptTwo = async (pollId, _id) => {
  const matchPoll = await pollModel.findOne({
    _id: pollId,
    "optionsTwo.votes": { $in: _id },
  });
  if (matchPoll) {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsTwo.votes.pop(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 0;
    } else {
      return false;
    }
  } else {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsTwo.votes.push(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 1;
    } else {
      return false;
    }
  }
};

const voteOptThree = async (pollId, _id) => {
  const matchPoll = await pollModel.findOne({
    _id: pollId,
    "optionsThree.votes": { $in: _id },
  });
  if (matchPoll) {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsThree.votes.pop(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 0;
    } else {
      return false;
    }
  } else {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsThree.votes.push(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 1;
    } else {
      return false;
    }
  }
};

const voteOptFour = async (pollId, _id) => {
  const matchPoll = await pollModel.findOne({
    _id: pollId,
    "optionsFour.votes": { $in: _id },
  });
  if (matchPoll) {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsFour.votes.pop(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 0;
    } else {
      return false;
    }
  } else {
    const pollDetails = await pollModel.findOne({ _id: pollId });
    await pollDetails.optionsFour.votes.push(_id);
    const voteSave = await pollDetails.save();
    if (voteSave) {
      return 1;
    } else {
      return false;
    }
  }
};
