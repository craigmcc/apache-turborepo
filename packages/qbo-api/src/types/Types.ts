/**
 * Types related to QuickBooks Online refresh operations.
 */

// OAuth Authorization Request
export type OAuthAuthorizationRequest = {
  client_id: string;
  redirect_uri: string;
  response_type: "code";
  scope: string;
  state?: string;
}

// OAuth Refresh Request
export type OAuthRefreshRequest = {
//  client_id: string;
//  client_secret: string;
  grant_type: "refresh_token";
  refresh_token: string;
}

// OAuth Refresh Response
export type OAuthRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

// OAuth Token Request
export type OAuthTokenRequest = {
  client_id: string;
  client_secret: string;
  code?: string;           // Required for authorization_code grant type
  grant_type: "authorization_code" | "refresh_token";
  redirect_uri?: string;  // Required for authorization_code grant type
}

// OAuth Token Response
export type OAuthTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

// Information returned for accessing QBO APIs
export type QboApiInfo = {
  accessToken: string;
  baseUrl: string;
  minorVersion: string;
  realmId: string;
  refreshToken: string;
}

// Information from QBO "Well Known Info" endpoints
export type QboWellKnownInfo = {
  authorization_endpoint: string;
  claims_supported: string[];
  id_token_signing_alg_values_supported: string[];
  issuer: string;
  jwks_uri: string;
  response_types_supported: string[];
  revocation_endpoint: string;
  scopes_supported: string[];
  subject_types_supported: string[];
  token_endpoint: string;
  token_endpoint_auth_methods_supported: string[];
  userinfo_endpoint: string;
}
