import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max = 500) {
  return String(value ?? "Not provided").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) || "Not provided";
}

export async function POST(request: NextRequest) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_ITINERARY_TEMPLATE || "kerala_trip_itinerary";
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v26.0";

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      { error: "Automatic WhatsApp delivery is not configured on the website server. The owner must add the WhatsApp Cloud API access token and Phone Number ID, then redeploy the website." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.phone !== "string" || typeof body.name !== "string" || typeof body.route !== "string" || typeof body.total !== "string") {
    return NextResponse.json({ error: "Missing itinerary details. Please complete the required fields and try again." }, { status: 400 });
  }

  const to = body.phone.replace(/\D/g, "");
  if (to.length < 10 || to.length > 15) {
    return NextResponse.json({ error: "The WhatsApp mobile number is invalid. Include the country code, for example 91 followed by your 10-digit number." }, { status: 400 });
  }

  // The approved WhatsApp template must contain exactly six body placeholders:
  // {{1}} name, {{2}} route, {{3}} dates, {{4}} duration/travellers/type,
  // {{5}} distance and included/extra km, {{6}} fare breakdown and total.
  const parameters = [
    clean(body.name, 100),
    clean(body.route, 200),
    clean(body.dates, 100),
    clean(body.duration, 150),
    clean(body.distance, 180),
    clean(body.total, 180),
  ];

  let response: Response;
  try {
    response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: language },
          components: [{ type: "body", parameters: parameters.map((text) => ({ type: "text", text })) }]
        }
      }),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ error: "Could not connect to WhatsApp right now. Please try again shortly." }, { status: 502 });
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const metaMessage = result?.error?.message;
    const metaCode = result?.error?.code;
    const hint = metaCode === 132000
      ? " The approved template's number of placeholders does not match the six variables configured by this website."
      : metaCode === 132001
        ? " Check that the template name, language and approval status match your WhatsApp Manager settings."
        : metaCode === 190
          ? " The WhatsApp access token is invalid or expired. Generate a valid system-user token and update the server environment."
          : " Check the WhatsApp Cloud API settings in the website server environment.";
    return NextResponse.json({ error: `${metaMessage || "WhatsApp could not send the itinerary."}${hint}` }, { status: 502 });
  }

  // Meta accepting the request is not the same as final delivery; use a webhook for delivery receipts.
  return NextResponse.json({
    ok: true,
    message: "WhatsApp accepted your itinerary and quotation request for delivery to the mobile number you entered. Please check that WhatsApp account shortly.",
    messageId: result?.messages?.[0]?.id || null
  });
}
