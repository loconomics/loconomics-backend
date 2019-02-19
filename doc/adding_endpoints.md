# Introduction

Loconomics uses [Sails](https://sailsjs.com) for its web framework. Much of the application code is written in [TypeScript](http://www.typescriptlang.org/) which offers some type-safety when working with lower-level libraries.

All of these technologies are heavily documented. My goal here is to get folks up and running migrating endpoints to this new backend quickly while providing links to the relevant documentation for any needed clarification.

Note that, throughout this document, the phrase _current backend_ refers to the .net code found [here](https://github.com/loconomics/loconomics/tree/master/web). This repository is referred to as the _new backend_.

## Request Flow

Broadly speaking, this is how the new backend works:

1. A request arrives at a path like _/api/v1/en-US/postal-codes/90001_.
2. The request hits (api/middleware/i18n.ts)[../api/middleware/i18n.ts]. This checks to see if the third path component looks like a [RFC 4646](https://www.ietf.org/rfc/rfc4646.txt) language code. If it does, the code is removed from the path and stashed in the request's _accept-language_ header.
3. The request then hits [Sails' i18n middleware](https://sailsjs.com/documentation/concepts/internationalization) which, among other things, parses the _accept-language_ header and makes it available via `req.getLocale()`.
4. The request then reaches Sails' router. If it matches a route in the new backend, it is processed immediately and the results are returned.
5. If no route in the new backend matches, [api/middleware/proxy.ts](../api/middleware/proxy.ts) proxies the request to a server running the current backend. By default this is _https://loconomics.com_, but _https://dev.loconomics.com_ is a good choice for development.

## Database access

Sails includes an ORM, and while you'll see it referenced throughout its documentation, we aren't using it. Instead, we're using the [@loconomics/data](https://github.com/loconomics/loconomics-data) package, because Sails' third-party MSSQL adapter is outdated. @loconomics/data wraps [TypeORM](https://typeorm.io), so see its documentation or our existing code to learn how to use it.

## Writing the code

Start by implementing the endpoint logic. In the new backend, make a file at _api/controllers/my-new-endpoint.ts_. This file is your [Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers) and uses a format called [node-machine](http://node-machine.org/). We'll dive into some common action patterns below.

Then, find the code to be ported in the current backend. [This directory](https://github.com/loconomics/loconomics/tree/master/web/api/v1) contains the logic for mapping requests to responses, while [this directory](https://github.com/loconomics/loconomics/tree/master/web/App_Code) contains additional logic used by the _.cshtml_ files.

Note that, to keep things simple, I'm recommending that we keep the logic near the endpoint in the new backend. That is, we'll keep the query and parsing logic together in the action, only splitting it up if we find ourselves using the same logic in 3 or more places. See later sections of this document for common action patterns and examples.

## Setting up routing

Once your action is written, you'll need to add it to _config/routes.js_. See [this documentation](https://sailsjs.com/documentation/concepts/actions-and-controllers/routing-to-actions) for more details. For compatibility with the current backend, please use routes of the form _/api/v1/path/to/action_. Do not include the language code in the Sails route definition.

Also, please keep routes in alphabetical order to make finding specific endpoints easier.

## Abstracting functionality

If we find ourselves using functionality in 3 or more places, we should move it to a [helper](https://sailsjs.com/documentation/concepts/helpers). Helpers also use the node-machine format, and are globally accessible via `sails.helpers.helperName`.

An example of a good helper is [connection.ts](../api/helpers/connection.ts), which allocates a database connection. If we find ourselves reusing query logic in several places, we may want to create namespaced helpers to use the query in multiple actions.

## Common patterns with examples

### Listing all records

[availability-types.ts](../api/controllers/availability-types.ts) illustrates the common pattern of listing all records of a given type. Notice that the query is scoped to records of the user's language. These values are populated from the language code in the request. If you'd like to learn more about how this is done, read up on Sails [middleware](https://sailsjs.com/documentation/concepts/middleware) and check out [i18n.ts](../api/middleware/i18n.ts).

### Query by ID

Querying by ID, or some other provided field type, is another common API pattern. See [postal-codes.ts](../api/controllers/postal-codes.ts) for an example.

Notice that the `id` input is marked as required. Inputs can take many forms. They can be provided as query parameters, path components, or form parameters. In this case, the _/postal-codes_ route in _config/routes.js_ specifically indicates a `:id` path component. Other endpoints expect their inputs to be provided as query parameters, and conditionally react based on their presence or absence.

### Multiple input parameters

[api/controllers/specializations.ts](../api/controllers/specializations.ts) is an action with `searchTerm` and `solutionID` inputs passed as query parameters. In this instance, they are both required, but this same pattern can be extended out to many more inputs. Inputs can be optional by omitting `required: true`, and code can conditionally run by checking whether or not the given input is defined.

### Multi-level URLs

The current backend handles multi-level URLs in a single endpoint, however this can be difficult to reason about. By contrast, the new backend places actions in directory hierarchies based on their URL structure, adding a specific route in _config/routes.js_ to each action.

### Authentication

Logging in/out, account management, etc. is presently handled in the current backend, but the new backend needs access to this status. As such, the current backend provisions a UUID token to authenticated users, which the frontend treats as a bearer token. The new backend looks up the user by token and populates `this.req.user` and `this.req.authenticated`.

[api/controllers/test/authentication.ts](../api/controllers/test/authentication.ts) demonstrates accessing the authenticated user from within an action. Actions where authentication is required are indicated by adding a [policy](https://sailsjs.com/documentation/concepts/policies) entry in [config/policies.js](../config/policies.js) to the [auth policy](../api/policies/auth.ts) which handles both authentication and authorization.

To require a certain authorization level on a given action, set its `requiredLevel` field. See xxx for an example of this.

Low-level details of implementing authentication are handled by [Passport](http://www.passportjs.org), which lets us pick from hundreds of additional authentication strategies to add if desired.

If authentication is not required, then simply check for the presence of `this.req.authenticated` or `this.req.user` in your actions. Note that `this.req.authenticated` may go away at some point in favor of just checking truthiness of `this.req.user`.


