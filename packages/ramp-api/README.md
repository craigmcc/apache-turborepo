# packages/ramp-api

A package of types and retrieval modules for retrieving information from
the [Ramp API Platform](https://docs.ramp.com/developer-api/v1/introduction).
Since we currently only use the Ramp Card workflows, those are the focus of this package.

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/ramp-api": "workspace:*"
  }
}
```

## Authentication

The **AuthActions** module provides the *fetchAccessToken()*
function to retrieve access token required to interact with Ramp APIs.  This
function requires the following environment variables to be set (in the `.env` file
in the `apps/{appname}` directory of the app consuming this package):

| Variable Name              | Description                                                                     |
|-----------------------------|---------------------------------------------------------------------------------|
| RAMP_PROD_API_BASE_URL      | The base URL for the Ramp production API (https://api.ramp.com).                |
| RAMP_PROD_API_CLIENT_ID     | The client ID for the Ramp production API you received when you registered.     |
| RAMP_PROD_API_CLIENT_SECRET | The client secret for the Ramp production API you received when you registered. |
| RAMP_PROD_API_SCOPE         | The OAuth scopes you will need for this application (space separated).          |

Currently, the following scopes must be included:
* accounting:read
* cards:read
* departments:read
* limits:read
* spend_programs:read
* transactions:read
* users:read

To retrieve the access token, call the function at the beginning of your application code:

```ts
import { fetchAccessToken } from '@repo/ramp-api/AuthActions';

const result = await fetchAccessToken();
const accessToken = result.access_token;
```

Then, you can use the returned access token to call the other functions provided by this package.

## Usage

This package provides a module for each of the Ramp API objects that we are interested in. They have
an exported function for each of the objects we use, following this pattern:

```ts
import { fetchCards } from '@repo/ramp-api/CardActions';
import { RampCard } from '@repo/ramp-api/Models';

const result = await fetchCards(accessToken);
const cards: RampCard[] = result.model!.data;
for (const card of cards) {
  // Process this card object
}
```

where *accessToken* is the access token retrieved as described above.

Object types for values returned by the fetch functions is generally inferred automatically,
so there is no need to explicitly declare the type of the returned objects, but you can
do so if you wish.

The following modules are provided:

| Module Name                | Description                                 |
|----------------------------|---------------------------------------------|
| AccountingGLAccountActions | Retrieve accounting GL account information. |
| CardActions                | Retrieve card information.                  |
| DepartmentActions          | Retrieve department information.            |
| LimitActions               | Retrieve limit information.                 |
| SpendProgramActions        | Retrieve spend program information.         |
| TransactionActions         | Retrieve transaction information.           |
| UserActions                | Retrieve user information.                  |

Types for subordinate objects are also provided, for example, the
*RampCardSpendingRestrictions* type.  Again, these types are generally inferred
automatically, but may be imported explicitly if desired.

Note that the type names here all begin with **Ramp** to avoid name collisions with the
corresponding types when the data is stored in a local database.  For example, the
*RampCard* type corresponds to the data as returned by the Ramp API, while the
*Card* type (in a different package) corresponds to the data as stored in our local
database.

In each case, the fetch function returns an array that contains **all** objects, from Ramp,
of that type (they locally iterate if there are more objects than the maximum retrieval
limit of the Ramp API).
This matches the expectation that we will always be collecting all objects of each type, storing them
in a local database, and then using that as the source of truth for our applications.

## Implementation Notes

For some reason, the Ramp API returns some ID attributes referencing objects in other APIs
that do not exist (they somehow got deleted or something).  Storing such data in our database,
which will enforce foreign key constraints, would cause errors.  Therefore, in such cases,
the fetch functions substitute such invalid ID values with a known-good one instead.

Presently, this only affects a single Card ID and a single User ID, but more such cases
might be found in the future.
