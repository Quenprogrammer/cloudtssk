import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

exports.disableUserAccount = functions.https.onCall(async (data, context) => {
    const email = data.email;

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(userRecord.uid, {disabled: true});
        return {success: true, message: `User with email ${email} disabled successfully.`};
    } catch (error: any) { // Explicitly type the error object
        console.error('Error disabling user account:', error);
        return {success: false, error: error.message};
    }
});
