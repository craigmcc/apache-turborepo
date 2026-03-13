# INSTALLING

These instructions describe the steps required to install the necessary global
dependencies, and to set up the local development environment for this repository.

## Install Global Dependencies

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

## Clone The Repository

In the parent directory into which you want to clone the repository, run:

```bash
git clone https://github.com/craigmcc/apache-turborepo.git
```

All of the subsequent commands should be run from within the
`apache-turborepo` directory.

## Install Dependencies

Next, install the dependencies for the monorepo by running:

```bash
cd apache-turborepo ## If you are not already in the repository directory
pnpm install
```

## Configure Environment Variables

The various packages (libraries) and applications each have required environment
variables.  Except for the Quickbooks packages and applications, these variables
will be configured in a `.env` file in the base directory for that packages or
application.  For the Quickbooks packages and applications, the environment
variables will be configured in a `.env.production` file in the base directory for
that package or application (to access the production QBO information), or a
`.env.development` file in the base directory for that package or application
(to access the sandbox QBO information).

Each library package has a `README.md` file that documents the required environment
variables for that package.  They are as follows:

| Package | Description | README File |
|---------|-------------|-------------|
| bill-api | API access to bill.com | [packages/bill-api/README.md](packages/bill-api/README.md) |
| bill-db | Local database access for bill.com data | [packages/bill-db/README.md](packages/bill-db/README.md) |
| qbo-api | API access to Quickbooks Online | [packages/qbo-api/README.md](packages/qbo-api/README.md) |
| qbo-db | Local database access for Quickbooks Online data | [packages/qbo-db/README.md](packages/qbo-db/README.md)
| ramp-api | API access to ramp.com | [packages/ramp-api/README.md](packages/ramp-api/README.md) |
| ramp-db | Local database access for ramp.com data | [packages/ramp-db/README.md](packages/ramp-db/README.md) |

Applications require that all of the environment variables for the packages they use are defined, plus
any additional environment variables required for the application itself.  They are
documented in the `README.md` file for each application, as follows:

| Application  | Description                                  | README File                                                | Dependencies                                                                                    |
|--------------|----------------------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| bill-lookup  | Review local bill.com data in a browser      | [apps/bill-lookup/README.md](apps/bill-lookup/README.md)   | [packages/bill-db](packages/bill-db/README.md)                                                  |
| bill-refresh | Update local bill.com data from the Bill API | [apps/bill-refresh/README.md](apps/bill-refresh/README.md) | [packages/bill-api](packages/bill-api/README.md) [packages/bill-db](packages/bill-db/README.md) |
| qbo-lookup   | Review local QBO data in a browser           | [apps/qbo-lookup/README.md](apps/qbo-lookup/README.md)     | [packages/qbo-db](packages/qbo-db/README.md)                                                    |
| qbo-refresh  | Update local QBO data from the QBO API       | [apps/qbo-refresh/README.md](apps/qbo-refresh/README.md)   | [packages/qbo-api](packages/qbo-api/README.md) [packages/qbo-db](packages/qbo-db/README.md)     |
| qbo-upload   | Upload local QBO data from a CSV file        | [apps/qbo-upload/README.md](apps/qbo-upload/README.md)     | [packages/qbo-db](packages/qbo-db/README.md)                                                    |
| ramp-lookup  | Review local ramp.com data in a browser      | [apps/ramp-lookup/README.md](apps/ramp-lookup/README.md)   | [packages/ramp-db](packages/ramp-db/README.md)                                                  |
| ramp-refresh | Update local ramp.com data from the Bill API | [apps/ramp-refresh/README.md](apps/ramp-refresh/README.md) | [packages/ramp-api](packages/ramp-api/README.md) [packages/ramp-db](packages/ramp-db/README.md) |


## Next Steps

Follow the instructions in the [UPDATING.md](UPDATING.md) to update the
database packages, and to compile the entire application.

