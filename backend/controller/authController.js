const Joi = require("joi");
const User = require("../models/user");
const RefreshToken = require("../models/token");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTservice = require("../services/JWTservice");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-z-A-Z\d]{8,25}$/;

const authController = {
  //REGISTER CONTROLLER
  async register(req, res, next) {
    // 1 - Validate User Input
    const userRegisterSchema = Joi.object({
      name: Joi.string().max(30).required(),
      username: Joi.string().min(6).max(25).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });
    const { error } = userRegisterSchema.validate(req.body);

    // 2 - If Error in Validation -> Return Error via Middleware
    if (error) {
      return next(error);
    }

    // 3 - If email Or username is Already Registered -> Return email Or Username not Available
    const { username, name, email, password } = req.body;
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email already Taken",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "Username not available",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // 4 - Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5 - Store User Credentials in DataBase
    let accessToken;
    let refreshToken;
    let user;
    try {
      const userToRegister = new User({
        name,
        username,
        email,
        password: hashedPassword,
      });
      user = await userToRegister.save();

      //Generate Token
      accessToken = JWTservice.signAccessToken({ _id: user._id }, "30m");
      refreshToken = JWTservice.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }
    //Store Refresh Token in Data Base
    JWTservice.storeRefreshToken(refreshToken, user._id);

    //Send Tokens in Cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // 6 - Send Response to User
    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  //LOGIN CONTROLLER
  async login(req, res, next) {
    // 1 - Validate User Input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(6).max(25).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });
    const { error } = userLoginSchema.validate(req.body);

    // 2 - If Validation Error -> Return Error
    if (error) {
      return next(error);
    }

    // 3 - Match username & password
    const { username, password } = req.body;
    let user;
    try {
      //Match Username
      user = await User.findOne({ username: username });
      if (!user) {
        const error = {
          status: 401,
          message: "Username not Found",
        };
        return next(error);
      }
      //Match Password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid Password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //Generate Token
    accessToken = JWTservice.signAccessToken({ _id: user._id }, "30m");
    refreshToken = JWTservice.signRefreshToken({ _id: user._id }, "60m");
    //Store Refresh Token in Data Base
    JWTservice.storeRefreshToken(refreshToken, user._id);

    //Send Tokens in Cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // 4 - Send Response to User
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

  // 3 - LOGOUT CONTROLLER
  async logout(req, res, next) {
    // 1 - Delete Refresh Token From Data Base
    const { refreshToken } = req.cookies;
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    // 2 - Delete Cookie
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // 3 - Response to User
    res.status(200).json({ user: null, auth: false });
  },
  async refresh(req, res, next) {
    // 1 - Get Refresh Token from Cookie
    const originalRefreshToken = req.cookies.refreshToken;

    // 2 - Verify Refresh Token
    let id;
    try {
      id = JWTservice.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }
    try {
      const match = RefreshToken.findOne({
        _id: id,
        token: originalRefreshToken,
      });
      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };
        return next(error);
      }
    } catch (e) {
      return next(e);
    }

    // 3 - Generate new Token
    try {
      const accessToken = JWTservice.signAccessToken({ _id: id }, "30m");
      const refreshToken = JWTservice.signRefreshToken({ _id: id }, "60m");

      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });
      //Send Tokens in Cookie
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (e) {
      return next(e);
    }

    // 4 - Update Data Base
    const user = await User.findOne({ _id: id });

    // 5 - Send Response
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },
};

module.exports = authController;
