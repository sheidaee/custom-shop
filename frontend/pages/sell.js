import React from 'react';
import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSingin';

const sell = () => {
  
  return (
    <div>
      <PleaseSignIn>
        <CreateItem />      
      </PleaseSignIn>
    </div>
  );
};

export default sell;
