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
  
// Add team time block
export const addTeamTimeblock = async (req: Request, res: Response) => {
    const [timeblock_id, team_id, attend, comment, tier] = req.body;

    if (!timeblock_id || !team_id || !attend) {
        return res.status(400).json({ message: 'Missing information to add team timeblock'});
    }

    const newTeamTimeblock: ITeamTimeBlock = {
        teamTimeBlock_id: 0,
        timeBlock_id: timeblock_id,
        team_id: team_id,
        attend: attend,
        comment: comment,
        tier: tier
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO teamtimeblocks (TeamTimeBlock_ID, TimeBlock_ID, Team_ID, Attend, Comment, Tier) VALUES (?, ?, ?, ?, ?, ?)', 
            [
                newTeamTimeblock.teamTimeBlock_id,
                newTeamTimeblock.timeBlock_id,
                newTeamTimeblock.team_id,
                newTeamTimeblock.attend,
                newTeamTimeblock.comment,
                newTeamTimeblock.tier
            ]
        )
    } catch (error) {
        res.status(500).json({ message: 'Error adding team timeblock '});
    }
}

// Edit team timeblock
export const editTeamTimeblock = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    const [timeblock_id, team_id, attend, comment, tier] = req.body;

    try {

        const [update] = await pool.execute(
            'UPDATE teamtimeblocks SET TeamTimeBlock_ID = ?, TimeBlock_ID = ?, Team_ID = ?, Attend = ?, Comment = ?, Tier = ?',
            [id, timeblock_id, team_id, attend, comment, tier]
        )

        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Team timeblock id not found'})
            }
        }

    } catch (error) {
        res.status(500).json({ message: 'Error editing team timeblock '});
    }

}

// Delete team timeblock
export const deleteTeamTimeblock = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    try {
        const [check]: any = await pool.execute('SELECT * FROM teamtimeblock WHERE TeamTimeBlock_ID = ?', [id]);

        if (check.length === 0) {
            return res.status(401).json({ message: 'Team Timeblock does not exist' });
        }

        pool.execute('DELETE FROM teamtimeblock WHERE TeamTimeBlock_ID = ?', [id]);

    } catch (error) {
        res.status(500).json({ message: 'Error deleting team timeblock', error });
    }
}

// Get team timeblock from team id
export const getTeamTimeblocksByTeamId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    try {
        const [check]: any = await pool.execute(
            'SELECT * FROM teamtimeblock WHERE Team_ID = ?', [id]
        );

        if (check.length === 0) {
            return res.status(401).json({ message: 'Team timeblock does not exist' });
        }
        res.status(200).json(check);


    } catch (error) {
        res.status(500).json({ message: 'Error retrieving team timeblocks', error})
    }
}

// get team timeblock from timeblock id
export const getTeamTimeblocskByTimeblockId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id'});
    }

    try {
        const [check]: any = await pool.execute(
            'SELECT * FROM teamtimeblock WHERE TimeBlock_ID = ?', [id]
        );

        if (check.length === 0) {
            return res.status(401).json({ message: 'Team timeblock does not exist' });
        }
        res.status(200).json(check);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving team timeblocks', error})
    }
}

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

