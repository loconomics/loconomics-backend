# REST API Tests

This directory contains files for the Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension. The goal is to support easily running API requests against production, dev, and staging environments, comparing their behaviors and return values.

## Usage

The extension docs are pretty good for this, but in brief:

1. Install VSCode.
2. Install the above extension.
3. Configure your user settings.json file with your credentials for the various loconomics.com sites. Note, do *not* use workspace settings for this, as your credentials may get accidentally committed. See a sample configuration below.
4. With _api.http_ open, place the cursor near a given request and press _ctrl-alt-R_ to run it.
5. Select another environment using the control near the bottom, then rerun the request to note any differences.

## Sample Configuration

Here is a template snippet for your user _settings.json_:

```json
{
    "rest-client.environmentVariables": {
        "loconomicsDev": {
            "username": "me@example.com",
            "password": "CHANGEME123"
        },
        "loconomicsStaging": {
            "username": "me@example.com",
            "password": "CHANGEME123"
        }
    }
}
```

With the above configuration in place and with correct credentials, you should be able to see sample return values for authenticated and unauthenticated API requests.
