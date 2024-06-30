const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/profileImg');
        } else if (file.fieldname === 'documents') {
            cb(null, 'uploads/docs');
        } else {
            cb(new Error('Invalid fieldname'));
        }
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, Date.now() + '.' + ext);
    },
});

const upload = multer({ storage: storage }).fields([{ name: 'image', maxCount: 5 }, { name: 'documents', maxCount: 5 }]);

app.post('/signup', (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            const { username, password, confirmPassword, email } = req.body;
            const images = req.files['image'];
            const documents = req.files['documents'];

            // Validation and signup logic here...

            // Save the user to the database using Prisma
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.userAuthDetails.create({
                data: {
                    username,
                    password: hashedPassword,
                    email,
                    profileImg: images ? images.map(image => image.path) : [],
                    documents: documents ? documents.map(doc => doc.path) : [],
                },
            });

            res.status(201).json({ user: newUser });
        } catch (error) {
            console.error('Error signing up:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// Login route
app.post('/login', async (req, res) => {
    // Add login logic here...
});

// Logout route
app.post('/logout', (req, res) => {
    // Add logout logic here...
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
