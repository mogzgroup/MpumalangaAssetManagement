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

## Maps

Maps use MapLibre GL JS with the OpenFreeMap Liberty style and OpenStreetMap
data. No map API key is required. Map panels include provider and OpenStreetMap
attribution. Address coordinate lookup uses OpenStreetMap Nominatim only when
the user explicitly requests a search; a selected result stores its coordinates
alongside a hired property.

The Dashboard plots facility coordinates; selecting a facility opens its
existing asset-details dialog. Hiring and Lease Management display their
property coordinates in clustered, clickable markers with address/property
popups. The map keeps the previous Mpumalanga center and zoom, and uses
MapLibre's navigation controls for pan and zoom.

## Authentication

The frontend stores the authenticated user and JWT in browser local storage so
the session survives a page refresh. The HTTP interceptor adds the bearer token
to API requests only; a `401 Unauthorized` response clears the stored session
and returns the user to the login page.

## Development

Run `npm start` for the Angular development server at
`http://localhost:4200/`. The development proxy forwards `/api` to the local
API at `https://localhost:44391`.

Run tests with `npm test`.
