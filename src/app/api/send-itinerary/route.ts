
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(value: unknown, max = 1500) {
  return String(value ?? "Not provided")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max) || "Not provided";
}

export async function POST(request: NextRequest) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName =
    process.env.WHATSAPP_ITINERARY_TEMPLATE || "kerala_tours_quotation";
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v26.0";

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      { error: "WhatsApp delivery is not configured on the server." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.phone !== "string" ||
    typeof body.name !== "string" ||
    typeof body.pickup !== "string" ||
    typeof body.destination !== "string" ||
    typeof body.travelDate !== "string" ||
    typeof body.itinerary !== "string" ||
    typeof body.total !== "string"
  ) {
    return NextResponse.json(
      { error: "Some required trip details are missing. Please check the form." },
      { status: 400 }
    );
  }

  const to = body.phone.replace(/\D/g, "");

  if (to.length < 10 || to.length > 15) {
    return NextResponse.json(
      { error: "Invalid WhatsApp number. Include the country code, such as 91 followed by your 10-digit number." },
      { status: 400 }
    );
  }

  // Must match the six placeholders in kerala_tours_quotation:
  // {{1}} name, {{2}} pickup, {{3}} destination,
  // {{4}} travel date, {{5}} itinerary, {{6}} quotation amount.
  const parameters = [
    clean(body.name, 100),
    clean(body.pickup, 200),
    clean(body.destination, 200),
    clean(body.travelDate, 100),
    clean(body.itinerary, 1500),
    clean(body.total, 200),
  ];

  let response: Response;

  try {
    response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: language },
            components: [
              {
                type: "body",
                parameters: parameters.map((text) => ({
                  type: "text",
                  text,
                })),
              },
            ],
          },
        }),
        cache: "no-store",
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not connect to WhatsApp. Please try again shortly." },
      { status: 502 }
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const metaMessage = result?.error?.message;
    const metaCode = result?.error?.code;

    const hint =
      metaCode === 132000
        ? " Check that the template has exactly six matching placeholders."
        : metaCode === 132001
          ? " Check the template name, language and approval status in WhatsApp Manager."
          : metaCode === 190
            ? " The WhatsApp access token is invalid or expired. Update it in Vercel."
            : " Check your WhatsApp Cloud API settings in Vercel.";

    return NextResponse.json(
      { error: `${metaMessage || "WhatsApp could not send the message."}${hint}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      "WhatsApp accepted your itinerary and quotation request. Please check the WhatsApp number you entered.",
    messageId: result?.messages?.[0]?.id || null,
  });
}
