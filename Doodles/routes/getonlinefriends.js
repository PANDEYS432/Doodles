const express = require("express");
const bodyParser = require("body-parser");
const router =  new express.Router();
const usermodel=require("./../models/userDetail");
const notification=require("./../models/notificationdb");
router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(express.json());

async function getonlinefriendsarr(friends){
    var arr=[];
    friends.map((payload)=>{
        const find=usermodel.findOne({email:payload[1]});
        console.log(find);
        if(find.isOnline=="yes"){
            arr=[...arr,find.email];
        }
    });
    return arr;
}

router.post("/getonlinefriends",async (req,res)=>{
    const sender=req.body.email;
    const senderdata=await usermodel.findOne({email:sender});
    var arr=[];
    await Promise.all(
        senderdata.friends.map(async (payload) => {
            const find=await usermodel.findOne({email:payload[1]});
            // console.log(find);
            if(find.isOnline=="yes"){
                arr=[...arr,[find.name,find.email]];
            }
        })
    )
    // console.log(arr);
    return res.status(200).json({success:true,arr:arr});

})

router.post("/storenotificationindb",async (req,res)=>{
    try{
        const sender=req.body.sender;
        const receiver=req.body.email;
        const room=req.body.roomId;
        const user=await usermodel.findOne({email:sender});
        const find=await notification.findOne({email:receiver});
        if(find==null){
            const notif=new notification({
                email:receiver,
                notifications:[[user.name,room]]
            })
            notif.save();
        }
        else{
            // var arr=find.notifications;
            const update=await notification.findOneAndUpdate({email:receiver},{$push:{notifications:[user.name,room]}});
        }
        // console.log(arr);
        console.log("notifiaciton sent succesfully!!");
        return res.status(200).json({success:true});
    }
    catch(e){
        console.log("error at storing notification",e);
    }
    

})

router.post("/getallnotifications",async (req,res)=>{
    try{
        const email=req.body.email;
        const notifs=await notification.findOne({email:email});
        return res.status(200).json({success:true,notification:notifs.notifications});
    }
    catch(e){
        console.log("error at storing notification",e);
    }
    

})

module.exports=router;