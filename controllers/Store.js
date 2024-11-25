const Category = require("../models/Category");
const Item = require("../models/Item");
const Pet = require("../models/Pet");
//create category
exports.getStoreData = async (req, res) => {
  try {
    //get top categories
    const data1 = await Category.find(
      {},
      {
        title: true,
        thumbnail: true,
        items: true,
      }
    )
      .sort({ _id: -1 })
      .limit(6)
      .exec();

    //get latest added items
    const data2 = await Item.find(
      {},
      {
        title: true,
        price: true,
        discount: true,
        thumbnail: true,
      }
    )
      .sort({ _id: -1 })
      .limit(8)
      .exec();

    const dogItems = await Item.find(
      { item_type: "Dog" },
      {
        title: true,
        thumbnail: true,
        price: true,
      }
    ).limit(10);
    const catItems = await Item.find(
      { item_type: "Cat" },
      {
        title: true,
        thumbnail: true,
        price: true,
      }
    ).limit(10);

    return res.status(200).json({
      success: true,
      data: {
        topCat: data1,
        latest: data2,
        dog: dogItems,
        cat: catItems,
      },
      message: "data fetched for store",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load store data",
      error: err.message,
    });
  }
};

// admin - analytics
exports.storeDetails = async (req, res) => {
  try {
    const data = await Category.find(
      {},
      {
        title: true,
        items: true,
      }
    );

    const dogs = await Pet.find(
      { type: "Dog" },
      {
        _id: true,
      }
    );
    const cats = await Pet.find(
      { type: "Cat" },
      {
        _id: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: data,
      dogs: dogs.length,
      cats: cats.length,
      message: "store data fetched",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: err.message,
    });
  }
};

// items ans categories
exports.getallCategoryandItems = async (req, res) => {
  try {
    //category
    const data1 = await Category.find(
      {},
      {
        title: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      }
    )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .exec();

    //items
    const data2 = await Item.find(
      {},
      {
        title: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      }
    )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .exec();

    return res.status(200).json({
      success: true,
      categories: data1,
      items: data2,
      message: "data fetched",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: err.message,
    });
  }
};

//search items
exports.getSearchQuery = async (req, res) => {
  try {
    const { min ,max ,pet , query } = req.body;

    if (!min || !max || !pet || !query) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements",
      });
    }
    
    let pets;
    let items;

    if (pet === "Dog") {
      pets = await Pet.find({
        type: "Dog",
        breed : { $regex: "^" + query, $options: "i" },
      });
    }
    if (pet === "Cat") {
      pets = await Pet.find({
        type: "Cat",
        breed : { $regex: "^" + query, $options: "i" },
      });
    }
    if (pet === "Both") {
      pets = await Pet.find({
        breed: { $regex: "^" + query, $options: "i" },
      });
    }

    items = await Item.find({
      title: { $regex: "^" + query, $options: "i" },
      price: { $gte : min, $lte : max },
    });

    return res.status(200).json({
      success: true,
      items: items,
      pets: pets,
      message: "data fetched",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: err.message,
    });
  }
};
