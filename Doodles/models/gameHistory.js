require("../db/connection");
const mongoose = require("mongoose");

const gameHistorySchema = new mongoose.Schema({
  email:String,
  totalMatch:{
    type:Number,
    default:0
  },
  first:{
    type:Number,
    default:0
  },
  second:{
    type:Number,
    default:0
  },
  third:{
    type:Number,
    default:0
  },
  totalpoints:{
    type:Number,
    default:0
  },
  level:{
    type:Number,
    default:0
  },
  pastmatches:[]
});

const gameHistory = new mongoose.model("gameHistory", gameHistorySchema);

module.exports = gameHistory;
