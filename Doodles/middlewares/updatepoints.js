const usermodel=require("./../models/userDetail");
const gameHistory=require("./../models/gameHistory");


var date = new Date(); 


async function updatepoints(socketId,rank,points){
    // console.log("upate: "+socketId+" "+rank);
    var res=await usermodel.findOne({socketId:socketId});
    // console.log(res);
    var useremail=res.email;
    var add=0;
    if(rank==1){
        add=10;
    }
    else if(rank==2){
        add=7;
    }
    else if(rank==3){
        add=5;
    }
    else{
        add=-5;
    }
    const find=await gameHistory.findOne({email:useremail});
    if(find==null){
        try{
            var totalmatch=1;
            var first=(rank==1);
            var second=(rank==2);
            var third=(rank==3);
            var totalpoints=add;
            if(totalpoints<0) totalpoints=0;
            var level=Math.floor(totalpoints/10);
            var pastmatches=[{
                    date:date.getDate(),
                    month:date.getMonth(),
                    hour:date.getHours(),
                    min:date.getMinutes(),
                    add,
                    points
                }
            ];
            const data=new gameHistory({
                email:useremail,
                totalMatch:totalmatch,
                first:first,
                second:second,
                third:third,
                totalpoints:totalpoints,
                level:level,
                pastmatches:pastmatches
            })
            data.save();

        }
        catch(e){
            console.log("error at storing points on first time"+ e);
        }
    }
    else{
        try{
            var totalmatch=find.totalMatch+1;
            var first=find.first+(rank==1);
            var second=find.second+(rank==2);
            var third=find.third+(rank==3);
            var totalpoints=find.totalpoints+add;
            if(totalpoints<0) totalpoints=0;
            var level=Math.floor(totalpoints/10);
            var matchdata={
                date:date.getDate(),
                month:date.getMonth(),
                hour:date.getHours(),
                min:date.getMinutes(),
                add,
                points
            };
            // console.log(matchdata);
            // console.log(find);
            // console.log(find.pastmatches);
            // var pastmatches=find.pastmatches.push(matchdata);
            var pastmatches = [...find.pastmatches, matchdata];
            // console.log(pastmatches);
            const data= await gameHistory.findOneAndUpdate({email:useremail},{
                totalMatch:totalmatch,
                first:first,
                second:second,
                third:third,
                totalpoints:totalpoints,
                level:level,
                pastmatches:pastmatches
            });
            // console.log("data",data);
        }
        catch(e){
            console.log("error at storing points after first time"+ e);
        }
    }
}

module.exports=updatepoints;