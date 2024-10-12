import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ISchool } from '../models/data.models'; // Adjust the import path

export const addSchool = async (req: Request, res: Response) => {
    const { school_group_id, name, flight } = req.body;

    // Validate required fields
    if (!school_group_id || !name || !flight) {
        return res.status(400).json({ message: 'School group ID, name, and flight are required' });
    }

    // Create the new school object
    const newSchool: ISchool = {
        ID: 0, // Auto-increment handled by the database
        school_group_id,
        name,
        flight,
    };

    try {
        const [result] = await pool.execute(
            'INSERT INTO School (school_group_id, name, flight) VALUES (?, ?, ?)',
            [
                newSchool.school_group_id,
                newSchool.name,
                newSchool.flight,
            ]
        );

        // Return success message
        res.status(201).json({ message: 'School added successfully' });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ message: 'Error adding school', error: error.message });
    }
};