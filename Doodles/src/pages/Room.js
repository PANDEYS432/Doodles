import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logo from "./../images/scribble.png"
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from '../components/homecomponents/Navbar';

const Room = () => {
    const {isAuthenticated,user} = useAuth0();
    const [Private,setPrivate]=useState(0);
    const reactNavigator = useNavigate();
    if(isAuthenticated!=true){
        reactNavigator('/');
    }
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const createNewRoom = async (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = async () => {
        var isHost=0;
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }
        const check=await fetch(`${process.env.REACT_APP_LOCALURL}/checkBeforeCreatingRoom`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({roomId}),
        });
        const data=await check.json();
        console.log("check: ",data.value);
        if(data.value=="false" || data.value==false){
            alert("Same roomid already exist create a new one!!");
            return;
        }

        const ishost=await fetch(`${process.env.REACT_APP_LOCALURL}/findRooms`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({roomId}),
        });
        const ishost_data=await ishost.json();
        if(ishost_data.ishost==1){
            isHost=1;
        }
        // Redirect
        navigate(`/room/${roomId}`, {
            state: {
                username,
                isHost,
                Private
            },
        });
    };

    const handleInputEnter = async (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };
    return (
        <>
            <Navbar/>
            <div className="homePageWrapper">
                <div className="formWrapper">
                    <img
                        className="homePageLogo"
                        src={logo}
                        alt="scribble logo"
                    />
                    <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                    <div className="inputGroup">
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="ROOM ID"
                            onChange={(e) => setRoomId(e.target.value)}
                            value={roomId}
                            onKeyUp={handleInputEnter}
                        />
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="USERNAME"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            onKeyUp={handleInputEnter}
                        />
                        <div className='switch_div'>
                            <label class="switch">
                                <input onChange={()=>setPrivate(!Private)} type="checkbox"/>
                                <span class="slider round"></span>
                            </label>
                            <button className="btn joinBtn" onClick={joinRoom}>
                                Create
                            </button>
                        </div>
                        
                        <span className="createInfo">
                            If you don't have an invite then create <br></br>
                           
                        </span>
                        <p onClick={createNewRoom} className="createNewBtn">New Room</p>
                        
                    </div>
                </div>
                
            </div>
        </>
    );
};

export default React.memo(Room);
