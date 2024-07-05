import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.config';
import { IUser } from '../models/auth.model';

const secretKey = 'UGA';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: IUser = {
    _id: 0,
    username,
    password: hashedPassword,
    lastUpdated: new Date(),
    createdOn: new Date(),
  };

  try {
    const [result] = await pool.execute('INSERT INTO users (username, password, lastUpdated, createdOn) VALUES (?, ?, ?, ?)', [
      newUser.username,
      newUser.password,
      newUser.lastUpdated,
      newUser.createdOn,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user: IUser = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT _id, username, lastUpdated, createdOn FROM users');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

export const validateToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, token missing!' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.body.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
