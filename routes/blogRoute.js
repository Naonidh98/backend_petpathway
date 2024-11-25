const express = require("express");
const router = express.Router();

const { auth, isUser } = require("../middlewares/AuthMiddleware");
const {
  createBlog,
  editBlog,
  deleteBlog,
  likeBlog,
  getBlogs,
  getUserBlogs,
  getBlogDetails,
} = require("../controllers/Blogs");

//create blog
router.post("/create", auth, createBlog);

//edit blog
router.put("/update", auth, editBlog);

//delete blog
router.delete("/delete", auth, deleteBlog);

//like/dislike post
router.put("/like", auth, likeBlog);

//get all blogs
router.post("/all", auth, getBlogs);

//get user's blogs
router.get("/user/all", auth, getUserBlogs);

//get blog by id
router.post("/detail", auth, isUser, getBlogDetails);

module.exports = router;
