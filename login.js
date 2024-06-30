const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Use express.json() middleware to parse JSON request bodies
app.use(express.json());
// Initialize Prisma client
const prisma = new PrismaClient();

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
        const { username, password, email } = req.body;
        const images = req.files;

        if (!username || !password || !email || !images) {
            return res.status(400).json({ error: 'Missing username, password, email, or images' });
        }

        // Save the image paths to the database as an array of strings
        const imagePaths = images.map(image => image.path);

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save the user to the database using Prisma
        const newUser = await prisma.userAuthDetails.create({
            data: {
                username,
                password: hashedPassword,
                email,
                // profileImg: imagePaths[0], // Only save the first image path for now
                profileImg: imagePaths, // Save all image paths
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
        // Destructure username_or_email and password from the request body
        const { username_or_email, password } = req.body;

        // Check if username_or_email and password are provided
        if (!username_or_email || !password) {
            return res.status(400).json({ error: 'Missing username_or_email or password' });
        }

        // Perform login logic here
        // Query the database to find the user by username or email
        const user = await prisma.userAuthDetails.findFirst({
            where: {
                OR: [
                    { username: username_or_email },
                    { email: username_or_email }
                ]
            }
        });

        // If user is not found, return an error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match, return an error
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // If everything is successful, return the user data
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});








// Logout route
app.post('/logout', (req, res) => {
    try {
        // Clear any session data or tokens
        // For example, if using session middleware:
        // req.session.destroy();
        
        // Alternatively, if using tokens, you might want to blacklist the token
        
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
