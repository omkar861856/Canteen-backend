import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from './routes/index.js'


dotenv.config();
const app = express();

app.use(cors('*'));
app.use(json());

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api/v1", routes);

// Error Handling Middleware
app.use(errorHandler);

export default app;