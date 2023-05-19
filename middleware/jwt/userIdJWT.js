const jwt = require("jsonwebtoken");

exports.userIdFromJWT = async (token) => {
  try {
    let decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (e) {
    return e;
  }
};
