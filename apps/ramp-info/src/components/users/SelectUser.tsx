"use client";

/**
 * UI to list and/or filter Users, then select one for use in the app.
 */

// External Modules ----------------------------------------------------------

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import { fetchDepartments } from "@/actions/DepartmentActions";
import { fetchUsers } from "@/actions/UserActions";
import { useAccessTokenContext } from "@/contexts/AccessTokenContext";
import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import { logger } from "@/lib/ClientLogger";
import {
  DepartmentsResponse,
  RampDepartment,
  RampResult,
  RampUser,
  UsersResponse
} from "@/types/Models";

// Private Objects ------------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function SelectUser() {

  const {accessToken} = useAccessTokenContext();
  const [allDepartments, setAllDepartments] = useState<RampDepartment[]>([]);
  const [allUsers, setAllUsers] = useState<RampUser[] | null>(null);
  const [result, setResult] = useState<RampResult<DepartmentsResponse> | RampResult<UsersResponse> | null>(null);
  const {selectedUser, changeSelectedUser} = useSelectedUserContext();

  useEffect(() => {

    const fetchAllDepartments = async () => {
      if (accessToken) {
        const result = await fetchDepartments(accessToken);
        if (result.model) {
          const sortedDepartments = sortDepartments(result.model.data);
          setAllDepartments(sortedDepartments);
          logger.info({
            context: "SelectUser.fetchAllDepartments",
            departments: sortedDepartments,
          });
        }
      } else {
        const result: RampResult<DepartmentsResponse> = {
          error: {
            error_code: "NO_ACCESS_TOKEN",
            message: "You must refresh the access token",
            status: 401,
          },
        };
        logger.error({
          context: "SelectUser.fetchAllDepartments",
          result: result,
        });
        setResult(result);
      }
    }

    const fetchAllUsers = async () => {
      if (accessToken) {
        const result = await fetchUsers(accessToken);
        setResult(result);
        if (result.model) {
          const sortedUsers = sortUsers(result.model.data);
          setAllUsers(sortedUsers);
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

    fetchAllDepartments();
    fetchAllUsers();

  }, [accessToken]);

  function departmentName(departmentId: string | null | undefined) {
    const department = allDepartments.find((d) => d.id === departmentId);
    return department ? department.name : "Unknown";
  }

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
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {allUsers?.map((user) => (
              <tr
                className={selectedUser?.id === user.id ? "table-primary" : ""}
                key={user.id}
                onClick={() => changeSelectedUser(selectedUser?.id === user.id ? null : user)}
              >
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.department_id ? departmentName(user.department_id) : "Unknown"}</td>
                <td>{user.is_manager ? "Manager" : "User"}</td>
                <td>{user.status}</td>
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

// Private Functions ---------------------------------------------------------

function sortDepartments(departments: RampDepartment[]) {
  return departments.sort((a, b) => {

    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;

  });

}

function sortUsers(users: RampUser[]) {
  return users.sort((a, b) => {

    const aFirstName = a.first_name || "";
    const aLastName = a.last_name || "";
    const bFirstName = b.first_name || "";
    const bLastName = b.last_name || "";

    if (aLastName < bLastName) {
      return -1;
    }
    if (aLastName > bLastName) {
      return 1;
    }
    if (aFirstName < bFirstName) {
      return -1;
    }
    if (aFirstName > bFirstName) {
      return 1;
    }
    return 0;

  });

}
