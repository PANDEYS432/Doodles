const livegames=require("./../models/currentlivegames.js");


async function storeGameinDb(roomId,Private){
    try{
        const find=await livegames.findOne({roomId:roomId});
        if(find==null){
            console.log("Creating a fresh Room");
            const storeRoomInDb=new livegames({
                roomId:roomId,
                members:1,
                Private:Private
            })
            storeRoomInDb.save();
        }
        else{
            console.log("adding user to existing room ");
            const data=await livegames.findOneAndUpdate({roomId:roomId},{
                members:find.members+1
            });
        }
    }
    catch(e){
        console.log("error at updating live games "+e);
    }
    
}

module.exports=storeGameinDb;

