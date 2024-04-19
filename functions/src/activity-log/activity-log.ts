import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
export const onMovieActivityLogged = onDocumentWritten("movies/{movieId}", async (event) => {
    const movieId = event.params.movieId;
    const beforeSnapshot = event.data?.before;
    const afterSnapshot = event.data?.after;

    let activityType;
    let movieData;

    logger.log("Our function has started", { snapBefore: beforeSnapshot, snapAfter: afterSnapshot });

    if (beforeSnapshot?.exists && afterSnapshot?.exists) {
        // Document was updated
        activityType = "updated";
        movieData = afterSnapshot.data();
        logger.log("Updated works!");
    } else if (!beforeSnapshot?.exists && afterSnapshot?.exists) {
        // Document was created
        activityType = "created";
        movieData = afterSnapshot.data();
        logger.log("Created works!");
    } else if (beforeSnapshot?.exists && !afterSnapshot?.exists) {
        // Document was deleted
        activityType = "deleted";
        movieData = null;
        logger.log("Deleted works");
    } else {
        // Unexpected case, handle accordingly
        logger.error('Unexpected case: Both before and after snapshots are undefined.');
        return;
    }

    try {
        // Log activity to ACTIVITY_LOG collection
        await admin.firestore().collection('ACTIVITY_LOG').add({
            movieId: movieId,
            activityType: activityType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            movieData: movieData
        });

        logger.log("Our function has ended");
        logger.log('Movie activity logged:', activityType);
    } catch (error) {
        logger.error('Error logging movie activity:', error);
    }
});
