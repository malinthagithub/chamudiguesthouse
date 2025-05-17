const express = require('express'); // Import express
const router = express.Router();
const db = require('../db'); // Import your database connection
const { Parser } = require('json2csv'); // Import the json2csv parser
const axios = require('axios');
const PDFDocument = require('pdfkit');
const QuickChart = require('quickchart-js');

// Download Analytics Route (with booking_source)
router.get('/download/online', (req, res) => {
    const query = `
        SELECT 
            YEAR(b.created_at) AS year,
            MONTH(b.created_at) AS month,
            b.room_id,
            r.name AS room_name,
            COUNT(b.booking_id) AS number_of_bookings,
            SUM(b.total_amount) AS total_revenue
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.room_id
        WHERE b.status = 'confirmed'
          AND b.booking_source = 'online'
        GROUP BY YEAR(b.created_at), MONTH(b.created_at), b.room_id, r.name
        ORDER BY year DESC, month DESC;
    `;

    db.query(query, (err, rows) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: 'Failed to generate online bookings report' });
        }

        // Calculate total revenue
        const totalRevenue = rows.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0);
        console.log('Total Revenue:', totalRevenue.toFixed(2));

        // Create CSV header
        const header = `"Chmaudi Guest House"\n"online  Bookings Report"\n\n`;
        
        // CSV column titles - adjust as needed
        const columns = ['Year', 'Month', 'Room ID', 'Room Name', 'Number of Bookings', 'Total Revenue'];

        // Generate CSV body rows as strings joined by commas
        const csvRows = rows.map(row => {
            return [
                row.year,
                row.month,
                row.room_id,
                `"${row.room_name}"`,  // quotes to handle commas in names
                row.number_of_bookings,
                row.total_revenue
            ].join(',');
        });

        // Join all rows with newlines
        const csvBody = columns.join(',') + '\n' + csvRows.join('\n');

        // Add total revenue line, aligning with columns (4 empty columns, then label, then value)
        const totalLine = `,,,,Total Revenue,${totalRevenue.toFixed(2)}\n`;

        // Combine all parts into final CSV content
        const finalCsv = header + csvBody + '\n' + totalLine;

        // Set headers and send CSV content
        res.header('Content-Type', 'text/csv');
        res.attachment('online_bookings_report.csv');
        res.send(finalCsv);
    });
});


