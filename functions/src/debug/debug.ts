import * as logger from "firebase-functions/logger";
import {onRequest} from "firebase-functions/v2/https";
import {sendDailySummaryEmail} from "../sendemail";

export const helloWorld = onRequest(async (request, response) => {
    logger.info("Hello logs!", {structuredData: true});
    await sendDailySummaryEmail()
    response.send("Hello from Firebase!");
});

