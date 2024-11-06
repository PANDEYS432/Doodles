const userDetail=require("./../models/userDetail");


async function storesocketid(socketid,email){
    try{
        await  userDetail.updateOne({email:email},{
            $set:{
                socketId:socketid,
                isOnline:"playing"
            }
        });
    }
    catch(e){
        console.log("error at updating socketid at db: "+e);
    }
    
}

module.exports=storesocketid;

