import React from 'react';
import PleaseSignIn from '../components/PleaseSingin';
import Permissions from '../components/Permissions';

const PermissionsPage = () => {
  
  return (
    <div>
      <PleaseSignIn>
        <Permissions /> 
      </PleaseSignIn>
    </div>
  );
};

export default PermissionsPage;
