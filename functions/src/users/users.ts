import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";


export const createUserDocument = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    // Get user data
    const { uid } = user;

    try {
        // Create a new document in the USERS collection with user's UID as document ID

        const userJson = JSON.stringify(user);
        await admin.firestore().collection('USERS').doc(uid)
            .set({...(JSON.parse(userJson)) });
        console.log('User document created successfully.');
    } catch (error) {
        console.error('Error creating user document:', error);
    }
});
export const sendUserDeletionNotification = functions.auth.user().onDelete(async (user: admin.auth.UserRecord) => {
    // Get user data
    const { email } = user;

    try {
        // Send an email notification to the administrator
        await admin
            .firestore()
            .collection('emails')
            .add({
                to: 'aims@gmail.com',
                message: {
                    subject: 'User Account Deleted',
                    text: `The user with email ${email} has been deleted.`,
                },
            });

        console.log('User deletion notification sent successfully.');
    } catch (error) {
        console.error('Error sending user deletion notification:', error);
    }
});

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

export const syncUsers = onRequest(async (request, response) => {
    logger.info("sync started", {structuredData: true});
    const usersSnapshot = await admin.auth().listUsers();
    const users=usersSnapshot.users
   for(let i=0; i<=users.length;i++){
       try {
           // Create a new document in the USERS collection with user's UID as document ID

           const userJson = JSON.stringify(users[i]);
           await admin.firestore().collection('USERS').doc(users[i].uid)
               .set({...(JSON.parse(userJson)) });
           console.log('User document created successfully.');
       } catch (error) {
           console.error('Error creating user document:', error);
       }
   }
    response.send("completed Sync Users");
});
