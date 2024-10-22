import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITournament } from '../models/data.models'; // Adjust the import path
import xlsx from 'xlsx';
import { Workbook } from 'exceljs'; // Import Workbook from exceljs
import ExcelJS from 'exceljs';
import { RankedTeam } from '../models/data.models';

export const addTournament = async (req: Request, res: Response) => {
    const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;
  
    // Validate required fields
    if (!name || !division) {
      return res.status(400).json({ message: 'Name and division are required' });
    }
  
    // Create the new tournament object
    const newTournament: ITournament = {
      tournament_id: 0, // Auto-increment handled by the database
      group_id: group_id, // Use the group_id from the request body
      isCurrent: isCurrent, // Set this according to your application logic
      division: division, // Use the division from the request body
      NumOfTimeBlocks: NumOfTimeBlocks || 0, // Use the NumOfTimeBlocks from the request body
      name: name, // Use the name from the request body
      date: date || new Date(), // Set to current date or a specific date
      location: location || "", // Use the location from the request body or default
      description: description || "", // Use the description from the request body or default to empty
    };
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO tournament (name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newTournament.name,
          newTournament.division,
          newTournament.group_id,
          newTournament.isCurrent,
          newTournament.NumOfTimeBlocks,
          newTournament.location,
          newTournament.description,
          newTournament.date,
        ]
      );
  
      // Retrieve the ID of the newly inserted tournament
      const insertId = (result as any).insertId;
  
      // Return the newly created tournament ID
      res.status(201).json({ message: 'Tournament added successfully', id: insertId });
    } catch (error) {
      console.error('Error adding tournament:', error); // Log the error for debugging
      res.status(500).json({ message: 'Error adding tournament', error: error.message });
    }
  };
  

export const getAllTournaments = async (req: Request, res: Response) => {
    try {
      const [tournaments] = await pool.execute('SELECT * FROM tournament');
      res.status(200).json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Error fetching tournaments', error: error.message });
    }
  };

  export const editTournament = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
    const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;

  
    try {
      const [result] = await pool.execute(
        `UPDATE tournament 
         SET name = ?, division = ?, group_id = ?, isCurrent = ?, NumOfTimeBlocks = ?, location = ?, description = ?, date = ?
         WHERE tournament_id = ?`,
        [
          name,
          division,
          group_id,
          isCurrent,
          NumOfTimeBlocks,
          location,
          description,
          date,
          tournament_id, // Use the tournament ID from the URL
        ]
      );
  
      // Check if any rows were affected
      const affectedRows = (result as { affectedRows: number }).affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      res.status(200).json({ message: 'Tournament updated successfully' });
    } catch (error) {
      console.error('Error updating tournament:', error);
      res.status(500).json({ message: 'Error updating tournament', error: error.message });
    }
  };

  export const deleteTournament = async (req: Request, res: Response) => {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
  
    // Validate the tournament ID
    if (!tournament_id) {
      return res.status(400).json({ message: 'Tournament ID is required' });
    }
  
    try {
      const [result] = await pool.execute(
        'DELETE FROM tournament WHERE tournament_id = ?',
        [tournament_id] // Use the tournament ID from the URL
      );
  
      // Check if any rows were affected
      const affectedRows = (result as { affectedRows: number }).affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      res.status(200).json({ message: 'Tournament deleted successfully' });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      res.status(500).json({ message: 'Error deleting tournament', error: error.message });
    }
  };

  export const getTourneyById = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.id); // Get tournament ID from the URL

    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    try {
        // Execute the select query
        const [tournaments] = await pool.execute('SELECT * FROM Tournament WHERE tournament_id = ?', [tournamentId]) as [Event[], any];

        // Check if the school was found
        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.status(200).json(tournaments[0]); // Return the first (and should be only) school found
    } catch (error) {
        console.error('Error retrieving tournament:', error);
        res.status(500).json({ message: 'Error retrieving tournament', error: error.message });
    }
};

export const getCurrentTournamentIds = async (req: Request, res: Response) => {
    try {
      // Query to get the IDs of all current tournaments
      const [tournamentIds] = await pool.execute(
        'SELECT tournament_id FROM tournament WHERE isCurrent = true'
      );
  
      res.status(200).json(tournamentIds);
    } catch (error) {
      console.error('Error fetching current tournament IDs:', error);
      res.status(500).json({ message: 'Error fetching current tournament IDs', error: error.message });
    }
  };

  export const getCurrentTournamentsByGroupId = async (req: Request, res: Response) => {
    const groupId = req.params.groupId; // Extract group_id from the URL
  
    try {
      // Query to get the tournaments for the specific group_id where isCurrent is true
      const [tournaments] = await pool.execute(
        'SELECT * FROM tournament WHERE group_id = ? AND isCurrent = true',
        [groupId] // Pass the group_id to the query
      );
  
      res.status(200).json(tournaments);
    } catch (error) {
      console.error('Error fetching current tournaments for group:', error);
      res.status(500).json({ message: 'Error fetching current tournaments for group', error: error.message });
    }
  };

