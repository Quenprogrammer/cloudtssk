import {onRequest} from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import * as logger from "firebase-functions/logger";
import {onDocumentCreated, onDocumentDeleted, onDocumentUpdated, onDocumentWritten} from "firebase-functions/v2/firestore";

const functions = require('firebase-functions');



admin.initializeApp();

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
    response.send("Hello from Firebase!");
});


export const onMovieAddedAddTimeStamp = onDocumentCreated("movies/{movieId}", async (event) => {
     const movieId = event.params.movieId;

    try {
        // Use server timestamp for createdOn and updatedOn fields
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        // Update the document with the createdOn and updatedOn fields
        await admin.firestore().collection('movies').doc(movieId).update({
            movieId: movieId,
            createdOn: timestamp,
            updatedOn: timestamp
        });

        console.log('Timestamps added to the movie document.');
        return null;
    } catch (error) {
        console.error('Error adding timestamps to movie:', error);
        return null;
    }

});


export const onMovieDeleteMoveMovieToRecycleBin = onDocumentDeleted("movies/{movieId}", async (event) => {

    const movieId = event.params.movieId;
    const snap = event.data;
    const data = snap?.data();
    try {
        if (!movieId) {
            logger.error('Movie ID is missing in the request.', {movieId});
        }

        // Add the deleted document to MOVIES_RECYCLE_BIN collection
        await admin.firestore().collection('MOVIES_RECYCLE_BIN').doc(movieId).set({...data});

        logger.info('Document moved to recycle bin and deleted from movies collection.', {movieId});
    } catch (error) {
        logger.error('Error occurred while moving document to recycle bin:', error);
    }
});


export const onMovieUpdatedUpdateTimeStamp = onDocumentUpdated("movies/{movieId}", async (event) => {

    const movieId = event.params.movieId;
    try {

        const movieData = event.data?.after.data();
        // Use server timestamp for updatedOn field
        const timestamp = admin.firestore.FieldValue.serverTimestamp();


        //I added this to prevent the cloud function from going into infinite loop and DDos ing your self
        //So this function will technically just update the updatedOn timestamp only once
        if (!movieData?.updatedFlag) {
            // Update the document with the updatedOn field
            await admin.firestore().collection('movies').doc(movieId).update({
                updatedOn: timestamp,
                updatedFlag: true
            });

        }

        console.log('Timestamp added to the movie document on update.');
    } catch (error) {
        console.error('Error adding timestamp to movie on update:', error);

    }
});


export const onMovieActivityLogged = onDocumentWritten("movies/{movieId}", async (event) => {
    const movieId = event.params.movieId;
    const beforeSnapshot = event.before;
    const afterSnapshot = event.after;

    let activityType;
    let movieData;

    if (beforeSnapshot && afterSnapshot) {
        // Document was updated
        activityType = "updated";
        movieData = afterSnapshot.data();
    } else if (!beforeSnapshot && afterSnapshot) {
        // Document was created
        activityType = "created";
        movieData = afterSnapshot.data();
    } else if (beforeSnapshot && !afterSnapshot) {
        // Document was deleted
        activityType = "deleted";
        movieData = null;
    } else {
        // Unexpected case, handle accordingly
        console.error('Unexpected case: Both before and after snapshots are undefined.');
        return null;
    }

    try {
        // Log activity to ACTIVITY_LOG collection
        await admin.firestore().collection('ACTIVITY_LOG').add({
            movieId: movieId,
            activityType: activityType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            movieData: movieData
        });

        console.log('Movie activity logged:', activityType);
        return null;
    } catch (error) {
        console.error('Error logging movie activity:', error);
        return null;
    }
});

export const createUserDocument = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    // Get user data
    const { uid, displayName, email } = user;

    try {
        // Create a new document in the USERS collection with user's UID as document ID
        await admin.firestore().collection('USERS').doc(uid).set({
            displayName: displayName || null,
            email: email || null,
            // Add more user data fields as needed
        });
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