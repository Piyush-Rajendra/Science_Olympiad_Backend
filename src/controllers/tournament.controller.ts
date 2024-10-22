import { Request, Response } from 'express';
import pool from '../../config/db.config';
import { ITournament } from '../models/data.models'; // Adjust the import path
import xlsx from 'xlsx';
import { Workbook } from 'exceljs'; // Import Workbook from exceljs
import ExcelJS from 'exceljs';

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

  interface RankedTeam {
    teamName: string;
    score: number | null;
    tier: number;
    TeamTimeBlock_ID: number;
    unique_id: number; // Added to store the unique team ID
    teamIden: string;
    flight: string; // Added to store the flight
    rank?: number; // Optional property for rank
    flightRankA: number;
    flightRankB: number; 
}


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
        const totalRanks: { [teamTimeBlockId: number]: number } = {}; // Holds total rank per team
        const overallRanks: { [teamTimeBlockId: number]: number } = {}; // Holds overall rank after sorting

        // Function to rank teams by score within an event (irrespective of flight)
        const rankTeams = (teams: RankedTeam[], scoringAlg: string) => {
            teams.sort((a, b) => {
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
            for (const team of teams) {
                team.rank = currentRank; // Assign rank within event
                currentRank++;
            }
        };

        // Function to rank teams within their flight
        const rankTeamsByFlight = (teams: RankedTeam[], scoringAlg: string) => {
            const flights: { [flight: string]: RankedTeam[] } = {};

            // Group teams by flight
            teams.forEach((team) => {
                if (!flights[team.flight]) {
                    flights[team.flight] = [];
                }
                flights[team.flight].push(team);
            });

            // Rank teams within each flight
            for (const flight in flights) {
                const flightTeams = flights[flight];
                flightTeams.sort((a, b) => {
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

                let flightRank = 1;
                for (const team of flightTeams) {
                    if (team.flight === 'A') {
                        team.flightRankA = flightRank; // Assign rank within flight A
                    } else if (team.flight === 'B') {
                        team.flightRankB = flightRank; // Assign rank within flight B
                    }
                    flightRank++;
                }
            }
        };

        // Process each event and rank teams
        for (const event of events) {
            const { event_id, name, scoringAlg } = event;
        
            const [teamTimeBlocks] = await pool.execute(
                `
                SELECT t.team_id AS unique_id, t.unique_id AS teamIden, t.name AS teamName, tt.TeamTimeBlock_ID, tt.Score, tt.Tier, s.flight
                FROM TeamTimeBlock tt
                JOIN Team t ON tt.Team_ID = t.team_id
                JOIN School s ON t.school_id = s.id
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
                    unique_id: tt.unique_id,
                    teamIden: tt.teamIden,   // Add unique_id here for Team Identifier
                    flight: tt.flight,
                    flightRankA: null,         // Initialize flight rank A
                    flightRankB: null,         // Initialize flight rank B
                }))
                .filter((tt) => tt.score !== null); // Only rank non-null scores
        
            // Rank all teams in the event (irrespective of flight)
            rankTeams(rankedTeams, scoringAlg);
        
            // Rank teams within their specific flights
            rankTeamsByFlight(rankedTeams, scoringAlg);
        
            // Store event ranks for overall ranking
            eventRanks[event_id] = eventRanks[event_id] || {};
            rankedTeams.forEach((team) => {
                eventRanks[event_id][team.TeamTimeBlock_ID] = team.rank; // Save event rank
            });
        
            // Add the teams to the list for overall ranking (only once, not by flight)
            allTeamTimeBlocks.push(...rankedTeams);
        
            // Create a new worksheet/tab for the current event
            const eventSheet = workbook.addWorksheet(name);
        
            // Updated headers for Event tabs (including Team Identifier)
            const eventHeaders = ['Unique ID', 'Team Identifier', 'Team Name', 'Score', 'Tier', 'Flight', 'Rank in Event', 'Flight Rank A', 'Flight Rank B'];
            eventSheet.addRow(eventHeaders);
        
            // Populate the event sheet with ranked teams, including flight ranks
            rankedTeams.forEach((team) => {
                eventSheet.addRow([
                    team.unique_id,      // Unique ID
                    team.teamIden,      // Team Identifier (same as unique_id here)
                    team.teamName,
                    team.score,
                    team.tier,
                    team.flight,
                    team.rank,           // Rank in event
                    team.flightRankA,     // Rank within Flight A
                    team.flightRankB      // Rank within Flight B
                ]);
            });
        }
        
        // Main sheet to aggregate all teams and their overall rank
        const mainSheet = workbook.addWorksheet('Main');
        
        // Updated headers for the Main tab (including Team Identifier)
        const mainHeaders = ['Unique ID', 'Team Identifier', 'Team Name', ...events.map(event => event.name), 'Total Rank', 'Overall Rank'];
        mainSheet.addRow(mainHeaders);
        
        // Calculate the total rank for each team (sum of ranks across all events)
        allTeamTimeBlocks.forEach((tt) => {
            let totalRank = 0;
            const row = [tt.unique_id, tt.unique_id, tt.teamName]; // Add unique_id again for Team Identifier
        
            events.forEach((event) => {
                const eventRank = eventRanks[event.event_id]?.[tt.TeamTimeBlock_ID] ?? (allTeamTimeBlocks.length + 1); // Default to last rank if missing
                row.push(eventRank);
                totalRank += eventRank;
            });
        
            totalRanks[tt.TeamTimeBlock_ID] = totalRank; // Store total rank for this team
            row.push(totalRank); // Add total rank to the row in the main sheet
            mainSheet.addRow(row);
        });

        // Now calculate overall ranks based on total ranks (ignoring flight)
        const totalRankEntries = Object.entries(totalRanks).map(([id, total]) => ({
            TeamTimeBlock_ID: parseInt(id), total,
        }));

        // Sort teams by their total ranks to assign the overall rank
        totalRankEntries.sort((a, b) => a.total - b.total);

        let overallRank = 1;
        for (const entry of totalRankEntries) {
            overallRanks[entry.TeamTimeBlock_ID] = overallRank;
            overallRank++;
        }

        // Update main sheet to reflect the correct overall ranks
        mainSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip the header row
                const teamId = row.getCell(1).value as number;
                const overallRank = overallRanks[teamId] ?? 'N/A';
                row.getCell(mainHeaders.length).value = overallRank; // Update the overall rank column
            }
        });

        // Return the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=tournament_scores.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting tournament scores:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
