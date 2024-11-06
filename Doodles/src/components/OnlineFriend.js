import { keyboard } from '@testing-library/user-event/dist/keyboard';
import React from 'react';
import toast from 'react-hot-toast';

//client avatar component
const OnlineFriend = ({sender,name,email,roomId}) => {
    async function sendnotification(){
        const data=await fetch(`${process.env.REACT_APP_LOCALURL}/storenotificationindb`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({sender:sender,name:name,email:email,roomId:roomId}),
        });
        const res=await data.json();
        toast.success('Invite Notification Sent Succesfully!!');
    }
    return (
        <div className="online_singlediv">
            <div className='online_content'>
                <p>{name}</p>
            </div>
            <button onClick={sendnotification} value={email} className='notification_join_btn'>Invite</button>
        </div>
    );
};

export default OnlineFriend;
