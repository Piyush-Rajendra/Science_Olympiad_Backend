import { Request, Response } from 'express';
import pool from '../config/db.config';
import { IEvent, IEventSuperVisorEvent } from '../models/data.models'; // Adjust the import path
import { RowDataPacket } from 'mysql2';
import { FieldPacket } from 'mysql2';

export const addEvent = async (req: Request, res: Response) => {
    const { name, tournament_id, scoringAlg, description, status, scoreStatus } = req.body;
  
    // Validate required fields
    if (!name || !tournament_id || !scoringAlg) {
      return res.status(400).json({ message: 'Tournament ID, event name, and scoring algorithm are required' });
    }
  
    // Create the new event object, replacing undefined values with null
    const newEvent: IEvent = {
      event_id: 0, // Auto-increment handled by the database
      name,
      tournament_id,
      scoringAlg,
      description: description ?? null,
      status: status ?? null,
      scoreStatus: scoreStatus ?? null,
    };
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO Event (name, tournament_id, scoringAlg, description, status, scoreStatus) VALUES (?, ?, ?, ?, ?, ?)',
        [
          newEvent.name,
          newEvent.tournament_id,
          newEvent.scoringAlg,
          newEvent.description,
          newEvent.status,
          newEvent.scoreStatus,
        ]
      );
  
      // Return the newly created event ID
      res.status(201).json({ message: 'Event added successfully' });
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(500).json({ message: 'Error adding event', error: error.message });
    }
  };
  
  
  // Edit Event by ID
  export const editEvent = async (req: Request, res: Response) => {
    const event_id = parseInt(req.params.id); // Get the event ID from the URL
    const {
      name,
      tournament_id,
      scoringAlg = null, // Optional field, set to null if not provided
      description = null, // Optional field, set to null if not provided
      status = null,
      scoreStatus = null,
    } = req.body;
  

    try {
        const [result] = await pool.execute(
            `UPDATE Event 
             SET name = ?, tournament_id = ?, scoringAlg = ?, description = ?, status = ?, scoreStatus = ?
             WHERE event_id = ?`,
            [
              name,
              tournament_id, // Required
              scoringAlg, // This can be null if not provided
              description, // This can be null if not provided
              status,
              scoreStatus, // The scoreStatus field
              event_id // This should come last in the array
            ]
          );
  
      // Check if any rows were affected
      const affectedRows = (result as { affectedRows: number }).affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Error updating event', error: error.message });
    }
  };

  export const getAllEvents = async (req: Request, res: Response) => {
    try {
      const [events] = await pool.execute('SELECT * FROM Event');
      res.status(200).json(events);
    } catch (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
  };

// Get Events by Tournament ID
export const getEventsByTournamentId = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.tournamentId); // Get tournament ID from the URL

    if (isNaN(tournament_id)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // Assuming pool.execute returns a result set array where the first element is the data
        const [events] = await pool.execute('SELECT * FROM Event WHERE tournament_id = ?', [tournament_id]) as [Event[], any];

        // Check if events is an empty array
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this tournament ID' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events by tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

export const getEventsByEventSupervisorId = async (req: Request, res: Response) => {
    const eventSupervisorId = parseInt(req.params.supervisorId); // Get tournament ID from the URL

    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }

    try {
        // Assuming pool.execute returns a result set array where the first element is the data
        const [events] = await pool.execute('SELECT * FROM Event WHERE tournament_id = ?', [eventSupervisorId]) as [Event[], any];

        // Check if events is an empty array
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this supervisor ID' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events by supervisor ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.id); // Get event ID from the URL

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        // Execute the delete query
        const [result] = await pool.execute('DELETE FROM Event WHERE event_id = ?', [eventId]);

        // Check if any rows were affected
        const affectedRows = (result as { affectedRows: number }).affectedRows;
  
        if (affectedRows === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
    
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.id); // Get tournament ID from the URL

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        // Execute the select query
        const [events] = await pool.execute('SELECT * FROM Event WHERE event_id = ?', [eventId]) as [Event[], any];

        // Check if the school was found
        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(events[0]); // Return the first (and should be only) event found
    } catch (error) {
        console.error('Error retrieving event:', error);
        res.status(500).json({ message: 'Error retrieving event', error: error.message });
    }
};

export const addEventToEventSupervisor = async (req: Request, res: Response) => {
  const {event_id, eventSupervisor_id} = req.body;
  if(!event_id || !eventSupervisor_id) {
    return res.status(400).json({message: 'No such Event Supervisor exist or event exist.'});
  }

  const newEventToEventSupervisor: IEventSuperVisorEvent = {
    eventSuperVisorEvent_id: 0,
    event_id,
    eventSupervisor_id,
  };
  
  try {
    const [result] = await pool.execute ( 'INSERT INTO EventSuperVisorEvent (event_id, eventSupervisor_id) VALUES (?, ?)',
      [
        newEventToEventSupervisor.event_id,
        newEventToEventSupervisor.eventSupervisor_id,
      ]
    )
    res.status(201).json({ message: 'Event added successfully'});

  } catch(error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Error adding event', error: error.message });
  }
}

