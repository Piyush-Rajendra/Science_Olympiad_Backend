import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import pool from '../../config/db.config';
import { ResultSetHeader } from 'mysql2';
import { RankedTeam } from '../models/data.models';
import { ITournamentHistory } from '../models/data.models';

// Function to export tournament scores and store the Excel file
export const addTournamentHistory = async (req: Request, res: Response) => {
    const tournamentId = parseInt(req.params.tournamentId);
    const schoolGroupId = req.body.school_group_id; // Ensure this is passed in the request
    const tournamentName = req.body.name; // Ensure the tournament name is passed in the request

    if (!tournamentId || !schoolGroupId || !tournamentName) {
        return res.status(400).json({ error: 'Tournament ID, School Group ID, and tournament name are required' });
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
                `SELECT t.unique_id AS unique_id, t.name AS teamName, tt.TeamTimeBlock_ID, tt.Score, tt.Tier
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
                    unique_id: tt.unique_id,
                }))
                .filter((tt) => tt.score !== null); // Filter out null scores for ranking

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
                team.rank = currentRank;
                eventRanks[event_id] = eventRanks[event_id] || {};
                eventRanks[event_id][team.TeamTimeBlock_ID] = team.rank;
                currentRank++;
            }

            const eventSheet = workbook.addWorksheet(name);
            eventSheet.addRow(['Team Name', 'Score', 'Tier', 'Rank']);
            rankedTeams.forEach((team) => eventSheet.addRow([team.teamName, team.score, team.tier, team.rank ?? 'N/A']));

            allTeamTimeBlocks.push(...rankedTeams);
        }

        const mainSheet = workbook.addWorksheet('Main');
        const mainHeaders = ['Unique ID', 'Team Name', ...events.map(event => event.name), 'Total Rank', 'Overall Rank'];
        mainSheet.addRow(mainHeaders);

        const totalRanks: { [teamTimeBlockId: number]: number } = {};

        for (const tt of allTeamTimeBlocks) {
            const row = [tt.unique_id, tt.teamName];
            let totalRank = 0;

            for (const event of events) {
                const rank = eventRanks[event.event_id]?.[tt.TeamTimeBlock_ID] ?? (allTeamTimeBlocks.length + 1);
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
            if (index > 1) {
                const TeamTimeBlock_ID = allTeamTimeBlocks[index - 2].TeamTimeBlock_ID;
                cell.value = overallRanks[TeamTimeBlock_ID] ?? 'N/A';
            }
        });

        // Write the Excel file to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Store the Excel buffer in the database
        const [result] = await pool.execute(`
            INSERT INTO TournamentHistory (school_group_id, excelmasterscore, date, name)
            VALUES (?, ?, NOW(), ?)`, [schoolGroupId, buffer, tournamentName]);

        const insertResult = result as ResultSetHeader;

        res.status(201).json({
            message: 'Tournament history and Excel saved successfully',
            tournamentHistoryId: insertResult.insertId,
        });
    } catch (error) {
        console.error('Error exporting and saving tournament scores:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to get tournament history by school group ID
export const getTournamentHistoryBySchoolGroup = async (req: Request, res: Response) => {
    const { schoolgroupID } = req.params;

    try {
        const [results] = await pool.execute(`
            SELECT * FROM TournamentHistory 
            WHERE school_group_id = ?`, [schoolgroupID]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching tournament history:', error);
        res.status(500).json({ message: 'Error fetching tournament history' });
    }
};

export const downloadTournamentHistory = async (req: Request, res: Response) => {
    const tournamentHistoryId = parseInt(req.params.id);

    try {
        const [rows] = await pool.execute(
            'SELECT excelmasterscore, name FROM TournamentHistory WHERE tournament_history_id = ?',
            [tournamentHistoryId]
        ) as [any[], any];

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Tournament history not found' });
        }

        const { excelmasterscore, name } = rows[0];

        // Set the correct headers to serve the file as .xlsx
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.xlsx"`);

        // Send the binary data as response
        res.send(excelmasterscore);
    } catch (error) {
        console.error('Error downloading Excel file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};