router.get('/download/walkin', (req, res) => {
  const query = `
    SELECT
      YEAR(b.created_at) AS year,
      MONTH(b.created_at) AS month,
      b.room_id,
      r.name AS room_name,
      COUNT(b.booking_id) AS number_of_bookings,
      SUM(b.total_amount) AS total_revenue
    FROM bookings b
    LEFT JOIN rooms r ON b.room_id = r.room_id
    WHERE b.status = 'Arrived' AND b.booking_source = 'walk-in'
    GROUP BY YEAR(b.created_at), MONTH(b.created_at), b.room_id, r.name
    ORDER BY year DESC, month DESC;
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to generate walk-in bookings report' });
    }

    const fields = ['year', 'month', 'room_id', 'room_name', 'number_of_bookings', 'total_revenue'];
    const json2csvParser = new Parser({ fields });
    const csvBody = json2csvParser.parse(rows);

    // Calculate total revenue
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0);
console.log('Total Revenue:', totalRevenue.toFixed(2));



    // Create custom CSV output
    const header = `"Chmaudi Guest House"\n"Walk-in Bookings Report"\n\n`;
    const totalLine = `\n,,,,Total Revenue:,${totalRevenue}\n`; // aligns with columns

    const finalCsv = header + csvBody + totalLine;

    res.header('Content-Type', 'text/csv');
    res.attachment('walkin_bookings_report.csv');
    res.send(finalCsv);
  });
});
router.get('/download/occupancy', (req, res) => {
  const query = `
    SELECT 
      r.room_id,
      r.name AS room_name,
      COUNT(DISTINCT DATE(b.checkin_date)) AS booked_days,
      DAY(LAST_DAY('2025-05-01')) AS total_days_in_month,
      ROUND((COUNT(DISTINCT DATE(b.checkin_date)) / DAY(LAST_DAY('2025-05-01'))) * 100, 2) AS occupancy_percentage
    FROM rooms r
    LEFT JOIN bookings b ON r.room_id = b.room_id
      AND (b.status = 'Arrived' OR b.status = 'Completed')
      AND b.checkin_date >= '2025-05-01'
      AND b.checkin_date <= '2025-05-31'
    GROUP BY r.room_id, r.name
    ORDER BY occupancy_percentage DESC
    LIMIT 25;
  `;

  db.query(query, async (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to generate occupancy report' });
    }

    try {
      // Prepare chart config for QuickChart
      const qc = new QuickChart();
      qc.setConfig({
        type: 'bar',
        data: {
          labels: rows.map(row => row.room_name),
          datasets: [{
            label: 'Occupancy Percentage (%)',
            data: rows.map(row => Number(row.occupancy_percentage) || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
          }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Occupancy Percentage for May 2025',
              font: { size: 18 },
            },
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Occupancy %',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Rooms',
              },
            },
          },
        },
      });

      const chartUrl = qc.getUrl();

      // Fetch the chart image buffer
      const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
      const chartImageBuffer = response.data;

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Disposition', 'attachment; filename=occupancy_report_may_2025.pdf');
      res.setHeader('Content-Type', 'application/pdf');

      doc.pipe(res);

      // Add header
      doc.fontSize(20).text('Chmaudi Guest House', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).text('Occupancy Report for May 2025', { align: 'center' });
      doc.moveDown(1);

      // Add the chart image
      doc.image(chartImageBuffer, {
        fit: [500, 300],
        align: 'center',
        valign: 'center',
      });

      doc.moveDown(1);

      // Add table headers
      doc.fontSize(12).text(
        'Room ID'.padEnd(10) +
        'Room Name'.padEnd(30) +
        'Booked Days'.padEnd(15) +
        'Total Days'.padEnd(15) +
        'Occupancy %'
      );

      doc.moveDown(0.5);

      // Add table rows
      rows.forEach(row => {
        const occupancy = Number(row.occupancy_percentage);
        const occupancyText = isNaN(occupancy) ? '0.00' : occupancy.toFixed(2);

        doc.text(
          String(row.room_id).padEnd(10) +
          String(row.room_name).padEnd(30) +
          String(row.booked_days).padEnd(15) +
          String(row.total_days_in_month).padEnd(15) +
          occupancyText
        );
      });

      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF report' });
      }
    }
  });
});
router.get('/download/revenue', async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid or missing year/month query params' });
  }

  const query = `
    SELECT
      r.room_id,
      r.name AS room_name,
      SUM(CASE WHEN b.booking_source = 'Walk-in' THEN b.total_amount ELSE 0 END) AS walkin_revenue,
      SUM(CASE WHEN b.booking_source = 'Online' THEN b.total_amount ELSE 0 END) AS online_revenue,
      SUM(b.total_amount) AS total_revenue
    FROM rooms r
    LEFT JOIN bookings b ON r.room_id = b.room_id
      AND YEAR(b.checkin_date) = ?
      AND MONTH(b.checkin_date) = ?
    GROUP BY r.room_id, r.name
    ORDER BY total_revenue DESC;
  `;

  db.query(query, [year, month], async (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to fetch revenue report' });
    }

    try {
      // Prepare QuickChart config for grouped bar chart
      const qc = new QuickChart();
      qc.setConfig({
        type: 'bar',
        data: {
          labels: rows.map(row => row.room_name),
          datasets: [
            {
              label: 'Walk-in Revenue',
              data: rows.map(row => Number(row.walkin_revenue) || 0),
              backgroundColor: 'rgba(75, 192, 192, 0.7)'
            },
            {
              label: 'Online Revenue',
              data: rows.map(row => Number(row.online_revenue) || 0),
              backgroundColor: 'rgba(255, 159, 64, 0.7)'
            },
            {
              label: 'Total Revenue',
              data: rows.map(row => Number(row.total_revenue) || 0),
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `Room Revenue for ${month}/${year}`,
              font: { size: 18 }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Rooms'
              }
            }
          }
        }
      });

      const chartUrl = qc.getUrl();

      // Fetch chart image as buffer
      const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
      const chartImageBuffer = response.data;

      // Create PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Disposition', `attachment; filename=revenue_report_${year}_${month}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');

      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Chmaudi Guest House', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).text(`Revenue Report for ${month}/${year}`, { align: 'center' });
      doc.moveDown(1);

      // Chart image
      doc.image(chartImageBuffer, {
        fit: [500, 300],
        align: 'center',
        valign: 'center'
      });

      doc.moveDown(1);

      // Table header
      doc.fontSize(12).text(
        'Room ID'.padEnd(10) +
        'Room Name'.padEnd(30) +
        'Walk-in Revenue'.padEnd(20) +
        'Online Revenue'.padEnd(20) +
        'Total Revenue'
      );

      doc.moveDown(0.5);

      // Table rows
      rows.forEach(row => {
        doc.text(
          String(row.room_id).padEnd(10) +
          String(row.room_name).padEnd(30) +
          (Number(row.walkin_revenue) || 0).toFixed(2).padEnd(20) +
          (Number(row.online_revenue) || 0).toFixed(2).padEnd(20) +
          (Number(row.total_revenue) || 0).toFixed(2)
        );
      });

      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF report' });
      }
    }
  });
});




module.exports = router;
