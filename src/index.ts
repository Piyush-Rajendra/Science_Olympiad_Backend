import express, { Request, Response } from 'express';
import connection from '../config/db.config';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;
const setup =  connection.query
app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  setup;
  res.send('Hello Backend is wokrking');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
