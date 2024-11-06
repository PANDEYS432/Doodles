const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());


router.post("/storeuser",async (req,res)=>{
    try{

    //    console.log("storing info");
       const data=req.body;
       const email=data.email;
       const username=data.nickname;
       var check=await usermodel.find({email:email});
       if(check.length==0){
            const userdata=new usermodel({
                name:data.nickname,
                email:data.email,
                isOnline:"yes",
            })
            userdata.save();
       }
       else{
        try{
            await  usermodel.updateOne({email:email},{
                $set:{
                    isOnline:"yes",
                }
            });
        }
        catch(e){
            console.log("error in saving isonline "+e);
        }
        
       }
    }
    catch(e){
        console.log("error at storing user info: "+e);
        return res.status(400).json({success:true});
    }
})

module.exports=router;