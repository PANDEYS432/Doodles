import React, { useEffect,useState} from 'react';
import { useAuth0 } from "@auth0/auth0-react";
//client avatar component




const Friend = ({name,email,update}) => {
    const { user } = useAuth0();
    const [useremail,setuseremail]=useState(null);
    useEffect(()=>{
        if(user!=null && user!=undefined){
            setuseremail(user.email);
        }
    },[user]);

    async function addToFriendList(){
        const res = await fetch(`${process.env.REACT_APP_LOCALURL}/acceptfriendrequest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({sender:email,receiver:useremail})
        });
        const data=await res.json();
        update();
    }

    return (
        <div className="friend_div">
            <div>
                <p>{name}</p>
            </div>
            <button onClick={addToFriendList} value={email}>Add Friend</button>
        </div>
    );
};

export default Friend;
