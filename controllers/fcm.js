var FCM = require("fcm-node");
var serverKey =
  "AAAAoiXPdiY:APA91bFqLwG8XsP2FeUIrH4iLnKmfvIlPU7ZLCs9zjAZdcbhjka7ZOsSXP868p2Rx8bs4YYmdnudWw_ulkkg6q04TMr7TCdX-OSi_w389SxSiEqjVOziTgtSTZVlbRdsnU9pA5sl329v";
var fcm = new FCM(serverKey);
const { userModel } = require("../models/user");

exports.pushNotification = async (tweet, user) => {
  const userDetails = await userModel
    .findOne({ _id: user })
    .populate({
      path: 'followers',
      match: { isNotify: true },
      select:"fcmToken"
    })
    .select("name");
  console.log(userDetails);

  const token = await userDetails.followers.map((res) => res.fcmToken);
  var message = await {
    registration_ids: token,
    notification: {
      title: userDetails?.name || "Name",
      body: tweet || "Tweet",
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!" + err);
      console.log("Respponse:! " + response);
    } else {
      // showToast("Successfully sent with response");
      console.log("Successfully sent with response: ", response);
    }
  });
};
