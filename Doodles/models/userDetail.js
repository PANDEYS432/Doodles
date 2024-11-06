require("../db/connection");
const mongoose = require("mongoose");

const userDetailSchema = new mongoose.Schema({
  name:String,
  email:String,
  socketId:String,
  friends:[],
  isOnline:{
    type:String,
    default:"no"
  },
  friendRequest:[]
});

const UserDetail = new mongoose.model("userdetail", userDetailSchema);

module.exports = UserDetail;
