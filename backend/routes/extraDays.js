const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all extra day records
router.get('/', async (req, res) => {
    try {
        const { employee_id } = req.query;
        let query = 'SELECT * FROM extra_days';
        const params = [];

        if (employee_id) {
            params.push(employee_id);
            query += ' WHERE employee_id = $1';
        }

        query += ' ORDER BY date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching extra days:', error);
        res.status(500).json({ error: 'Failed to fetch extra days' });
    }
});

// Add extra day
router.post('/', async (req, res) => {
    try {
        const { employee_id, days_count, reason, date } = req.body;

        const result = await pool.query(
            `INSERT INTO extra_days (employee_id, days_count, reason, date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [employee_id, days_count || 1, reason, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating extra day record:', error);
        res.status(500).json({ error: 'Failed to create extra day record' });
    }
});

// Delete extra day record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM extra_days WHERE id = $1', [id]);
        res.json({ message: 'Extra day record deleted successfully' });
    } catch (error) {
        console.error('Error deleting extra day record:', error);
        res.status(500).json({ error: 'Failed to delete extra day record' });
    }
});

module.exports = router;
