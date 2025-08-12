import { NextRequest } from "next/server";
import { proxyToPaycenter } from "@rusoft/paycenter";

export const runtime = "nodejs";

const mustGet = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text(); // <-- raw JSON string

    const { status, body } = await proxyToPaycenter(raw, {
      paycenterUrl: mustGet("PAYCENTER_URL"),
      token: mustGet("PAYCENTER_TOKEN"),
      hmacSecret: mustGet("HMAC_SECRET"),
    });

    return new Response(body, {
      status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Proxy error", message: err?.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
