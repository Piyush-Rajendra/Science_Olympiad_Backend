import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { IScore } from '../models/data.models'; // Adjust the import path

export const addScore = async (req: Request, res: Response) => {
    const { score, event_id, school_id, tournament_id, school_group_id, team_id, is_reviewed } = req.body;

    // Validate required fields
    if (score === undefined || score === null || !event_id || !school_id || !tournament_id || !school_group_id || !team_id) {
        return res.status(400).json({ message: 'Score, event ID, school ID, tournament ID, school group ID, and team ID are required' });
    }

    // Create the new score object
    const newScore: IScore = {
        score_id: 0, // Auto-increment handled by the database
        score,
        event_id,
        school_id,
        tournament_id,
        school_group_id,
        team_id,
        is_reviewed: is_reviewed || false, // Default to false if not provided
    };

    try {
        const [result] = await pool.execute(
            'INSERT INTO Score (score, event_id, school_id, tournament_id, school_group_id, team_id, is_reviewed) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                newScore.score,
                newScore.event_id,
                newScore.school_id,
                newScore.tournament_id,
                newScore.school_group_id,
                newScore.team_id,
                newScore.is_reviewed,
            ]
        );

        // Return the newly created score ID
        res.status(201).json({ message: 'Score added successfully' });
    } catch (error) {
        console.error('Error adding score:', error);
        res.status(500).json({ message: 'Error adding score', error: error.message });
    }
};

export const editScore = async (req: Request, res: Response) => {
    const score_id = parseInt(req.params.id); // Get the score ID from the URL
    const { score, event_id, school_id, tournament_id, school_group_id, team_id, is_reviewed } = req.body;

    // Validate required fields
    if (isNaN(score_id)) {
        return res.status(400).json({ message: 'Invalid score ID' });
    }

    try {
        const [result] = await pool.execute(
            `UPDATE Score 
             SET score = ?, event_id = ?, school_id = ?, tournament_id = ?, school_group_id = ?, team_id = ?, is_reviewed = ?
             WHERE score_id = ?`,
            [
                score || null, // Use null if score is not provided
                event_id || null, // Use null if event_id is not provided
                school_id || null, // Use null if school_id is not provided
                tournament_id || null, // Use null if tournament_id is not provided
                school_group_id || null, // Use null if school_group_id is not provided
                team_id || null, // Use null if team_id is not provided
                is_reviewed !== undefined ? is_reviewed : false, // Default to false if not provided
                score_id, // Use the score ID from the URL
            ]
        );

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Score not found' });
        }

        res.status(200).json({ message: 'Score updated successfully' });
    } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ message: 'Error updating score', error: error.message });
    }
};

export const deleteScore = async (req: Request, res: Response) => {
    const scoreId = parseInt(req.params.id); // Get score ID from the URL

    if (isNaN(scoreId)) {
        return res.status(400).json({ message: 'Invalid score ID' });
    }

    try {
        // Execute the delete query
        const [result] = await pool.execute('DELETE FROM Score WHERE score_id = ?', [scoreId]);

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Score not found' });
        }

        res.status(200).json({ message: 'Score deleted successfully' });
    } catch (error) {
        console.error('Error deleting score:', error);
        res.status(500).json({ message: 'Error deleting score', error: error.message });
    }
};

export const getScoreById = async (req: Request, res: Response) => {
    const scoreId = parseInt(req.params.id); // Get school ID from the URL

    if (isNaN(scoreId)) {
        return res.status(400).json({ message: 'Invalid score ID' });
    }

    try {
        // Execute the select query
        const [scores] = await pool.execute('SELECT * FROM Score WHERE score_id = ?', [scoreId]) as [Event[], any];

        // Check if the team was found
        if (scores.length === 0) {
            return res.status(404).json({ message: 'Score not found' });
        }

        res.status(200).json(scores[0]); // Return the first (and should be only) score found
    } catch (error) {
        console.error('Error retrieving score:', error);
        res.status(500).json({ message: 'Error retrieving score', error: error.message });
    }
};

export const getScoresByTournamentId = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.tournamentId); // Get tournament ID from the URL

    if (isNaN(tournament_id)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // Execute the query to retrieve scores by tournament ID
        const [scores] = await pool.execute('SELECT * FROM Score WHERE tournament_id = ?', [tournament_id]) as [IScore[], any];

        // Check if scores is an empty array
        if (scores.length === 0) {
            return res.status(404).json({ message: 'No scores found for this tournament ID' });
        }

        res.status(200).json(scores);
    } catch (error) {
        console.error('Error retrieving scores by tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving scores', error: error.message });
    }
};

export const getScoresByEventId = async (req: Request, res: Response) => {
    const event_id = parseInt(req.params.eventId); // Get event ID from the URL

    if (isNaN(event_id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        // Execute the query to retrieve scores by event ID
        const [scores] = await pool.execute('SELECT * FROM Score WHERE event_id = ?', [event_id]) as [IScore[], any];

        // Check if scores is an empty array
        if (scores.length === 0) {
            return res.status(404).json({ message: 'No scores found for this event ID' });
        }

        res.status(200).json(scores);
    } catch (error) {
        console.error('Error retrieving scores by event ID:', error);
        res.status(500).json({ message: 'Error retrieving scores', error: error.message });
    }
};

export const getScoresByTeamId = async (req: Request, res: Response) => {
    const team_id = parseInt(req.params.teamId); // Get team ID from the URL

    if (isNaN(team_id)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }

    try {
        // Execute the query to retrieve scores by team ID
        const [scores] = await pool.execute('SELECT * FROM Score WHERE team_id = ?', [team_id]) as [IScore[], any];

        // Check if scores is an empty array
        if (scores.length === 0) {
            return res.status(404).json({ message: 'No scores found for this team ID' });
        }

        res.status(200).json(scores);
    } catch (error) {
        console.error('Error retrieving scores by team ID:', error);
        res.status(500).json({ message: 'Error retrieving scores', error: error.message });
    }
};

export const getScoresBySchoolId = async (req: Request, res: Response) => {
    const school_id = parseInt(req.params.schoolId); // Get school ID from the URL

    if (isNaN(school_id)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    try {
        // Execute the query to retrieve scores by school ID
        const [scores] = await pool.execute('SELECT * FROM Score WHERE school_id = ?', [school_id]) as [IScore[], any];

        // Check if scores is an empty array
        if (scores.length === 0) {
            return res.status(404).json({ message: 'No scores found for this school ID' });
        }

        res.status(200).json(scores);
    } catch (error) {
        console.error('Error retrieving scores by school ID:', error);
        res.status(500).json({ message: 'Error retrieving scores', error: error.message });
    }
};

export const getScoresBySchoolGroupId = async (req: Request, res: Response) => {
    const school_group_id = parseInt(req.params.schoolGroupId); // Get school group ID from the URL

    if (isNaN(school_group_id)) {
        return res.status(400).json({ message: 'Invalid school group ID' });
    }

    try {
        // Execute the query to retrieve scores by school group ID
        const [scores] = await pool.execute('SELECT * FROM Score WHERE school_group_id = ?', [school_group_id]) as [IScore[], any];

        // Check if scores is an empty array
        if (scores.length === 0) {
            return res.status(404).json({ message: 'No scores found for this school group ID' });
        }

        res.status(200).json(scores);
    } catch (error) {
        console.error('Error retrieving scores by school group ID:', error);
        res.status(500).json({ message: 'Error retrieving scores', error: error.message });
    }
};