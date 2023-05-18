class BlogDTO {
  constructor(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.content = blog.content;
    this.photo = blog.photoPath;
    this.author = blog.author;
  }
}
module.exports = BlogDTO;
