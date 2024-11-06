const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");
const gamehistory=require("./../models/gameHistory");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());


router.post("/findfriends",async (req,res)=>{
    try{
        
        var email=req.body.emailid;
        // console.log(email);
        const data=await usermodel.find({email:email});
        // console.log("data:" +data);
        return (res.status(200).json({data:data}));
    }
    catch(e){
        console.log("error found at fetching friends data "+e);
        return res.status(400).json({success:true});
    }
})

router.post("/findmatchdata",async (req,res)=>{
    try{
        
        var email=req.body.emailid;
        // console.log(email);
        const data=await gamehistory.find({email:email});
        // console.log("data:" +data);
        return (res.status(200).json({data:data}));
    }
    catch(e){
        console.log("error found at fetching friends data "+e);
        return res.status(400).json({success:true});
    }
})

module.exports=router;