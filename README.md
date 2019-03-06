# Loconomics Backend

Currently this is just a proxy. Incoming requests are passed directly to dev.loconomics.com.

For increased compatibility with our current backend, paths of the form /api/vX/YY-YY/Z are supported, where:

* `X` is an API version, currently set to `1`. The version currently has no effect, but is stored in the request for future use.
* `YY-YY` is a language code, for instance, `en-us`. The desired language must either be specified in the `Accept-language` HTTP header, or included in this exact path segment. If it is included in the path, it is normalized and placed in the header.
* `Z` is the remainder of the path.

Future versions of this backend may relax these requirements somewhat, but for now URLs must follow the above format.

## Setup

Note that this repository uses a Git submodule for the ORM. To get this submodule, either clone this repository with the `--recursive` option or run the following commands:

```bash
$ git submodule init
$ git submodule update
```


### Development

FOr the moment, [Docker](https://www.docker.com) is the only supported development environment. Nothing about the backend is Docker-specific, so avoiding Docker is entirely possible but beyond the scope of this documentation. To set up a development environment:

1. [Set up the Loconomics frontend](https://github.com/loconomics/loconomics/blob/master/docs/App%20Quick%20Start%20Guide.md).
2. [Install Docker CE for your platform](https://docs.docker.com/install/).
3. [Install Docker Compose for your platform](https://docs.docker.com/compose/install/).
4. Launch the frontend (for example, with `yarn grunt atwork`).
5. From the backend directory, run `docker-compose up`. On first use, this will download necessary dependencies and create your development environment. Please be patient. The backend will eventually report that it is listening.
6. If you get database connection errors, you may need to load in a database snapshot. See our [developer documentation](doc/development.md) for details on this process.
7. Visit http://localhost:8811 and, from a browser console, run `localStorage.siteUrl = 'http://localhost:1337'`.
8. You may need to reload the page.

The backend development environment is now running. Note that, in its current form, the backend requires that dev.loconomics.com be operational during development.

### Production

*_This is not currently intended for production use!*_

But, as a start at collecting notes, here we go. The following environment variables are currently used:

 * `LOCONOMICS_BACKEND_URL`: While we're proxying, set to the URL of the .net Loconomics backend. Defaults to `https://www.loconomics.com`.
 * `MSSQLSERVER_URL`: The URL to the MSSQL server in the form mssql://<user>:<password>@<host>/<database>

At the moment, Azure is the only environment known to run this. See [here](https://github.com/loconomics/loconomics-devops) for a Terraform script that can be used to set things up.
