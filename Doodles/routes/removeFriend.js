const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());


router.post("/removeFriend",async (req,res)=>{
    try{
        const sender=req.body.sender;
        const receiver=req.body.receiver;
        const data1=await usermodel.findOne({email:sender});
        const data2=await usermodel.findOne({email:receiver});
        const deletefriend1=await usermodel.findOneAndUpdate({email:sender},{$pull:{friends:[data2.name,receiver]}});
        const deletefriend2=await usermodel.findOneAndUpdate({email:receiver},{$pull:{friends:[data1.name,sender]}});
        console.log("deleted friend from friend list");
        return res.status(400).json({success:true});
    }
    catch(e){
        console.log("error found at deleting friend "+e);
        return res.status(400).json({success:true});
    }
})


module.exports=router;