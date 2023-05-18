const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const auth = require("../middleware/auth");

//Testing
//router.get("/test", (req, res) => res.json({ msg: "Working!" }));

//For User

// 1 - Register
router.post("/register", authController.register);

// 2 - Login
router.post("/login", authController.login);

// 3 - Logout
router.post("/logout", auth, authController.logout);

// 4 - Refresh
router.get("/refresh", auth, authController.refresh);

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
