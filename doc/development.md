# Introduction

Loconomics uses [Sails](https://sailsjs.com) for its web framework. Much of the application code is written in [TypeScript](http://www.typescriptlang.org/) which offers some type-safety when working with lower-level libraries.

All of these technologies are heavily documented. My goal here is to get folks up and running migrating endpoints to this new backend quickly while providing links to the relevant documentation for any needed clarification. I'll also link to particular patterns within the code that may prove helpful.

Note that, throughout this document, the phrase _current backend_ refers to the .net code found [here](https://github.com/loconomics/loconomics/tree/master/web). _This_ repository is referred to as the _new backend_.

## Installing the Environment

FOr the moment, [Docker](https://www.docker.com) is the only supported development environment. Nothing about the backend is Docker-specific, so avoiding Docker is entirely possible but beyond the scope of this documentation. To set up a development environment:

1. [Set up the Loconomics frontend](https://github.com/loconomics/loconomics/blob/master/docs/App%20Quick%20Start%20Guide.md).
2. [Install Docker CE for your platform](https://docs.docker.com/install/).
3. [Install Docker Compose for your platform](https://docs.docker.com/compose/install/). Note that this may have been done in the previous step, so you may wish to run `docker-compose -v` at a terminal prompt before reinstalling it.
4. Launch the frontend (for example, with `yarn grunt atwork`).
5. From the backend directory, run `docker-compose up`. On first use, this will download necessary dependencies and create your development environment. Please be patient. At first launch, the backend may fail to connect to the database. That's fine. Follow the steps below for dumping/loading data, then kill and restart docker-compose. With data loaded, the second run should complete.
6. Visit http://localhost:8811 and, from a browser console, run `localStorage.siteUrl = 'http://localhost:1337'`.
7. You may need to reload the page.

The backend development environment is now running. Note that, in its current form, the backend requires that dev.loconomics.com be operational during development.

## Getting Data

While we have scripts to create a database from scratch, we don't yet have a mechanism to seed a new database. As such, the best way to get up and running is to get a database snapshot from dev.loconomics.com. You'll either need the username and password for the development database, or an SQL dump from someone who has these credentials.

### Dumping the Database

If you have access to the dev.loconomics.com database, you can obtain a database dump as follows. Note that this assumes you have [mssql-scripter](https://github.com/Microsoft/mssql-scripter) installed:

```bash
$ mssql-scripter -U <database user> -P <database password> -S dev-loconomics.database.windows.net -d Dev --schema-and-data --target-server-version AzureDB >dev.sql
```

### Loading the Dump

Assuming you've made or received a database dump, load it into your server instance like so:

```bash
$ sqlcmd -U sa -i dev.sql
```

Note that this assumes your database server is located at `localhost:1433`, which is the case when using our Dockerized setup. If you're doing something non-standard, inserting the correct credentials and address is up to you.

## Request Flow

Broadly speaking, this is how the new backend works:

1. A request arrives at a path like _/api/v1/en-US/postal-codes/90001_.
2. The request hits (api/middleware/i18n.ts)[../api/middleware/i18n.ts]. This checks to see if the third path component looks like a [RFC 4646](https://www.ietf.org/rfc/rfc4646.txt) language code. If it does, the code is removed from the path and stashed in the request's _accept-language_ header.
3. The request then hits [Sails' i18n middleware](https://sailsjs.com/documentation/concepts/internationalization) which, among other things, parses the _accept-language_ header and makes it available via `req.getLocale()`.
4. The request then reaches Sails' router. If it matches a route in the new backend, it is processed immediately and the results are returned.
5. If no route in the new backend matches, [api/middleware/proxy.ts](../api/middleware/proxy.ts) proxies the request to a server running the current backend. By default this is _https://loconomics.com_, but _https://dev.loconomics.com_ is a good choice for development. Select a Loconomics backend to which requests should proxy by setting the _LOCONOMICS_BACKEND_URL_ environment variable.

## Database access

Sails includes an ORM, and while you'll see it referenced throughout its documentation, we aren't using it. Instead, we're using the [@loconomics/data](https://github.com/loconomics/loconomics-data) package, because Sails' third-party MSSQL adapter is outdated. @loconomics/data wraps [TypeORM](https://typeorm.io), so see its documentation or our existing code to learn how to use it.

While @loconomics/data is developed as a separate package, it is linked into the new backend via Git submodules at [data/](../data/). It may eventually make sense to eliminiate this distinction at some point, but for now is done this way to give each distinct repository a well-defined scope. Eventually @loconomics/data and its migrations should be the single source of truth on the schema, but for now that work remains unfinished.

## Accessing the Debugging Console

Sails exposes a [console](https://sailsjs.com/documentation/reference/command-line-interface/sails-console) for accessing models, configurations, APIs, and more. Use the following command to run the console once the development environment is up:

```bash
$ docker-compose exec web sails console --dontLift
```

See [this documentation](https://sailsjs.com/documentation/reference/command-line-interface/sails-console) for instructions on interacting with the console.

## Writing the code

Start by implementing the endpoint logic. In the new backend, make a file at _api/controllers/my-new-endpoint.ts_. This file is your [Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers) and uses a format called [node-machine](http://node-machine.org/). We'll dive into some common action patterns below.

Then, find the code to be ported in the current backend. [This directory](https://github.com/loconomics/loconomics/tree/master/web/api/v1) contains the logic for mapping requests to responses, while [this directory](https://github.com/loconomics/loconomics/tree/master/web/App_Code) contains additional logic used by the _.cshtml_ files. In particular, the [LcRest directory](https://github.com/loconomics/loconomics/tree/master/web/App_Code/LcRest) maps database/C# objects back to JSON.

Note that, to keep things simple, I'm recommending that we keep the logic near the endpoint in the new backend. That is, we'll keep the query and parsing logic together in the action, only splitting it up if we find ourselves using the same logic in 3 or more places. See later sections of this document for common action patterns and examples. If code needs to be separated out, place it in a [helper](https://sailsjs.com/documentation/anatomy/api/helpers).

## Setting up routing

Once your action is written, you'll need to add it to _config/routes.js_. See [this documentation](https://sailsjs.com/documentation/concepts/actions-and-controllers/routing-to-actions) for more details. For compatibility with the current backend, please use routes of the form _/api/v1/path/to/action_. Do not include the language code in the Sails route definition.

Also, please keep routes in alphabetical order to make it easier to determine if a given endpoint has been ported.

## Abstracting functionality

If we find ourselves using functionality in 3 or more places, we should move it to a [helper](https://sailsjs.com/documentation/concepts/helpers). Helpers also use the node-machine format, and are globally accessible via `sails.helpers.helperName`.

## Querying the Database

Broadly speaking, TypeORM has two ways of accessing the underlying database:

 * A simplified API via [Find Options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md).
 * A more complex API provided by [Select Query Builder](https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md) and others.

In general, Find Options support a simpler query syntax, and I use them where possible. However, Find Options don't support queries beyond a certain level of complexity. If you have bracketted `WHERE` statements for instance (I.e. `WHERE (something = 0 OR something IS NULL)`), Find Options won't work and you'll need a Query Builder.

While Query Builders do resemble SQL, they have some advantages to placing raw SQL in your code:

 * They discourage introducing SQL injections, as they make it a bit easier to place query parameters near the portions of the query that use them.
 * Queries can be selectively built based on the presence or absence of action parameters.
 * It's easier to reason about queries that are mostly TypeScript and slightly SQL, than it is to context-switch to multi-line strings of what is essentially code in another programming language.

See [api/controllers/specializations.ts](../api/controllers.specializations.ts) for an example of code that:

 * Builds a query programatically.
 * Only includes clauses it needs. No need for clauses like `WHERE @0 = 0 OR @0 = SolutionID` just to handle a parameter that isn't present.
 * Uses complex bracketted logic in a way that's easy to reason about and maintain.

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

### Simple JSON Transformations

The API doesn't always return values named after their database columns. Furthermore, sometimes values are only accessible behind promises, and non-primitives don't serialize to JSON at all. You also may wish to hide sensitive variables on models.

The new backend uses [Class-transformer](https://github.com/typestack/class-transformer) to both serialize objects to JSON, and to rename or hide values in the returned data. Class-transformer has several robust strategies for easily serializing your class to whatever JSON-based format you want:

 * Hide all class members, only whitelisting a few.
 * Exposing all class members, selectively hiding a few.
 * Exposing a given class member under a different name.
 * Serializing a given method or getter's return value.

Unfortunately, it appears that these decorators are all-or-nothing. That is, you can specify very exactly how a given class should be represented, but you can't customize that representation for other scenarios. Personally, I think each class should have a canonical representation that is returned by all endpoints. If there are inconsistencies between how models are represented in different routes, those inconsistencies will probably come back to bite you in inconvenient ways.

### Complex JSON Munging

The current backend seems to slurp in data from various records and return it in shapes that don't necessarily resemble the originating tables. We're also storing JSON as strings. There's no easy way to extract useful patterns for handling these cases, but check out [api/controllers/posting-templates.ts](../api/controllers/posting-templates.ts) for an endpoint that:
 * Performs a complex database query with joins to relations
 * Parses JSON strings
 * Iterates through the results and reshapes the data, in some cases waiting on async promises

Again, if we don't need the same parsing logic multiple times, let's keep it in the same file as the endpoint. Since the code itself is the API specification, chasing values through multiple files to determine what that should look like is very difficult.

### Authentication

Logging in/out, account management, etc. is presently handled in the current backend, but the new backend needs access to this status. As such, the current backend provisions a UUID token to authenticated users, which the frontend treats as a bearer token. The new backend looks up the user by token and populates `this.req.user`.

[api/controllers/test/authentication.ts](../api/controllers/test/authentication.ts) demonstrates accessing the authenticated user from within an action. Actions where authentication is required are indicated by adding a [policy](https://sailsjs.com/documentation/concepts/policies) entry in [config/policies.js](../config/policies.js) to the [auth policy](../api/policies/auth.ts) which handles both authentication and authorization.

Low-level details of implementing authentication are handled by [Passport](http://www.passportjs.org), which lets us pick from hundreds of additional authentication strategies to add if desired.

If authentication is optional for an action, then simply check for the presence of `this.req.user` in your actions.

Note that, because the process of obtaining an authentication token is currently performed in the current backend, the process to access authenticated endpoints in local instances is a bit clunky. The best way I've found to do this is as follows:

1. Log into https://dev.loconomics.com.
2. Take a database backup and load it into your local instance as documented above.
3. Find your user ID. There are a few ways to do this, but the easiest is probably via your registered email address:
```sql
select UserId from UserProfile where Email = '<your email address>';
go
```

With your user ID in hand, you can then list your authorization tokens:

```sql
select Token from Authorizations where UserId = <your user ID>;
go
```

Place one of these tokens in the header as so: `Authorization: Bearer <token>`

### Authorization

To require specific roles for a given action, set its `requiredRoles` field. See xxx for an example of this.

## Gotchas

### Object literal may only specify known properties, and 'select' does not exist in type 'x'.

Say you're working on an endpoint and get an error like this:

```
web_1          |   Object literal may only specify known properties, and 'select' does not exist in type 'FindConditions<Specialization>'.
```

You have code like:

```
    const data = await Specializations.find({
      select: [
        "specializationID",
        "name"
      ],
      where: {
        name: Like(searchTerm),
        language: this.req.getLocale(),
      },
      take: 20,
      order: {
        displayRank: "ASC",
        name: "ASC"
      }
    })
```

The error message suggests that `select` is an invalid key, but the docs and other code examples clearly state that it is.

The issue isn't `select`, but the fields being selected. In particular:

```
        "specializationID",
```

should be:

```
        "specializationId",
```

The error message misleads. It actually refers to the fields in the `select`, not to `select` itself. This can presumably happen with other TypeORM fields as well.

### Invalid usage of the option NEXT in the FETCH statement.

You'll hit this error if you're using TypeORM's `take` or `limit` options without an `ORDER BY` statement somewhere in your query. If there *is* an `ORDER BY`, ensure that it is correctly being translated to the query by examining the server logs for the web container.

## Testing

There isn't a system for API tests, but since I needed some way to quickly run and test requests against local and remote instances, I created [this pile of shell scripts](../test/rest). [HTTPIe](https://httpie.org) is required to run these. Each script is named for a given route, and runs against https://dev.loconomics.com by default. To run a script against your local instance, use something like:

```bash
$ BASE=http://localhost:1337 ./postal-codes.sh
```

These scripts also include default parameters that should return sensible data, but can optionally be overridden. You could run the above script like s to get another postal codeo:

```bash
$ BASE=http://localhost:1337 ID=90002 ./postal-codes.sh
```

In cases where authentication is required, set the `TOKEN` environment variable from an authentication token retrieved as documented above. See [test/rest/platforms.sh](../test/rest/platforms.sh) for an example of how to write an API script against an authenticated endpoint.

When porting a new endpoint, please copy and modify an existing script. The code from the current backend often includes request parameters that return useful sample data. Please also respect the API path structure by creating scripts in directories that match the remote routes as closely as possible.
