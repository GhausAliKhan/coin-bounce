const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog");
const { BACKEND_SERVER_PATH } = require("../config/index");
const BlogDTO = require("../dto/blog");
const BlogByIdDTO = require("../dto/blogById");
const Comment = require("../models/comment");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  // 1 - Create Blog
  async create(req, res, next) {
    // 1 - Validate
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      // Client Side -> base64 encoded string -> decode -> store -> Save decoded photo path in Data Base
      photo: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = createBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { title, content, photo, author } = req.body;
    //Read as Buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );

    //Allot a Random Name
    const imagePath = `${Date.now()}-${author}.png`;

    // 2 - Handle Photo Storage
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }

    // 3 - Save Blog to Data Base
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        content,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        author,
      });
      await newBlog.save();
    } catch (error) {
      return next(error);
    }

    // 4 - Return Response to User
    const blogDto = new BlogDTO(newBlog);
    return res.status(201).json({ blog: blogDto });
  },

  // 2.1 - Read All Blogs
  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});
      const blogsDto = [];

      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDTO(blogs[i]);
        blogsDto.push(dto);
      }
      return res.status(201).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },

  // 2.2 - Read Blog By Id
  async getById(req, res, next) {
    // 1 - Validate Id
    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = getByIdSchema.validate(req.params);
    let blog;
    const { id } = req.params;
    if (error) {
      return next(error);
    }
    try {
      blog = await Blog.findOne({ _id: id }).populate("author");
    } catch (error) {
      return next(error);
    }
    // 2 - Send Response
    const blogDto = new BlogByIdDTO(blog);
    return res.status(201).json({ blog: blogDto });
  },

  // 3 - Update
  async update(req, res, next) {
    // 1 - Validate
    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });
    const { error } = updateBlogSchema.validate(req.body);
    const { title, content, author, blogId, photo } = req.body;

    // Delete Previous Photo
    let blog;
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }

    if (photo) {
      let previousPhoto = blog.photoPath;
      previousPhoto = previousPhoto.split("/").at(-1);

      //Delete Previous Photo
      fs.unlinkSync(`storage/${previousPhoto}`);

      //Save New Photo
      //Read as Buffer
      const buffer = Buffer.from(
        photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );

      //Allot a Random Name
      const imagePath = `${Date.now()}-${author}.png`;

      // 2 - Handle Photo Storage
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }
      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { title, content });
    }
    return res.status(200).json({ message: "Blog Updated!" });
  },

  // 4 - Delete
  async delete(req, res, next) {
    // 1 - Validate by Id
    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = deleteBlogSchema.validate(req.params);
    const { id } = req.params;

    // 2 - Delete Blog & Delete Comments
    try {
      await Blog.deleteOne({ _id: id });
      await Comment.deleteMany({ blog: id });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({ message: "Blog Deleted!" });
  },
};
module.exports = blogController;
