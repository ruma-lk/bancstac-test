import { NextResponse } from "next/server";
import { dialogSMS, SENDER_ID } from "../../../../lib/smsenv";

export async function POST(req: Request) {
      try {

        const {to, message} = await req.json();

        const auth = await dialogSMS.login();
        if (!auth) {
          return NextResponse.json("ESMS Auth failed", { status: 401 });
        }
  
        const res = await dialogSMS.sendSMS({
          msisdn: [{ mobile: String(to) }], // recipient number
          sourceAddress:SENDER_ID,
          message: String(message),
          transaction_id: Date.now(),
          payment_method: 0,
          push_notification_url: 'http://localhost:3000/sms-status',
        });
  
        return NextResponse.json(res);
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
      }
}
