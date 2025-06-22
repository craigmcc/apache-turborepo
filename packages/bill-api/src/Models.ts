/**
 * Types for Bill API model objects.
 */

// Data Models ---------------------------------------------------------------

/**
 * The parameters for a Bill login request are presented in
 * a content-type of "application/x-www-form-urlencoded"
 * with the following keys:
 * - `devKey`: The Bill developer key
 * - `orgId`: The Bill organization ID
 * - `password`: The Bill password
 * - `userName`: The Bill username
 */

/**
 * The response for a successful Bill login request will be a sessionId as a string.
 */

/**
 * An API operation that fails will return an error object with the following properties:
 */
export type BillErrorResponse = {
  response_status: number; // Will be 1 for an error
  response_message: string; // Will be "Error" for an error
  response_data: {
    error_code: string; // A unique error code
    error_message: string; // A human-readable error message
  }
}

/**
 * A generic list response from the Bill API.  The generic type `T` should be replaced with the specific type of the items in the list.
 */
export type BillListResponse<T> = {
  // The optional ID for the next page of results, if there are more results available
  nextPage?: string;
  // The optional ID for the previous page of results, if there are previous results available
  prevPage?: string;
  // The list of results in the response
  results: T[];
}

/**
 * The request parameters for a Bill login request.
 */
export type BillLoginRequest = {
  // The Bill developer key
  devKey: string;
  // The Bill organization ID
  organizationId: string;
  // The Bill password
  password: string;
  // The Bill username
  username: string;
}

/**
 * The response for a successful Bill login request.
 */
export type BillLoginResponse = {
  // The bill organization ID
  organizationId: string;
  // The session ID to use for subsequent API requests
  sessionId: string;
  // Is this session trusted?
  trusted: boolean;
  // The user ID for the Bill API
  userId: string;
}

/**
 * A Bill User object.
 */
export type BillUser = {
  // The Bill user ID
  id: string;
  // Has this Bill been archived?
  archived: boolean;
  // The date/time the Bill user was created
  createdTime: string;
  // The Bill user email address
  email: string;
  // The Bill user first name
  firstName: string;
  // The Bill user last name
  lastName: string;
  // The Bill user role
  role: BillUserRole;
  // The date/time the Bill user was last updated
  updatedTime: string;
}

/**
 * A Bill User Role object.
 */
export type BillUserRole = {
  // The Bill user role description
  description?: string;
  // The Bill user role ID
  id: string;
  // The Bill user role type
  type: BillUserRoleType;
}

/**
 * The valid user role types for the Bill API.
 */
export type BillUserRoleType =
  "ACCOUNTANT" | "ADMINISTRATOR" | "APPROVER" | "AUDITOR" |
  "CLERK" | "CUSTOM" | "INTERNAL" | "MEMBER" | "NO_ACCESS" |
  "PARTNER" | "PAYER" | "PURCHASE_REQUESTER" | "REVIEWER" | "UNDEFINED";
