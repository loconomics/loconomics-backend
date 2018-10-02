# Introduction

Loconomics uses [Sails](https://sailsjs.com) for its web framework. Much of the application code is written in [TypeScript](http://www.typescriptlang.org/) which offers some type-safety when working with lower-level libraries.

All of these technologies are heavily documented. My goal here is to get folks up and running migrating endpoints to this new backend quickly while providing links to the relevant documentation for any needed clarification.

Note that, throughout this document, the phrase _current backend_ refers to the .net code found [here](https://github.com/loconomics/loconomics/tree/master/web). This repository is referred to as the _new backend_.

## Database access

Sails includes an ORM, and while you'll see it referenced throughout its documentation, we aren't using it. Instead, we're using the [mssql](https://github.com/tediousjs/node-mssql) Node module directly, because Sails' third-party MSSQL adapter is outdated.

Note that throughout the code you'll see queries like:

```js
    data = await sql.query(`select * from stateprovince where StateProvinceID = ${postalCode.StateProvinceID}`)
```

This may seem ripe with SQL injection possibilities, but it isn't. The backticks are template strings and, according to the documentation, ES2015 template strings passed into queries sanitize any interpolated parameters against SQL injections.

## Writing the code

Start by implementing the endpoint logic. In the new backend, make a file at _api/controllers/my-new-endpoint.ts_. This file is your [Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers) and uses a format called [node-machine](http://node-machine.org/). We'll dive into some common action patterns below.

Then, find the code to be ported in the current backend. [This directory](https://github.com/loconomics/loconomics/tree/master/web/api/v1) contains the logic for mapping requests to responses, while [this directory](https://github.com/loconomics/loconomics/tree/master/web/App_Code) contains additional logic used by the _.cshtml_ files.

Note that, to keep things simple, I'm recommending that we keep the logic near the endpoint in the new backend. That is, we'll keep the query and parsing logic together in the action, only splitting it up if we find ourselves using the same logic in 3 or more places.

## Setting up routing

Once your action is written, you'll need to add it to _config/routes.js_. See [this documentation](https://sailsjs.com/documentation/concepts/actions-and-controllers/routing-to-actions) for more details. For compatibility with the current backend, please use routes of the form _/api/v1/path/to/action_. API routes currently include a language code. This is dynamically extracted per request, and the path is reconstructed to remove it before it reaches the router. As such, an endpoint at _/api/v1/endpoint_ will actually be routable at _/api/v1/en-US/endpoint_ or something similar.

Also, please keep routes in alphabetical order to make finding specific endpoints easier.

## Abstracting functionality

If we find ourselves using functionality in 3 or more places, we should move it to a [helper](https://sailsjs.com/documentation/concepts/helpers). Helpers also use the node-machine format, and are globally accessible via `sails.helpers.helperName`.

An example of a good helper is [mssql.ts](../api/helpers/mssql.ts), which allocates a connection from the database connection pool. If we find ourselves reusing query logic in several places, we may want to create namespaced helpers to use the query in multiple actions.

## Common patterns with examples

### Listing all records

[availability-types.ts](../api/controllers/availability-types.ts) illustrates the common pattern of listing all records of a given type. Notice that the query is scoped to records of the user's language and country ID. These values are populated from the language code in the request. If you'd like to learn more about how this is done, read up on Sails [middleware](https://sailsjs.com/documentation/concepts/middleware) and check out [i18n.ts](../api/middleware/i18n.ts).

### Query by ID

Querying by ID, or some other provided field type, is another common API pattern. See [postal-codes.ts](../api/controllers/postal-codes.ts) for an example.

Notice that the `id` input is marked as required. Inputs can take many forms. They can be provided as query parameters, path components, or form parameters. In this case, the _/postal-codes_ route in _config/routes.js_ specifically indicates a `:id` path component. Other endpoints expect their inputs to be provided as query parameters, and conditionally react based on their presence or absence.

### Optional search term, listing if not provided

### Multi-level URLs

The current backend handles multi-level URLs in a single endpoint, however this can be difficult to reason about. By contrast, the new backend places actions in directory hierarchies based on their URL structure, adding a specific route in _config/routes.js_ to each action.

### Authentication

Authentication is presently handled in the current backend, but the new backend needs access to this status. As such, the current backend provisions a UUID token to authenticated users, which the frontend treats as a bearer token. The new backend looks up the user by token and populates `req.user`.

Note: This is only stubbed at the moment. Full implementation coming soon.
