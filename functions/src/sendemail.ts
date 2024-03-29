import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aimstech@gmail.com',
        pass: 'addcsjsbjsd'
    }
});

// Function to query Firestore and get the total count of users
async function getTotalUsers() {
    const usersSnapshot = await admin.firestore().collection('users').get();
    return usersSnapshot.size;
}

// Function to query Firestore and get the total count of movies
async function getTotalMovies() {
    const moviesSnapshot = await admin.firestore().collection('movies').get();
    return moviesSnapshot.size;
}

// Function to query Firestore and get the total count of categories
async function getTotalCategories() {
    const categoriesSnapshot = await admin.firestore().collection('categories').get();
    return categoriesSnapshot.size;
}

// Function to send the email containing the required information
async function sendDailySummaryEmail() {
    const totalUsers = await getTotalUsers();
    const totalMovies = await getTotalMovies();
    const totalCategories = await getTotalCategories();

    const today = new Date();
    const formattedDate = today.toDateString();

    const mailOptions = {
        from: 'aimstech@gmail.com',
        to: 'admin@example.com', // Administrator's email
        subject: 'Daily Summary',
        text: `Date: ${formattedDate}\nTotal Users: ${totalUsers}\nTotal Movies: ${totalMovies}\nTotal Categories: ${totalCategories}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Schedule the Cloud Function to run daily at a specific time
exports.sendDailySummary = functions.pubsub.schedule('every day 00:00').onRun(async (context) => {
    await sendDailySummaryEmail();
});





