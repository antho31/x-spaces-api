# x-spaces-api

Retrieve Spaces information for users on X (formerly known as Twitter).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- Retrieve information like space id, title, media key, playlist URL (.m3u8), and more from any X creator id.
- Supports pagination through cursor parameter.
- Utilizes internal GraphQL API – no paid developer account required.
- Built using TypeScript and deployed with Wrangler.

## Usage example

### Fetch Spaces information from [RadioChadFr](https://twitter.com/RadioChadFr)

Use `creator_id` = `1511552753444741120`

```shell
# The cursor query parameter is optional.
curl --request GET \
  --url 'https://[deployment_url]/spaces/1511552753444741120?cursor=DAABCgABF9wpS1-__9QKAAIX0ePcB1dwwggAAwAAAAIAAA' 
```

```JSON
{
   "data":[
      {
         "space_id":"1YpJkwXXDrjJj",
         "embed":"https://twitter.com/i/spaces/1YpJkwXXDrjJj",
         "creator":"Radio Chad",
         "title":"QU'EST-CE QUE LE LIBERTARIANISME ?",
         "state":"Ended",
         "media_key":"28_1713278501330231296",
         "playlist":"https://prod-fastly-eu-west-3.video.pscp.tv/Transcoding/v1/hls/LMNE3Jc9cDGtHFBHUDxGGMzy69b1RYZGKNq2k2t1zt5XhCc94U4WBbmC69JmhhRe-O3_51c6hjqUNIcEBK5VnQ/non_transcode/eu-west-3/periscope-replay-direct-prod-eu-west-3-public/audio-space/playlist_16748733499282531558.m3u8?type=replay",
         "created_at":1697312400536,
         "scheduled_start":1698004847505,
         "started_at":1698004806977,
         "ended_at":"1698010574755",
         "is_space_available_for_replay":true,
         "total_replay_watched":92,
         "total_live_listeners":90
      },
      {
         "space_id":"1YqxoDYWrVMKv",
         "embed":"https://twitter.com/i/spaces/1YqxoDYWrVMKv",
         "creator":"Radio Chad",
         "title":"JEUX VIDEO, BLOCKCHAIN ET TWITTER DE MERDE",
         "state":"Ended",
         "media_key":"28_1715463023849246720",
         "playlist":"https://prod-fastly-eu-west-3.video.pscp.tv/Transcoding/v1/hls/eXBGros1_pCwuUGqj3naP46crSlLAgHADhIBece0PzXGuXdr0PdwypOT80K59UCxsEZXuRjXJC4tTocOjSMBrQ/non_transcode/eu-west-3/periscope-replay-direct-prod-eu-west-3-public/audio-space/playlist_16748906662865588420.m3u8?type=replay",
         "created_at":1697833231287,
         "started_at":1697833233210,
         "ended_at":"1697837404207",
         "is_space_available_for_replay":true,
         "total_replay_watched":36,
         "total_live_listeners":43
      }
   ],
   "cursor":"DAABCgABF9wpS1-__78KAAIXy_S8oVag3wgAAwAAAAIAAA"
}
```

## Development

### Prerequisites

Ensure you have:

- Node.js installed.
- A Cloudflare account.
- A Twitter account (a free account is sufficient).

### Setup

#### Installation

To install the project, follow these steps:

```shell
git clone https://github.com/antho31/x-spaces-api
cd x-spaces-api
npm install
```

#### X Account authentication

Create a `.dev.vars` file and provide the following environment variables:

| Variable Name         | Description                                                    | Required  |
|-----------------------|----------------------------------------------------------------|-----------|
| AUTH_TOKEN            | Twitter Authentication token (`auth_token` from cookies)       | Yes       |
| CSRF                  | Twitter Cross-site request forgery token (`ct0` from cookies)  | Yes       |

Refer to `.dev.example.vars` for an example.

##### Retrieving required tokens

1. Sign in Twitter
2. Press F12 to open developer tools
3. Navigate to the `Application` tab.
4. Under `Storage`, select `Cookies` > `https://twitter.com`.
5. Copy the value of `auth_token` and assign it to `AUTH_TOKEN`.
6. Copy the value of `ct0` and assign it to `CSRF`.

#### Cloudflare configuration

1. Log in using `wrangler`:

```shell
npx wrangler login
```

2. Configure secrets for production:

```shell
npx wrangler secret put AUTH_TOKEN
npx wrangler secret put CSRF
```

### Testing

Run tests with:

```shell
npm run test
```

### Local development server

Start the development server:

```shell
npm run dev
```

Access the API at `http://localhost:8787`

### Deployment

Deploy the project to Cloudflare Workers:

```shell
npm run deploy
```

**Note**: Remember to note down the published API endpoint.

## License

Licensed under the MIT License. Refer to the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [twspace-crawler](https://github.com/HitomaruKonpaku)
