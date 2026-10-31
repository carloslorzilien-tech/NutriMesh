# NutriMesh

Pickup coordination between hotel kitchens and a food bank in Santo Domingo. Not a marketplace.

Hotels log two kinds of surplus at the end of service. The food bank confirms a morning pickup. The driver opens one link, with no account. The bank weighs what actually arrived and can reject the batch.

The hotels and the food bank in this build are a simulated pilot, not signed partners.

## What can be logged

Only food that never met a guest.

- Sealed store-room goods nearing their date: produce not yet prepped, dairy, meat, or dry goods still in their package.
- Kitchen production that stayed in the back of house, cooled and held at 4 °C or below.

Buffet food, anything from a guest plate, and infant formula cannot be logged. A batch can still be rejected on arrival for temperature, smell, packaging, or date.

## How a batch moves

The hotel publishes at close. The bank confirms a morning window. The driver marks the pickup. The bank enters the real weight and accepts or rejects.

Hot buffet is out of scope. A truck is not sent at midnight.

## Stack

React, TypeScript, Vite. Styles are plain CSS. Firebase Auth and Firestore when `.env` is present. Without `.env`, the same flow runs in memory so the demo still works.

## Run

```
git clone https://github.com/carloslorzilien-tech/NutriMesh.git
cd NutriMesh
npm install
npm run dev
```

| Role | Email | Password |
| --- | --- | --- |
| Hotel Europa | hotel.europa@nutrimesh.dev | demo1234 |
| Barceló | barcelo@nutrimesh.dev | demo1234 |
| Food bank | coordinador@bard.org.do | demo1234 |
| Driver | no account | /c/:token |

Meal counts use 0.4 kg each. Carbon figures use 2.5 kg CO₂e per kilo rescued. Both are labeled assumptions, not measurements.

## Status

Working prototype for STEMergent Hacks 2026. The script for the two-minute demo is in demo.md.
