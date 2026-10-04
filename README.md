# CourierFlow Courier Portal

A frontend-only courier operations prototype built with Next.js 16, TypeScript, React, Redux Toolkit, localStorage, and Turbopack.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

All accounts use the password `demo123`.

- Admin: `admin@demo.com`
- Merchant: `merchant@demo.com`
- Rider: `rider@demo.com`

## Included workflows

- Public shipment tracking using shared shipment data
- Merchant shipment creation, editing, cancellation, pickups, COD, invoices, reports, and settings
- Admin shipment operations, hubs, manifests, riders, merchants, COD settlements, returns, complaints, users, reports, and company settings
- Rider pickups, delivery start, successful delivery, failed delivery, COD collection, and history
- Full status timeline and return-to-origin flow
- Redux Toolkit state persisted per module in localStorage

## Production check

```bash
npm run build
npm start
```

Next.js 16 uses Turbopack automatically for development and production builds.
