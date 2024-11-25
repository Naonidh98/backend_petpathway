const express = require("express");
const router = express.Router();

//import controllers
const {createCategory,editCategory,deleteCategory,getCategoryByName,getCategories,getCategoryItems,getCategoriesName} = require("../controllers/Category")
const {auth,isAdmin}  = require("../middlewares/AuthMiddleware")

//create
router.post("/create",auth,isAdmin,createCategory);

//update
router.put("/edit",auth,isAdmin,editCategory);

//delete
router.delete("/delete",auth,isAdmin,deleteCategory);

//fetch all categories
router.get("/all",getCategories);
router.post("/item/all",getCategoryItems);
router.get("/all/name",getCategoriesName);

//categiry by name
router.post("/name",auth,getCategoryByName);


module.exports = router;
