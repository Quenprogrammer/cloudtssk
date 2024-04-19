
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adamsadam3667@gmail.com',
        pass: 'vyml nwvx khrl nzyp'
    }
});

// Function to query Firestore and get the total count of users
async function getTotalUsers() {
    const usersSnapshot = await admin.auth().listUsers();
    return usersSnapshot.users.length;
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
export async function sendDailySummaryEmail() {
    const totalUsers = await getTotalUsers();
    const totalMovies = await getTotalMovies();
    const totalCategories = await getTotalCategories();


    const today = new Date();
    const formattedDate = today.toDateString();

    const mailOptions = {
        from: 'aimstech@gmail.com',
        to: 'khaleelkantsi@gmail.com', // Administrator's email
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




