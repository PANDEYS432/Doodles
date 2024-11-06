const userDetail=require("./../models/userDetail");


async function approval(friendlist,remail){
    if(friendlist.length==0) return false;
    friendlist.map(element=>{
        if(element[1]==remail) return true;
    })

    return false;
}


async function updateFriendListThroughSocket(mysocketid,muteId){
    try{
        const findemail=await userDetail.findOne({socketId:mysocketid});
        const receiver=await userDetail.findOne({socketId:muteId});
        const check=await approval(findemail.friends,receiver.email);
        if(check==true) return;
        const data=await userDetail.updateOne({socketId:muteId},{$push:{friendRequest:[findemail.name,findemail.email]}});
        console.log("friend request sent successfully!!");
    }
    catch(e){
        console.log("error at sending friend request: "+e);
    }
    
}

module.exports=updateFriendListThroughSocket;

