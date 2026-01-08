# packages/bill-db

A package that defines the Prisma database schema for information retrieved from
the [Bill API Platform](https://developer.bill.com/home).  The database schema
focuses on the Accounts Payable workflows that we currently use, and represents
the stored version of material retrieved via the [bill-api](../bill-api/README.md)
package.

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/bill-db": "workspace:*"
  }
}
```

## Configuration

This package only requires a reference to the *DATABASE_URL* environment variable,
in the `.env` file, to perform its operations.  Applications that consume this package
and the [bill-api](../bill-api/README.md) package will also need to set the environment
variables referenced in that package's documentation.

The database URL should be a reference to a local SQLite database file.  This file
must NOT be committed to source control, as it contains sensitive information.  For
example, you might do this:

```dotenv
DATABASE_URL="file:~/sqlite/db-bill.db"
```

The structure of the database is defined by a [Prisma schema file](./prisma/schema.prisma).
See the [Prisma documentation](https://www.prisma.io/docs/) for more information about
how to use Prisma with your database.

## Usage

This package has two scripts that **MUST** be run before the package can be built
or referenced by applications that need it.

| Script Name        | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `bill-db:generate` | Generates the Prisma client code based on the database schema. |
| `bill-db:migrate`  | Applies any pending migrations to the database.                |                

For example, you can run the following commands (starting from the monorepo root):

```bash
cd packages/bill-db
pnpm run bill-db:generate
pnpm run bill-db:migrate
cd ../..
```
In the application consuming this package, you can import the database client itself
(*dbBill*), and the desired models that are derived from the
[database schema](./prisma/schema.prisma), as follows:

```ts
// Import the database client and whatever models you need
import { dbBill, User, Vendor } from '@repo/bill-db/*';
```

Then, *dbBill* can be used to perform database operations, such as upserting
(inserting if new or updating if existing) rows, as well as other operations.
See the Prisma documentation for more information on how to use the Prisma client.

For example, to upsert a *Vendor* row:

```ts
// Transform a BillVendor object retrieved via bill-api
// into a Vendor object for bill-db
const vendor = createVendor(billVendor);
// Insert or update the vendor into the database
await dbBill.vendor.upsert({
  where: { id: vendor.id },
  create: vendor,
  update: vendor,
});
```

Applications that render data from the database will also use *dbBill* to query
the local database for the desired rows.  For example, you might see a query
like this to retrieve all vendors, including related information (performed
via SQL join operations by Prisma), and sorting them in ascending order by name.

```ts
const vendors = await dbBill.vendor.findMany({
  include: {
    additionalInfo: true,
    address: true,
    autoPay: true,
    paymentInformation: true,
    virtualCard: true,
  },
  orderBy: [
    { name: "asc" },
  ],
});
```

## Database Viewer

Primsa comes with a browser-based database viewer that can be used to inspect
the contents of the database.  To launch the viewer, run the following command:

```bash
cd packages/bill-db
pnpm run bill-db:studio
// You will need to Control-C to terminate the viewer when done
cd ../..
```

