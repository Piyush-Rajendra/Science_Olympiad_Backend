import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITournament } from '../models/data.models'; // Adjust the import path

export const addTournament = async (req: Request, res: Response) => {
  const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;

  // Validate required fields
  if (!name || !division ) {
    return res.status(400).json({ message: 'Name, division are required' });
  }

  // Create the new tournament object
  const newTournament: ITournament = {
    tournament_id: 0, // Auto-increment handled by the database
    group_id: group_id, // Use the group_id from the request body
    isCurrent: isCurrent, // Set this according to your application logic
    division: division, // Use the division from the request body
    NumOfTimeBlocks: NumOfTimeBlocks || 0, // Use the NumOfTimeBlocks from the request body
    name: name, // Use the name from the request body
    date: date || new Date(), // Set to current date or a specific date
    location: location || "", // Use the location from the request body or default
    description: description || "", // Use the description from the request body or default to empty
  };

  try {
    const [result] = await pool.execute(
      'INSERT INTO tournament (name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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

export const getAllTournaments = async (req: Request, res: Response) => {
    try {
      const [tournaments] = await pool.execute('SELECT * FROM tournament');
      res.status(200).json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Error fetching tournaments', error: error.message });
    }
  };

  export const editTournament = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
    const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;

  
    try {
      const [result] = await pool.execute(
        `UPDATE tournament 
         SET name = ?, division = ?, group_id = ?, isCurrent = ?, NumOfTimeBlocks = ?, location = ?, description = ?, date = ?
         WHERE tournament_id = ?`,
        [
          name,
          division,
          group_id,
          isCurrent,
          NumOfTimeBlocks,
          location,
          description,
          date,
          tournament_id, // Use the tournament ID from the URL
        ]
      );
  
      // Check if any rows were affected
      const affectedRows = (result as { affectedRows: number }).affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      res.status(200).json({ message: 'Tournament updated successfully' });
    } catch (error) {
      console.error('Error updating tournament:', error);
      res.status(500).json({ message: 'Error updating tournament', error: error.message });
    }
  };

  export const deleteTournament = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
  
    // Validate the tournament ID
    if (!tournament_id) {
      return res.status(400).json({ message: 'Tournament ID is required' });
    }
  
    try {
      const [result] = await pool.execute(
        'DELETE FROM tournament WHERE tournament_id = ?',
        [tournament_id] // Use the tournament ID from the URL
      );
  
      // Check if any rows were affected
      const affectedRows = (result as { affectedRows: number }).affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      res.status(200).json({ message: 'Tournament deleted successfully' });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      res.status(500).json({ message: 'Error deleting tournament', error: error.message });
    }
  };

  export const getTourneyById = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.id); // Get tournament ID from the URL

    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // Execute the select query
        const [tournaments] = await pool.execute('SELECT * FROM Tournament WHERE tournament_id = ?', [tournamentId]) as [Event[], any];

        // Check if the school was found
        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.status(200).json(tournaments[0]); // Return the first (and should be only) school found
    } catch (error) {
        console.error('Error retrieving tournament:', error);
        res.status(500).json({ message: 'Error retrieving tournament', error: error.message });
    }
};

