import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {onDocumentCreated, onDocumentDeleted, onDocumentUpdated} from "firebase-functions/v2/firestore";

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
    } catch (error) {
        console.error('Error adding timestamps to movie:', error);
    }

});


export const onMovieDeleteMoveMovieToRecycleBin = onDocumentDeleted("movies/{movieId}", async (event) => {

    const movieId = event.params.movieId;
    const data = event.data?.data();

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

