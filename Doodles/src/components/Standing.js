import React from 'react';
import Avatar from 'react-avatar';
import "./../css/drawingBoard.css";

//client avatar component
const Standing = ({standings}) => {
    <div className='standings_outerdiv'>
        
        <div className='standings_innerdiv'>
            <h1>Congratulations To All Winners 🎉🎉🎉!!</h1>
            {standings.map((payload,index)=>{
                if(index==0){
                    return(
                        <div className='individual_standings gold'>
                            <div className='standings_name'><p>{payload.username}:</p></div>
                            <div className='standings_points'><p>{payload.points}</p></div>
                        </div>
                    )
                }
                else if(index==1){
                    return(
                        <div className='individual_standings silver'>
                            <div className='standings_name'><p>{payload.username}</p></div>
                            <div className='standings_points'><p>{payload.points}</p></div>
                        </div>
                    )
                }
                else if(index==2){
                    return(
                        <div className='individual_standings bronze'>
                            <div className='standings_name'><p>{payload.username}</p></div>
                            <div className='standings_points'><p>{payload.points}</p></div>
                        </div>
                    )
                }
                else{
                    return(
                        <div className='individual_standings nomedal'>
                            <div className='standings_name'><p>{payload.username}</p></div>
                            <div className='standings_points'><p>{payload.points}</p></div>
                        </div>
                    )
                }
            })}
        </div>

        <button className='endgamebtn'>End Game</button>
        
    </div>
    
};

export default Standing;
