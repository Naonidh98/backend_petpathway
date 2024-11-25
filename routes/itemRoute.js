const express = require("express");
const router = express.Router();

//import controllers
const {createItem,updateItem,deleteItem,getItem,getItemForStore,getItemForAdmin,getItemsByName} = require("../controllers/Item");
const {auth,isAdmin} = require("../middlewares/AuthMiddleware")

//create
router.post("/create",createItem);

//update
router.put("/edit",updateItem);

//delete
router.delete("/delete",deleteItem);

//fetch details of a item
router.post("/detail",auth,getItem);

//
router.get("/store",getItemForStore);

//items for admin dash
router.get("/dash",auth,isAdmin,getItemForAdmin);

//item bt name
router.post("/search/name",auth,isAdmin,getItemsByName);

module.exports = router;
