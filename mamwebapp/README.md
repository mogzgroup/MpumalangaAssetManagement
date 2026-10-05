# Asset Management web application

## Build

Install dependencies with `npm ci`, then build the production bundle with:

```sh
npm run build -- --configuration production
```

Deploy the generated browser files from `dist/mamwebapp/browser` to the web root.
The production build calls the API at the same origin under `/api`; the IIS
rewrite configuration forwards those requests to the API listener on
`127.0.0.1:5000`. Install IIS URL Rewrite and Application Request Routing, and
enable ARR proxying on the server.

## Runtime configuration

Before publishing, set `googleMapsApiKey` in
`src/assets/runtime-config.json` (or replace the file in the deployment
artifact). This is a browser-visible key, not a secret: restrict it by HTTP
referrer and enable only the Google Maps APIs the application uses.

The checked-in template intentionally has no key. The application still starts
without one, but map and Places features will not load.

## Development

Run `npm start` for the Angular development server at
`http://localhost:4200/`. The development proxy forwards `/api` to the local
API at `https://localhost:44391`.

Run tests with `npm test`.
