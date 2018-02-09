# Loconomics Backend

Currently this is just a proxy. Incoming requests are passed directly to dev.loconomics.com, with /api/test intercepted and handled locally.

## Setup

FOr the moment, [Docker](https://www.docker.com) is the only supported development environment. Nothing about the backend is Docker-specific, so avoiding Docker is entirely possible but beyond the scope of this documentation. To set up a development environment:

1. [Set up the Loconomics frontend](https://github.com/loconomics/loconomics/blob/master/docs/App%20Quick%20Start%20Guide.md).
2. [Install Docker CE for your platform](https://docs.docker.com/install/).
3. [Install Docker Compose for your platform](https://docs.docker.com/compose/install/).
4. Launch the frontend (for example, with `yarn grunt atwork`).
5. From the backend directory, run `docker-compose up`. On first use, this will download necessary dependencies and create your development environment. Please be patient. The backend will eventually report that it is listening.
6. Visit http://localhost:8811 and, from a browser console, run `localStorage.siteUrl = 'http://localhost:3000'`.
7. You may need to reload the page.

The backend development environment is now running. Note that, in its current form, the backend requires that dev.loconomics.com be operational. It also forwards all data via HTTP.
