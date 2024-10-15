import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { IEvent, IEventSuperVisorEvent } from '../models/data.models'; // Adjust the import path

export const addEvent = async (req: Request, res: Response) => {
    const { name, location, eventSupervisor_id, tournament_id, scoringAlg, description } = req.body;
  
    // Validate required fields
    if (!name || !tournament_id || !scoringAlg) {
      return res.status(400).json({ message: 'Tournament ID, event name, and scoring algorithm are required' });
    }
  
    // Create the new event object
    const newEvent: IEvent = {
      event_id: 0, // Auto-increment handled by the database
      name,
      location: location || "", // Use provided location or default to empty string
      eventSupervisor_id: eventSupervisor_id || null, // Set to null if not provided
      tournament_id,
      scoringAlg,
      description: description || "", // Use provided description or default to empty string
    };
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO Event (name, location, eventSupervisor_id, tournament_id, scoringAlg, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          newEvent.name,
          newEvent.location,
          newEvent.eventSupervisor_id,
          newEvent.tournament_id,
          newEvent.scoringAlg,
          newEvent.description,
        ]
      );
  
      // Return the newly created event ID
      res.status(201).json({ message: 'Event added successfully'});
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
      location,
      eventSupervisor_id = null, // Optional field, set to null if not provided
      tournament_id,
      scoringAlg = null, // Optional field, set to null if not provided
      description = null, // Optional field, set to null if not provided
    } = req.body;
  

    try {
      const [result] = await pool.execute(
        `UPDATE Event 
         SET name = ?, location = ?, eventSupervisor_id = ?, tournament_id = ?, scoringAlg = ?, description = ?
         WHERE event_id = ?`,
        [
          name,
          location || null, // Use null if location is not provided
          eventSupervisor_id, // This can be null if not provided
          tournament_id, // Required
          scoringAlg, // This can be null if not provided
          description, // This can be null if not provided
          event_id, // Use the event ID from the URL
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

export const getTimeBlocksByEventId = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const [timeBlocks] = await pool.execute(
      `SELECT * FROM TimeBlock WHERE Event_ID = ?`, [eventId]
    )as [any[], any];

    if (timeBlocks.length === 0) {
      return res.status(404).json({ message: 'No time blocks found for this event' });
    }

    res.status(200).json(timeBlocks);
  } catch (error) {
    console.error('Error fetching time blocks by event ID', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamsByTimeBlockId = async (req: Request, res: Response) => {
  const { timeBlockId } = req.params;

  try {
    const [teams] = await pool.execute(
      `SELECT t.* FROM Team t
       JOIN TeamTimeBlock ttb ON t.team_id = ttb.Team_ID
       WHERE ttb.TimeBlock_ID = ?`, [timeBlockId]
    ) as [any[], any];;

    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this time block' });
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams by time block ID', error);
    res.status(500).json({ message: 'Server error' });
  }
};
