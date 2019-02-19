import React from 'react';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3, p {
    margin: 0;    
  }
`

const CartItem = ({cartItem }) => {  
  if (!cartItem.item) 
    return (
    <CartItemStyles>
      This Item has been removed
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>)

  const item = cartItem.item;
  return (
    <CartItemStyles>
      <img src={item.image} width="100" alt=""/>
      <div className="cart-item-details">
        <h3>{item.title}</h3>
        <p>
          {formatMoney(item.price)}
          { ' - ' }
          <em>
            {cartItem.quantity} &times; {formatMoney(item.price * cartItem.quantity)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.prototypes = {
  cartItem: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    largeImage: PropTypes.string,
    price: PropTypes.number    
  }).isRequired
}

export default CartItem;