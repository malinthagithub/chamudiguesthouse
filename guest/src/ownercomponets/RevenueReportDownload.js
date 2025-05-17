import React, { useState } from 'react';

const RevenueReportDownload = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const handleDownload = () => {
    if (!year || !month) {
      alert('Please select both year and month');
      return;
    }

    const url = `http://localhost:5000/api/reports/download/revenue?year=${year}&month=${month}`;

    // Create invisible link and click it to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenue_report_${year}_${month}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Download Revenue Report</h2>

     <div>
  <span style={{ color: 'black', fontWeight: 'bold' }}>Year: </span>
  <input
    type="number"
    value={year}
    onChange={(e) => setYear(e.target.value)}
    placeholder="e.g. 2025"
    min="2000"
    max="2100"
  />
</div>


      <div>
        <label>
           <span style={{ color: 'black', fontWeight: 'bold' }}>Month: </span>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="1-12"
            min="1"
            max="12"
          />
        </label>
      </div>

      <button onClick={handleDownload} style={{ marginTop: '10px' }}>
        Download Report
      </button>
    </div>
  );
};

export default RevenueReportDownload;
