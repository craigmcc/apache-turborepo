# packages/ramp-db

## Introduction

This package contains a Prisma schema for the `db-ramp` database,
which can contain tables of content downloaded with the Ramp APIs,
along with a generated Prisma client for that schema.

## Initial Setup

(1) When you first acquire this turborepo, you will need to configure
the location of the database.  Do this by configuring a `.env` file
within the `packages/ramp-db` directory.  Be sure that the location
where you have configured the database is not checked in to the Git
repository. The best practice is to store it in some global location.

##### File: packages/ramp-db/.env
```env
DATABASE_URL="file:/Users/{username}/ramp-db.db"
```

This file will be listed in the `.gitignore` file, so it will not be
checked in to the Git repository.

(2) Next, you will need to generate the Prisma client (and associated
classes), based on the current schema.  This is done by running
the following command:

```bash
turbo run db-ramp:generate
```

This will generate the client and necessary classes in
`packages/ramp-db/generated/`.  These files are *not* checked in to
the Git repository, because they are specific to the OS and
architecture of the machine where they were generated.

This step will need to be repeated whenever the schema changes.

(3) Finally, you will need to run the Prisma migration command to
bring the table structure of your database up to date with the latest
schema.  If there has been a schema change, this will generate a new
SQL migration script (under `packages/prisma/migrations`), which can
then be applied to the database by the following command:

```bash
turbo run db-ramp:migrate
```

The migration files themselves (under a date/time stamped directory),
and the overall lock file (`packages/prisma/migrations/migration_lock.toml`)
must be checked in to the Git repository, so that other develoepers will
be able to apply any new migration(s) to their own database, by using
the same command above.

This step will need to be repeated whenever the schema changes.

## Using the Prisma Client in Your Application

(1) To use this package in your application, declare it as a dependency
in your application:

##### File:  `apps/{your-app}/package.json`
```json
{
  "dependencies": {
    "@repo/ramp-db": "workspace:*"
  }
}
```

(2) Run your package manager's install command, either inside the
`apps/{your-app}` directory or in the root of the monorepo.

```bash
# Inside the application root (only installs dependencies for this app)
cd apps/{your-app}
pnpm install
```

```bash
# From inside the monorepo root (installs dependencies for all apps)
pnpm install
```

(3) Add a `DATABASE_URL` environment variable to the environment file for
your application.  The value *must* match the one you configured above
in the `packages/ramp-db/.env` file.  For example:

##### File: apps/{your-app}/.env
```env
DATABASE_URL="file:/Users/{username}/ramp-db.db"
```

(4) To use the Prisma client, you will need to import it into your TypeScript
or JavaScript module that needs to access the database.  The Prisma client then
gives you access to all the Prisma logic to interact with the underlying database.
For example, you might include code like this:

##### File:  `apps/{your-app}/src/app/page.tsx`
```tsx
import { dbRamp, Department } from '@craigmcc/ramp-db/client';

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

NOTE:  You *must* import `dbRamp` (the Prisma client for this database).
You *may* import one or more of the model types for each table in the
database, but because of TypeScript's type inference, you will often
not need to do this.
