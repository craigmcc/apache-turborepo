# apache-turborepo

## Introduction

This repository is a monorepo (in other words, it contains multiple applications
and packages that are interdependent) managed by [Turborepo](https://turborepo.com/).

The relevant applications (in the `apps` directory) are:

| Application  | Description                                                                                     |
|--------------|-------------------------------------------------------------------------------------------------|
| bill-lookup  | Application for looking up information about Bill content, using the local database.            |
| bill-refresh | Node-based Application to download content from the Bill API and storing it in a local database. |
| qbo-lookup   | Application for looking up information about QBO content, using the local database.             |
| qbo-refresh  | Node-based Application to download content from the QBO API and storing it in a local database. |
| qbo-upload   | Node-based Application to upload transactions to the QBO API, based on an exported file.        |
| ramp-lookup  | Application for looking up information about Ramp content, using the local database.            |
| ramp-refresh | Node-based Application to download content from the Ramp API and storing it in a local database. |

The relevant packages (in the `packages` directory) are:

| Package                                   | Description                                                                                                                                                             |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [bill-api](./packages/bill-api/README.md) | Server side logic to call the Bill APIs, which can be used to download content from Bill.                                                                               |
| [bill-db](./packages/bill-db/README.md)   | Contains a Prisma schema for the local database, which contains tables for content downloaded with the Bill APIs, along with a generated Prisma client for that schema. |
| eslint-config                             | ESLint configuration files, including `eslint-config-next` and `eslint-config-prettier`, which can be used by the applications and packages in this monorepo.           |
| [qbo-api](./packages/qbo-api/README.md)   | Server side logic to call the QuickBooks Online (QBO) APIs, which can be used to download content from QBO.                                                             |
| [qbo-db](./packages/qbo-db/README.md)     | Contains a Prisma schema for the local database, which contains tables for content downloaded with the QBO APIs, along with a generated Prisma client for that schema.  |
| [ramp-api](./packages/ramp-api/README.md) | Server side logic to call the Ramp APIs, which can be used to download content from Ramp.                                                                               |
| [ramp-db](./packages/ramp-db/README.md)   | Contains a Prisma schema for the local database, which contains tables for content downloaded with the Ramp APIs, along with a generated Prisma client for that schema. |
| shared-components                         | Shared React components that can be used by the applications and packages in this monorepo.  Depends on React Boostrap and Tanstack Table.                              |
| shared-utils                              | Shared utility functions that can be used by the applications and packages in this monorepo.                                                                            |
| testing-react                             | Shared React testing utilities that can be used by the applications and packages in this monorepo.  Depends on React Testing Library and Vitest.                        |
| typescript-config                         | TypeScript configuration files, which can be used by the applications and packages in this monorepo.                                                                    |
| vitest-config                             | Vitest configuration files, which can be used by the applications and packages in this monorepo.                                                                        |

The statement distributor tools are in the *distributors* directory:

| Tool                        | Description                                                                                                                                                                         |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bill-statement-distributor  | Python tool to generate and distribute monthly Bill.com accounts payable statements to departments via email. See [README](distributors/bill-statement-distributor/README.md) for details. |
| ramp-statement-distributor  | Python tool to generate and distribute monthly Ramp credit card activity statements to departments via email. See [README](distributors/ramp-statement-distributor/README.md) for details. |

For an overview of all distributors, shared utilities, and Python version management, see the [Distributors README](distributors/README.md).

## Topical Documentation

The information about this repository is spread across multiple files,
in addition so specific `README.md` files for each application and package.
The topical documentation files are as follows:

| File Name           | Description                                                                                     |
|---------------------|-------------------------------------------------------------------------------------------------|
| [INSTALLING.md](INSTALLING.md) | Instructions for installing the software and setting up the local databases.                     |
| [UPDATING.md](UPDATING.md)     | Instructions for updating the software and local databases with the latest code changes.         |
| [REFRESHING.md](REFRESHING.md)   | Instructions for refreshing the local databases with the latest content from Bill and Ramp.       |


## Tips On Understanding the Repository Contents

### Where are the versions of our dependencies specified?

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

### How do I verify that the source code in each package has correct styling?

You can run the following command from the root of the monorepo to check the
source code in each package for correct styling, as defined by the ESLint configuration:

```bash
turbo run lint
```

This will run the `lint` script in each package and application that has one defined.

### Are there any tests in this repository?

There are few at the moment, but the packages and applications have been
configured to use Vitest for unit testing.  You can run the tests in each package by
navigating to it's root directory, and running one of the following commands:

- `pnpm run test` - Runs the tests in the package, and watches for changes
  to the source code of that package or application, and re-runs the tests then.
- `pnpm run test:ci` - Runs the tests in the package, but does not
  watch for changes to the source code.  This is useful for running tests in a
  continuous integration environment, such as GitHub Actions.

### Is there a GitHub Action workflow in this repository?

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

### Is there Dependabot support in this repository?

While it is configured (`.github/dependabot.yml`), GitHub does not currently
seem to support Dependabot for monorepos.  This means that Dependabot will not
create pull requests to update the dependencies in the monorepo, and you will
need to manually update the dependencies in the `pnpm-workspace.yaml` file
before rebuilding everything.
