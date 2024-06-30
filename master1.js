// Import necessary modules
const express = require("express");
const dotenv = require("dotenv");

// Import routers
const homeRouter = require("./Home/home");
const imageRouter = require("./UserAuth/server13docs_img");
// const EmailRouter = require("./Email/email");

dotenv.config();

// Create an instance of express
const app = express();

// Define the PORT variable
const PORT = process.env.PORT || 3000;

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

// Mount the home router
app.use("/home", homeRouter);
app.use("/image", imageRouter);
// app.use("/email", EmailRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
