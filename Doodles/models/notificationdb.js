require("../db/connection");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  email:String,
  notifications:[]
});

const notificationdata= new mongoose.model("notificationdata", notificationSchema);

module.exports = notificationdata;
