
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const supabase =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey)
    : null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token &&
    verifyToken &&
    token === verifyToken &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    console.error("Supabase server configuration is missing.");

    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.entry || !Array.isArray(body.entry)) {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  try {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Save incoming customer messages
        for (const message of value.messages || []) {
          const contact = (value.contacts || []).find(
            (item: any) => item.wa_id === message.from
          );

          const messageText =
            message.text?.body ||
            message.button?.text ||
            message.interactive?.button_reply?.title ||
            message.interactive?.list_reply?.title ||
            null;

          const { error } = await supabase
            .from("whatsapp_messages")
            .upsert(
              {
                message_id: message.id,
                customer_phone: message.from || null,
                customer_name: contact?.profile?.name || null,
                message_type: message.type || null,
                message_text: messageText,
                message_timestamp: message.timestamp
                  ? new Date(
                      Number(message.timestamp) * 1000
                    ).toISOString()
                  : null,
                raw_payload: message,
              },
              { onConflict: "message_id" }
            );

          if (error) throw error;
        }

        // Save quotation delivery status updates
        for (const status of value.statuses || []) {
          const { error } = await supabase
            .from("whatsapp_message_statuses")
            .insert({
              message_id: status.id,
              recipient_phone: status.recipient_id || null,
              status: status.status,
              status_timestamp: status.timestamp
                ? new Date(
                    Number(status.timestamp) * 1000
                  ).toISOString()
                : null,
              error_details: status.errors || null,
              raw_payload: status,
            });

          if (error) throw error;
        }
      }
    }

    console.log("WhatsApp webhook events saved successfully.");

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook database error:", error);

    return NextResponse.json(
      { error: "Could not save WhatsApp webhook event." },
      { status: 500 }
    );
  }
}
