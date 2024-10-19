import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITeamTimeBlock, ITimeBlock } from '../models/data.models';

// Add multiple timeblocks (based on how many timeblocks and breaks between)
export const addTimeblocks = async (req: Request, res: Response) => {
    const { startTime, event_id, tournament_id, building, roomNumber, status, duration, breakTime, amount } = req.body;

    if (!startTime || !event_id || !tournament_id || !building || !roomNumber || !duration || !breakTime || !amount || !status) {
        return res.status(400).json({ message: 'Missing information to add timeblock'});
    }

    try {

        const startInTime = startTime.getTime();
        for (let i = 0; i < amount; i++) {
            const newStart = new Date(startInTime + (i * duration) + (i * breakTime));
            const newEnd = new Date(newStart.getTime() + (i * duration));

            const newTimeblock: ITimeBlock = {
                timeBlock_id: 0,
                startTime: newStart,
                endTime: newEnd,
                event_id: event_id,
                tournament_id: tournament_id,
                building: building,
                roomNumber: roomNumber,
                status: status
            }

            await pool.execute(
                'INSERT INTO timeblock (TimeBlock_ID, Event_ID, Tournament_ID, TimeBegin, TimeEnd, Building, RoomNumber, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newTimeblock.timeBlock_id,
                    newTimeblock.startTime,
                    newTimeblock.endTime,
                    newTimeblock.event_id,
                    newTimeblock.tournament_id,
                    newTimeblock.building,
                    newTimeblock.roomNumber,
                    newTimeblock.status
                ]
            )
        }

    } catch (error) {
        res.status(500).json({ message: 'Error adding timeblocks', error });
    }
}

// Edit timeblock
export const editTimeblock = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { startTime, endTime, event_id, tournament_id, building, roomNumber, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    try {

        const [update] = await pool.execute(
            'UPDATE timeblock SET TimeBegin = ?, TimeEnd = ?, Event_ID = ?, Tournament_ID = ?, Building = ?, RoomNumber = ?, Status = ? WHERE TimeBlock_ID = ?', 
            [startTime, endTime, event_id, tournament_id, building, roomNumber, id, status ]
        )

        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Timeblock id not found'})
            }
        }

    } catch (error) {
        res.status(500).json({ message: 'Error editing timeblock '});
    }
}

// Delete timeblock (and associated team timeblocks)
export const deleteTimeblock = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    try {

        const [check]: any = await pool.execute('SELECT * FROM timeblock WHERE TimeBlock_ID = ?', [id]);

        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }

        pool.execute('DELETE FROM timeblock WHERE TimeBlock_ID = ?', [id]);
        pool.execute('DELETE FROM teamtimeblock WHERE TimeBlock_ID = ?', [id]);

    } catch (error) {
        res.status(500).json({ message: 'Error deleting timeblock', error});
    }
}

// Get timeblocks based on event id
export const getTimeblocksByEventId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid event id'});
    }

    try {
        const [check]: any = await pool.execute('SELECT * FROM TimeBlock WHERE Event_ID = ?', [id]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }
        res.status(200).json(check);
    
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving timeblocks', error});
    }
};

// Get timeblocks based on tournament id
export const getTimeblocksByTournamentId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Invalid tournament id'});
    }

    try {
        const [check]: any = await pool.execute('SELECT * FROM TimeBlock WHERE Tournament_ID = ?', [id]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }
        res.status(200).json(check);
    
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving timeblocks', error});
    }
}
