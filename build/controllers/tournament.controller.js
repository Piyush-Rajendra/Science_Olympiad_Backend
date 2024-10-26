"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentTournament = exports.exportTournamentScoresToExcel = exports.getCurrentTournamentsByGroupIdManage = exports.getCurrentTournamentsByGroupId = exports.getCurrentTournamentIds = exports.getTourneyById = exports.deleteTournament = exports.editTournament = exports.getAllTournaments = exports.addTournament = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const exceljs_1 = __importDefault(require("exceljs"));
//import { RankedTeam } from '../models/data.models';
const addTournament = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;
    // Validate required fields
    if (!name || !division) {
        return res.status(400).json({ message: 'Name and division are required' });
    }
    // Create the new tournament object
    const newTournament = {
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
        const [result] = yield db_config_1.default.execute('INSERT INTO tournament(name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            newTournament.name,
            newTournament.division,
            newTournament.group_id,
            newTournament.isCurrent,
            newTournament.NumOfTimeBlocks,
            newTournament.location,
            newTournament.description,
            newTournament.date,
        ]);
        // Retrieve the ID of the newly inserted tournament
        const insertId = result.insertId;
        // Return the newly created tournament ID
        res.status(201).json({ message: 'Tournament added successfully', id: insertId });
    }
    catch (error) {
        console.error('Error adding tournament:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error adding tournament', error: error.message });
    }
});
exports.addTournament = addTournament;
const getAllTournaments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [tournaments] = yield db_config_1.default.execute('SELECT * FROM tournament');
        res.status(200).json(tournaments);
    }
    catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ message: 'Error fetching tournaments', error: error.message });
    }
});
exports.getAllTournaments = getAllTournaments;
const editTournament = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
    const { name, division, group_id, isCurrent, NumOfTimeBlocks, location, description, date } = req.body;
    try {
        const [result] = yield db_config_1.default.execute(`UPDATE tournament 
         SET name = ?, division = ?, group_id = ?, isCurrent = ?, NumOfTimeBlocks = ?, location = ?, description = ?, date = ?
         WHERE tournament_id = ?`, [
            name,
            division,
            group_id,
            isCurrent,
            NumOfTimeBlocks,
            location,
            description,
            date,
            tournament_id, // Use the tournament ID from the URL
        ]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.status(200).json({ message: 'Tournament updated successfully' });
    }
    catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ message: 'Error updating tournament', error: error.message });
    }
});
exports.editTournament = editTournament;
const deleteTournament = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
    // Validate the tournament ID
    if (!tournament_id) {
        return res.status(400).json({ message: 'Tournament ID is required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM tournament WHERE tournament_id = ?', [tournament_id] // Use the tournament ID from the URL
        );
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.status(200).json({ message: 'Tournament deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ message: 'Error deleting tournament', error: error.message });
    }
});
exports.deleteTournament = deleteTournament;
const getTourneyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournamentId = parseInt(req.params.id); // Get tournament ID from the URL
    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }
    try {
        // Execute the select query
        const [tournaments] = yield db_config_1.default.execute('SELECT * FROM tournament WHERE tournament_id = ?', [tournamentId]);
        // Check if the school was found
        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.status(200).json(tournaments[0]); // Return the first (and should be only) school found
    }
    catch (error) {
        console.error('Error retrieving tournament:', error);
        res.status(500).json({ message: 'Error retrieving tournament', error: error.message });
    }
});
exports.getTourneyById = getTourneyById;
const getCurrentTournamentIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query to get the IDs of all current tournaments
        const [tournamentIds] = yield db_config_1.default.execute('SELECT tournament_id FROM tournament WHERE isCurrent = true');
        res.status(200).json(tournamentIds);
    }
    catch (error) {
        console.error('Error fetching current tournament IDs:', error);
        res.status(500).json({ message: 'Error fetching current tournament IDs', error: error.message });
    }
});
exports.getCurrentTournamentIds = getCurrentTournamentIds;
const getCurrentTournamentsByGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.params.groupId; // Extract group_id from the URL
    try {
        // Query to get the tournaments for the specific group_id where isCurrent is true
        const [tournaments] = yield db_config_1.default.execute('SELECT * FROM tournament WHERE group_id = ? AND isCurrent = true', [groupId] // Pass the group_id to the query
        );
        res.status(200).json(tournaments);
    }
    catch (error) {
        console.error('Error fetching current tournaments for group:', error);
        res.status(500).json({ message: 'Error fetching current tournaments for group', error: error.message });
    }
});
exports.getCurrentTournamentsByGroupId = getCurrentTournamentsByGroupId;
const getCurrentTournamentsByGroupIdManage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.params.groupId; // Extract group_id from the URL
    try {
        // Query to get the tournaments for the specific group_id where isCurrent is true
        const [tournaments] = yield db_config_1.default.execute('SELECT * FROM tournament WHERE group_id = ?', [groupId] // Pass the group_id to the query
        );
        res.status(200).json(tournaments);
    }
    catch (error) {
        console.error('Error fetching current tournaments for group:', error);
        res.status(500).json({ message: 'Error fetching current tournaments for group', error: error.message });
    }
});
exports.getCurrentTournamentsByGroupIdManage = getCurrentTournamentsByGroupIdManage;
const exportTournamentScoresToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournamentId = parseInt(req.params.tournamentId);
    if (!tournamentId) {
        return res.status(400).json({ error: 'Tournament ID is required' });
    }
    try {
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE tournament_id = ?', [tournamentId]);
        const [teamCount] = yield db_config_1.default.execute('SELECT * FROM Team WHERE tournament_id = ?', [tournamentId]);
        const [flightATeams] = yield db_config_1.default.execute(`
      SELECT *
      FROM Team t
      JOIN School s ON t.school_id = s.ID
      WHERE t.tournament_id = ? AND s.flight = ?
    `, [tournamentId, 'A']);
        // Query for count of teams in flight B
        const [flightBTeams] = yield db_config_1.default.execute(`
      SELECT * 
      FROM Team t
      JOIN School s ON t.school_id = s.ID
      WHERE t.tournament_id = ? AND s.flight = ?
    `, [tournamentId, 'B']);
        const flightACount = flightATeams.length; // Default to 0 if no teams found
        const flightBCount = flightBTeams.length; // Default to 0 if no teams found
        const workbook = new exceljs_1.default.Workbook();
        const eventRanks = {};
        const allTeamTimeBlocks = [];
        const totalRanks = {}; // Holds total rank per team
        const overallRanks = {}; // Holds overall rank after sorting
        const teamEventRanks = {}; // To store event ranks by team
        // Create a map to hold team names
        const teamNamesMap = {};
        // Function to rank teams by score within an event (irrespective of flight)
        const rankTeams = (teams, scoringAlg, teamCount) => __awaiter(void 0, void 0, void 0, function* () {
            teams.sort((a, b) => {
                if (a.tier !== b.tier) {
                    return a.tier - b.tier;
                }
                if (scoringAlg === 'Default') {
                    return b.score - a.score;
                }
                else if (scoringAlg === 'Flipped') {
                    return a.score - b.score;
                }
                return 0;
            });
            // let currentRank = 1;
            // for (const team of teams) {
            //     team.rank = currentRank; // Assign rank within event
            //     currentRank++;
            // }
            let firstZeroRank = null; // Variable to store the rank for the first 0 score
            let currentRank = 1; // Start rank from 1
            const totalTeams = teamCount;
            for (const team of teams) {
                if (team.score === null) {
                    // If team is absent, assign rank as totalTeams + 1
                    team.rank = totalTeams + 1;
                }
                else if (team.score === 0) {
                    // For teams with score 0, assign firstZeroRank if it's the first one, otherwise use firstZeroRank
                    if (firstZeroRank === null) {
                        firstZeroRank = currentRank;
                    }
                    team.rank = firstZeroRank;
                }
                else {
                    // For other teams, assign the current rank
                    team.rank = currentRank;
                }
                // Only increment rank if the team is not absent or a 0-score team
                if (team.score !== null && team.score !== 0) {
                    currentRank++;
                }
            }
        });
        // Function to rank teams within their flight
        const rankTeamsByFlight = (teams, scoringAlg, flightACount, flightBCount) => {
            const flights = {};
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
                // Sort teams based on tier and score
                flightTeams.sort((a, b) => {
                    if (a.tier !== b.tier) {
                        return a.tier - b.tier;
                    }
                    if (scoringAlg === 'Default') {
                        return b.score - a.score;
                    }
                    else if (scoringAlg === 'Flipped') {
                        return a.score - b.score;
                    }
                    return 0;
                });
                let firstZeroRank = null; // Variable to store the rank for the first 0 score
                let flightRank = 1; // Start rank from 1
                const totalTeams = flight === 'A' ? flightACount : flightBCount; // Determine total teams based on flight
                for (const team of flightTeams) {
                    if (team.score === null) {
                        // If team is absent, assign rank as totalTeams + 1 to flight-specific rank
                        if (flight === 'A') {
                            team.flightRankA = totalTeams + 1; // Set absent rank for flight A
                        }
                        else if (flight === 'B') {
                            team.flightRankB = totalTeams + 1; // Set absent rank for flight B
                        }
                    }
                    else if (team.score === 0) {
                        // For teams with score 0, assign firstZeroRank if it's the first one, otherwise use firstZeroRank
                        if (firstZeroRank === null) {
                            firstZeroRank = flightRank; // Store the rank for the first 0-score team
                        }
                        if (flight === 'A') {
                            team.flightRankA = firstZeroRank; // Set rank for flight A
                        }
                        else if (flight === 'B') {
                            team.flightRankB = firstZeroRank; // Set rank for flight B
                        }
                    }
                    else {
                        // For other teams, assign the current flightRank
                        if (flight === 'A') {
                            team.flightRankA = flightRank; // Set rank for flight A
                        }
                        else if (flight === 'B') {
                            team.flightRankB = flightRank; // Set rank for flight B
                        }
                        // Only increment flightRank if the team is not absent or a 0-score team
                        flightRank++;
                    }
                }
            }
        };
        const flightATotalRanks = {};
        const flightBTotalRanks = {};
        // Process each event and rank teams
        for (const event of events) {
            const { event_id, name, scoringAlg } = event;
            const [teamTimeBlocks] = yield db_config_1.default.execute(`
              SELECT t.team_id AS unique_id, tt.Comment AS comment, t.unique_id AS teamIden, t.name AS teamName, tt.TeamTimeBlock_ID, tt.Score, tt.Tier, s.flight
              FROM TeamTimeBlock tt
              JOIN Team t ON tt.Team_ID = t.team_id
              JOIN School s ON t.school_id = s.id
              WHERE tt.Event_ID = ?
              ORDER BY tt.Tier, tt.Score`, [event_id]);
            // Populate team names into the map
            teamTimeBlocks.forEach((tt) => {
                teamNamesMap[tt.unique_id] = tt.teamName; // Store team names
            });
            const rankedTeams = teamTimeBlocks
                .map((tt) => ({
                teamName: tt.teamName,
                score: tt.Score,
                tier: tt.Tier,
                TeamTimeBlock_ID: tt.TeamTimeBlock_ID,
                unique_id: tt.unique_id, // Add unique_id for Team Identifier
                flight: tt.flight,
                teamIden: tt.teamIden,
                comment: tt.comment,
                flightRankA: null, // Initialize flight rank A
                flightRankB: null, // Initialize flight rank B
            }));
            //.filter((tt) => tt.score !== null); // Only rank non-null scores
            // Rank all teams in the event (irrespective of flight)
            rankTeams(rankedTeams, scoringAlg, teamCount.length);
            // Rank teams within their specific flights
            rankTeamsByFlight(rankedTeams, scoringAlg, flightACount, flightBCount);
            // Populate team rankings in the map
            rankedTeams.forEach((team) => {
                if (!teamEventRanks[team.unique_id]) {
                    teamEventRanks[team.unique_id] = {};
                }
                teamEventRanks[team.unique_id][event_id] = team.rank; // Save event rank for the team
            });
            rankedTeams.forEach((team) => {
                if (team.flight === 'A') {
                    if (!flightATotalRanks[team.unique_id]) {
                        flightATotalRanks[team.unique_id] = {};
                    }
                    flightATotalRanks[team.unique_id][event_id] = team.flightRankA; // Save event rank for the team
                }
                else if (team.flight === 'B') {
                    if (!flightBTotalRanks[team.unique_id]) {
                        flightBTotalRanks[team.unique_id] = {};
                    }
                    flightBTotalRanks[team.unique_id][event_id] = team.flightRankB; // Save event rank for the team
                }
            });
            // Store event ranks for overall ranking
            eventRanks[event_id] = eventRanks[event_id] || {};
            rankedTeams.forEach((team) => {
                eventRanks[event_id][team.TeamTimeBlock_ID] = team.rank; // Save event rank
            });
            // Add the teams to the list for overall ranking (only once, not by flight)
            allTeamTimeBlocks.push(...rankedTeams);
            // Create a new worksheet/tab for the current event
            const eventSheet = workbook.addWorksheet(name);
            const eventHeaders = ['Unique ID', 'Team Identifier', 'Team Name', 'Score', 'Tier', 'Flight', 'Rank', 'Flight A Rank', 'Flight B Rank', 'Comment'];
            eventSheet.addRow(eventHeaders);
            // Populate the event sheet with ranked teams, including flight ranks
            rankedTeams.forEach((team) => {
                eventSheet.addRow([
                    team.unique_id,
                    team.teamIden, // Team Identifier
                    team.teamName,
                    team.score,
                    team.tier,
                    team.flight,
                    team.rank, // Rank in event
                    team.flightRankA, // Rank within Flight A
                    team.flightRankB, // Rank within Flight B
                    team.comment
                ]);
            });
        }
        // Main sheet to aggregate all teams and their overall rank
        const mainSheet = workbook.addWorksheet('Main');
        const mainHeaders = ['Unique ID', 'Team Identifier', 'Team Name', ...events.map(event => event.name), 'Total Rank', 'Flight A Total Rank', 'Flight B Total Rank', 'Flight A Total Rank', 'Flight B Total Rank', 'Overall Rank'];
        mainSheet.addRow(mainHeaders);
        // Calculate the total rank for each team (sum of ranks across all events)
        const teamEntries = Object.entries(teamEventRanks).map(([teamId, eventRanks]) => {
            return {
                unique_id: parseInt(teamId),
                teamName: teamNamesMap[parseInt(teamId)] || 'Unknown', // Use the map to get team name
                teamIden: teamId, // Assuming `teamId` is equivalent to `teamIden` here
                eventRanks,
            };
        });
        const teamAEntries = Object.entries(flightATotalRanks).map(([teamId, eventRanks]) => {
            return {
                unique_id: parseInt(teamId),
                teamName: teamNamesMap[parseInt(teamId)] || 'Unknown', // Use the map to get team name
                teamIden: teamId, // Assuming `teamId` is equivalent to `teamIden` here
                eventRanks,
            };
        });
        const teamBEntries = Object.entries(flightBTotalRanks).map(([teamId, eventRanks]) => {
            return {
                unique_id: parseInt(teamId),
                teamName: teamNamesMap[parseInt(teamId)] || 'Unknown', // Use the map to get team name
                teamIden: teamId, // Assuming `teamId` is equivalent to `teamIden` here
                eventRanks,
            };
        });
        // Default rank for non-participating events (greater than max possible rank)
        const defaultRank = teamCount.length + 1; // Assuming this is higher than any possible rank
        const defaultRankA = flightATeams.length + 1;
        const defaultRankB = flightBTeams.length + 1;
        teamEntries.forEach((team) => {
            const row = [team.unique_id, team.teamIden, team.teamName]; // Add teamIden to this row
            // Calculate event sum for the current team
            const eventSum = events.reduce((sum, event) => {
                const eventRank = team.eventRanks[event.event_id] || defaultRank; // Use default rank if missing
                row.push(eventRank); // Add event rank to the row
                return sum + eventRank; // Sum up event ranks
            }, 0);
            // Calculate total rank including default ranks for missing events
            const totalRank = Object.values(team.eventRanks).reduce((sum, rank) => sum + rank, 0) +
                (events.length - Object.keys(team.eventRanks).length) * defaultRank; // Add default ranks for missing events
            row.push(totalRank); // Add total rank to the row in the main sheet
            // Calculate A Sum for the current team
            const Asum = teamAEntries.reduce((sum, aTeam) => {
                if (aTeam.unique_id === team.unique_id) { // Check if it matches the current team
                    return Object.values(aTeam.eventRanks).reduce((eventSum, rank) => eventSum + rank, 0) +
                        (events.length - Object.keys(aTeam.eventRanks).length) * defaultRankA; // Add default ranks for missing events
                }
                return sum; // Return the accumulated sum if no match
            }, 0);
            if (Asum === 0) {
                row.push('');
            }
            else {
                row.push(Asum); // Add A Sum to the row
            }
            // Calculate B Sum for the current team
            const Bsum = teamBEntries.reduce((sum, bTeam) => {
                if (bTeam.unique_id === team.unique_id) { // Check if it matches the current team
                    return Object.values(bTeam.eventRanks).reduce((eventSum, rank) => eventSum + rank, 0) +
                        (events.length - Object.keys(bTeam.eventRanks).length) * defaultRankB; // Add default ranks for missing events
                }
                return sum; // Return the accumulated sum if no match
            }, 0);
            if (Bsum === 0) {
                row.push('');
            }
            else {
                row.push(Bsum); // Add A Sum to the row
            }
            mainSheet.addRow(row); // Add the completed row to the main sheet
        });
        // Now calculate overall ranks based on total ranks (ignoring flight)
        const totalRankEntries = {}; // Holds total rank per team
        const totalAEntries = {};
        const totalBEntries = {};
        Object.entries(teamEventRanks).forEach(([teamId, eventRanks]) => {
            const totalRank = Object.values(eventRanks).reduce((sum, rank) => sum + rank, 0) +
                (events.length - Object.keys(eventRanks).length) * defaultRank; // Calculate total rank
            totalRankEntries[parseInt(teamId)] = totalRank; // Store total rank for each team
        });
        Object.entries(flightATotalRanks).forEach(([teamId, eventRanks]) => {
            const totalRank = Object.values(eventRanks).reduce((sum, rank) => sum + rank, 0) +
                (events.length - Object.keys(eventRanks).length) * defaultRank; // Calculate total rank
            totalAEntries[parseInt(teamId)] = totalRank; // Store total rank for each team
        });
        Object.entries(flightBTotalRanks).forEach(([teamId, eventRanks]) => {
            const totalRank = Object.values(eventRanks).reduce((sum, rank) => sum + rank, 0) +
                (events.length - Object.keys(eventRanks).length) * defaultRank; // Calculate total rank
            totalBEntries[parseInt(teamId)] = totalRank; // Store total rank for each team
        });
        // Sort teams by total rank
        const sortedTotalRanks = Object.entries(totalRankEntries)
            .sort(([, totalRankA], [, totalRankB]) => totalRankA - totalRankB); // Sort by total rank
        const sortedARanks = Object.entries(totalAEntries)
            .sort(([, totalRankA], [, totalRankB]) => totalRankA - totalRankB); // Sort by total rank
        const sortedBRanks = Object.entries(totalBEntries)
            .sort(([, totalRankA], [, totalRankB]) => totalRankA - totalRankB); // Sort by total rank
        // Assign overall ranks based on sorted order
        let overallRank = 1;
        const overallRanker = {}; // Resetting overall ranks
        for (const [teamId] of sortedTotalRanks) {
            overallRanker[parseInt(teamId)] = overallRank; // Assign overall rank
            overallRank++;
        }
        let flightA = 1;
        const flightARanker = {}; // Resetting overall ranks
        for (const [teamId] of sortedARanks) {
            flightARanker[parseInt(teamId)] = flightA; // Assign overall rank
            flightA++;
        }
        let flightB = 1;
        const flightBRanker = {}; // Resetting overall ranks
        for (const [teamId] of sortedBRanks) {
            flightBRanker[parseInt(teamId)] = flightB; // Assign overall rank
            flightB++;
        }
        // Update main sheet to reflect the correct overall ranks
        mainSheet.eachRow((row, rowNumber) => {
            var _a;
            if (rowNumber > 1) { // Skip the header row
                const teamId = row.getCell(1).value;
                const overallRank = (_a = flightARanker[teamId]) !== null && _a !== void 0 ? _a : ''; // Get overall rank for the team
                row.getCell(mainHeaders.length - 2).value = overallRank; // Update the overall rank column
            }
        });
        mainSheet.eachRow((row, rowNumber) => {
            var _a;
            if (rowNumber > 1) { // Skip the header row
                const teamId = row.getCell(1).value;
                const overallRank = (_a = flightBRanker[teamId]) !== null && _a !== void 0 ? _a : ''; // Get overall rank for the team
                row.getCell(mainHeaders.length - 1).value = overallRank; // Update the overall rank column
            }
        });
        mainSheet.eachRow((row, rowNumber) => {
            var _a;
            if (rowNumber > 1) { // Skip the header row
                const teamId = row.getCell(1).value;
                const overallRank = (_a = overallRanker[teamId]) !== null && _a !== void 0 ? _a : ''; // Get overall rank for the team
                row.getCell(mainHeaders.length).value = overallRank; // Update the overall rank column
            }
        });
        // Return the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=tournament_scores.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error exporting scores to Excel:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.exportTournamentScoresToExcel = exportTournamentScoresToExcel;
const setCurrentTournament = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament_id = parseInt(req.params.id); // Get the tournament ID from the URL
    if (isNaN(tournament_id)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }
    try {
        // Retrieve the group_id of the specified tournament
        const [rows] = yield db_config_1.default.execute('SELECT group_id FROM tournament WHERE tournament_id = ?', [tournament_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        const group_id = rows[0].group_id;
        // Set isCurrent = false for all tournaments with the same group_id
        yield db_config_1.default.execute('UPDATE tournament SET isCurrent = false WHERE group_id = ?', [group_id]);
        // Set isCurrent = true for the specified tournament
        const [result] = yield db_config_1.default.execute('UPDATE tournament SET isCurrent = true WHERE tournament_id = ?', [tournament_id]);
        // Check if any rows were affected (meaning the tournament was updated)
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.status(200).json({ message: 'Tournament set as current successfully' });
    }
    catch (error) {
        console.error('Error setting current tournament:', error);
        res.status(500).json({ message: 'Error setting current tournament', error: error.message });
    }
});
exports.setCurrentTournament = setCurrentTournament;
