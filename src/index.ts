import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from '../src/routes/auth.routes';
import { createTables } from '.././src/middlewares/auth.middleware';
import pool from '../config/db.config';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRoutes);

// Create tables before starting the server
createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Error creating tables', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error.message);
  process.exit(1); // Exit the process or handle the error as per your application's needs
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the error as per your application's needs
});
