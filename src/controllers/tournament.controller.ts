import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITournament } from '../models/data.models'; // Adjust the import path

export const addTournament = async (req: Request, res: Response) => {
  const { name, division, group_id, NumOfTimeBlocks, location, description } = req.body;

  // Validate required fields
  if (!name || !division ) {
    return res.status(400).json({ message: 'Name, division are required' });
  }

  // Create the new tournament object
  const newTournament: ITournament = {
    tournament_id: 0, // Auto-increment handled by the database
    group_id: 0, // Use the group_id from the request body
    isCurrent: false, // Set this according to your application logic
    division: division, // Use the division from the request body
    NumOfTimeBlocks: 0, // Use the NumOfTimeBlocks from the request body
    name: name, // Use the name from the request body
    date: new Date(), // Set to current date or a specific date
    location: location || "Default Location", // Use the location from the request body or default
    description: description || "", // Use the description from the request body or default to empty
  };

  try {
    const [result] = await pool.execute(
      'INSERT INTO tournaments (name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newTournament.name,
        newTournament.division,
        newTournament.group_id,
        newTournament.isCurrent,
        newTournament.NumOfTimeBlocks,
        newTournament.location,
        newTournament.description,
        newTournament.date,
      ]
    );

    res.status(201).json({ message: 'Tournament added successfully'}); // Return the newly created tournament ID
  } catch (error) {
    console.error('Error adding tournament:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error adding tournament', error: error.message });
  }
};
