require("../db/connection");
const mongoose = require("mongoose");

const livegamesSchema = new mongoose.Schema({
  roomId:String,
  members:{
    type:Number,
    default:0
  },
  Private:{
    type:Number,
    default:0
  }
});

const livegames= new mongoose.model("livegames", livegamesSchema);

module.exports = livegames;
