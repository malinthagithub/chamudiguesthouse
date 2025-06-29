const RevenueModel = require('../models/revenueModel');
const { Parser } = require('json2csv');

class RevenueController {
    // Get analytics data (same output as original)
    static async getAnalytics(req, res) {
        try {
            const analytics = await RevenueModel.getAnalytics();
            res.json(analytics); // Same response format as original
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve revenue analytics' // Same error format
            });
        }
    }

    // Download CSV (same output as original)
    static async downloadAnalytics(req, res) {
        try {
            const data = await RevenueModel.getDownloadData();
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(data);

            // Same headers and attachment as original
            res.header('Content-Type', 'text/csv');
            res.attachment('revenue_report.csv'); 
            res.send(csv);
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).json({ 
                error: 'Failed to generate report' // Same error format
            });
        }
    }
}

module.exports = RevenueController;