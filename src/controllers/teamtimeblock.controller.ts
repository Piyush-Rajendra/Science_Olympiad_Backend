import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITeamTimeBlock } from '../models/data.models'; // Adjust the import path

export const addTeamTimeBlock = async (req: Request, res: Response) => {
    const { timeBlock_id, team_id, event_id, attend, comment, tier, score } = req.body;

    // Validate required fields
    if (!timeBlock_id || !team_id || !event_id || attend === undefined) {
        return res.status(400).json({ message: 'TimeBlock ID, Team ID, Event ID, and Attend status are required' });
    }

    // Create the new team time block object
    const newTeamTimeBlock: ITeamTimeBlock = {
        teamTimeBlock_id: 0, // Auto-increment handled by the database
        timeBlock_id,
        team_id,
        event_id,
        attend,
        comment: comment || '', // Default to empty string if comment is not provided
        tier: tier || 0, // Default tier to 0 if not provided
        score: score || 0.0, // Default score to 0 if not provided
    };

    try {
        const [result] = await pool.execute(
            `INSERT INTO TeamTimeBlock (TimeBlock_ID, Team_ID, Event_ID, Attend, Comment, Tier, Score) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                newTeamTimeBlock.timeBlock_id,
                newTeamTimeBlock.team_id,
                newTeamTimeBlock.event_id,
                newTeamTimeBlock.attend,
                newTeamTimeBlock.comment,
                newTeamTimeBlock.tier,
                newTeamTimeBlock.score,
            ]
        );

        // Return a success message along with the newly created team time block ID
        res.status(201).json({ message: 'Team time block added successfully' });
    } catch (error) {
        console.error('Error adding team time block:', error);
        res.status(500).json({ message: 'Error adding team time block', error: error.message });
    }
};

export const editTeamTimeBlock = async (req: Request, res: Response) => {
    const teamTimeBlockId = parseInt(req.params.id); // Get the team time block ID from the URL
    const { timeBlock_id, team_id, event_id, attend, comment, tier, score } = req.body;

    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }

    // Validate required fields
    if (!timeBlock_id || !team_id || !event_id || attend === undefined) {
        return res.status(400).json({ message: 'TimeBlock ID, Team ID, Event ID, and Attend status are required' });
    }

    try {
        const [result] = await pool.execute(
            `UPDATE TeamTimeBlock 
             SET TimeBlock_ID = ?, Team_ID = ?, Event_ID = ?, Attend = ?, Comment = ?, Tier = ?, Score = ?
             WHERE TeamTimeBlock_ID = ?`,
            [
                timeBlock_id,
                team_id,
                event_id,
                attend,
                comment || '', // Default to empty string if comment is not provided
                tier || 0, // Default tier to 0 if not provided
                score || 0.0, // Default score to 0.0 if not provided
                teamTimeBlockId, // Use the team time block ID from the URL
            ]
        );

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }

        res.status(200).json({ message: 'Team time block updated successfully' });
    } catch (error) {
        console.error('Error updating team time block:', error);
        res.status(500).json({ message: 'Error updating team time block', error: error.message });
    }
};

export const deleteTeamTimeBlock = async (req: Request, res: Response) => {
    const teamTimeBlockId = parseInt(req.params.id); // Get team time block ID from the URL

    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }

    try {
        // Execute the delete query
        const [result] = await pool.execute('DELETE FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?', [teamTimeBlockId]);

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }

        res.status(200).json({ message: 'Team time block deleted successfully' });
    } catch (error) {
        console.error('Error deleting team time block:', error);
        res.status(500).json({ message: 'Error deleting team time block', error: error.message });
    }
};

export const getTeamTimeBlockById = async (req: Request, res: Response) => {
    const teamTimeBlockId = parseInt(req.params.id); // Get team time block ID from the URL

    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }

    try {
        // Execute the select query
        const [rows] = await pool.execute(
            'SELECT * FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?',
            [teamTimeBlockId]
        );

        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }

        // Return the found team time block
        res.status(200).json(rows[0]); // Return the first (and should be only) result
    } catch (error) {
        console.error('Error retrieving team time block:', error);
        res.status(500).json({ message: 'Error retrieving team time block', error: error.message });
    }
};

export const getTeamTimeBlocksByTeamId = async (req: Request, res: Response) => {
    const teamId = parseInt(req.params.teamId); // Get team ID from the URL

    if (isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }

    try {
        // Execute the select query
        const [rows] = await pool.execute(
            'SELECT * FROM TeamTimeBlock WHERE Team_ID = ?',
            [teamId]
        );

        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this team' });
        }

        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    } catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
};

export const getTeamTimeBlocksByTimeBlockId = async (req: Request, res: Response) => {
    const timeBlockId = parseInt(req.params.timeBlockId); // Get time block ID from the URL

    if (isNaN(timeBlockId)) {
        return res.status(400).json({ message: 'Invalid time block ID' });
    }

    try {
        // Execute the select query
        const [rows] = await pool.execute(
            'SELECT * FROM TeamTimeBlock WHERE TimeBlock_ID = ?',
            [timeBlockId]
        );

        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this time block ID' });
        }

        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    } catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
};

export const getTeamTimeBlocksByEventId = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId); // Get event ID from the URL

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        // Execute the select query
        const [rows] = await pool.execute(
            'SELECT * FROM TeamTimeBlock WHERE Event_ID = ?',
            [eventId]
        );

        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this event ID' });
        }

        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    } catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
};

export const getTeamTimeBlockComment = async (req: Request, res: Response): Promise<void> => {
    const { TeamTimeBlock_ID } = req.params;

    try {
        // Query to get the comment by TeamTimeBlock_ID
        const [rows]: [any[], any] = await pool.execute(`
            SELECT Comment FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?
        `, [TeamTimeBlock_ID]);

        if (rows.length === 0) {
            res.status(404).json({ message: 'TeamTimeBlock not found' });
            return;
        }

        // Send the comment as JSON
        res.json({ comment: rows[0].Comment });
    } catch (error) {
        console.error('Error retrieving comment:', error);
        res.status(500).json({ message: 'Error retrieving comment' });
    }
};

// Update the comment for a specific TeamTimeBlock by its ID
export const updateTeamTimeBlockComment = async (req: Request, res: Response): Promise<void> => {
    const { TeamTimeBlock_ID } = req.params;
    const { comment } = req.body; // Expect the new comment from the request body

    if (typeof comment !== 'string') {
        res.status(400).json({ message: 'Invalid comment format' });
        return;
    }

    try {
        // Query to update the comment by TeamTimeBlock_ID
        const [result]: [any, any] = await pool.execute(`
            UPDATE TeamTimeBlock SET Comment = ? WHERE TeamTimeBlock_ID = ?
        `, [comment, TeamTimeBlock_ID]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'TeamTimeBlock not found' });
            return;
        }

        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
};
