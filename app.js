import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from './routes/index.js'

dotenv.config();
const app = express();

// List of allowed origins
export const allowedOrigins = '*'

// [
//     'http://localhost:5173',            
//     'http://localhost:5174',         
//     'https://canteen-mauve.vercel.app', // Frontend hosted on Vercel
//     'https://kitchen-alpha-liard.vercel.app', // Kitchen app URL
//   ];

// CORS configuration
// const corsOptions = {
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true); // Allow the request
//         } else {
//             callback(new Error('Not allowed by CORS')); // Reject the request
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
//     credentials: true, // Allow cookies and credentials
// };

app.use(cors('*'));
app.use(json());

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api/v1", routes);

// Error Handling Middleware
app.use(errorHandler);

export default app;