// Import required modules
const express = require("express");
const { PrismaClient } = require("@prisma/client");

// Create an instance of Express Router
const homeRouter = express.Router();

// Create a new PrismaClient instance
const prisma = new PrismaClient();

// Function to validate phone number format
function isValidPhoneNumber(phoneNumber) {
  // Regular expression to validate phone numbers
  const phoneRegex = /^[0-9]{10}$/;

  // Check if the phone number matches the regex pattern
  return phoneRegex.test(String(phoneNumber));
}

// Function to check if a phone number already exists in the database
async function phoneNumberExists(phoneNumber) {
  try {
    // Check if any user has already registered with the given phone number
    const existingUser = await prisma.house.findFirst({
      where: { phoneNumber: String(phoneNumber) }, // Convert phoneNumber to string
    });

    // Return true if a user with the given phone number exists, false otherwise
    return existingUser !== null;
  } catch (error) {
    // Log any errors that occur during the database query
    console.error("Error checking phone number existence:", error.message);
    throw error;
  }
}

// Route to handle POST request for creating a new home module instance
homeRouter.post("/homes", async (req, res) => {
  try {
    // Extract required fields from request body
    const { name, address, phoneNumber, userId } = req.body;

    // Check if userId is missing in request body
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request body" });
    }

    // Check if userId exists
    const existingUser = await prisma.userAuthDetails.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if name is missing
    if (!name) {
      return res.status(400).json({ error: "Missing name in request body" });
    }

    // Check if address is missing
    if (!address) {
      return res.status(400).json({ error: "Missing address in request body" });
    }

    // Check if phoneNumber is missing or invalid
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phoneNumber" });
    }

    // Check if the phone number already exists in the database
    if (await phoneNumberExists(phoneNumber)) {
      return res.status(400).json({ error: "Phone number already exists" });
    }
    
    // Create a new home module instance
    const newHome = await prisma.house.create({
      data: {
        name,
        phoneNumber: String(phoneNumber), // Convert phoneNumber to string
        address,
        userId,
      },
    });

    // Respond with the newly created home module instance
    res.status(201).json({ home: newHome });
  } catch (error) {
    // Handle errors
    console.error("Error creating home:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

// Route to handle GET request to retrieve all homes
homeRouter.get("/homes", async (req, res) => {
  try {
    const homes = await prisma.house.findMany();
    res.json(homes);
  } catch (error) {
    console.error("Error fetching homes:", error.message);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Route to handle GET request to retrieve a single home by ID
homeRouter.get("/homes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const home = await prisma.house.findUnique({ where: { id: parseInt(id) } });
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }
    res.json(home);
  } catch (error) {
    console.error("Error fetching home:", error.message);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Route to handle PUT request to update a home
homeRouter.put("/homes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phoneNumber, userId } = req.body;

    const updatedHome = await prisma.house.update({
      where: { id: parseInt(id) },
      data: {
        name,
        address,
        phoneNumber,
        userId,
      },
    });

    res.json(updatedHome);
  } catch (error) {
    console.error("Error updating home:", error.message);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Route to handle PATCH request to partially update a home
homeRouter.patch("/homes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phoneNumber, userId } = req.body;

    const updatedHome = await prisma.house.update({
      where: { id: parseInt(id) },
      data: {
        name,
        address,
        phoneNumber,
        userId,
      },
    });

    res.json(updatedHome);
  } catch (error) {
    console.error("Error updating home:", error.message);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Route to handle DELETE request to delete a home
homeRouter.delete("/homes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.house.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Home deleted successfully" });
  } catch (error) {
    console.error("Error deleting home:", error.message);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Export the homeRouter
module.exports = homeRouter;
