import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITeamTimeBlock, ITimeBlock } from '../models/data.models';

// Add multiple timeblocks (based on how many timeblocks and breaks between)
export const addTimeblocks = async (req: Request, res: Response) => {
    const { startTime, event_id, tournament_id, building, roomNumber, status, duration, breakTime, amount } = req.body;
    /*
    console.log("Start time: ", startTime);
    console.log("Event_id: ", event_id);
    console.log("Tournament_id: ", tournament_id);
    console.log("Building: ", building);
    console.log("Room Number: ", roomNumber);
    console.log("Status: ", status);
    console.log("Duration: ", duration);
    console.log("Break Time: ", breakTime);
    console.log("Amount: ", amount);*/


    if (!startTime || !event_id || !tournament_id || !building || !roomNumber || !duration || !breakTime || !amount) {
        return res.status(400).json({ message: 'Missing information to add timeblock'});
    }

    try {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const durationMs = duration * 60 * 1000;
        const breakTimeMs = breakTime * 60 * 1000;

        const date = new Date()
        date.setHours(startHour, startMinute, 4, 4);
        const startInTime = date.getTime()
        for (let i = 0; i < amount; i++) {
            const newStart = new Date(startInTime + (i * durationMs) + (i * breakTimeMs));
            const newEnd = new Date(newStart.getTime() + (durationMs));

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
                'INSERT INTO TimeBlock (TimeBlock_ID, Event_ID, Tournament_ID, TimeBegin, TimeEnd, Building, RoomNumber, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newTimeblock.timeBlock_id,
                    newTimeblock.event_id,
                    newTimeblock.tournament_id,
                    newTimeblock.startTime,
                    newTimeblock.endTime,
                    newTimeblock.building,
                    newTimeblock.roomNumber,
                    newTimeblock.status
                ]
            )
        }
        res.status(201).json({ message: 'Timeblock created successfully' });

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
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startDate = new Date()
        startDate.setHours(startHour, startMinute, 0, 0);
        //const startInTime = startDate.getTime()

        const endDate = new Date()
        endDate.setHours(endHour, endMinute, 0, 0);
        //const endInTime = endDate.getTime()
        

        const [update] = await pool.execute(
            'UPDATE TimeBlock SET TimeBegin = ?, TimeEnd = ?, Event_ID = ?, Tournament_ID = ?, Building = ?, RoomNumber = ?, Status = ? WHERE TimeBlock_ID = ?', 
            [startDate, endDate, event_id, tournament_id, building, roomNumber, status, id]
        );

        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Timeblock id not found'})
            }
        }
        res.status(200).json({ message: 'Edit timeblock successful' });


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
        const [check]: any = await pool.execute('SELECT * FROM TimeBlock WHERE TimeBlock_ID = ?', [id]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }

        pool.execute('DELETE FROM TimeBlock WHERE TimeBlock_ID = ?', [id]);
        pool.execute('DELETE FROM TeamTimeBlock WHERE TimeBlock_ID = ?', [id]);

        res.status(200).json({ message: 'Delete timeblock successful' });
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

export const getTimeBlockStatus = async (req: Request, res: Response) => {
    const { TimeBlock_ID } = req.params; // Updated the parameter to match the query

    try {
        const [rows] = await pool.execute(`
            SELECT status FROM TimeBlock WHERE TimeBlock_ID = ?
        `, [TimeBlock_ID]) as [any[], any];;

        if (rows.length === 0) {
            return res.status(404).json({ message: 'TimeBlock not found' });
        }

        res.json({ status: rows[0].status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving TimeBlock status' });
    }
};
  export const updateTimeBlockStatus = async (req: Request, res: Response) => {
    const { TimeBlock_ID } = req.params;
    const { status } = req.body;
  
    if (typeof status !== 'number') {
        return res.status(400).json({ message: 'Invalid status value' });
    }
  
    try {
        const [result] = await pool.execute(`
            UPDATE TimeBlock SET status = ? WHERE TimeBlock_ID = ?
        `, [status, TimeBlock_ID]) as [any, any];
  
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
  
        res.json({ message: 'TimeBlock status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating TimeBlock status' });
    }
  };



