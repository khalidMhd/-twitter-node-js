const jwt = require("jsonwebtoken");

exports.generateJWT = async (_id) => {
  const token = await jwt.sign({ _id: _id }, process.env.JWT_SECRET);
  return token;
};
