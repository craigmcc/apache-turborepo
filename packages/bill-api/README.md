# packages/bill-api

A package of types and retrieval modules for retrieving information from
the [Bill API Platform](https://developer.bill.com/home/).  Since we currently only use
the Accounts Payable workflows, those are the focus of this package.

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/bill-api": "workspace:*"
  }
}
```

## Authentication

The **AuthActions** module provides the *fetchSessionIdV2()* and *fetchSessionIdV3()*
functions to retrieve session IDs for Bill API v2 and v3, respectively.  These
functions require the following environment variables to be set (in the `.env` file
in the `apps/{appname}` directory of the app consuming this package):

| Variable Name          | Description                                                                                  |
|------------------------|----------------------------------------------------------------------------------------------|
| BILL_DEVELOPER_KEY     | The developer key for the Bill API that you have registered at *bill.com*.                   |
| BILL_ORGANIZATION_ID   | The organization ID for your Bill API account.                                               |
| BILL_PASSWORD          | The password for your Bill API account.                                                      |
| BILL_PROD_API_BASE_URL | The base URL for the Bill API production environment (https://gateway.prod.bill.com/connect) |
| BILL_USERNAME          | The username for your Bill API account.                                                      |

To retrieve the session IDs, call the appropriate functions at the beginning of your application code:

```ts
import { fetchSessionIdV2, fetchSessionIdV3 } from '@repo/bill-api/AuthActions';

const sessionIdV2 = await fetchSessionIdV2();
const sessionIdV3 = await fetchSessionIdV3();
```

Then, you can use the returned session IDs to call the other functions provided by this package.

## Usage

This package provides a module for each of the Bill API objects that we are interested in.  They have
an exported function for each of the objects we use, following this pattern:

```ts
import { fetchAccounts } from '@repo/bill-api/AccountActions';

const accounts = await fetchAccounts(sessionId);
```

where *sessionId* is the appropriate V2 or V3 session ID retrieved as described above.

The following modules are provided:

| Module Name                  | API Version | Description                                  |
|------------------------------|-------------|----------------------------------------------|
| AccountActions               | V2          | Retrieve account information.                |
| BillActions                  | V3          | Retrieve bill information.                   |
| BillApproverActions          | V2          | Retrieve bill approver information.          |
| RecurringBillActions         | V3          | Retrieve vendor information.                 |
| RecurringBillApproverActions | V2          | Retrieve vendor contact information.         |
| UserActions                  | V3          | Retrieve user information.                   |
| VendorActions                | V3          | Retrieve vendor information.                 |
| VendorCreditActions          | V3          | Retrieve vendor credit information.          |
| VendorCreditApproverActions  | V2          | Retrieve vendor credit approver information. |

TypeScript types for the Bill API version of each of these objects are provided, and may be used
as follows (although the object type is generally inferred automatically from the return value
of the fetch methods):

```ts
import { fetchAccounts } from '@repo/bill-api/AccountActions';
import { BillAccount } from '@repo/bill-api/Models';

const accounts: BillAccount[] = await fetchAccounts(sessionId);  // V2 session ID in this case
```

Types for subordinate objects are also provided, for example, the *BillAddress* type.  Again,
these types are generally inferred automatically, but may be imported explicitly if desired.

Note that the type names here all begin with **Bill** to avoid name collisions with the
corresponding types when the data is stored in a local database.  For example, the
*BillAccount* type corresponds to the data as returned by the Bill API, while the
*Account* type (in a different package) corresponds to the data as stored in our local
database.

In each case, the fetch function returns an array that contains **all** objects, from Bill,
of that type (they locally iterate if there are more objects than the maximum retrieval
limit of the Bill API).
This matches the expectation that we will always be collecting all objects of each type, storing them
in a local database, and then using that as the source of truth for our applications.
