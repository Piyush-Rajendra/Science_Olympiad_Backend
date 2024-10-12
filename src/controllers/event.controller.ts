import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { IEvent } from '../models/data.models'; // Adjust the import path

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
