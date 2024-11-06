const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());


router.post("/acceptfriendrequest",async (req,res)=>{
    try{
        const sender=req.body.sender;
        const receiver=req.body.receiver;
        const data1=await usermodel.findOne({email:sender});
        const data2=await usermodel.findOne({email:receiver});
        const update1=await usermodel.findOneAndUpdate({email:sender},{$push:{friends:[data2.name,receiver]}});
        const update2=await usermodel.findOneAndUpdate({email:receiver},{$push:{friends:[data1.name,sender]}});
        const deletefriendRequest=await usermodel.findOneAndUpdate({email:receiver},{$pull:{friendRequest:[data1.name,sender]}});
        console.log("added friend to friend list");
        return res.status(400).json({success:true});
    }
    catch(e){
        console.log("error found at accepting friend request "+e);
        return res.status(400).json({success:true});
    }
})


module.exports=router;