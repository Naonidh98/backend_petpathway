const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Db connection successfull");
    })
    .catch((err) => {
      console.log("Db connection failed");
      console.log("error", err);
      process.exit(1);
    });
};
