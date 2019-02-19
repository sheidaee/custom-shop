import React from 'react';
import Reset from '../components/Reset';

const sell = (props) => {
  
  return (
    <div>
      <p>Reset Your password {props.query.resetToken}</p>
      <Reset resetToken={props.query.resetToken} />    
    </div>
  );
};

export default sell;
