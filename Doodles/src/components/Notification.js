import { keyboard } from '@testing-library/user-event/dist/keyboard';
import React from 'react';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router-dom';


//client avatar component
const Notification = ({name,room}) => {
    const reactNavigator = useNavigate();
    async function gotoroom(e){
        const value=e.currentTarget.getAttribute("value");
        const url="/joinroom/"+value;
        reactNavigator(url);
    }
    return (
        <div className="notification_singlediv">
            <div className='notification_content'>
                <p>{name} is inviting you to play the game.Join him now for some action...😊😊 </p>
            </div>
            <button onClick={gotoroom} value={room} className='notification_join_btn'>Join</button>
        </div>
    );
};

export default Notification;
