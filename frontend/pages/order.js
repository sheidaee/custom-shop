import React from 'react';
import PleaseSignIn from '../components/PleaseSingin';
import Order from '../components/Order';

const OrderPage = (props) => {
  
  return (
    <div>
      <PleaseSignIn>
        <Order id={props.query.id} />
      </PleaseSignIn>
    </div>
  );
};

export default OrderPage;
