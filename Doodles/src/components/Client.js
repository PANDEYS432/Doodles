import { keyboard } from '@testing-library/user-event/dist/keyboard';
import React from 'react';
import Avatar from 'react-avatar';


//client avatar component
const Client = ({username ,points,openpowers,clientId,mysocketid}) => {
    return (
        <div onClick={openpowers} value={clientId} className="client">
            <Avatar name={username} size={50} round="14px" />
            <span className="userName">{username}</span>
            <span>{points}</span>
            {/* <span>{clientId}</span> */}
            {/* <span>{mysocketid}</span> */}
        </div>
    );
};

export default Client;
