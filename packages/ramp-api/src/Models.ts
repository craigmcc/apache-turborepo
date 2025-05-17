/**
 * Types for Ramp API model objects.
 */

// Data Models ---------------------------------------------------------------

/**
 * A Ramp API Department object.
 */
export type RampDepartment = {
  // Unique identifier of the department
  id: string;
  // The name of the department
  name: string;
}

/**
 * The OAuth2 response for a successful token request.
 */
export type RampTokenResponse = {
  // The access token
  access_token: string;
  // The type of token
  token_type: string;
  // The expiration time in seconds
  expires_in: number;
  // The scope of the token
  scope: string;
}

/**
 * A Ramp API User object.
 */
export type RampUser = {
  // Unique identifier of the company that the user belongs to
  business_id: string | null;
  // A list of custom fields for this user
  custom_fields: {
    [key: string]: string | number | boolean | null;
  };
  // Unique identifier of the user's department
  department_id: string | null;
  // The user's email address
  email: string;
  // Alternative identifier for an employee, which is from an external system,
  // that can be used in place of an email
  employee_id: string | null;
  // Unique identifier of the business entity that the user belongs to
  entity_id: string | null;
  // First name of the user
  first_name: string | null;
  // Unique user identifier
  id: string;
  // Is this user a manager?
  is_manager: boolean;
  // Last name of the user
  last_name: string | null;
  // Unique identifier of the user's location
  location_id: string | null;
  // Unique identifier of the user's manager
  manager_id: string | null;
  // The user's phone number
  phone: string | null;
  // The user's role
  role: UserRole | null;
  // The user's status with respect to Ramp
  status: UserStatus;
}

/**
 * Role of a User
 */
export type UserRole =
  "ADVISOR_CONSOLE_ADMIN" | "ADVISOR_CONSOLE_USER" | "AUDITOR" |
  "BUSINESS_ADMIN" | "BUSINESS_BOOKKEEPER" | "BUSINESS_OWNER" |
  "BUSINESS_USER" | "DEVELOPER_ADMIN" | "GUEST_USER" | "IT_ADMIN" |
  "PRESALES_DEMO_USER" | "UNBUNDLED_ADMIN" | "UNBUNDLED_BOOKKEEPER" |
  "UNBUNDLED_OWNER" | "UNBUNDLED_USER" | "VENDOR_NETWORK_ADMIN";

/**
 * Status of a User.
 */
export type UserStatus =
  "INVITE_EXPIRED" | "INVITE_PENDING" | "USER_ACTIVE" |
  "USER_INACTIVE" | "USER_ONBOARDING" | "USER_SUSPENDED";

// Interface Definitions -----------------------------------------------------

/**
 * The Ramp API response for a fetch departments request.
 */
export type RampDepartmentsResponse = {
  // The list of departments
  data: RampDepartment[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * The "error_v2" portion of the Ramp response with an error, plus a spot for
 * the HTTP status code.
 */
export type RampError = {
  // Additional info about the error (if any)
  additional_info?: {
    [key: string]: string;
  };
  // The error code
  error_code: string;
  // The error message
  message: string;
  // Notes about the error
  notes?: string;
  // The HTTP status code
  status: number;
}

/**
 * Generic describing the result returned by a Ramp API call.
 * Either an error or a model object will be included, but not both.
 * The headers from the response are normally included.
 *
 * @param M                             The type of model object being returned
 * @param E                             The type of error object being returned
 *                                      (defaults to RampError)
 */
export type RampResult<M, E = RampError> = {
  // The error object returned by the action (if any)
  error?: E;
  // The headers returned by the action (if any)
  headers?: Headers;
  // The model object returned by the action (if any)
  model?: M;
}

/**
 * The Ramp API response for a fetch users request.
 */
export type RampUsersResponse = {
  // The list of users
  data: RampUser[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}
