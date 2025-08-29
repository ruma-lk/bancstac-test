import 'server-only'
import DialogESMS from "@rusoft/dialog-esms"

const { ESMS_USERNAME, ESMS_PASSWORD, ESMS_SENDERID } = process.env;

if (!ESMS_USERNAME || !ESMS_PASSWORD) {
    throw new Error("ESMS_USERNAME and ESMS_PASSWORD must be set in environment variables");
}

export const dialogSMS = new DialogESMS({
    username: ESMS_USERNAME,
    password: ESMS_PASSWORD,
});

export const SENDER_ID = ESMS_SENDERID || "RuSoft";