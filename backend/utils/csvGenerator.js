const { Parser } = require('json2csv');

module.exports = {
    generateCSV: (data) => {
        try {
            const json2csvParser = new Parser();
            return json2csvParser.parse(data);
        } catch (error) {
            throw error;
        }
    }
};