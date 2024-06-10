import express, { Request, Response } from 'express';
import connection from '../config/db.config';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express and TypeScript');
});

// Example route to fetch data from the database
app.get('/users', (req: Request, res: Response) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
