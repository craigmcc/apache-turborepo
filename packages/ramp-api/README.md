# packages/ramp-api

## Introduction

This package contains functions that can be used to access the Ramp APIs.
They are useful either as server actions (in a full-stack application) or
as accessible functions (in a Node.js application).

## Installation

To use this package in your application, declare it as a dependency
in your application:

##### File:  `package.json`
```json
{
  "dependencies": {
    "@repo/ramp-api": "workspace:*"
  }
}
```

Then run your package manager's install command inside the `apps/{application}` directory:

```bash
cd apps/{application}
pnpm install
```

In your application's `.env` or `.env.local` file, you will need to declare the following
variables:

| Variable Name              | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| RAMP_PROD_API_BASE_URL      | The base URL for the Ramp production API (normally https://api.ramp.com).   |
| RAMP_PROD_API_CLIENT_ID     | The client ID for the Ramp production API you received when you registered. |
| RAMP_PROD_API_CLIENT_SECRET | The client secret for the Ramp production API you received when you registered. |
| RAMP_PROD_API_SCOPE         | The OAuth scopes you will need for this application, for example:  cards:read departments:read limits:read transactions:read users:read |

## Example Usage

In your application code, import the action class you need and then call it:

##### File:  `src/app/page.tsx`
```tsx
import { fetchAccessToken } from '@repo/ramp-api/AuthActions';

async function getAccessToken(): string {
    const response = await authActions.fetchAccessToken();
    if (!response.ok) {
        throw new Error('Failed to fetch access token');
    }
    return response.model.access_token;
}
```
