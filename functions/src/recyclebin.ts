import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

admin.initializeApp();

export const moveDocumentToRecycleBin = onRequest(async (request, response) => {
        const deletedDocument = request.body;
        const movieId = request.query.movieId as string;

        try {
                if (!movieId) {
                        throw new Error('Movie ID is missing in the request.');
                }

                // Add the deleted document to MOVIES_RECYCLE_BIN collection
                await admin.firestore().collection('MOVIES_RECYCLE_BIN').doc(movieId).set(deletedDocument);

                // Delete the document from the movies collection
                await admin.firestore().collection('movies').doc(movieId).delete();

                logger.info('Document moved to recycle bin and deleted from movies collection.', { movieId });
                response.send('Document moved to recycle bin and deleted from movies collection.');
        } catch (error) {
                logger.error('Error occurred while moving document to recycle bin:', error);
                response.status(500).send('Error occurred while moving document to recycle bin.');
        }
});
