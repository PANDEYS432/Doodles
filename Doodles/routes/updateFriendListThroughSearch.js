const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());

async function check(sender,friendRequest){
    console.log("sender: ",sender);
    var check=0;
    friendRequest.map(element=>{
        console.log(element[1]==sender,element[1],sender);
        if(element[1]==sender){
            check=1;
        }
    });
    if(check==1) return true;
    else
    return false;
}

router.post("/updateFriendListThroughSearch",async (req,res)=>{
    try{
        const sender=req.body.sender;
        const receiver=req.body.receiver;
        const data1=await usermodel.findOne({email:sender});
        const data2=await usermodel.findOne({email:receiver});
        if(data2==null) return res.status(200).json({success:false});
        const approval=await check(sender,data2.friendRequest);
        console.log(approval);
        if(approval==true){
            console.log("friend request sent again");
            return res.status(200).json({success:false});
        }
        const update2=await usermodel.findOneAndUpdate({email:receiver},{$push:{friendRequest:[data1.name,sender]}});
        console.log("added friendrequest to friend list through search");
        return res.status(200).json({success:true});
    }
    catch(e){
        console.log("error found at accepting friend request through search "+e);
        return res.status(400).json({success:false});
    }
})


module.exports=router;