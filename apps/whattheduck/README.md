# What The Duck

## Running locally

- Update `VITE_DM_SOCKET_URL` in `.env` so that it doesn't point to the production environment (comment the line with the production URL, uncomment the other one)
- Run `pnpm dev:whattheduck` from the root of this repository. This will start:
  - The DM Web interface
  - The DM API
  - A Web version of WTD, which in itself is limited as it can't use any mobile capabilities (like cover search)
- EXPERIMENTAL: You can also run the native Android app by calling `pnpm dev:whattheduck:android` from the root of this repository. In this case you will need to edit your local public IP in [capacitor.config.ts](capacitor.config.ts) and [capacitor.config.json](capacitor.config.json). This will start:
  - The DM Web interface
  - The DM API
  - The native WTD Android app.
