# packages/qbo-api

A package of types and retrieval modules for retrieving information from
the [QuickBooks Online (QBO) API Platform](https://developer.intuit.com/app/developer/qbo/docs/get-started).

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/qbo-api": "workspace:*"
  }
}
```

## Authentication

QBO's developer portal allows you to configure one or more applications.  Each application
can either access a "sandbox" (development) environment, or a production environment, with
different configuration requirements.  Therefore, an application that uses this module
will require setting up two different environment variable files -- one for sandbox, and
one for production.

### Configuration for the Sandbox Environment

For the sandbox environment, the following environment variables must be set in the
`.env.sandbox` file in the `apps/{appname}` directory of the app consuming this package:

| Variable Name      | Description                        | Value                                                                   |
|--------------------|------------------------------------|-------------------------------------------------------------------------|
| DATABASE_URL       | URL for your local SQLite database | Example: *file:~/db-qbo-sandbox.db*                                     |
| QBO_BASE_URL       | Base URL for API calls             | `https://sandbox-quickbooks.api.intuit.com`                             |
| QBO_CLIENT_ID      | OAuth2 Client ID                   | Your OAuth2 Client ID from the Intuit Developer Portal                  |
| QBO_CLIENT_SECRET  | OAuth2 Client Secret               | Your OAuth2 Client Secret from the Intuit Developer Portal              |
| QBO_ENVIRONMENT    | Which environment?                 | *sandbox*                                                               |
| QBO_REALM_ID       | Your company ID                    | The Realm ID for your QuickBooks Online sandbox app                     |
| QBO_REDIRECT_URI   | OAuth2 Redirect URI                | Example: *http://localhost:8000/callback*                               |
| QBO_WELL_KNOWN_URL | Well-known configuration URL       | `https://developer.intuit.com/.well-known/openid_sandbox_configuration` |

### Configuration for the Production Environment

For the production environment, Intuit requires that the redirect URI be an `https://` URL.
To run the application locally, the easiest thing to do is to install
[ngrok](https://ngrok.com/), and use it to create a secure tunnel to your local system.
To do so:
* Register with NGrok.
* Download and install the NGrok CLI tool (on MacOS, `brew install ngrok` is the simplest).
* Look up the auth token from your NGrok dashboard, and run `ngrok config add-authtoken {your_token}`.
* On the *Domains* page, you will see a domain name typically ending in ".dev".  This name will be registered in DNS by NGrok.
* In a separate shell window, run `ngrok http 8000` (assuming your local app's OAuth callback is running on port 8000), before running your application.

On Intuit's Developer Portal, you must provide multiple items of information before you can
see the assigned client ID and client secret for your production application:

| Information Item           | Value To Enter                                                                     |
|----------------------------|------------------------------------------------------------------------------------|
| End user license agreement | https://github.com/craigmcc/apache-turborepo/blob/main/LICENSE                     |
| End user privacy policy    | https://github.com/craigmcc/apache-turborepo/blob/main/apps/qbo-refresh/PRIVACY.md |
| Host domain                | The NGrok domain you noted above (e.g., `example.dev`)                             |
| Launch URL                 | Example: *https://{ngrok-domain}*                                                  |
| Disconnect URL             | Example: *https://{ngrok-domain}*                                                  |
| Category for your App      | *Accounting*                                                                       |
| Regulated Industries       | *None of the above*                                                                |
| Hosting Location           | United States                                                                      |
| Compliance Certifications  | Answer the questionnaire questions                                                 |

Intuit says that approval for production apps can take up to 7 business days.

Don't forget to add the redirect URI to your production app registration on
the Intuit Developer Portal.  It should be in the format:
`https://{ngrok-domain}/callback`.

For the production environment, the following environment variables must be set in the
`.env.production` file in the `apps/{appname}` directory of the app consuming this package:

| Variable Name          | Description                        | Value                                                           |
|------------------------|------------------------------------|-----------------------------------------------------------------|
| DATABASE_URL           | URL for your local SQLite database | Example: *file:~/db-qbo-production.db*                          |
| QBO_BASE_URL           | Base URL for API calls             | `https://quickbooks.api.intuit.com`                             |
| QBO_CLIENT_ID          | OAuth2 Client ID                   | Your OAuth2 Client ID from the Intuit Developer Portal          |
| QBO_CLIENT_SECRET      | OAuth2 Client Secret               | Your OAuth2 Client Secret from the Intuit Developer Portal      |
| QBO_ENVIRONMENT        | Which environment?                 | *production*                                                    |
| QBO_LOCAL_REDIRECT_URI | Redirect URI in local app          | Example: *http://localhost:8000/callback*                       |
| QBO_REALM_ID           | Your company ID                    | The Realm ID for your QuickBooks Online sandbox app             |
| QBO_REDIRECT_URI       | OAuth2 Redirect URI for QBO        | Example: *https://{ngrok-domain}:8000/callback*                 |
| QBO_WELL_KNOWN_URL     | Well-known configuration URL       | `https://developer.intuit.com/.well-known/openid_configuration` |

### Usage (Either Environment)

The authentication process uses the OAuth2 Authorization Code flow.  The first time
your application is run, it will direct you to a browser window where you can log in
to Intuit and authorize the application to access your QuickBooks Online data.  After
the first time, the refresh token will be stored locally (but not in source control),
and (if it is still valid) will be used to obtain new access tokens as needed.  If the
refresh token is no longer valid, you will be prompted to re-authenticate.

In the initialization of your application code, retrieve the necessary information
for subsequent API calls, as follows:

```ts
import { fetchApiInfo } from '@repo/qbo-api/AuthActions';

// Timeout when waiting for manual authentication (in milliseconds)
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const apiInfo = await fetchApiInfo(API_TIMEOUT);
```

The timeout specified is to avoid waiting indefinitely for manual authentication to complete.
It should be long enough to allow manual authentication to be performed in the browser.

Then, you can use the returned *apiInfo* object to call other functions in your app
to retrieve data from the QuickBooks Online API.  For example, you might retrieve a list
of all accounts as follows:

```ts
import { fetchAccounts } from '@repo/qbo-api/AccountActions';
import { QboAccount } from '@repo/qbo-api/types/Finance';
import { QboApiInfo } from "@repo/qbo-api/types/Types";

const accounts: Map<string, QboAccount> = await fetchAccounts(apiInfo);
```

The returned values will be a map of all accounts in QBO, keyed by their ID.

## Defined Data Types

Intuit provides documentation for the various data types used in the QuickBooks Online API
in XML Schemas, which are tied to a minor version number of their API.  We are using
version 75 of the API at this time.

For convenience, the relevant [XML Schemas](https://static.developer.intuit.com/resources/v3-minor-version-75.zip)
have been downloaded and unpacked in the qbo-api package, in the `src/xsd` directory.
Corresponding TypeScript types have been generated from these schemas (for the relevant
data types only) in the 'src/types' directory.  The top level object names have been prefixed
with 'Qbo' to avoid name collisions with other packages in this monorepo (such as Prisma
schemas).  The top level object types are in the `src/types/Finance.ts` file,
such as *QboAccount* in the example above.
