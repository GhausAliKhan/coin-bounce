const mongoose = require("mongoose");
const { Schema } = mongoose; // const Schema = mongoose.Schema:

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    blog: { type: mongoose.SchemaTypes.ObjectId, ref: "blogs" },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Comment", commentSchema, "comments"); // ("name of model", name of Schema, "collection name")
