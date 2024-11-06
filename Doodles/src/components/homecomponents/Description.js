import React from 'react'
import './../../css/navbar.css'
import { useAuth0 } from "@auth0/auth0-react";

//first page to be seen
const Description = () => {
  //using auth0 for authentication
  const { user,loginWithRedirect} = useAuth0();
 
  return (
    
    <div className='outerdesdiv'>
      <div className='innerdesdiv'>
        <div className='innerdesdiv1'>
          <h1>Draw Your <span>Imagination,</span><br/>Guess the <span>Creation!</span></h1>
          <p>"Picasso is a fun and creative drawing and guessing game that challenges players to communicate without words."</p>
          <button className="loginbtn" onClick={() => loginWithRedirect({screen_hint:"/room"})}>LOG IN</button>
        </div>
        <div className='innerdesdiv2'>
          <img className="desimg" src="https://app.svgator.com/assets/svgator.webapp/log-in-girl.svg"/>
        </div>
      </div>
    </div>
  )
}

export default Description
