import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { region } from 'firebase-functions';

admin.initializeApp();

export const addTimestampsToMovie = region('europe-west1').firestore
    .document('movies/{movieId}')
    .onUpdate(async (change, context) => {
        const movieId = context.params.movieId;

        try {
            // Use server timestamp for updatedOn field
            const timestamp = firestore.FieldValue.serverTimestamp();

            // Update the document with the updatedOn field
            await admin.firestore().collection('movies').doc(movieId).update({
                updatedOn: timestamp
            });

            console.log('Timestamp added to the movie document on update.');
            return null;
        } catch (error) {
            console.error('Error adding timestamp to movie on update:', error);
            return null;
        }
    });
