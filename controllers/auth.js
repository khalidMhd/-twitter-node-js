const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateJWT } = require("../middleware/jwt/generateJWT");
const { parseJwt } = require("../middleware/jwt/parseJWT");
const { userIdFromJWT } = require("../middleware/jwt/userIdJWT");
const { userModel } = require("../models/user");
const { emailValidatoin, passwordValidation } = require("../util/validations");

//user  signup
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, fcmToken } = req.body;
    console.log("fcmToken::::: ", fcmToken);
    if (!name || !email || !password) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const isEmailValidate = await emailValidatoin(email);
    if (!isEmailValidate) {
      return res.status(200).json({ message: "Invalid email address." });
    }
    const isPasswordValidate = await passwordValidation(password);
    if (!isPasswordValidate) {
      return res
        .status(200)
        .json({ message: "Password must be at least 5 characters." });
    }
    const savedUser = await userModel.findOne({ email: email.toLowerCase() });
    if (savedUser) {
      const { isVerified, accStatus } = savedUser;
      if (!accStatus) {
        return res.status(200).json({ message: "Account disabled!" });
      }
      if (!isVerified) {
        return res.status(200).json({ message: "Email not verified" });
      }
      if (isVerified) {
        return res
          .status(200)
          .json({ message: "Email already registered. Take an another email" });
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 12);
      const userDetails = await new userModel({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: hashPassword,
        fcmToken: fcmToken,
      });

      const savedNewUser = await userDetails.save();
      if (savedNewUser) {
        const { _id, name, email } = savedNewUser;
        const token = await jwt.sign({ _id: _id }, process.env.JWT_SECRET);

        return res.status(200).json({
          message: "User register successfully",
          token,
          user: { _id, name, email },
        });
      } else {
        return res
          .status(200)
          .json({ message: "Unable to create an account." });
      }
    }
  } catch (error) {
    return res.status(200).json({ message: "Something went wrong!" });
  }
};

//user  signin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const savedUser = await userModel.findOne({
      email: String(email).trim().toLowerCase(),
    });
    if (savedUser) {
      const { _id, isVerified, accStatus, name, email } = savedUser;
      if (!accStatus) {
        return res.status(200).json({ message: "Account disabled!" });
      }
      if (!isVerified) {
        return res.status(200).json({ message: "Email not verified" });
      } else {
        const doMatch = await bcrypt.compare(password, savedUser.password);
        if (doMatch) {
          const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET);
          return res.status(200).json({
            message: "Successfully signed in",
            token,
            user: { _id, name, email },
          });
        } else {
          return res.status(200).json({ message: "Invalid Email or password" });
        }
      }
    } else {
      return res.status(200).json({ message: "User not registered" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Something went wrong!" });
  }
};
//admin  signin
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }

    if (email.trim() === "admin@gmail.com" && password.trim() === "@admin21") {
      const token = await jwt.sign(
        { _id: "927867293" },
        process.env.JWT_SECRET
      );
      return res.status(200).json({
        message: "Successfully signed in",
        token,
        user: { name: "Admin", email: "admin@gmail.com" },
      });
    } else {
      return res.status(200).json({ message: "Invalid Email or password" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Something went wrong!" });
  }
};

// verify token/user
exports.confirmUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(422).json({ message: "Please fill all the fields!" });
  }
  const { _id } = await userIdFromJWT(token);
  if (_id) {
    const verifyUser = await userModel.findOne({
      _id: _id,
      isVerified: false,
    });
    if (verifyUser) {
      verifyUser.isVerified = true;
      verifyUser
        .save()
        .then((data) => {
          return res
            .status(200)
            .json({ message: "User verified successfully" });
        })
        .catch((err) => {
          return res.status(422).json({ message: "Unable to verify" });
        });
    } else {
      return res
        .status(401)
        .json({ message: "We were unable to find a valid token." });
    }
  } else {
    return res.status(401).json({ message: "Un-authorized User" });
  }
};

//reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const isEmailValidate = await emailValidatoin(email);
    if (!isEmailValidate) {
      return res.status(422).json({ message: "Invalid email address." });
    }

    const userDetails = await userModel.findOne({ email: email.toLowerCase() });
    if (!userDetails) {
      return res
        .status(422)
        .json({ message: "User dont exists with this email" });
    }
    const { _id } = userDetails;
    const token = await generateJWT(_id);
    if (token) {
      userDetails.resetToken = token;
      userDetails.expireToken = Date.now() + 3600000; // 1hour
      const savedUser = await userDetails.save();
      if (savedUser) {
        const { resetToken } = savedUser;
        return res.status(200).json({
          message: "A change password mail has been sent",
          token: resetToken,
        });
      } else {
        return res.status(422).json({ message: "Unable to send email" });
      }
    } else {
      return res.status(422).json({ message: "Unable to generate token" });
    }
  } catch (error) {
    return res.status(422).json({ message: "Unable to process" });
  }
};

//new password
exports.newPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;
    if (!newPassword || !token) {
      return res.status(422).json({ message: "Please fill all the fields!" });
    }
    const { _id } = await userIdFromJWT(token);
    if (_id) {
      const userDetails = await userModel.findOne({
        _id: _id,
        expireToken: { $gt: Date.now() },
      });
      if (!userDetails) {
        return res.status(422).json({ message: "Try again session expired" });
      }
      const hashPassword = await bcrypt.hash(newPassword, 12);
      userDetails.password = hashPassword;
      userDetails.resetToken = undefined;
      userDetails.expireToken = undefined;
      userDetails
        .save()
        .then((saveduser) => {
          return res.status(200).json({ message: "password updated success" });
        })
        .catch((err) => {
          return res.status(422).json({ message: "Unable to save password" });
        });
    } else {
      return res.status(401).json({ message: "Un-authorized User" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ message: "Unable to process" });
  }
};

//change passwort
exports.changePassord = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    if (!newPassword || !password) {
      return res.status(200).json({ message: "Please fill all the fields!" });
    }
    const { authorization } = req.headers;
    const { _id } = await userIdFromJWT(authorization);
    if (_id) {
      const userDetails = await userModel.findOne({
        _id: _id,
      });
      if (userDetails) {
        const doMatch = await bcrypt.compare(password, userDetails.password);

        if (doMatch) {
          bcrypt
            .hash(newPassword, 12)
            .then((pwd) => {
              userDetails.password = pwd;
              userDetails
                .save()
                .then((data) => {
                  return res.status(200).json({
                    message: "Password Changed Successfully",
                  });
                })
                .catch((err) => {
                  return res.status(200).json({ message: "Unable to change" });
                });
            })
            .catch((err) => {
              return res.status(200).json({ message: "Something went wrong!" });
            });
        } else {
          return res.status(200).json({ message: "Invalid password" });
        }
      } else {
        return res.status(200).json({ message: "We were unable to update." });
      }
    } else {
      return res.status(200).json({ message: "Un-authorized User" });
    }
  } catch (error) {
    return res.status(200).json({ message: "Unable to process" });
  }
};

// refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { _id } = await parseJwt(authorization);

    if (_id) {
      const token = await jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIREIN,
      });
      return res.json({
        message: "Refresh token generated.",
        token,
      });
    } else {
      return res.status(422).json({ message: "Unable to generate token." });
    }
  } catch (error) {
    return res.status(422).json({ message: "Something went wrong!" });
  }
};

//get all user
exports.users = async (req, res, next) => {
  try {
    // localhost:5000/api/users?page=1&limit=10
    const isUserExists = await res.paginatedResults;
    if (isUserExists.results.length > 0) {
      return res.status(200).json(isUserExists);
    } else {
      return res.status(422).json({ message: "Users not exist." });
    }
  } catch (error) {
    return res.status(422).json({ message: "Something went wrong!" });
  }
};
