# apache-turborepo

## 1. Introduction

This repository is a monorepo (in other words, it contains multiple applications
and packages that are interdependent) managed by [Turborepo](https://turborepo.com/).

The relevant applications (in the *apps* directory) are:

| Application   | Description                                                                                                                                       |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| bill-lookup   | Application for looking up information about Bill content, using the local database.                                                              |
| bill-refresh  | Node-based Application to download content from the Ramp API and storing it in a local database.                              |
| ramp-download | **UNNEEDED** NextJS based application for downloading contet from the Ramp API and storing it in a local database when ramp-refresh did not work. |
| ramp-info     | **OBSOLETE** Application originally intended to display information directly from the Ramp APIs.  Superceded by ramp-lookup.                      |
| ramp-lookup   | Application for looking up information about Ramp content, using the local database.                                                              |
| ramp-refresh  | Node-based Application to download content from the Ramp API and storing it in a local database.                              |

The relevant packages (in the *packages* directory) are:

| Package           | Description                                                                                                                                                             |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bill-api          | Server side logic to call the Bill APIs, which can be used to download content from Bill.                                                                               |
| bill-db           | Contains a Prisma schema for the local database, which contains tables for content downloaded with the Bill APIs, along with a generated Prisma client for that schema. |
| eslint-config     | ESLint configuration files, including `eslint-config-next` and `eslint-config-prettier`, which can be used by the applications and packages in this monorepo.           |
| jest-presets      | Jest configuration files, which can be used by the applications and packages in this monorepo.                                                                          |
| ramp-api          | Server side logic to call the Ramp APIs, which can be used to download content from Ramp.                                                                               |
| ramp-db           | Contains a Prisma schema for the local database, which contains tables for content downloaded with the Ramp APIs, along with a generated Prisma client for that schema. |
| shared-components | Shared React components that can be used by the applications and packages in this monorepo.  Depends on React Boostrap and Tanstack Table.                              |
| shared-utils      | Shared utility functions that can be used by the applications and packages in this monorepo.                                                                            |
| typescript-config | TypeScript configuration files, which can be used by the applications and packages in this monorepo.                                                                    |

## 2. Installation

### 2.1 Install Global Dependencies

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

### 2.2 Clone the Repository and Install Dependencies

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

### 2.3 Perform An Initial Build of the Entire Monorepo

There is a step needed before the global build, to generate the Prisma client
and types that will be used to access the local databases.  This is done by running:

```bash
cd packages/bill-db
pnpm run bill-db:generate
cd ../..
cd packages/ramp-db
pnpm run ramp-db:generate
cd ../..
```

After that, you can build the entire monorepo by running (from the root of the repository):

```bash
turbo run build
```
### 2.4 Create the Local Database for Bill Content

To create the local database, you must first set up a `.env` file, in the
package directory `packages/bill-db/`.  This file should contain a single
variable defining the location of the local database file, for example:

```env
DATABASE_URL="file:/Users/craigmcc/sqlite/bill-db.db"
```

You must create the directory where the database file will be stored, if it does not
exist, but the database file itself will be created automatically when you run the
next command.

Now, you can create the local database, and configure its tables, by running:

```bash
cd packages/bill-db
turbo run bill-db:migrate
cd ../..
```
This will create the database file (if it does not exist yet), apply the initial
database schema to it, followed by any migrations that have been defined in the
`prisma/migrations` directory.  The end result will be that the database
is configured exactly as defined by the current Prisma schema, as of the time you
most recently pulled the repository from Github.

### 2.5 Populate the Local Database with Bill Content

Next, we are going to use the `bill-refresh` application to download information
from Bill, and populate the local database with that content.  Before you can do this,
however, you must first configure a `.env` file in the `apps/bill-refresh/` directory,
with the following environment variables:

| Variable Name          | Description                                                                                        |
|------------------------|----------------------------------------------------------------------------------------------------|
| DATABASE_URL           | The location of the local database file, same as what was configured for `bill-db` above.          |
| BILL_PROD_API_BASE_URL | The base URL for the Bill production API, e.g. `https://gateway.prod.bill.com/connect`.            |
| BILL_DEVELOPER_KEY     | Your developer key from when you registered as a Bill developer.                                   |
| BILL_ORGANIZATION_ID   | The organization ID (for all of Apache) that you received when you registered as a Bill developer. |
| BILL_USERNAME          | Your Bill login username.                                                                          |
| BILL_PASSWORD          | Your Bill login password.                                                                          |

Now, you can run the `bill-refresh` application to download the content from Bill and
load it into the local database.  This is done by running:

```bash
cd apps/bill-refresh
turbo run build
pnpm run start
cd ../..
```

This is a Node-based application that outputs its progress to the terminal window,
and then exits when it is finished.  It is suitable to be run periodically to update
the local database with the latest content from Bill, and it can be run as often
as you like, or even run it periodically with a cron job.

Now, if you use any of the various SQLite database browsers, you will be able to
see that all of the tables have been populated with the current content from Bill,
as of the moment you ran this application.  It can be run again at any time
without problems, because it uses Prisma's `upsert` functionality to insert new
rows or update existing rows, based on the unique primary key for each table.

### 2.6 Running the Lookup Application to View and Download the Bill Local Database Content

#### 2.6.1 Initial Setup

Next, set up a `.env` file in the `apps/bill-lookup/` directory, with only the
DATABASE_URL variable, which should point to the same local database file.  Now,
you can run the `bill-lookup` application to view the content of the local database.

```bash
cd apps/bill-lookup
turbo run build
pnpm run dev
```

Running in development mode will automatically reload the application when you make
changes to the source code, so you can easily make changes and see the results.

#### 2.6.2 Using the Application to View Content

Point your browser at `http://localhost:3001`.  When you want to stop the
app, you can cancel it with Ctrl-C in the terminal window where it is running
and return to the repo's root directory.

The application has a set of tabs that lets you view the content of each major table.
By default, you will see a paginated list of all rows from the selected table.
To refine the visible information, you can do one of two things:
* Some columns have sorting indicators next to the column name, so you can sort in
  ascending or descending order by clicking on the column name.
* You can enter information into one or more of the filter boxes at the top of the table,
  and the displayed data will be filtered (via an AND operation if there is more than one),
  which will immediately reduce the number of rows shown.

#### 2.6.3 Using the Application to Download Bills

This application also includes an API endpoint that allows you to download the bills
from the local database as a CSV file.  To do so, use your browser or a tool like `curl` or
`Postman` to make a GET request to the following URL:

```bash
curl http://localhost:3001/api/bills.csv?accountGroup={accountGroup}/fromDate={fromDate}&toDate={toDate}
```

The available account groups will match the ones in the *Filter by Account Group* dropdown.
Dates should be specified in `YYYY-MM-DD` format.

The response will be a CSV file, which you can save to your local machine (the filename
will default to `Bill-{accountGroup)-{fromDate}-{toDate}.csv`).  Or, if you are using
a script to do the download, you can simply redirect the output to a file.

### 2.7 Create the Local Database for Ramp Content

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
turbo run ramp-db:migrate
```
This will create the database file (if it does not exist yet), apply the initial
database schema to it, followed by any migrations that have been defined in the
`prisma/migrations` directory.  The end result will be that the database
is configured exactly as defined by the current Prisma schema, as of the time you
most recently pulled the repository from Github.

### 2.8 Populate the Local Database with Ramp Content

Next, we are going to use the `ramp-refresh` application to download information
from Ramp, and populate the local database with that content.  Before you can do this,
however, you must first configure a `.env` file in the `apps/ramp-refresh/` directory,
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

Now, you can run the `ramp-refresh` application to download the content from Ramp and
load it into the local database.  This is done by running:

```bash
cd apps/ramp-refresh
turbo run build
pnpm run start
cd ../..
```

This is a Node-based application that outputs its progress to the terminal window,
and then exits when it is finished.  It is suitable to be run periodically to update
the local database with the latest content from Ramp, and it can be run as often
as you like, or even run it periodically with a cron job.

Now, if you use any of the various SQLite database browsers, you will be able to
see that all of the tables have been populated with the current content from Ramp,
as of the moment you ran this application.  It can be run again at any time
without problems, because it uses Prisma's `upsert` functionality to insert new
rows or update existing rows, based on the unique primary key for each table.

### 2.9 Running the Lookup Application to View and Download the Ramp Local Database Content

#### 2.9.1 Initial Setup

Next, set up a `.env` file in the `apps/ramp-lookup/` directory, with only the
DATABASE_URL variable, which should point to the same local database file.  Now,
you can run the `ramp-lookup` application to view the content of the local database.

```bash
cd apps/ramp-lookup
turbo run build
pnpm run dev
```

Running in development mode will automatically reload the application when you make
changes to the source code, so you can easily make changes and see the results.

#### 2.9.2 Using the Application to View Content

Point your browser at `http://localhost:3000`.  When you want to stop the
app, you can cancel it with Ctrl-C in the terminal window where it is running
and return to the repo's root directory.

The application has a set of tabs that lets you view the content of each major table.
By default, you will see a paginated list of all rows from the selected table.
To refine the visible information, you can do one of two things:
* Some columns have sorting indicators next to the column name, so you can sort in
  ascending or descending order by clicking on the column name.
* You can enter information into one or more of the filter boxes at the top of the table,
  and the displayed data will be filtered (via an AND operation if there is more than one),
  which will immediately reduce the number of rows shown.

#### 2.9.3 Using the Application to Download Transactions

This application also includes an API endpoint that allows you to download the transactions
from the local database as a CSV file.  To do so, use your browser or a tool like `curl` or
`Postman` to make a GET request to the following URL:

```bash
curl http://localhost:3000/api/transactions.csv?accountGroup={accountGroup}/fromDate={fromDate}&toDate={toDate}
```

The available account groups will match the ones in the *Filter by Account Group* dropdown.
Dates should be specified in `YYYY-MM-DD` format.

The response will be a CSV file, which you can save to your local machine (the filename
will default to `Ramp-{accountGroup)-{fromDate}-{toDate}.csv`).  Or, if you are using
a script to do the download, you can simply redirect the output to a file.

## 3. Regular Usage

You will periodically want to pull the latest code changes from the Git repository.
To do so, run the following commands from the root of the repository:

```bash
git pull
```

If there have been any changes, you will typically need to regenerate the Prisma clients,
rebuild the entire monorepo, and then run the migration commands to update the local database:

```bash
cd packages/bill-db
turbo run bill-db:generate
turbo run bill-db:migrate
cd ../..
cd packages/ramp-db
turbo run ramp-db:generate
turbo run ramp-db:migrate
cd ../..
turbo run build
```

Periodically, you will also want to update the local database content with the latest
information from Bill and Ramp.  This will be something you will want to do if there have been
code changes (such as supporting for new tables or updated schema definitions):

```bash
cd apps/bill-refresh
turbo run build
pnpm run start
cd ../..
cd apps/ramp-refresh
turbo run build
pnpm run start
cd ../..
```

As before, you can run the `bill-lookup` and `ramp-lookup` applications to view
the updated content in the local databases:

```bash
cd qpps/bill-lookup
turbo run build
pnpm run dev
# Control-C to stop the app
cd ../..
# OR
cd apps/ramp-lookup
turbo run build
pnpm run dev
# Control-C to stop the app
cd ../..
```

## 4. Tips On Understanding the Repository Contents

### 4.1 Where are the versions of our dependencies specified?

If you look at the `package.json` files in the various applications and packages,
you will see two interesting types of dependency declarations:

- `workspace:*` - This means that the dependency is a local package in the monorepo,
  and it will be resolved to the latest version of that package in the monorepo.
  This is used for packages that are part of the same monorepo, such as
  `@repo/bill-db` or `@repo/ramp-db`.
- `catalog:foo` - This means that the actual version of the dependency is stored
  in the `pnpm-workspace.yaml` file in the root of the monorepo.  Declaring
  dependencies this way allows us to ensure that the same version of the
  same dependency is used across the entire monorepo.

### 4.2 How do I verify that the source code in each package has correct styling?

You can run the following command from the root of the monorepo to check the
source code in each package for correct styling, as defined by the ESLint configuration:

```bash
turbo run lint
```

This will run the `lint` script in each package and application that has one defined.

### 4.3 Are there any tests in this repository?

There are woefully few at the moment, but the packages and applications have been
configured to use Jest for unit testing.  You can run the tests in each package by
navigating to it's root directory, and running one of the following commands:

- `pnpm run test` - Runs the tests in the package, and watches for changes
  to the source code of that package or application, and re-runs the tests then.
- `pnpm run test:ci` - Runs the tests in the package, but does not
  watch for changes to the source code.  This is useful for running tests in a
  continuous integration environment, such as GitHub Actions.

### 4.4 Is there a GitHub Action workflow in this repository?

Yes, defined in the file `.github/workflows/ci.yml`.  This workflow is triggered
when a push happens to the main branch, and performs the following steps:
- Check out the code from the repository.
- Set up `pnpm`.
- Set up `NodeJS`.
- Install the dependencies for the monorepo.
- Generate the Prisma client and types for the local database.
- Build the entire monorepo.
- Runs the tests in each package and application via `pnpm run test:ci`.

Results of these workflow runs can be seen in the "Actions" tab of the repository
on GitHub.

To avoid causing inadvertent CI failures, it is recommended that you run the
following commands (from the root of the monorepo) before pushing any changes:

```bash
turbo run lint
turbo run build
turbo run test:ci
```

### 4.5 Is there Dependabot support in this repository?

While it is configured (`.github/dependabot.yml`), GitHub does not currently
seem to support Dependabot for monorepos.  This means that Dependabot will not
create pull requests to update the dependencies in the monorepo, and you will
need to manually update the dependencies in the `pnpm-workspace.yaml` file
before rebuilding everything.

## 5. Underlying Technologies In Use

TODO.

