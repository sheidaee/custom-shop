import React, { Component } from 'react';
import StringCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import User, { CURRENT_USER_QUERY } from './User';

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
}

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

class TakeMyMoney extends Component {
  tokenHandler = async (res, createOrder) => {
    NProgress.start()
    // manually call the mutation once we have stripe token
    const order = await createOrder({
      variables: {
        token: res.id
      }
    })
    .catch(err =>  {
      alert(err.message)
    })

    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id },

    })
    
  }
  render() {
    return (
      <User>
        { ({data: {me}, loading}) => {
          if(loading) return null;

          return(
            <Mutation 
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[
                {query: CURRENT_USER_QUERY}
              ]}
            >
              {(createOrder) => (
                <StringCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Custom Shop"
                  description={`Order of ${totalItems(me.cart)} items`}
                  image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                  stripeKey="pk_test_9fJtg3G73qFMGLfHBusOTCKF"
                  currency="USD"
                  email={me.email}
                  token={res => this.tokenHandler(res, createOrder)}
                >
                  {this.props.children}
                </StringCheckout>
              )}
            </Mutation>
          )
        }}
        
      </User>
    );
  }
}

export default TakeMyMoney;
export { CREATE_ORDER_MUTATION };