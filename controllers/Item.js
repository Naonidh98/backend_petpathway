const Item = require("../models/Item");
const Category = require("../models/Category");
const Info = require("../models/Info");
const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../utils/uploadMedia");

//create item
exports.createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      price,
      discount = "0",
      categoryName,
      quantity = "0",
    } = req.body;
    const { dimension, origin, gtin, sku, type, returnPolicy } = req.body;
    const thumbnail = req?.files?.image || null;
    console.log(req.body);

    //validation
    if (
      !title ||
      !description ||
      !brand ||
      !price ||
      !categoryName ||
      !dimension ||
      !origin ||
      !gtin ||
      !sku ||
      !type ||
      !returnPolicy ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    //get the category
    const category = await Category.findOne({ title: categoryName });

    //invalid category
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Invalid category",
      });
    }

    //create info
    const moreInfo = await Info.create({
      dimensions: dimension,
      brand: brand,
      origin: origin,
      gtin: gtin,
      sku: sku,
      type: category.title,
      return: returnPolicy,
    });

    //upload the thubnail to cloud
    const response = await uploadImageToCloudinary(thumbnail);

    //create item
    const item = await Item.create({
      title: title,
      brand: brand,
      description: description,
      price: price,
      discount: discount,
      quantity: quantity,
      thumbnail: response.secure_url,
      category: category._id,
      more_info: moreInfo._id,
      item_type: type,
    });

    //add item to category
    await Category.findOneAndUpdate(
      { _id: category._id },
      {
        $push: {
          items: item._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item created",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create item",
      error: err.message,
    });
  }
};

//update item
exports.updateItem = async (req, res) => {
  try {
    const {
      itemId,
      title,
      description,
      brand,
      price,
      discount,
      categoryName,
      quantity,
    } = req.body;
    const { dimension, origin, gtin, sku, type, returnPolicy } = req.body;
    const thumbnail = req?.files?.image || null;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Missing post",
      });
    }

    //validation
    if (
      !title &&
      !description &&
      !brand &&
      !price &&
      !categoryName &&
      !dimension &&
      !origin &&
      !gtin &&
      !sku &&
      !type &&
      !returnPolicy &&
      !thumbnail &&
      !discount &&
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message: "provide atleast one field",
      });
    }

    const item = await Item.findOne({ _id: itemId });

    if (title) {
      item.title = title;
    }
    if (description) {
      item.description = description;
    }
    if (brand) {
      item.brand = brand;
    }
    if (price) {
      item.title = price;
    }
    if (quantity) {
      item.quantity = quantity;
    }

    const info = await Info.findOne({ _id: item.more_info });
    if (dimension) {
      info.dimensions = dimension;
    }
    if (origin) {
      info.origin = origin;
    }
    if (gtin) {
      info.gtin = gtin;
    }
    if (returnPolicy) {
      info.return = returnPolicy;
    }

    if (categoryName) {
      //remove item from category
      await Category.findOneAndUpdate(
        { _id: item?.category },
        {
          $pull: {
            items: item.id,
          },
        }
      );

      //add item to new category
      const newCat = await Category.findOneAndUpdate(
        { title: categoryName },
        {
          $push: {
            items: item.id,
          },
        }
      );

      // update item's category
      item.category = newCat._id;

      //update info
      info.type = newCat.title;
    }

    if (thumbnail) {
      //delete previous
      await deleteImageFromCloudinary(item.thumbnail);

      //update image
      const response = await uploadImageToCloudinary(thumbnail);

      //update item
      item.thumbnail = response.secure_url;
    }

    await item.save();
    await info.save();

    return res.status(200).json({
      success: true,
      message: "Item updated",
      data: info,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: err.message,
    });
  }
};

//delete item
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const item = await Item.findOne({ _id: itemId });

    if (!item) {
      return res.status(500).json({
        success: false,
        message: "Invaid item",
      });
    }

    await Category.findOneAndUpdate(
      { _id: item.category },
      {
        $pull: {
          items: item._id,
        },
      }
    );

    const deletedItem = await Item.findByIdAndDelete({ _id: itemId });

    await deleteImageFromCloudinary(deletedItem.thumbnail);

    const data = await Category.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .exec();

    return res.status(200).json({
      success: true,
      message: "Item Deleted Successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: err.message,
    });
  }
};

//get items

// 1 .get item by id
exports.getItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }

    const data = await Item.findOne({
      _id: itemId,
    })
      .populate("category")
      .populate("more_info")
      .exec();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Item Fetched",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: err.message,
    });
  }
};

// 2. get item form store page
exports.getItemForStore = async (req, res) => {
  try {
    const data1 = await Item.find(
      { type: "dog" },
      {
        title: true,
        description: true,
        price: true,
        thumbnail: true,
      }
    )
      .limit(8)
      .exec();

    const data2 = await Item.find(
      { type: "cat" },
      {
        title: true,
        description: true,
        price: true,
        thumbnail: true,
      }
    )
      .limit(8)
      .exec();

    const data3 = await Item.find(
      {},
      {
        title: true,
        description: true,
        price: true,
        thumbnail: true,
      }
    )
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();

    const data = {
      forDogs: data1,
      forCats: data2,
      latestItem: data3,
    };

    return res.status(200).json({
      success: true,
      data: data,
      message: "Item Fetched for store",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: err.message,
    });
  }
};

exports.getItemForAdmin = async (req, res) => {
  try {
    const data = await Item.find({}).sort({ created: -1 }).limit(6).exec();

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data.",
      error: err.message,
    });
  }
};

exports.getItemsByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Missing name",
      });
    }

    const data = await Item.find({
      title: { $regex: "^" + name, $options: "i" },
    }).exec();

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data.",
      error: err.message,
    });
  }
};
