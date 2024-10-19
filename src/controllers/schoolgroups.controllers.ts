import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ISchoolGroup } from '../models/data.models';



// Adding a group to the table
export const addSchoolGroup = async (req: Request, res: Response) => {
    const { schoolname } = req.body;

    if (!schoolname) {
        return res.status(400).json({ message: 'School name is required'})
    }

    const newGroup: ISchoolGroup = {
        schoolgroup_id: 0,
        name: schoolname
    };

    try {
        const [result] = await pool.execute('INSERT into SchoolGroup (school_group_id, name) VALUES (?, ?)', [
            newGroup.schoolgroup_id,
            newGroup.name
        ]);
        res.status(201).json({ message: 'Group created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding group', error});
    }

}

// Delete group
export const deleteSchoolGroup = async (req: Request, res: Response) => {
    const School_ID  = parseInt(req.params.id);

    // Checks for if group_id is valid/exists
    if (!School_ID) {
        return res.status(400).json ({ message: 'Group is required'})
    }

    const [check]: any = await pool.execute('SELECT * FROM SchoolGroup WHERE school_group_id = ?', [School_ID]);
    if (check.length === 0) {
        return res.status(401).json({ message: 'Group does not exist' });
    }

    try {
        // Deleting group entry from table
        pool.execute('DELETE FROM SchoolGroup WHERE school_group_id = ?', [School_ID]);

        // Searching admins with the same group_id to set null
        pool.execute('UPDATE admin SET Group_ID = null WHERE Group_ID = ?' [School_ID]);
        res.status(200).json({ message: 'Group deleted, admins removed from group' });
    } catch (err) {
        res.status(401).json({ message: 'Group does not exist' });
    }
}

// Edit group
export const editSchoolGroup = async (req: Request, res: Response) => {
    const School_ID  = parseInt(req.params.id);

    // Checks for if group_id is valid/exists
    if (!School_ID) {
        return res.status(400).json ({ message: 'Group is required'})
    }
    const name = req.body;
    if (!name) {
        return res.status(400).json({ message: 'name required'})
    }

    try {
        const [update] = await pool.execute(
            'UPDATE SchoolGroup SET name = ? WHERE school_group_id = ?', [name, School_ID]
        )

        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Schoolgroup id not found'})
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error editing SchoolGroup '});
    }
}


// Get all groups
export const getAllSchoolGroups = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM SchoolGroup');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving groups', error });
    }
}
