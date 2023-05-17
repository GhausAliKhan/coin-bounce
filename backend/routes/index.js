const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

//Testing
//router.get("/test", (req, res) => res.json({ msg: "Working!" }));

//For User

// 1 - Register
router.post("/register", authController.register);

// 2 - Login
router.post("/login", authController.login);

// 3 - Logout
// 4 - Refresh

//For Blog
// 1 - Create
// 2 - Read
// 2.1 - Read All Blogs
// 2.2 - Read Blog By Id
// 3 - Update
// 4 - Delete

//For Comment
// 1 - Create
// 2 - Read
// 2.1 - Read Comment by Blog Id

module.exports = router;
