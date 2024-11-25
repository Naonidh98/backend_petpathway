const Blog = require("../models/Blog");
const User = require("../models/User");

const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../utils/uploadMedia");

//create a blog
exports.createBlog = async (req, res) => {
  try {
    const userId = req.user._id;

    const { title, description } = req.body;

    //validation
    if (!userId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const imageBlog = req?.files?.image || null;

    //if blog has a image to upload
    if (imageBlog) {
      const response = await uploadImageToCloudinary(imageBlog);

      const blog = await Blog.create({
        title: title,
        description: description,
        author: userId,
        image: response.secure_url,
      });

      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            myBlogs: blog._id,
          },
        }
      );

      const newBlogs = await Blog.find({})
        .populate({
          path: "author",
          select: "firstName lastName",
        })
        .sort("-createdAt")
        .limit(15)
        .exec();

      return res.status(200).json({
        success: true,
        message: "Blog created",
        data: newBlogs,
      });
    } else {
      //Blog with no image
      const blog = await Blog.create({
        title: title,
        description: description,
        author: userId,
      });

      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            myBlogs: blog._id,
          },
        }
      );

      const newBlogs = await Blog.find({})
        .populate({
          path: "author",
          select: "firstName lastName",
        })
        .sort("-createdAt")
        .limit(15)
        .exec();

      return res.status(200).json({
        success: true,
        message: "Blog created",
        data: newBlogs,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create Blog.",
      error: err.message,
    });
  }
};

//edit blog
exports.editBlog = async (req, res) => {
  try {
    const { title, description, blogId } = req.body;
    const image = req?.files?.image || null;

    //if no blog id find
    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Missing blog id",
      });
    }

    if (!title && !description && !image) {
      return res.status(400).json({
        success: false,
        message: "Provide atleast one field.",
      });
    }

    const blog = await Blog.findOne({
      _id: blogId,
    });

    //invalid blog
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog Missing",
      });
    }

    //if title
    if (title) {
      blog.title = title;
    }

    //if desc
    if (description) {
      blog.description = description;
    }

    //if image
    if (image) {
      //remove previos image from cloud
      if (blog?.image) {
        await deleteImageFromCloudinary(blog.image);
      }

      const response = await uploadImageToCloudinary(image);

      blog.image = response.secure_url;
    }

    //save all changes
    await blog.save();

    const newBlogs = await Blog.find({}).sort("updated_at").limit(15).exec();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      data: newBlogs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to edit Blog.",
      error: err.message,
    });
  }
};

//delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    const userId = req.user._id;

    //validation
    if (!blogId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const blog = await Blog.findOne({ _id: blogId });

    if (blog.image) {
      await deleteImageFromCloudinary(blog.image);
    }

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          myBlogs: blogId,
        },
      }
    );

    await Blog.findByIdAndDelete({ _id: blogId });

    const newBlogs = await Blog.find({author : userId}).sort({createdAt : -1}).exec();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
      data: newBlogs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete Blog.",
      error: err.message,
    });
  }
};

//like/dislike blog
exports.likeBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    const userId = req.user._id;

    //validation
    if (!blogId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements.",
      });
    }

    const blog = await Blog.findOne({
      _id: blogId,
    });

    //like
    if (blog.likes.includes(userId)) {
      await Blog.findOneAndUpdate(
        { _id: blogId },
        {
          $pull: {
            likes: userId,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Blog disliked.",
      });
    } else {
      //dislike
      await Blog.findOneAndUpdate(
        { _id: blogId },
        {
          $push: {
            likes: userId,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Blog liked.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to like/dislike Blog.",
      error: err.message,
    });
  }
};

//get - blogs
exports.getBlogs = async (req, res) => {
  try {
    const { page } = req.body;

    if (!page) {
      return res.status(400).json({
        success: false,
        message: "Missing page no",
      });
    }

    const data = await Blog.find({})
      .populate({
        path: "author",
        select: "firstName lastName",
      })
      .sort("-createdAt")
      .skip((page - 1) * 15)
      .limit(15)
      .exec();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Blog.",
      error: err.message,
    });
  }
};

//get - user blogs
exports.getUserBlogs = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Blog.find({ author: userId })
      .select("title createdAt updatedAt likes")
      .sort("-createdAt")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Blog.",
      error: err.message,
    });
  }
};

//get blog by id
exports.getBlogDetails = async (req, res) => {
  try {
    const { blogId } = req.body;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Blog.findOne({ _id: blogId })
      .populate("author", "firstName lastName")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Blog.",
      error: err.message,
    });
  }
};
