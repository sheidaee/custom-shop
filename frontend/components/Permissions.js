import React from 'react';
import { Query, Mutation } from 'react-apollo';  
import Error from './ErrorMessage';
import gql from 'graphql-tag'; 
import PropTypes from 'prop-types'

import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
  
`
const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions =  (props) =>  (
  <Query query={ALL_USERS_QUERY}>
    {({data, loading, error}) => 
     (
      <div>
        <Error error={error}></Error>
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map( (permission, index) => <th key={index}>{permission}</th> )}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map( (user, index) => <UserPermissions key={index} user={user}/> )}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermissions extends React.Component {
  // user: PropTypes.object.isRequired
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email:PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  }

  permissionChangeHandler = (e) => {
    const checkbox = e.target
    // take a copy of the current permissions
    let updatedPermissions = [...this.state.permissions]
    
    // figure out if we need to remove or add this permissions
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value)      
    }
    else {
      updatedPermissions = updatedPermissions.filter( permission => permission !== checkbox.value )
    }

    this.setState({ permissions: updatedPermissions })
  }

  state = {
    permissions: this.props.user.permissions  
  }

   render() {
     const user = this.props.user
     return (
       <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
          permissions: this.state.permissions,
          userId: this.props.user.id
        }}>
        {(updatePermissions, {loading, error}) => (
          <>
            {error && <tr><td colSpan="8"><Error error={error}/></td></tr> }
            <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {possiblePermissions.map((permission, index) => (
                  <td key={index}>
                    <label htmlFor={`${user.id}-permission-${permission}`}>
                      <input 
                        id={`${user.id}-permission-${permission}`}
                        type="checkbox" 
                        checked={
                          this.state.permissions.includes(permission)
                        }
                        value={permission}
                        onChange={this.permissionChangeHandler}
                      />
                    </label>
                  </td>
              ))}
              <td>
                <SickButton 
                type="button" 
                disabled={loading} 
                onClick={updatePermissions}
                >Updat{loading ? 'ing' : 'e'}</SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
     );
   }
}

export default Permissions;