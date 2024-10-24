import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from '../src/routes/auth.routes';
import dataRoutes from '../src/routes/data.routes';
import { createTables } from '.././src/middlewares/auth.middleware';
import pool from '../src/config/db.config'; // Adjust this path according to the new structure
import { createDataTables } from './middlewares/data.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRoutes);
app.use(dataRoutes)

//Expand PDF Storage
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use((req, res, next) => {
  req.setTimeout(600000); // 600 seconds
  next();
});

// Create tables before starting the server
const startServer = async () => {
  try {
    // First create the regular tables
    await createTables();

    // Then create the data tables
    await createDataTables();

    // After both succeed, start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);  // Exit process on failure
  }
};

startServer();


process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error.message);
  process.exit(1); // Exit the process or handle the error as per your application's needs
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the error as per your application's needs
});
