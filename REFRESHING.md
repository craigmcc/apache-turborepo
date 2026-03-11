# REFRESHING

These instructions should be followed any time you want to retrieve the most
recent data from the various platforms (bill.com, Quickbooks Online, and ramp.com).

If you have not done so recently, you should first follow the instructions in
[UPDATING.md](UPDATING.md) to update the code and dependencies, and to update
the local database metadata, before following the instructions below to refresh the data.

## Refreshing Local Database Data

Start from the base directory of the repository (`apache-turborepo`) for any and all
of these commands.  Refreshing can be done independently for each platform, but you
will generally want to refresh all three platforms at the same time.

```bash
# Refresh the bill.com data
cd apps/bill-refresh
pnpm run start
cd ../..

# Refresh the QBO data
cd apps/qbo-refresh
pnpm run start
cd ../..

# Refresh the ramp.com data
cd apps/ramp-refresh
pnpm run start
cd ../..
```

## WARNING:  QBO TRANSACTION DATA IS NOT REFRESHED

The `qbo-refresh` application cannot refresh transaction data from
Quickbooks Online, due to limitations in the QBO API.  To refresh that data,
see the [qbo-upload app README.md](apps/qbo-upload/README.md) for instructions
on how to do so manually.
