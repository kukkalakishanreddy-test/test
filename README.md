# Kerala car rentals, vacation and holidays — website starter

A responsive Next.js + TypeScript + Tailwind CSS starter for a Kerala taxi and tours business. It includes tour cards, service highlights, a trip enquiry form, WhatsApp handoff, SEO metadata, and an optional Supabase database.

## Requirements

- Node.js 20.9 or newer
- npm
- A code editor such as VS Code

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

## Configure your business details

The supplied `.env.local` is already configured with your business name and WhatsApp number. To change them later, edit `.env.local`:

```env
NEXT_PUBLIC_BUSINESS_NAME=Kerala car rentals, vacation and holidays
NEXT_PUBLIC_WHATSAPP_NUMBER=917989581582
```

Use your real WhatsApp number in international format with digits only (India: 91 followed by your 10-digit mobile number). Do not include +, spaces, or hyphens. Example format only: 919876543210. The WhatsApp number is configured as 917989581582. Confirm that this number is registered with WhatsApp and can receive customer enquiries.

## Enquiry form behaviour

- Without Supabase credentials, the form prepares the enquiry in WhatsApp. The customer must press Send in WhatsApp. No enquiry is stored automatically.
- With Supabase configured, the form inserts the enquiry into `booking_enquiries`.

To enable Supabase:
1. Create a project at https://supabase.com.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy the project URL and anon/public key from Project Settings → API.
4. Put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Restart the development server.

Security notes:
- Never put a Supabase service-role key in a browser-accessible environment variable.
- Add rate limiting / bot protection and validate the form server-side before production.
- The supplied public insert policy is a starter, not a complete production security review.
- Build a protected owner dashboard separately; do not expose enquiry records through public database policies.

## Build for production

```bash
npm run build
npm run start
```

Use a host and plan that permits commercial use. Verify current provider terms, quotas, and pricing before deployment.

## Before launch checklist

- Business name and WhatsApp number are configured. Replace or confirm the photos, routes, distances, prices, and other copy before launch.
- Use images you own or have permission to use.
- Review the draft package prices and inclusions in `src/app/page.tsx`; these are editable suggestions based on ₹3,200/day, 220 km/day and ₹17/km extra, not verified market rates.
- Add business address/contact details, privacy policy, terms, cancellation policy, and applicable tax information.
- Confirm applicable permits, commercial vehicle requirements, and insurance for your operation.
- Add server-side validation, spam protection, monitoring, and a protected admin dashboard.
- Test mobile layout, WhatsApp flow, enquiry storage, accessibility, and production build.

## Trip fare estimator

The homepage enquiry form now accepts pickup and destination, From/To dates, and an estimated total route distance. It calculates an indicative fare using the configured starter pricing model:

- Base: ₹3,500 per calendar day (From and To dates are counted inclusively)
- Included distance: 100 km per day
- Additional distance: ₹17 per km above the included allowance

Customers can edit the route, dates and kilometres and select **Check fresh route price** to recalculate. **Send itinerary & quotation to my WhatsApp** calls the server-side WhatsApp Cloud API and sends to the customer's entered number; it does not open WhatsApp on the customer's device. **Send enquiry to our WhatsApp** remains a separate customer-initiated message to the business number. The route distance is entered by the customer; this starter project does not automatically fetch live road distance or live market fares. The displayed amount is an estimate, not a confirmed quote. Confirm route kilometres, tolls, parking, permits, taxes and other applicable charges before accepting a booking.

## Automatic customer itinerary delivery (WhatsApp Business Platform)

The **Send itinerary & quotation to my WhatsApp** button now sends the itinerary from your business WhatsApp account to the customer's entered WhatsApp number through a server-side API route. It does not open a self-chat or expose the customer's number on the owner-enquiry button. The customer must tick the consent checkbox.

This feature will only send automatically after you configure the official WhatsApp Business Platform Cloud API:

1. Set up a Meta Business account, a WhatsApp Business Account and a WhatsApp-enabled phone number.
2. In WhatsApp Manager, create and get approval for a utility message template named `kerala_trip_itinerary` in English. It must have exactly six body placeholders in this order: `{{1}}` customer name, `{{2}}` pickup-to-destination route, `{{3}}` travel dates, `{{4}}` duration + traveller count + trip type, `{{5}}` total/included/extra kilometres, and `{{6}}` fare breakdown + estimated total. The template name, language and placeholder count/order must match exactly.
3. Add the permanent system-user access token and phone number ID to your deployment's server environment as `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`. Also set `WHATSAPP_ITINERARY_TEMPLATE`, `WHATSAPP_TEMPLATE_LANGUAGE`, and `WHATSAPP_GRAPH_API_VERSION` if your approved template uses different values. This project defaults to Graph API `v26.0`. Never put the access token in a `NEXT_PUBLIC_` variable or in client-side code.
4. Keep these credentials server-side only. Never prefix them with `NEXT_PUBLIC_` or expose them in browser code. Restart/redeploy after setting them.

Until the Cloud API credentials and approved template are configured on the deployed server, the endpoint returns a clear setup error instead of pretending that a WhatsApp message was sent. A successful API response means Meta accepted the request; it is not proof of final delivery. For delivery/read receipts, configure a WhatsApp webhook. The separate **Send enquiry to our WhatsApp** action continues to open a customer-composed message to the business number; the customer still presses Send. The automatic delivery uses WhatsApp, not SMS. Separate SMS delivery would require an SMS provider and additional configuration.
