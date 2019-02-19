import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import {CURRENT_USER_QUERY} from './User';

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`

const Signout = props => {

  return (
    <Mutation 
    mutation={SIGNOUT_MUTATION}
    refetchQueries={[
      {query: CURRENT_USER_QUERY }
    ]}>
      {(signout, {error, loading}) => {
        return <button type="submit" onClick={ async e => {
          const res = await signout()
        }}>
          Sign out          
        </button>
      }}
    </Mutation>
  )
}

export default Signout