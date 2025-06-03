# apache-turborepo

## Introduction

This repository is a monorepo (in other words, it contains multiple applications
and packages that are interdependent) managed by [Turborepo](https://turborepo.com/).

The relevant applications (in the *apps* directory) are:

| Application | Description                                                                                                                  |
| ----------- |------------------------------------------------------------------------------------------------------------------------------|
| ramp-download | Application for downloading contet from the Ramp API and storing it in a local database.                                     |
| ramp-info | **OBSOLETE** Application originally intended to display information directly from the Ramp APIs.  Superceded by ramp-lookup. |
| ramp-lookup | Application for looking up information about Ramp content, using the local database.                                         |
| ramp-refresh | **OBSOLETE** Node-based Application originally intended to download content from the Ramp API and storing it in a local databse.  Superceded by ramp-download. |

The relevant packages (in the *packages* directory) are:

| Package      | Description                                                                                                                                                             |
| ------------ |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| eslint-config | ESLint configuration files, including `eslint-config-next` and `eslint-config-prettier`, which can be used by the applications and packages in this monorepo.           |
| jest-presets | Jest configuration files, which can be used by the applications and packages in this monorepo.                                                                          |
| ramp-api | Server side logic to call the Ramp APIs, which can be used to download content from Ramp.                                                                          |
| ramp-db      | Contains a Prisma schema for the local database, which contains tables for content downloaded with the Ramp APIs, along with a generated Prisma client for that schema. |
| shared-utils | Shared utility functions that can be used by the applications and packages in this monorepo.                                                                            |
| typescript-config | TypeScript configuration files, which can be used by the applications and packages in this monorepo.                                                                    |

## Installation

### Install Global Dependencies

The following global dependencies are required to work with this repository,
and must be installed using the instructions on each of their respective websites:

- [Node.js](https://nodejs.org/en/download/) (use the latest LTS version).
  This is the server side runtime used to execute applications.  Includes `npm`,
  a package manager for Node.js based applications, but we will not be using it
  (except to install `pnpm` as described next).

- [pnpm](https://pnpm.io/installation) (use the latest version).  This is the
  package manager we will be using to install dependencies for the applications
  and packages in this monorepo.  It is a drop-in replacement for `npm`, but
  has much better performance and disk space usage, because it caches a single
  copy of each package in a global location, and then symlinks that copy into
  each application or package that requires it.  You can use `npm` to install
  `pnpm`, as described on the installation page.

- [Turborepo](https://turborepo.org/docs/getting-started/installation#global-installation)
  (use the latest version).
  This is the monorepo management tool that we will be using to manage the
  applications and packages in this repository.  It is installed as a global
  package using `pnpm`.

### Clone the Repository and Install Dependencies

In the parent directory into which you want to clone the repository, run:

```bash
git clone https://github.com/craigmcc/apache-turborepo.git
```

All of the subsequent commands should be run from within the
`apache-turborepo` directory.

Next, install the dependencies for the monorepo by running:

```bash
cd apache-turborepo ## If you are not already in the repository directory
pnpm install
```

### Perform An Initial Build of the Entire Monorepo

There is a step needed before the global build, to generate the Prisma client
and types that will be used to access the local database.  This is done by running:

```bash
cd packages/ramp-db
pnpm run db-ramp:generate
cd ../..
```

After that, you can build the entire monorepo by running (from the root of the repository):

```bash
turbo run build
```
### Create the Local Database

To create the local database, you must first set up a `.env` file, in the
package directory `packages/ramp-db/`.  This file should contain a single
variable defining the location of the local database file, for example:

```env
DATABASE_URL="file:/Users/craigmcc/sqlite/ramp-db.db"
```

You must create the directory where the database file will be stored, if it does not
exist, but the database file itself will be created automatically when you run the
next command.

Now, you can create the local database, and configure its tables, by running:

```bash
cd packages/ramp-db
turbo run db-ramp:migrate
```
This will create the database file (if it does not exist yet), apply the initial
database schema to it, followed by any migrations that have been defined in the
`packages/prisma/migrations` directory.  The end result will be that the database
is configured exactly as defined by the current Prisma schema, as of the time you
most recently pulled the repository from Github.

### Populate the Local Database with Content

Next, we are going to use the `ramp-download` application to download information
from Ramp, and populate the local database with that content.  Before you can do this,
however, you must first configure a `.env` file in the `apps/ramp-download/` directory,
with the following environment variables:

| Variable Name | Description                                                                              |
| -------------- |------------------------------------------------------------------------------------------|
| DATABASE_URL | The location of the local database file, same as what was configured for `ramp-db` above. |
| RAMP_PROD_API_BASE_URL | The base URL for the Ramp production API, e.g. `https://api.ramp.com`.                   |
| RAMP_PROD_API_CLIENT_ID | The client ID for your Ramp production API application, as configured in the Ramp developer portal. |
| RAMP_PROD_API_CLIENT_SECRET | The client secret for your Ramp production API application, as configured in the Ramp developer portal. |
| RAMP_PROD_API_SCOPE | Space-separated list of scopes for the Ramp production API (see below). |

The list of scopes you will need for the Ramp API calls will depend on which tables we are
downloading.  The following scopes are required for the tables that we currently download:

`accounting:read cards:read departments:read limits:read spend_programs:read transactions:read users:read`

Now, you can run the `ramp-download` application to download the content from Ramp and
load it into the local database.  This is done by running:

```bash
cd apps/ramp-download
turbo run build
pnpm run start
```

This app does not have any browser API - it shows its progress in the terminal
window (all output is logged with console.log() statements).

When the download is finished, you will need to cancel the application (Ctrl-C).

Now, if you use any of the various SQLite database browsers, you will be able to
see that all of the tables have been populated with the current content from Ramp,
as of the moment you ran this application.  It can be run again at any time
without problems, because it uses Prisma's `upsert` functionality to insert new
rows or update existing rows, based on the unique primary key for each table.

### Running the Lookup Application to View the Local Database Content

Next, set up a `.env` file in the `apps/ramp-lookup/` directory, with only the
DATABASE_URL variable, which should point to the same local database file.  Now,
you can run the `ramp-lookup` application to view the content of the local database.

```bash
cd apps/ramp-lookup
turbo run build
pnpm run dev
```

Then point your browser at `http://localhost:3000`.  When you want to stop the
app, you can cancel it with Ctrl-C in the terminal window where it is running
and return to the repo's root directory.

Running in development mode will automatically reload the application when you make
changes to the source code, so you can easily make changes and see the results.

## Regular Usage

You will periodically want to pull the latest code changes from the Git repository.
To do so, run the following commands from the root of the repository:

```bash
git pull
```

If there have been any changes, you will typically need to regenerate the Prisma client,
rebuild the entire monorepo, and then run the migration command to update the local database:

```bash
cd packages/ramp-db
turbo run db-ramp:generate
cd ../..
turbo run build
cd packages/ramp-db
turbo run db-ramp:migrate
```

Periodically, you will also want to update the local database content with the latest
information from Ramp.  This will be something you will want to do if there have been
code changes (such as supporting for new tables or updated schema definitions):

```bash
cd apps/ramp-download
turbo run build
pnpm run start
```

As before, you can run the `ramp-lookup` application to view the updated content in the local database:

```bash
cd apps/ramp-lookup
turbo run build
pnpm run dev
```

## Tips On Understanding the Repository Contents

### Where are the versions of our dependencies specified?

If you look at the `package.json` files in the various applications and packages,
you will see two interesting types of dependency declarations:

- `workspace:*` - This means that the dependency is a local package in the monorepo,
  and it will be resolved to the latest version of that package in the monorepo.
  This is used for packages that are part of the same monorepo, such as `@repo/ramp-db`.
- `catalog:foo` - This means that the actual version of the dependency is stored
  in the `pnpm-workspace.yaml` file in the root of the monorepo.  Declaring
  dependencies this way allows us to ensure that the same version of the
  same dependency is used across the entire monorepo.

We are using the Catalogs feature of `pnpm` to manage the versions of our dependencies
globally, so that we can ensure that all applications and packages in the monorepo
use the same version of a dependency.

### How do I verify that the source code in each package has correct styling?

You can run the following command from the root of the monorepo to check the
source code in each package for correct styling, as defined by the ESLint configuration:

```bash
turbo run lint
```

This will run the `lint` script in each package and application that has one defined.

### Are there any tests in this repository?

There are woefully few at the moment, but the packages and applications have been
configured to use Jest for unit testing.  You can run the tests in each package by
navigating to it's root directory, and running one of the following commands:

- `pnpm run test` - Runs the tests in the package, and watches for changes
  to the source code of that package or application, and re-runs the tests then.
- `pnpm run test:ci` - Runs the tests in the package, but does not
  watch for changes to the source code.  This is useful for running tests in a
  continuous integration environment, such as GitHub Actions.

### Is there a GitHub Action workflow in this repository?

Yes, defined in the file `.github/workflows/ci.yml`.  This workflow is triggered
and performs the following steps:
- Checks out the code from the repository.
- Sets up `pnpm`.
- Sets up `NodeJS`.
- Installs the dependencies for the monorepo.
- Generates the Prisma client and types for the local database.
- Builds the entire monorepo.
- Runs the tests in each package and application via `turbo run test:ci`.

Results of these workflow runs can be seen in the "Actions" tab of the repository
on GitHub.

To avoid causing inadvertent CI failures, it is recommended that you run the
following commands (from the root of the monorepo) before pushing any changes:

### Is there Dependabot support in this repository?

While it is configured (`.github/dependabot.yml`), GitHub does not currently
seem to support Dependabot for monorepos.  This means that Dependabot will not
create pull requests to update the dependencies in the monorepo, and you will
need to manually update the dependencies in the `pnpm-workspace.yaml` file.

```bash
turbo run build
turbo run lint
turbo run test:ci
```

## Underlying Technologies In Use

TODO.

