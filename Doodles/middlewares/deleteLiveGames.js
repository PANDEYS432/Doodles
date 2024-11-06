const livegames=require("./../models/currentlivegames.js");


async function deleteLiveGames(roomId){
    try{
        const data=await livegames.deleteOne({roomId:roomId});
        console.log("game removed from db succesfully",roomId);
    }
    catch(e){
        console.log("error at deleting live games "+e);
    }
    
}

module.exports=deleteLiveGames;

