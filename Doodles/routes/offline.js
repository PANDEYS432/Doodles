const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());


router.post("/offline",async (req,res)=>{
    try{
        console.log("running offline");
    //    console.log(req.body);
       const data=req.body;
       const email=data.email;
       var check=await usermodel.find({email:email});
       if(check.length==0){
            const userdata=new usermodel({
                name:data.nickname,
                email:data.email,
                isOnline:"no",
            })
            userdata.save();
       }
       else{
        try{
            await  usermodel.updateOne({email:email},{
                $set:{
                    isOnline:"no",
                }
            });
        }
        catch(e){
            console.log("error in saving isonline "+e);
        }
        
       }
       return res.status(200).json({success:true});
    }
    catch(e){
        console.log("error at storing user info: "+e);
        return res.status(400).json({success:true});
    }
})

module.exports=router;