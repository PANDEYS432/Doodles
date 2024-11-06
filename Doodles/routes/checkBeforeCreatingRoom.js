const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");
const currentlivegames=require("./../models/currentlivegames");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());

router.post("/checkBeforeCreatingRoom",async (req,res)=>{
    try{
        const roomId=req.body.roomId;
        const findRoom=currentlivegames.findOne({roomId:roomId});
        if(findRoom==null) return res.status(200).json({value:false});
        return res.status(200).json({value:true});
    }
    catch(e){
        console.log("error at checking of roomid ",e);
        return res.status(400).json({success:true});
    }
    
})
module.exports=router;