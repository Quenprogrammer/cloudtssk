
// Schedule the Cloud Function to run daily at a specific time
import * as functions from "firebase-functions";
import {sendDailySummaryEmail} from "../sendemail";

exports.sendDailySummary = functions.pubsub.schedule('every day 00:00').onRun(async (context) => {
    await sendDailySummaryEmail();
});


