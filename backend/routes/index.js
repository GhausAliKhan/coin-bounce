const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const blogController = require("../controller/blogController");

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
router.post("/blog", auth, blogController.create);

// 2 - Read
// 2.1 - Read All Blogs
router.get("/blog/all", auth, blogController.getAll);

// 2.2 - Read Blog By Id
router.get("/blog/:id", auth, blogController.getById);

// 3 - Update
router.put("/blog", auth, blogController.update);

// 4 - Delete
router.delete("/blog/:id", auth, blogController.delete);

//For Comment
// 1 - Create


// 2 - Read
// 2.1 - Read Comment by Blog Id


module.exports = router;
