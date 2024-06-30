const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');
// const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// // Secret key for signing JWTs
// const JWT_SECRET = '123123';

const PORT = process.env.PORT || 3000;

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

// Initialize Prisma client
const prisma = new PrismaClient();

// Set up session middleware
app.use(session({
    secret: 'secret_key', // Change this to a secure random string
    resave: false,
    saveUninitialized: false
}));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profileImg');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, Date.now() + '.' + ext);
    },
});

const upload = multer({ storage: storage });

// Signup route
app.post('/signup', upload.array('image', 5), async (req, res) => {
    try {
        const { username, password, confirmPassword, email } = req.body;
        const images = req.files;
        const documents = req.files;

        // if (!username || !password || !email || !images) {
        //     return res.status(400).json({ error: 'Missing username, password, email, or images' });
        // }

        // Check if username is missing or invalid
        if (!username) {
            return res.status(400).json({ error: 'Missing username' });
        }
        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }
        
        // Check if password is missing or invalid
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }
        // Check if confirmPassword is missing or invalid
        if (!confirmPassword) {
            return res.status(400).json({ error: 'Missing confirmPassword' });
        }
        //check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Password and confirm password do not match' });
        }

        // // Add password validation logic here if needed
        // const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        // if (!passwordRegex.test(password)) {
        //     return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });

        //     //THIS IS DEFINED SPECIAL CHARCTER PARTS
        //     // (?=.*[!@#$%^&*]).{8,}$/;
        //     // one special character (!, @, #, $, %, ^, &, *)'

        // }

//         // Check if password is missing or invalid
// if (!password) {
//     return res.status(400).json({ error: 'Missing password' });
// }
// // Add password validation logic here if needed
// const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
// if (!passwordRegex.test(password)) {
//     return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
// }

// Check if password is missing or invalid
if (!password) {
    return res.status(400).json({ error: 'Missing password' });
}
// Add password validation logic here if needed
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be 8 characters with upper, lower, digit, and special char' });
}

        // Check if email is missing or invalid
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        // Add email validation logic here if needed
        // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.com$/;
        // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|in|aus|uk|co)$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|in|aus|uk|co)(\.[a-zA-Z]{2,})?$/;
        // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Check if email already exists
        const existingUser = await prisma.userAuthDetails.findFirst({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Check if images are missing or invalid
        if (!images || images.length === 0) {
            return res.status(400).json({ error: 'Missing images' });
        }
        // Check image extensions
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const invalidImages = images.filter(image => !allowedExtensions.includes(path.extname(image.originalname)));
        if (invalidImages.length > 0) {
            return res.status(400).json({ error: 'Invalid image file extensions. Allowed extensions: .jpg, .jpeg, .png, .gif' });
        }
        // Save the image paths to the database as an array of strings
        const imagePaths = images.map(image => image.path);

        const hashedPassword = await bcrypt.hash(password, 10);

        







        // const documentStorage = multer.diskStorage({
        //     destination: function (req, file, cb) {
        //         cb(null, 'uploads/docs');
        //     },
        //     filename: function (req, file, cb) {
        //         const ext = file.originalname.split('.').pop();
        //         cb(null, Date.now() + '.' + ext);
        //     },
        // });
        
        // const uploadDocuments = multer({ storage: documentStorage });
        
        // app.post('/upload-documents', uploadDocuments.array('documents', 5), async (req, res) => {
        //     try {
        //         const documents = req.files;
        
        // Check if documents are missing or invalid
                // if (!documents || documents.length === 0) {
                //     return res.status(400).json({ error: 'No documents uploaded' });
                // }
        
        //         // Check document extensions
        //         const allowedExtensions = ['.pdf', '.xlsx', '.docx', '.txt'];
        //         const invalidDocuments = documents.filter(doc => !allowedExtensions.includes(path.extname(doc.originalname)));
        //         if (invalidDocuments.length > 0) {
        //             return res.status(400).json({ error: 'Invalid document file extensions. Allowed extensions: .pdf, .xlsx, .docx, .txt' });
        //         }
        
        //         // Save the document paths to the database as an array of strings
        //         const documentPaths = documents.map(doc => doc.path);
        
        //         // Update user's document paths in the database
        //         const userId = req.session.userId; // Assuming user is logged in and session contains user ID
        //         await prisma.userAuthDetails.update({
        //             where: { id: userId },
        //             data: { documents: { push: documentPaths } } // Assuming documents field is an array in the database
        //         });
        
        //         res.status(200).json({ message: 'Documents uploaded successfully' });
        //     } catch (error) {
        //         console.error('Error uploading documents:', error.message);
        //         res.status(500).json({ error: 'Internal server error' });
        //     }
        // });

        






        // Save the user to the database using Prisma
        const newUser = await prisma.userAuthDetails.create({
            data: {
                username,
                password: hashedPassword,
                email,
                profileImg: imagePaths,
                documents: [],
            },
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Error signing up:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username_or_email, password } = req.body;

        if (!username_or_email || !password) {
            return res.status(400).json({ error: 'Missing username_or_email or password' });
        }

        const user = await prisma.userAuthDetails.findFirst({
            where: {
                OR: [
                    { username: username_or_email },
                    { email: username_or_email }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        req.session.userId = user.id; // Store user ID in session
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
