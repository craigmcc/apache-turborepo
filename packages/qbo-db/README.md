# packages/qbo-db

A package that defines the Prisma database schema for information retrieved from
the [QuickBooks Online (QBO) API Platform](https://developer.intuit.com/app/developer/qbo/docs/get-started).
The database schema focuses.  It represents the stored version of material retrieved via the
[QBO API](../qbo-api/README.md) package.

Unlike many of the other database packages in this monorepo, this package expects
two different environment files -- one for development, and one for production.  This is
because the QuickBooks Online API has different application registrations for development
and production, and each registration has its own OAuth2 credentials.

Also, the sandbox (development) environment gets populated with test data by Intuit,
whereas the production environment will have actual production data.

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/qbo-db": "workspace:*"
  }
}
```

## Configuration

This package requires references to two different environment variable files
to perform its operations.  Applications that consume this package
and the [qbo-api](../qbo-api/README.md) package will also need to set the environment
variables referenced in that package's documentation, depending on whether you are
working with the sandbox (development) or production environment.

For the sandbox environment, you will normally declare something like this, in 
the `.env.sandbox` file:

```dotenv
DATABASE_URL="file:~/sqlite/db-qbo-sandbox.db"
```

For the production environment, you will normally declare something like this, in
the `.env.production` file:

```dotenv
DATABASE_URL="file:~/sqlite/db-qbo-production.db"
```

## Usage

This package has three scripts that **MUST** be run before the package can be built
or referenced by applications that need it.

| Script Name                 | Description                                                    |
|-----------------------------|----------------------------------------------------------------|
| `qbo-db:generate`           | Generates the Prisma client code based on the database schema. |
| `qbo-db:migrate:sandbox`    | Applies any pending migrations to the sandbox database.        |                
| `qbo-db:migrate:production` | Applies any pending migrations to the production database.     |

(A third version of the migrate script (`qbo-db:migrate:ci`) is also provided to
provide the GitHub Actions CI environment with a way to migrate the schema to
an appropriate state for the CI tests to succeed.

For example, you can run the following commands (starting from the monorepo root):

```bash
cd packages/qbo-db
pnpm run qbo-db:generate
pnpm run qbo-db:migrate:sandbox
pnpm run qbo-db:migrate:production
cd ../..
```

In an application consuming this package, you can import the database client itself
(*dbQbo*), and the desired models that are derived from the
[database schema](./prisma/schema.prisma), as follows:

```ts
// Import the database client and whatever models you need
import { dbQbo, Account } from '@repo/qbo-db/*';
```

The *DATABASE_URL* environment variable must be set appropriately to point to either
the sandbox or production database, depending on which environment you want to work with.
Also, all the other environment variables required by the [qbo-api](../qbo-api/README.md)
package must be set appropriately for the desired environment.

For example, to upsert an *Account* row:

```ts
// Transform a QboAccount object retrieved via qbo-api
// into an Account obj for qbo-db.
const account = createAccount(qboAccount);
// Insert or update the account into the database
await dbQbo.account.upsert({
  where: { id: account.id },
  update: account,
  create: account,
});
```

Applications that render data from the database will also use *dbQbo* to query
the local database for the desired rows.  For example, you might see a query
like this to retrieve all accounts, including related information (performed
via SQL join operations by Prisma), and sorting them in ascending order by name.

```ts
  const allAccounts = await dbQbo.account.findMany({
  include: {
    childAccounts: true,
    parentAccount: true,
  },
  orderBy: [
    { name: "asc" },
  ],
});
```

## Database Viewer

Prisma comes with a browser-based database viewer that can be used to inspect
the contents of the database.  To launch the viewer, run one of the following
commands, depending on which database you want to view:

```bash
cd packages/qbo-db
pnpm run qbo-db:studio:production
// You will need to Control-C to terminate the viewer when done
cd ../..
```

```bash
cd packages/qbo-db
pnpm run qbo-db:studio:sandbox
// You will need to Control-C to terminate the viewer when done
cd ../..
```

