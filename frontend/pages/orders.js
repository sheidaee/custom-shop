import React from 'react';
import PleaseSignIn from '../components/PleaseSingin';
import OrderList from '../components/OrderList';

const OrderPage = (props) => {
  
  return (
    <div>
      <PleaseSignIn>
        <OrderList />
      </PleaseSignIn>
    </div>
  );
};

export default OrderPage;
