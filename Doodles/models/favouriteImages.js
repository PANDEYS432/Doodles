require("../db/connection");
const mongoose = require("mongoose");

const favouriteImagesSchema = new mongoose.Schema({
  email:String,
  images:[]
});

const favouriteImages= new mongoose.model("favouriteImage", favouriteImagesSchema);

module.exports = favouriteImages;
