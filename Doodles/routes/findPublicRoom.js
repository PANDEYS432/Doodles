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

router.post("/findPublicRoom",async (req,res)=>{
    try{
        const roomSatisfyingCondition=await currentlivegames.findOne({Private:0,members:{$lt:4}});
        if(roomSatisfyingCondition==null){
            return res.status(200).json({value:false});
        }
        else return res.status(200).json({value:true,room:roomSatisfyingCondition.roomId});
    }
    catch(e){
        console.log("error at checking of roomid ",e);
        return res.status(400).json({success:true});
    }
    
})
module.exports=router;