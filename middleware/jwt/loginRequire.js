var jwt = require("jsonwebtoken");
const { userModel } = require("../../models/user");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(200).json({ message: "You must be login." });
    }
    const token = await authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(200).json({ message: "Un-authorized User" });
      }
      const { _id } = payload;
      userModel
        .findById(_id)
        .then((userData) => {
          if (userData) {
            req.user = userData;
            next();
          } else {
            return res.status(200).json({ message: "Un-authorized User!" });
          }
        })
        .catch((err) => {
          return res.status(200).json({ message: "Un-authorized User!" });
        });
    });
  } catch (error) {
    return res.status(200).json({ message: "Un-authorized User!" });
  }
};