export const getEventSupervisorIdByEmail = async (req, res) => {
    const { email } = req.query; // Get the email from query params
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      // Query the database to get the eventSupervisor_id by email
      const [rows] = await pool.execute(
        'SELECT eventSupervisor_id FROM eventsupervisor WHERE email = ?',
        [email]
      ) as [any[], any];;
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Event Supervisor not found' });
      }
  
      // Send back the eventSupervisor_id
      const eventSupervisor_id = rows[0].eventSupervisor_id;
      res.status(200).json({ eventSupervisor_id });
    } catch (error) {
      console.error('Error retrieving eventSupervisor:', error);
      res.status(500).json({ message: 'Error retrieving event supervisor', error });
    }
  };

export const getEventsByEventSupervisor = async (req: Request, res: Response) => {
    const eventSupervisorId = parseInt(req.params.id);

    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }

    try {
        const [events] = await pool.execute(
            'SELECT * FROM EventSuperVisorEvent WHERE eventSupervisor_id = ?',
            [eventSupervisorId]
        ) as [any[], any];

        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this event supervisor' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

export const removeEventFromEventSupervisor = async (req: Request, res: Response) => {
    const { event_id, eventSupervisor_id } = req.body;

    if (!event_id || !eventSupervisor_id) {
        return res.status(400).json({ message: 'Missing event ID or event supervisor ID' });
    }

    try {
        const [result] = await pool.execute(
            'DELETE FROM EventSuperVisorEvent WHERE event_id = ? AND eventSupervisor_id = ?',
            [event_id, eventSupervisor_id]
        ) as [any, any];

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No such event-supervisor relation found' });
        }

        res.status(200).json({ message: 'Event removed from event supervisor successfully' });
    } catch (error) {
        console.error('Error removing event from event supervisor:', error);
        res.status(500).json({ message: 'Error removing event', error: error.message });
    }
};

export const updateEventForEventSupervisor = async (req: Request, res: Response) => {
    const { eventSuperVisorEvent_id, event_id, eventSupervisor_id } = req.body;

    if (!eventSuperVisorEvent_id || !event_id || !eventSupervisor_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE EventSuperVisorEvent SET event_id = ?, eventSupervisor_id = ? WHERE eventSuperVisorEvent_id = ?',
            [event_id, eventSupervisor_id, eventSuperVisorEvent_id]
        ) as [any, any];

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'EventSupervisorEvent not found or no update made' });
        }

        res.status(200).json({ message: 'EventSupervisorEvent updated successfully' });
    } catch (error) {
        console.error('Error updating event-supervisor relation:', error);
        res.status(500).json({ message: 'Error updating event-supervisor relation', error: error.message });
    }
};

export const getEventSupervisorEventById = async (req: Request, res: Response) => {
    const eventSuperVisorEventId = parseInt(req.params.id);

    if (isNaN(eventSuperVisorEventId)) {
        return res.status(400).json({ message: 'Invalid event-supervisor event ID' });
    }

    try {
        const [eventSupervisorEvent] = await pool.execute(
            'SELECT * FROM EventSuperVisorEvent WHERE eventSuperVisorEvent_id = ?',
            [eventSuperVisorEventId]
        ) as [any[], any];

        if (eventSupervisorEvent.length === 0) {
            return res.status(404).json({ message: 'Event supervisor event not found' });
        }

        res.status(200).json(eventSupervisorEvent[0]);
    } catch (error) {
        console.error('Error retrieving event-supervisor event:', error);
        res.status(500).json({ message: 'Error retrieving event-supervisor event', error: error.message });
    }
};


export const getEventStatus = async (req: Request, res: Response) => {
  const { event_id } = req.params;

  try {
      const [rows] = await pool.execute(`
          SELECT status FROM Event WHERE event_id = ?
      `, [event_id]) as [any[], any];

      if (rows.length === 0) {
          return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ status: rows[0].status });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving event status' });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { status } = req.body;

  if (typeof status !== 'number') {
      return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
      const [result] = await pool.execute(`
          UPDATE Event SET status = ? WHERE event_id = ?
      `, [status, event_id]) as [any, any];

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event status updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating event status' });
  }
};

export const getEventsBySupervisorAndTournamentId = async (req: Request, res: Response) => {
    const eventSupervisorId = parseInt(req.params.supervisorId); // Get event supervisor ID from the URL
    const tournamentId = parseInt(req.params.tournamentId); // Get tournament ID from the URL

    // Validate the inputs
    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }

    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // SQL query to find events based on both supervisor ID and tournament ID
        const [events] = await pool.execute(
            'SELECT * FROM Event WHERE eventSupervisor_id = ? AND tournament_id = ?',
            [eventSupervisorId, tournamentId]
        ) as [Event[], any];

        // Check if any events were found
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this supervisor ID and tournament ID' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events by supervisor ID and tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

