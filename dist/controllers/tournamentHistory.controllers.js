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
exports.downloadTournamentHistory = exports.getTournamentHistoryBySchoolGroup = exports.addTournamentHistory = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const db_config_1 = __importDefault(require("../config/db.config"));
// Function to export tournament scores and store the Excel file
const addTournamentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const tournamentId = parseInt(req.params.tournamentId);
    const schoolGroupId = req.body.school_group_id; // Ensure this is passed in the request
    const tournamentName = req.body.name; // Ensure the tournament name is passed in the request
    const division = req.body.division; // Ensure the division is passed in the request
    if (!tournamentId || !schoolGroupId || !tournamentName || !division) {
        return res.status(400).json({ error: 'Tournament ID, School Group ID, tournament name, and division are required' });
    }
    try {
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE tournament_id = ?', [tournamentId]);
        const workbook = new exceljs_1.default.Workbook();
        const eventRanks = {};
        const allTeamTimeBlocks = [];
        const overallRanks = {}; // To hold overall ranks
        for (const event of events) {
            const { event_id, name, scoringAlg } = event;
            const [teamTimeBlocks] = yield db_config_1.default.execute(`SELECT t.unique_id AS unique_id, t.name AS teamName, tt.TeamTimeBlock_ID, tt.Score, tt.Tier
                 FROM TeamTimeBlock tt
                 JOIN Team t ON tt.Team_ID = t.team_id
                 WHERE tt.Event_ID = ?
                 ORDER BY tt.Tier, tt.Score`, [event_id]);
            const rankedTeams = teamTimeBlocks
                .map((tt) => ({
                teamName: tt.teamName,
                score: tt.Score,
                tier: tt.Tier,
                TeamTimeBlock_ID: tt.TeamTimeBlock_ID,
                unique_id: tt.unique_id,
            }))
                .filter((tt) => tt.score !== null); // Filter out null scores for ranking
            rankedTeams.sort((a, b) => {
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
            let currentRank = 1;
            for (const team of rankedTeams) {
                team.rank = currentRank;
                eventRanks[event_id] = eventRanks[event_id] || {};
                eventRanks[event_id][team.TeamTimeBlock_ID] = team.rank;
                currentRank++;
            }
            const eventSheet = workbook.addWorksheet(name);
            eventSheet.addRow(['Team Name', 'Score', 'Tier', 'Rank']);
            rankedTeams.forEach((team) => { var _a; return eventSheet.addRow([team.teamName, team.score, team.tier, (_a = team.rank) !== null && _a !== void 0 ? _a : 'N/A']); });
            allTeamTimeBlocks.push(...rankedTeams);
        }
        const mainSheet = workbook.addWorksheet('Main');
        const mainHeaders = ['Unique ID', 'Team Name', ...events.map(event => event.name), 'Total Rank', 'Overall Rank'];
        mainSheet.addRow(mainHeaders);
        const totalRanks = {};
        for (const tt of allTeamTimeBlocks) {
            const row = [tt.unique_id, tt.teamName];
            let totalRank = 0;
            for (const event of events) {
                const rank = (_b = (_a = eventRanks[event.event_id]) === null || _a === void 0 ? void 0 : _a[tt.TeamTimeBlock_ID]) !== null && _b !== void 0 ? _b : (allTeamTimeBlocks.length + 1);
                row.push(rank);
                totalRank += rank;
            }
            totalRanks[tt.TeamTimeBlock_ID] = totalRank;
            row.push(totalRank);
            mainSheet.addRow(row);
        }
        // Sort teams based on total ranks for overall rank
        const totalRankEntries = Object.entries(totalRanks).map(([id, total]) => ({ TeamTimeBlock_ID: id, total }));
        totalRankEntries.sort((a, b) => a.total - b.total);
        let overallRank = 1;
        totalRankEntries.forEach((entry) => {
            overallRanks[entry.TeamTimeBlock_ID] = overallRank++;
        });
        mainSheet.getColumn(mainHeaders.length).eachCell((cell, index) => {
            var _a;
            if (index > 1) {
                const TeamTimeBlock_ID = allTeamTimeBlocks[index - 2].TeamTimeBlock_ID;
                cell.value = (_a = overallRanks[TeamTimeBlock_ID]) !== null && _a !== void 0 ? _a : 'N/A';
            }
        });
        // Write the Excel file to a buffer
        const buffer = yield workbook.xlsx.writeBuffer();
        // Store the Excel buffer in the database
        const [result] = yield db_config_1.default.execute(`
            INSERT INTO TournamentHistory (school_group_id, excelmasterscore, date, name, division)
            VALUES (?, ?, NOW(), ?, ?)`, [schoolGroupId, buffer, tournamentName, division]);
        const insertResult = result;
        res.status(201).json({
            message: 'Tournament history and Excel saved successfully',
            tournamentHistoryId: insertResult.insertId,
        });
    }
    catch (error) {
        console.error('Error exporting and saving tournament scores:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.addTournamentHistory = addTournamentHistory;
// Function to get tournament history by school group ID
const getTournamentHistoryBySchoolGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schoolgroupID } = req.params;
    try {
        const [results] = yield db_config_1.default.execute(`
            SELECT * FROM TournamentHistory 
            WHERE school_group_id = ?`, [schoolgroupID]);
        res.status(200).json(results);
    }
    catch (error) {
        console.error('Error fetching tournament history:', error);
        res.status(500).json({ message: 'Error fetching tournament history' });
    }
});
exports.getTournamentHistoryBySchoolGroup = getTournamentHistoryBySchoolGroup;
const downloadTournamentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournamentHistoryId = parseInt(req.params.id);
    try {
        const [rows] = yield db_config_1.default.execute('SELECT excelmasterscore, name FROM TournamentHistory WHERE tournament_history_id = ?', [tournamentHistoryId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Tournament history not found' });
        }
        const { excelmasterscore, name } = rows[0];
        // Set the correct headers to serve the file as .xlsx
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.xlsx"`);
        // Send the binary data as response
        res.send(excelmasterscore);
    }
    catch (error) {
        console.error('Error downloading Excel file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.downloadTournamentHistory = downloadTournamentHistory;
