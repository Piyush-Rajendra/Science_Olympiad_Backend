import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ISchool } from '../models/data.models'; // Adjust the import path

export const addSchool = async (req: Request, res: Response) => {
    const { school_group_id, name, flight } = req.body;

    // Validate required fields
    if ( !name || !flight) {
        return res.status(400).json({ message: 'Name and flight are required' });
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

export const editSchool = async (req: Request, res: Response) => {
    const school_id = parseInt(req.params.id); // Get the school ID from the URL
    const {
        school_group_id = null, // Optional field, set to null if not provided
        name = null, // Optional field, set to null if not provided
        flight = null, // Optional field, set to null if not provided
    } = req.body;

    // Check if the school ID is valid
    if (isNaN(school_id)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    try {
        const [result] = await pool.execute(
            `UPDATE School 
             SET school_group_id = ?, name = ?, flight = ?
             WHERE ID = ?`,
            [
                school_group_id, // Can be null if not provided
                name,             // Can be null if not provided
                flight,           // Can be null if not provided
                school_id,       // Use the school ID from the URL
            ]
        );

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({ message: 'School updated successfully' });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ message: 'Error updating school', error: error.message });
    }
};

export const getAllSchools = async (req: Request, res: Response) => {
    try {
      const [schools] = await pool.execute('SELECT * FROM School');
      res.status(200).json(schools);
    } catch (error) {
      console.error('Error retrieving schools:', error);
      res.status(500).json({ message: 'Error retrieving schools', error: error.message });
    }
  };

  export const deleteSchool = async (req: Request, res: Response) => {
    const schoolId = parseInt(req.params.id); // Get school ID from the URL

    if (isNaN(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    try {
        // Execute the delete query
        const [result] = await pool.execute('DELETE FROM School WHERE ID = ?', [schoolId]);

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({ message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ message: 'Error deleting school', error: error.message });
    }
};

export const getSchoolById = async (req: Request, res: Response) => {
    const schoolId = parseInt(req.params.id); // Get school ID from the URL

    if (isNaN(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }

    try {
        // Execute the select query
        const [schools] = await pool.execute('SELECT * FROM School WHERE ID = ?', [schoolId]) as [Event[], any];

        // Check if the school was found
        if (schools.length === 0) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json(schools[0]); // Return the first (and should be only) school found
    } catch (error) {
        console.error('Error retrieving school:', error);
        res.status(500).json({ message: 'Error retrieving school', error: error.message });
    }
};