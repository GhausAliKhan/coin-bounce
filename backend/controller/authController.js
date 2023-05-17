const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");

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
    const userToRegister = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    const user = await userToRegister.save();

    const userDto = new UserDTO(user);

    // 6 - Send Response to User
    return res.status(201).json({ user: userDto });
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

    const userDto = new UserDTO(user);

    // 4 - Send Response to User
    return res.status(200).json({ user: userDto });
  },
};
module.exports = authController;
