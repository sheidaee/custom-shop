import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User'

const SIGIN_MUTATION =  gql`
  mutation SIGIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`

class Signin extends Component {
  state = {
    password: '',
    email: ''
  }

  formChangeHandler = (e) => {
    const {name, type, value} = e.target

    this.setState({[name]: value})
  }
  render() {
    return (
      <Mutation 
        mutation={SIGIN_MUTATION} 
        variables={
          this.state        
        }
        refetchQueries={[
          {
            query: CURRENT_USER_QUERY
          }
        ]}
      >
      {(signup, {error, loading}) => {
        
        return (<Form method="post" onSubmit={async(e) => {
          e.preventDefault()
          const res = await signup()
          
          this.setState({name: '', email: '', password: ''})
          
        }}>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Sign into your Account</h2>
                  <Error error={error}/>
                  <label htmlFor="email">
                    Email
                    <input type="email" name="email"
                      placeholder="email"
                      value={this.state.email}
                      onChange={this.formChangeHandler}/>
                  </label>
                  <label htmlFor="password">
                    Password
                    <input type="password" name="password"
                      placeholder="password"
                      value={this.state.password}
                      onChange={this.formChangeHandler}/>
                  </label>

                  <button type="submit">Sign In!</button>
                </fieldset>
            </Form>)
        }}
        </Mutation>
    );
  }
}

export default Signin;