import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITeam } from '../models/data.models'; // Adjust the import path

export const addTeam = async (req: Request, res: Response) => {
    const { school_id, name, unique_id, tournament_id } = req.body;

    // Validate required fields
    if (!school_id || !name || !unique_id || !tournament_id) {
        return res.status(400).json({ message: 'School ID, team name, and unique ID are required' });
    }

    // Create the new team object
    const newTeam: ITeam = {
        ID: 0, // Auto-increment handled by the database
        school_id,
        name,
        unique_id,
        tournament_id,
    };

    try {
        const [result] = await pool.execute(
            'INSERT INTO Team (school_id, name, unique_id, tournament_id) VALUES (?, ?, ?, ?)',
            [
                newTeam.school_id,
                newTeam.name,
                newTeam.unique_id,
                newTeam.tournament_id,
            ]
        );

        // Return a success message along with the newly created team ID
        res.status(201).json({ message: 'Team added successfully' });
    } catch (error) {
        console.error('Error adding team:', error);
        res.status(500).json({ message: 'Error adding team', error: error.message });
    }
};

export const getTeamById = async (req: Request, res: Response) => {
    const teamId = parseInt(req.params.id); // Get school ID from the URL

    if (isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }

    try {
        // Execute the select query
        const [teams] = await pool.execute('SELECT * FROM Team WHERE team_id = ?', [teamId]) as [Event[], any];

        // Check if the team was found
        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(teams[0]); // Return the first (and should be only) team found
    } catch (error) {
        console.error('Error retrieving team:', error);
        res.status(500).json({ message: 'Error retrieving school', error: error.message });
    }
};

export const getAllTeams = async (req: Request, res: Response) => {
    try {
      const [teams] = await pool.execute('SELECT * FROM Team');
      res.status(200).json(teams);
    } catch (error) {
      console.error('Error retrieving teams:', error);
      res.status(500).json({ message: 'Error retrieving teams', error: error.message });
    }
  };

  export const deleteTeam = async (req: Request, res: Response) => {
    const teamId = parseInt(req.params.id); // Get team ID from the URL

    if (isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }

    try {
        // Execute the delete query
        const [result] = await pool.execute('DELETE FROM Team WHERE team_id = ?', [teamId]);

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
};

export const editTeam = async (req: Request, res: Response) => {
    const teamId = parseInt(req.params.id); // Get the team ID from the URL
    const { school_id, name, unique_id, tournament_id } = req.body;

    if (isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }

    // Validate required fields
    if (!school_id || !name || !unique_id || !tournament_id) {
        return res.status(400).json({ message: 'School ID, team name, and unique ID are required' });
    }

    try {
        const [result] = await pool.execute(
            `UPDATE Team 
             SET school_id = ?, name = ?, unique_id = ?, tournament_id = ?
             WHERE team_id = ?`,
            [
                school_id,
                name,
                unique_id,
                tournament_id,
                teamId, // Use the team ID from the URL
                
            ]
        );

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ message: 'Error updating team', error: error.message });
    }
};

export const getTeamsBySchoolId = async (req: Request, res: Response) => {
    const schoolId = parseInt(req.params.schoolId); // Get school ID from the URL

    if (isNaN(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    try {
        // Execute the query to get teams by school ID
        const [teams] = await pool.execute('SELECT * FROM Team WHERE school_id = ?', [schoolId]) as [ITeam[], any];

        // Check if teams is an empty array
        if (teams.length === 0) {
            return res.status(404).json({ message: 'No teams found for this school ID' });
        }

        res.status(200).json(teams);
    } catch (error) {
        console.error('Error retrieving teams by school ID:', error);
        res.status(500).json({ message: 'Error retrieving teams', error: error.message });
    }
};

export const getTeamsByTournamentId = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.tournamentId); // Get tournament ID from the URL

    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // Execute the query to get teams by tournament ID
        const [teams] = await pool.execute('SELECT * FROM Team WHERE tournament_id = ?', [tournamentId]) as [ITeam[], any];

        // Check if teams is an empty array
        if (teams.length === 0) {
            return res.status(404).json({ message: 'No teams found for this tournament ID' });
        }

        res.status(200).json(teams);
    } catch (error) {
        console.error('Error retrieving teams by tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving teams', error: error.message });
    }
};
