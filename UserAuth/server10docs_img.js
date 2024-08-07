const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
// const dotenv = require("dotenv");
const path = require("path");
const nodemailer = require("nodemailer");

// const PORT = process.env.PORT || 3000;
// export const imageRouter = express.Router();
const prisma = new PrismaClient();
const imageRouter = express.Router();

// Use express.json() middleware to parse JSON request bodies
imageRouter.use(express.json());

// SEND MAIL

// Generate OTP function
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
}

// Store OTP function with timestamp
async function storeOTP(email, otp) {
  try {
    // Store OTP in the database along with the current timestamp
    await prisma.otp.create({
      data: {
        otp,
        createdAt: new Date(), // Current timestamp
        user: {
          connect: {
            email: email
          }
        }
      },
    });
  } catch (error) {
    console.error("Error storing OTP:", error.message);
    throw error;
  }
}

// Send OTP function
// async function sendWelcomeEmail(userEmail) {
//   try {
async function sendOTP(userEmail, otp) {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure your email service provider here
      // Example configuration for Gmail:
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define email content
    const mailOptions = {
      from: `LALA JEE ${process.env.EMAIL_USERNAME}`,
      to: userEmail,
      // subject: 'Welcome to Our App!',
      // text: 'Welcome to our application. We are glad to have you on board!'

      subject: "OTP for Account Verification",
      text: `Your OTP for account verification is: ${otp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // console.error("Error sending welcome email:", error.message);
    // throw error; // Rethrow the error for centralized error handling
    console.error("Error sending OTP email:", error.message);
    throw error;
  }
}

// Verify OTP with expiry check
imageRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP and its timestamp from the database
    const storedOTP = await prisma.otp.findFirst({
      where: {
        otp: parseInt(otp), // Convert otp to an integer
        user: {
          email: email
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Define OTP expiry time (5 minutes in milliseconds)
    const otpExpiryTime = 5 * 60 * 1000; // 5 minutes

    // Check if OTP has expired
    if (new Date() - new Date(storedOTP.createdAt) > otpExpiryTime) {
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    // Update user's email verification status to true
    await prisma.userAuthDetails.update({
      where: {
        email: email
      },
      data: {
        isEmailVerified: true
      }
    });

    // OTP is valid
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Set up session middleware
imageRouter.use(
  session({
    secret: "secret_key", // Change this to a secure random string
    resave: false,
    saveUninitialized: false,
  })
);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "uploads/profileImg");
    } else if (file.fieldname === "documents") {
      cb(null, "uploads/docs");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "." + ext);
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "image", maxCount: 5 },
  { name: "documents", maxCount: 5 },
]);

// Verify OTP endpoint
imageRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP from the database
    const storedOTP = await prisma.otp.findFirst({
  where: {
    otp: parseInt(otp), // Convert otp to an integer
    user: {
      email: "ysly305@gmail.com"
    }
  },
  orderBy: {
    createdAt: "desc"
  }
});

    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Signup route // Create a new user
// imageRouter.post('/signup', upload.array('image', 5), async (req, res) => {
imageRouter.post("/signup", (req, res) => {
  // console.log("Email: ===========================", req.body.email)
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      const { username, password, confirmPassword, email } = req.body;
      const images = req.files["image"];
      const documents = req.files["documents"];

      // Check if username is missing or invalid
      if (!username) {
        return res.status(400).json({ error: "Missing username" });
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          error: "Username can only contain letters, numbers, and underscores",
        });
      }

      // Check if password is missing or invalid
      if (!password) {
        return res.status(400).json({ error: "Missing password" });
      }

      // Check if confirmPassword is missing or invalid
      if (!confirmPassword) {
        return res.status(400).json({ error: "Missing confirmPassword" });
      }

      //check if password and confirmPassword match
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ error: "Password and confirm password do not match" });
      }

      // Check if password is missing or invalid
      if (!password) {
        return res.status(400).json({ error: "Missing password" });
      }
      // Add password validation logic here if needed
      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            "Password must be 8 characters with upper, lower, digit, and special char",
        });
      }

      // Check if email is missing or invalid
      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }
      // Add email validation logic here if needed
      // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.com$/;
      // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|in|aus|uk|co)$/;
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|in|aus|uk|co)(\.[a-zA-Z]{2,})?$/;
      // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      // Check if email already exists
      const existingUser = await prisma.userAuthDetails.findFirst({
        where: {
          email: email,
        },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Check if images are missing or invalid
      if (!images || images.length === 0) {
        return res.status(400).json({ error: "Missing images" });
      }
      // Check image extensions
      const allowedImgExtensions = [".jpg", ".jpeg", ".png", ".gif"];
      const invalidImages = images.filter(
        (image) =>
          !allowedImgExtensions.includes(path.extname(image.originalname))
      );
      if (invalidImages.length > 0) {
        return res.status(400).json({
          error:
            "Invalid image file extensions. Allowed extensions: .jpg, .jpeg, .png, .gif",
        });
      }

      // Check if documents are missing or invalid
      if (!documents || documents.length === 0) {
        return res.status(400).json({ error: "No documents uploaded" });
      }

      // Check document extensions
      const allowedDocsExtensions = [".pdf", ".xlsx", ".docx", ".txt"];
      const invalidDocuments = documents.filter(
        (doc) => !allowedDocsExtensions.includes(path.extname(doc.originalname))
      );
      if (invalidDocuments.length > 0) {
        return res
          .status(400)
          .json({
            error: "Invalid document format. Allowed: .pdf, .xlsx, .docx, .txt",
          });
      }

      // Save the image paths to the database as an array of strings
      const imagePaths = images.map((image) => image.path);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save the user to the database using Prisma // Save user to database
      const newUser = await prisma.userAuthDetails.create({
        data: {
          username,
          password: hashedPassword,
          email,
          // profileImg: imagePaths,
          profileImg: images ? images.map((image) => image.path) : [],
          // documents: [],
          documents: documents ? documents.map((doc) => doc.path) : [],
        },
      });

      // await sendWelcomeEmail(newUser.email);
      const otp = generateOTP();
      // console.log("OTP:=====================", otp)
      
      // Store OTP in the database
      await storeOTP(email, otp);
      
      // Send OTP to user's email
      await sendOTP(email, otp);
      
      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error("Error signing up:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// Modify your login route to check if the email is verified before allowing login
imageRouter.post("/login", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    // Check if email and password are provided
    if (!username_or_email || !password) {
      return res
        .status(400)
        .json({ error: "Missing username_or_email or password" });
    }

    // Find the user by email
    const user = await prisma.userAuthDetails.findFirst({
      where: {
        OR: [{ username: username_or_email }, { email: username_or_email }],
      },
    });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match, return error
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Set user ID in session
    req.session.userId = user.id; // Store user ID in session

    // Return success response
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Implement a resend OTP endpoint similar to the signup process
imageRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Generate new OTP
    const newOTP = generateOTP();

    // Retrieve user by email
const user = await prisma.userAuthDetails.findUnique({
  where: {
    email: email
  }
});

if (!user) {
  return res.status(404).json({ error: "User not found" });
}

    // Update OTP in the database
    await prisma.otp.create({
      data: {
        // email,
        otp: newOTP,
        createdAt: new Date(), // Current timestamp
        user: {
          connect: {
            id: user.id // Connect the OTP to the user
          }
        }
      },
    });

    // Resend OTP to user's email
await sendOTP(user.email, newOTP); // Use user.email instead of email

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout route
imageRouter.post("/logout", (req, res) => {
  try {
    // Destroy the session
    req.session.destroy();
    // Return success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
// imageRouter.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// Retrieve all image
imageRouter.get("/users", async (req, res) => {
  try {
    const image = await prisma.userAuthDetails.findMany();
    res.json(image);
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve a user by ID
imageRouter.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.userAuthDetails.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a user
imageRouter.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const updatedUser = await prisma.userAuthDetails.update({
      where: { id: parseInt(id) },
      data: { username, email },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a user
imageRouter.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.userAuthDetails.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = imageRouter;
