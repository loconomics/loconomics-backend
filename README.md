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

See our [doc/development.md](developer documentation) for instructions on how to provision a development environment, as well as tips and tricks on how to help out.

### Production

*_This is not currently intended for production use!*_

But, as a start at collecting notes, here we go. The following environment variables are currently used:

 * `LOCONOMICS_BACKEND_URL`: While we're proxying, set to the URL of the .net Loconomics backend. Defaults to `https://www.loconomics.com`.
 * `MSSQLSERVER_URL`: The URL to the MSSQL server in the form mssql://<user>:<password>@<host>/<database>

At the moment, Azure is the only environment known to run this. See [here](https://github.com/loconomics/loconomics-devops) for a Terraform script that can be used to set things up.
