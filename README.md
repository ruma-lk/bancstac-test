# Next.js × Bancstac (Paycenter) IPG — Test Integration

A minimal, production-ready example showing how to integrate Bancstac / Paycenter IPG in a Next.js app.
It includes HMAC signing, a secure server proxy, return/cancel handling, and sample UI to kick off payments and display results.

## Packages used

 * Next.js (App Router)

 * TypeScript

 * @rusoft/paycenter (helpers/utilities for Paycenter flows)

## Features

✅ Server-side HMAC signing & verification

✅ Secure proxy to Paycenter (no secrets in the browser)

✅ Return/Cancel handlers with example UI alerts

✅ Optional Webhook endpoint stub

✅ Clear environment configuration and error-handling patterns

## 1) Install deps
pnpm install
or npm i / yarn

## 2) Run dev
pnpm dev
or npm dev / yarn dev

## App runs at http://localhost:3000

## .env Requirements
PAYCENTER_TOKEN=your_authtoken_here\
HMAC_SECRET=your_hmac_secret_here\
PAYCENTER_CLIENTID=00000000\
PAYCENTER_URL=https://paycorp-xxx.prod.aws.paycorp.lk/rest/service/proxy\

