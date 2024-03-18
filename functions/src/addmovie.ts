import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { region } from 'firebase-functions';

admin.initializeApp();

export const addTimestampsToMovie = region('europe-west1').firestore
    .document('movies/{movieId}')
    .onCreate(async (snapshot, context) => {
        const movieId = context.params.movieId;

        try {
            // Use server timestamp for createdOn and updatedOn fields
            const timestamp = firestore.FieldValue.serverTimestamp();

            // Update the document with the createdOn and updatedOn fields
            await admin.firestore().collection('movies').doc(movieId).update({
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