export const getTotalAbsentByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;

        // SQL query to get the count of team time blocks where Attend is false
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count 
             FROM TeamTimeBlock 
             WHERE event_id = ? AND Attend = false`,
            [eventId]
        );

        // Send the count back in the response
        const count = (rows as any)[0]?.count || 0;
        res.json({ count });
    } catch (error) {
        console.error('Error getting absent team count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEventStatusByEventId = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const [result] = await pool.execute(
            `SELECT
                CASE
                    WHEN e.scoreStatus = 3 THEN 'Completed'  -- Check if event scoreStatus is 3
                    WHEN COUNT(ttb.TeamTimeBlock_ID) = 0 THEN 'Not Available'
                    WHEN SUM(CASE WHEN ttb.Score IS NULL THEN 1 ELSE 0 END) = COUNT(ttb.TeamTimeBlock_ID) THEN 'Not Started'
                    WHEN SUM(CASE WHEN ttb.Score IS NOT NULL THEN 1 ELSE 0 END) > 0 
                         AND SUM(CASE WHEN ttb.Score IS NULL THEN 1 ELSE 0 END) > 0 THEN 'In Progress'
                    ELSE 'For Review'
                END AS scoreStatus
            FROM Event e
            LEFT JOIN TeamTimeBlock ttb ON e.event_id = ttb.Event_ID
            WHERE e.event_id = ? AND ttb.Attend = 1`, // Include only present teams
            [eventId]
        );

        const status = result[0]?.scoreStatus || 'Not Available';

        res.status(200).json({ status });
    } catch (error) {
        console.error('Error retrieving event status:', error);
        res.status(500).json({ message: 'Error retrieving event status', error: error.message });
    }
};



export const getScorePercentageByEventId = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const [result] = await pool.execute(
            `SELECT
                COUNT(CASE WHEN Score IS NOT NULL THEN 1 END) AS nonNullScoreCount,
                COUNT(*) AS totalScoreCount
            FROM TeamTimeBlock
            WHERE Event_ID = ? AND Attend = 1`, // Only include teams that are present
            [eventId]
        );

        const nonNullScoreCount = result[0]?.nonNullScoreCount || 0;
        const totalScoreCount = result[0]?.totalScoreCount || 0;

        let scorePercentage: number;

        if (totalScoreCount === 0) {
            scorePercentage = 0; // If no present scores exist
        } else if (nonNullScoreCount === totalScoreCount) {
            scorePercentage = 100; // All present scores are non-null
        } else {
            scorePercentage = (nonNullScoreCount / totalScoreCount) * 100; // Calculate percentage of non-null scores
        }

        res.status(200).json({ scorePercentage });
    } catch (error) {
        console.error('Error retrieving non-null score count:', error);
        res.status(500).json({ message: 'Error retrieving non-null score count', error: error.message });
    }
};

export const finalizeEventByEventId = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        // Execute the update query
        const [result]: any = await pool.execute(
            `UPDATE Event
             SET scoreStatus = 3
             WHERE event_id = ?`,
            [eventId]
        );

        // Access the affectedRows from the result object
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event finalized successfully' });
    } catch (error) {
        console.error('Error finalizing event:', error);
        res.status(500).json({ message: 'Error finalizing event', error: error.message });
    }
};

export const getEventsByTournamentAndSupervisor = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.tournamentId);
    const eventSupervisorId = parseInt(req.params.eventSupervisorId);

    if (isNaN(tournamentId) || isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid tournament or event supervisor ID' });
    }

    try {
        // Execute the select query
        const [events] = await pool.execute(
            `SELECT E.event_id, E.name, E.scoringAlg, E.description, E.status, E.scoreStatus
            FROM Event E
            JOIN EventSuperVisorEvent ES ON E.event_id = ES.event_id
            JOIN tournament T ON E.tournament_id = T.tournament_id
            WHERE T.tournament_id = ? AND ES.eventSupervisor_id = ?`,
            [tournamentId, eventSupervisorId]
        ) as [Event[], any];

        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

export const checkAndUpdateEventStatus = async (req: Request, res: Response) => {
    const { eventId } = req.params;
  
    try {
      // Get all TimeBlock statuses for the given event
      const [timeBlocks]: any = await pool.execute(
        `SELECT Status FROM TimeBlock WHERE Event_ID = ?`,
        [eventId]
      );
  
      if (!timeBlocks.length) {
        return res.status(404).json({ message: 'No time blocks found for this event' });
      }
  
      const allStatuses = timeBlocks.map((block: any) => block.Status);
  
      // Logic for updating event status based on TimeBlock statuses
      let newEventStatus;
  
      if (allStatuses.every((status: number) => status === 0)) {
        newEventStatus = 0;
      } else if (allStatuses.every((status: number) => status === 2)) {
        newEventStatus = 2;
      }
      else if (allStatuses.some((status: number) => status >= 1)) {
        newEventStatus = 1;
      }  else {
        return res.status(400).json({ message: 'Invalid status combination' });
      }
  
      // Update the Event status
      await pool.execute(
        `UPDATE Event SET Status = ? WHERE event_id = ?`,
        [newEventStatus, eventId]
      );
  
      res.status(200).json({ message: 'Event status updated successfully', newEventStatus });
    } catch (error) {
      console.error('Error updating event status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

