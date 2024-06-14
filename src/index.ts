import express, { Request, Response } from 'express';
import connection from '../config/db.config';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Backend is wokrking');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
