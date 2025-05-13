"use client";

/**
 * UI to list and/or filter Users, then select one for use in the app.
 */

// External Modules ----------------------------------------------------------

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import { fetchUsers } from "@/actions/UserActions";
import { useAccessTokenContext } from "@/contexts/AccessTokenContext";
//import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import {RampResult, User, UsersResponse} from "@/types/Models";

// Private Objects ------------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function SelectUser() {

  const {accessToken} = useAccessTokenContext();
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [result, setResult] = useState<RampResult<UsersResponse> | null>(null);
//  const {selectedUser, changeSelectedUser} = useSelectedUserContext();

  useEffect(() => {

    const fetchAllUsers = async () => {
      if (accessToken) {
        const result = await fetchUsers(accessToken);
        setResult(result);
        if (result.model) {
          // TODO - sort users by last name, first name
          setAllUsers(result.model.data);
        }
      } else {
        setResult({
          error: {
            error_code: "NO_ACCESS_TOKEN",
            message: "You must refresh the access token",
            status: 401,
          },
        });
      }
    }

    fetchAllUsers();

  }, [accessToken]);

  return (
    <div>

      {(!result) ? (
        <p className="bg-info">Fetching users...</p>
      ) : null }

      {(result && result.model) ? (
        <div>
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
            </tr>
            </thead>
            <tbody>
            {allUsers?.map((user) => (
              <tr key={user.id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
              </tr>
            ))}
            </tbody>
          </Table>
        </div>
      ) : null }

      {(result && result.error) ? (
        <div className="bg-danger">
          <p>Error fetching users: {result!.error?.message}</p>
          <pre>{JSON.stringify(result!.error, null, 2)}</pre>
        </div>
      ) : null }

    </div>
  )
}
