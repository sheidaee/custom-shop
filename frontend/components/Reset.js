import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types'
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User'

const RESET_MUTATION =  gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken , password: $password, confirmPassword: $confirmPassword) {      
      id
      email
      name       
    }
  }
`

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }
  state = {
    password: '',
    confirmPassword: ''
  }

  formChangeHandler = (e) => {
    const {name, type, value} = e.target

    this.setState({[name]: value})
  }
  render() {
    return (
      <Mutation 
        mutation={RESET_MUTATION} 
        variables={
          {
            resetToken: this.props.resetToken,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword       
          }
        }
        refetchQueries={[
          {query: CURRENT_USER_QUERY}
        ]}
      >
      {(reset, {error, loading, called}) => {
        
        return (<Form method="post" onSubmit={async(e) => {
          e.preventDefault()
          const success = await reset()
          this.setState({password: '', confirmPassword: ''})          
        }}>
                <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Reset your password</h2>
                  {<Error error={error}/>}
                  
                  <label htmlFor="password">
                    Password
                    <input type="password" name="password"
                      placeholder="password"
                      value={this.state.password}
                      onChange={this.formChangeHandler}/>
                  </label>                  

                  <label htmlFor="confirmPassword">
                    Confirm Your Password
                    <input type="password" name="confirmPassword"
                      placeholder="confirmPassword"
                      value={this.state.confirmPassword}
                      onChange={this.formChangeHandler}/>
                  </label>                  

                  <button type="submit">Reset Your Password!</button>
                </fieldset>
            </Form>)
        }}
        </Mutation>
    );
  }
}

export default Reset;