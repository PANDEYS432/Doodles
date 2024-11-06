import React,{useEffect, useState} from 'react';
import './../../css/carousel.css';
import {FaAngleRight,FaAngleLeft} from "react-icons/fa6";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

//main page to be shown after authentication--------------------------------------------------------------

const Mainpage = () => {
  const [ct,setct]=useState(0);
  const {user} = useAuth0();
  const navigate = useNavigate();

  
  useEffect(()=>{
    if(user==null) return;
    async function start(){
      const storeuserindb=await fetch(`${process.env.REACT_APP_LOCALURL}/storeuser`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(user),
      });
    }
    start();
    
  },[user]);

  // window.addEventListener("beforeunload", function (e) {
  //   e.preventDefault(); // If you want a confirmation dialog
  //   e.returnValue = ''; // If you want a confirmation dialog

  //   fetch("process.env.REACT_APP_LOCALURL/offline",{
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json'
  //     },
  //     credentials: 'include',
  //     body: JSON.stringify(user),
  //   }).then(response => console.log('Page unload event sent to server.'))
  //   .catch(error => console.log('Error occurred while sending page unload event to server.'));
  //   delete e['returnValue'];
  //   return;
    
  // });

  async function play_with_randoms(){
    const findroom = await fetch(`${process.env.REACT_APP_LOCALURL}/findPublicRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({}),
    });

    const data=await findroom.json();
    if(data.value==false){
      alert("Sorry No Active Rooms Found");
      return;
    }
    // console.log("random: ",data);
    var url="/joinroom/"+data.room;
    navigate(url);
  }

  async function play_with_friends(){
    navigate("/joinroom");
  }

  async function create_game(){
    navigate("/createRoom");
  }
    

  //slider data for changing states------------------------------------------------------------------------
  const arr=[
    {
      headingData:"Play With ",
      headingspan:"Randoms!",
      paragraphData:"Doodle, guess, and compete with strangers globally in Picasso's 'Play with Randoms' feature for endless artistic fun!",
      "imageurl":require("./../../images/play_with_randoms_3.png"),
      buttonData:"Play Now",
      func:play_with_randoms
    },
    {
      headingData:"Play With ",
      headingspan:"Friends!",
      paragraphData:"Sketch and guess alongside your friends in real-time challenges using Picasso's Play with Friends feature, making every match an art-filled adventure!",
      "imageurl":require("./../../images/play_with_friends_1.png"),
      buttonData:"Play Now",
      func:play_with_friends
    },
    {
      headingData:"Create Your Own ",
      headingspan:"Lobby!",
      paragraphData:"Take the lead and create your artistic showdowns by hosting personalized games with friends through Picasso's 'Host Your Own Game' feature, setting the canvas for creative fun!",
      "imageurl":require("./../../images/create_your_game_1.png"),
      buttonData:"Create Now",
      func:create_game
    },
  ];


  //slide for outer slider div---------------------------------------------------------------------
  const background_image_styles={
    width:"100vw",
    height:"100%",
    backgroundImage:`url(${arr[ct].imageurl})`,
    backgroundSize:"cover",
  }

  const gotonext=()=>{
    if(ct==2){
      setct(0);
    }
    else setct(ct+1);
  }
  const gotoprev=()=>{
    if(ct==0){
      setct(2);
    }
    else setct(ct-1);
  }

  return (
    <>
      <div className='mainpage_div'>
        <div className='slider_div'>
          <div onClick={gotoprev} className='left'><FaAngleLeft/></div>
          <div onClick={gotonext} className='right'><FaAngleRight/></div>
          <div  style={background_image_styles} className='mainpage_outerdiv'>
            <div  className='mainpage_innerdiv1'>
              <div className='mainpage_innerdiv11'>
                <h1>{arr[ct].headingData}<span>{arr[ct].headingspan}</span></h1>
                <p>{arr[ct].paragraphData}</p>
                <button onClick={arr[ct].func} className='loginbtn'>{arr[ct].buttonData}</button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  )
}

export default Mainpage;