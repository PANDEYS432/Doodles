import React, { useState } from 'react'
import './../../css/navbar.css'
import logo from './../../images/scribble.png'
import { useAuth0 } from "@auth0/auth0-react"
import { FaBell } from "react-icons/fa";
import Notification from "./../Notification.js"
//html code for navbar
const Navbar = ({email}) => {

  //using auth0 feature for shwoing logout button on authentication
  const { user,logout,isAuthenticated } = useAuth0();
  const [shownotificationdiv,setshownotificationdiv]=useState(0);
  const [notification,setNotification]=useState([]);
  async function getoffline(){
    console.log("offline");
    const data=await fetch(`${process.env.REACT_APP_LOCALURL}/offline`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
    logout({ logoutParams: { returnTo: window.location.origin } });
  }
  async function shownotificationdivfunc(){
    const data=await fetch(`${process.env.REACT_APP_LOCALURL}/getallnotifications`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
    const notifs=await data.json();
    // console.log(notifs);
    setshownotificationdiv(!shownotificationdiv);
    setNotification(notifs.notification);
  }

  // var url="/profile/"+email;
  return (
    <>
      <div className='outernav'>
        <div className='innerdiv1'>
          <img className="logoimg" src={logo}></img>
          <h3>PICASSO</h3>
        </div>
        <div className='innerdiv2'> 
          <a href="/">Home</a>
          <a href="/joinroom">Play</a>
          <a href="/createRoom">Create</a>
          {
            isAuthenticated ?<a href="/profile">Profile</a>:<></>
          }
          {
            isAuthenticated?<FaBell onClick={shownotificationdivfunc} size={20} className='notificationbtn'/>:<></>
          }
          {
            isAuthenticated && <button className="logoutbtn" onClick={getoffline}>Log Out</button>
          }
          
        </div>
      </div>
      {
        shownotificationdiv?( 
          <div className='notification_outerdiv'>
            
            {notification.length!=0?(
                <div className='notification_innerdiv'>
                  <h3>Notifications:</h3>
                  {notification?.map((payload)=>{
                    return (<Notification name={payload[0]} room={payload[1]}/>);
                  })}
                </div>
            ):<p>No new notifications to show</p>
            }
          </div>
        ):<></>
        }
    </>
  )
}

export default Navbar;