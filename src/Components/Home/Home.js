import React from 'react';
import '../Styles.css'
import TechnicalDirector from './TechnicalDirector';
import Player from './Player';

const Home = ({onLogout}) => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    return(
        <div>
            {userDetails && (
                !userDetails.user_type ? (
                    <TechnicalDirector dtId={userDetails.user_id}/>
                ) : (
                    <Player playerId={userDetails.user_id}/>
            ))}
        </div>
    );
}

export default Home;