// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('mongodb');

const app = express();
const port = 3000;

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb+srv://ezra6987:Ubd00-317782@hrms-login-enquiry.5vztfrw.mongodb.net/HR-MANAGEMENT-SYSTEM?retryWrites=true&w=majority'; // MongoDB connection URL
const dbName = 'hrms-app'; // Name of the MongoDB database

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "views" directory
app.use(express.static(path.join(__dirname, 'views')));

// MongoDB client connection
let db;
MongoClient.connect(mongoUrl, { tlsAllowInvalidCertificates: true })
    .then(client => {
        console.log('Connected to MongoDB successfully');
        db = client.db(dbName);
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Middleware to check database connection
app.use((req, res, next) => {
    if (!db) {
        console.log('Database connection not established');
        return res.status(500).send('Database connection not established');
    }
    next();
});

// Route to handle the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.use(bodyParser.json()); // Add this line to parse JSON requests

// Route to handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    res.redirect('/');
});

// Route to serve the enquiry form
app.get('/enquiry', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'enquiry.html'));
});

app.use(bodyParser.json()); // Add this line to parse JSON requests

// Route to handle enquiry form submission
app.post('/enquiry', async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
    if (!db) {
        return res.status(500).send('Database connection not established');
    }
    try {
        const enquiriesCollection = db.collection('enquiries');
        await enquiriesCollection.insertOne({ name, email, message });
        console.log('Enquiry inserted into MongoDB');
        res.redirect('/');
    } catch (err) {
        console.error('Error inserting enquiry:', err);
        res.status(500).send('Error submitting enquiry');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
