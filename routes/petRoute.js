const express = require("express");
const router = express.Router();

const {createPet,addMedia,getPetDetails,editPet,deletePet,getPetUser} = require("../controllers/Pet");
const { auth } = require("../middlewares/AuthMiddleware");

//create pet
router.post("/create",auth,createPet);

//add-edit media in pet 
router.post("/media/add",addMedia);

//pet detail
router.post("/detail",auth,getPetDetails);

//edit pet
router.put("/edit",auth,editPet);

//delete pet
router.delete("/delete",auth,deletePet);

//get pet state - wise
router.post("/state/all",auth,getPetUser);

module.exports = router;
