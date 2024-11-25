const express = require("express");
const router = express.Router();

const {getStoreData,storeDetails,getallCategoryandItems,getSearchQuery}  = require("../controllers/Store");
const {auth,isAdmin}  =require("../middlewares/AuthMiddleware")

router.get("/data",getStoreData)

//get store details for admin dashboard
router.get("/details",auth,isAdmin,storeDetails);

//categories and items
router.get("/item_and_cat",auth,isAdmin,getallCategoryandItems);

//search query
router.post("/search/result",auth,getSearchQuery);

module.exports = router;
