# packages/ramp-db

A package that defines the Prisma database schema for information retrieved from
the [Ramp API Platform](https://docs.ramp.com/developer-api/v1/introduction).
The database schema focuses on the Ramp Card workflows that we currently use,
and represents the stored version of material retrieved via the
[ramp-api](../ramp-api/README.md) package.

## Dependency Declaration

For applications that depend on this package, declare it in your `package.json`
file as follows:

```json
{
  "dependencies": {
    "@repo/ramp-db": "workspace:*"
  }
}
```

## Configuration

This package only requires a reference to the *DATABASE_URL* environment variable,
in the `.env` file, to perform its operations.  Applications that consume this package
and the [ramp-api](../ramp-api/README.md) package will also need to set the environment
variables referenced in that package's documentation.

The database URL should be a reference to a local SQLite database file.  This file
must NOT be committed to source control, as it contains sensitive information.  For
example, you might do this:

```dotenv
DATABASE_URL="file:~/sqlite/db-ramp.db"
```

The structure of the database is defined by a [Prisma schema file](./prisma/schema.prisma).
See the [Prisma documentation](https://www.prisma.io/docs/) for more information about
how to use Prisma with your database.

## Usage

This package has two scripts that **MUST** be run before the package can be built
or referenced by applications that need it.

| Script Name        | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `ramp-db:generate` | Generates the Prisma client code based on the database schema. |
| `ramp-db:migrate`  | Applies any pending migrations to the database.                |                

For example, you can run the following commands (starting from the monorepo root):

```bash
cd packages/ramp-db
pnpm run ramp-db:generate
pnpm run ramp-db:migrate
cd ../..
```
In the application consuming this package, you can import the database client itself
(*dbRamp*), and the desired models that are derived from the
[database schema](./prisma/schema.prisma), as follows:

```ts
// Import the database client and whatever models you need
import { dbRamp, Card, User } from '@repo/ramp-db/*';
```

Then, *dbRamp* can be used to perform database operations, such as upserting
(inserting if new or updating if existing) rows, as well as other operations.
See the Prisma documentation for more information on how to use the Prisma client.

For example, to upsert a *User* row:

```ts
// Transform a RampUser object retrieved via ramp-api
// into a User object for ramp-db
const user = createUser(rampUser);
// Insert or update the user into the database
await dbRamp.user.upsert({
  where: { id: user.id },
  create: user,
  update: user,
});
```

Applications that render data from the database will also use *dbRamp* to query
the local database for the desired rows.  For example, you might see a query
like this to retrieve all users, including related information (performed
via SQL join operations by Prisma), and sorting them in ascending order by name.

```ts
  const users = await dbRamp.user.findMany({
  include: {
    cards: true,
    department: true,
    limit_users: {
      include: {
        limit: {
          include: {
            spending_restrictions: true,
          },
        },
      },
    },
    manager: true,
  },
  orderBy: [
    { last_name: "asc" },
    { first_name: "asc" },
  ],
});
```

## Database Viewer

Prisma comes with a browser-based database viewer that can be used to inspect
the contents of the database.  To launch the viewer, run the following command:

```bash
cd packages/ramp-db
pnpm run ramp-db:studio
// You will need to Control-C to terminate the viewer when done
cd ../..
```

