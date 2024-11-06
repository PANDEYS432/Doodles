import React from 'react';
import Navbar from './../components/homecomponents/Navbar.js';
import Description from '../components/homecomponents/Description.js';
import { useAuth0 } from "@auth0/auth0-react";
import Mainpage from '../components/homecomponents/Mainpage.js';

const Home = () => {
  const {user,isAuthenticated } = useAuth0();
  var email="";
  if(isAuthenticated) email=user.email;
  return (
    <>
      <div className='monitor_div'>
        <Navbar email={email}/> 
        {
          isAuthenticated ?<Mainpage/>:<Description/>
        }
      </div>
      
    </>
  )
}

export default React.memo(Home);