export const exportTournamentScoresToExcel = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.tournamentId);

    if (!tournamentId) {
        return res.status(400).json({ error: 'Tournament ID is required' });
    }

    try {
        const [events] = await pool.execute(
            'SELECT * FROM Event WHERE tournament_id = ?',
            [tournamentId]
        ) as [any[], any];

        const workbook = new ExcelJS.Workbook();
        const eventRanks: { [eventId: number]: { [teamTimeBlockId: number]: number | null } } = {};
        const allTeamTimeBlocks: RankedTeam[] = [];
        const overallRanks: { [teamTimeBlockId: number]: number } = {}; // To hold overall ranks

        for (const event of events) {
            const { event_id, name, scoringAlg } = event;

            const [teamTimeBlocks] = await pool.execute(
                `
                SELECT t.unique_id AS unique_id, t.name AS teamName, tt.TeamTimeBlock_ID, tt.Score, tt.Tier
                FROM TeamTimeBlock tt
                JOIN Team t ON tt.Team_ID = t.team_id
                WHERE tt.Event_ID = ?
                ORDER BY tt.Tier, tt.Score`,
                [event_id]
            ) as [any[], any];

            const rankedTeams: RankedTeam[] = teamTimeBlocks
                .map((tt) => ({
                    teamName: tt.teamName,
                    score: tt.Score,
                    tier: tt.Tier,
                    TeamTimeBlock_ID: tt.TeamTimeBlock_ID,
                    unique_id: tt.unique_id, // Capture unique ID
                }))
                .filter((tt) => tt.score !== null); // Filter out null scores for ranking

            // Rank the teams based on scoring algorithm
            rankedTeams.sort((a, b) => {
                if (a.tier !== b.tier) {
                    return a.tier - b.tier;
                }
                if (scoringAlg === 'Default') {
                    return b.score! - a.score!;
                } else if (scoringAlg === 'Flipped') {
                    return a.score! - b.score!;
                }
                return 0;
            });

            let currentRank = 1;
            for (const team of rankedTeams) {
                team.rank = currentRank; // Assign rank
                eventRanks[event_id] = eventRanks[event_id] || {};
                eventRanks[event_id][team.TeamTimeBlock_ID] = team.rank; // Store the rank
                currentRank++;
            }

            // Add a new sheet for the event
            const eventSheet = workbook.addWorksheet(name);
            eventSheet.addRow(['Team Name', 'Score', 'Tier', 'Rank']);

            for (const team of rankedTeams) {
                eventSheet.addRow([team.teamName, team.score, team.tier, team.rank ?? 'N/A']);
            }

            // Collect all TeamTimeBlock_IDs for the main sheet
            allTeamTimeBlocks.push(...rankedTeams);
        }

        const mainSheet = workbook.addWorksheet('Main');
        const mainHeaders = ['Unique ID', 'Team Name', ...events.map(event => event.name), 'Total Rank', 'Overall Rank'];
        mainSheet.addRow(mainHeaders);

        const totalRanks: { [teamTimeBlockId: number]: number } = {};

        for (const tt of allTeamTimeBlocks) {
            const { unique_id, teamName } = tt; // Use unique_id
            const row = [unique_id, teamName]; // Update to use unique_id

            let totalRank = 0;

            for (const event of events) {
                const rank = eventRanks[event.event_id]?.[tt.TeamTimeBlock_ID] ?? (allTeamTimeBlocks.length + 1); // Default to last place
                row.push(rank);
                totalRank += rank; // Accumulate total rank
            }

            totalRanks[tt.TeamTimeBlock_ID] = totalRank;
            row.push(totalRank); // Total rank
            mainSheet.addRow(row);
        }

        // Calculate overall ranks based on total ranks
        const totalRankEntries = Object.entries(totalRanks).map(([id, total]) => ({ TeamTimeBlock_ID: id, total }));
        totalRankEntries.sort((a, b) => a.total - b.total);

        let overallRank = 1;
        for (const entry of totalRankEntries) {
            overallRanks[entry.TeamTimeBlock_ID] = overallRank;
            overallRank++;
        }

        // Update the main sheet with overall ranks
        mainSheet.getColumn(mainHeaders.length).eachCell((cell, index) => {
            if (index > 1) { // Skip the header row
                const TeamTimeBlock_ID = allTeamTimeBlocks[index - 2].TeamTimeBlock_ID; // Adjust index
                cell.value = overallRanks[TeamTimeBlock_ID] ?? 'N/A'; // Use 'N/A' for teams without a rank
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=tournament_scores.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting tournament scores:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};