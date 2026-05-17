import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Initialize the Express engine
const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware Pipeline
app.use(cors()); // Allows your React frontend to talk to this API
app.use(express.json()); // Allows the server to accept JSON data in the body

// Database Connection Protocol
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[error]: Database connection failed.`, error);
    process.exit(1); // Kill the server if the database is dead
  }
};
// Health Check Route (Your first API endpoint)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'The Virtuoso Engine is online.' 
  });
});

// SECURE: User Registration Route
app.post('/api/users/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation: Did they provide a password?
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 2. Security: Hash the password (10 salt rounds is the enterprise standard)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to Database with the hashed password, NOT the plain text
    const newUser = new User({ 
      name, 
      email, 
      passwordHash: hashedPassword 
    });
    
    await newUser.save();

    // 4. Return success (Notice we DO NOT send the password back in the response)
    res.status(201).json({ 
      message: 'Secure user created successfully', 
      userId: newUser._id 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// SECURE: User Login Route
app.post('/api/users/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' }); // Vague error is more secure
    }

    // 2. Check if the password matches the hash in the database
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Create the JWT Passport
    // We only put non-sensitive data in the token payload
    const payload = {
      user: {
        id: user._id
      }
    };

    // Sign the token with our secret key. It expires in 1 hour.
    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // 4. Send the token back to the client
        res.json({ token });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Boot the server

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`[server]: API is running at http://localhost:${port}`);
  });
});