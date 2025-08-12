import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@rusoft/paycenter";

export const runtime = "nodejs";

const must = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bridge = url.searchParams.get("bridge") === "1";
  const reqid = url.searchParams.get("reqid") || "";
  const clientRef = url.searchParams.get("clientRef") || "";

  const { status, body } = await confirmPayment(reqid, {
    paycenterUrl: must("PAYCENTER_URL"),
    clientId: must("PAYCENTER_CLIENTID"),
    token: must("PAYCENTER_TOKEN"),
    hmacSecret: must("HMAC_SECRET"),
  });

  if (!bridge) {
    return new Response(body, {
      status,
      headers: { "content-type": "application/json" },
    });
  }

  const jsonStr = typeof body === "string" ? body : JSON.stringify(body);
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Return</title></head>
<body>
<script>
  (function(){
    try{
      var payload = ${JSON.stringify(jsonStr)};
      var data; try{ data = JSON.parse(payload); }catch(e){ data = { raw: payload }; }
      window.parent.postMessage(
        { source: "paycenter", status: ${status}, clientRef: ${JSON.stringify(clientRef)}, reqid: ${JSON.stringify(reqid)}, data },
        location.origin
      );
    }catch(e){}
  })();
</script>
</body></html>`;
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}