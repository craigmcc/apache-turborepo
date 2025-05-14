# packages/ramp-db

## Introduction

This package contains a Prisma schema for the `db-ramp` database,
which can contain tables of content downloaded with the Ramp APIs,
along with a generated Prisma client for that schema.

## Installation

To use this package in your application, declare it as a dependency
in your application:

##### File:  `package.json`
```json
{
  "dependencies": {
    "@craigmcc/ramp-db": "workspace:*"
  }
}
```

Then run your package manager's install command inside the `apps/{application}` directory:

```bash
cd apps/{application}
pnpm install
```

Finally, you will need to declare a `DATABASE_URL` environment variable in your
application's `.env` file.  This variable should contain the connection string
for the database you want to use.  If you choose not to move it from the default
location, you will say something like this:

##### File:  `.env`
```env
DATABASE_URL="file:../packages/db-ramp/prisma/db-ramp.db"
```

Note that this is an SQLite database (which is not checked in to the Git repository
because it contains sensitive information).  The location included above *must*
match where it was generated in the `packages/ramp-db` package's `.env` file.

## Using the Prisma Client in Your Application

To use the Prisma client, you will need to import it into your TypeScript
or JavaScript module that needs to access the database.  The Prisma client then
gives you access to all the Prisma logic to interact with the underlying database.
For example, you might include code like this:

##### File:  `src/app/page.tsx`
```tsx
import { dbRamp, Department } from '@craigmcc/ramp-db';

export default async function Home() {
  const department = await dbRamp.departments.findFirst();
    return (
        <div>
            <p className="text-3xl font-bold underline">
                Department is {department?.name}
            </p>
        </div>
    );
}
```
