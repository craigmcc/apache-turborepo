# UPDATING

These instructions should be followed any time you need to update your local
version of the software.  This should be done regularly, particularly before
you start using the lookup applications for each of the three platforms.

There is no penalty for running these commands more often than necessary,
so if you are in doubt, just run them.

Start from the base directory of the repository (`apache-turborepo`)
for any and all of these commands.

## Pull the Latest Code

This is not necessary if you have just followed [INSTALLING.md](INSTALLING.md)
to install the software. Otherwise, you will want to pull the
latest code from GitHub.

```bash
git pull
```

## Update Dependencies

This is not necessary if you have just followed [INSTALLING.md](INSTALLING.md)
to install the software. Otherwise, you will want to update any dependencies
that have changed.

```bash
pnpm install
```

## Update Local Database Metadata

This is necessary in case there have been any modifications to local database
schemas.  It is also necessary the very first time, to initially create the
various local databases.

```bash
# Update the local bill.com database metadata
cd packages/bill-db
pnpm run bill-db:generate
pnpm run bill-db:migrate
cd ../..

# Update the local QBO database metadata
cd packages/qbo-db
pnpm run qbo-db:generate
pnpm run qbo-db:migrate
cd ../..

# Update the local ramp.com database metadata
cd packages/ramp-db
pnpm run ramp-db:generate
pnpm run ramp-db:migrate
cd ../..
```
## Rebuild The Entire Monorepo

This will pick up any changes to the code in the various packages and
applications, and rebuild the entire monorepo.

```bash
pnpm run build
```

## Next Steps

If you are initially installing the software, or if you want to retrieve
the most recent data from the various platforms, follow the instructions
in [REFRESHING.md](REFRESHING.md) to run the refresh applications for each
of the platforms.

Otherwise, you can follow the instructions in the README.md files for the
various lookup applications to review the data in the local databases.
