import React, { useState } from 'react';

const ReportDownload = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [error, setError] = useState('');

  const validateInputs = () => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (!year || !month) {
      setError('Please enter both year and month.');
      return false;
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2050) {
      setError('Year must be between 2000 and 2050.');
      return false;
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setError('Month must be between 1 and 12.');
      return false;
    }

    setError('');
    return true;
  };

  const handleDownload = (reportType) => {
    if (!validateInputs()) return;

    const url = `http://localhost:5000/api/reports/download/${reportType}?year=${year}&month=${month}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report_${year}_${month}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Download Reports</h2>

      <div>
        <span style={{ color: 'black', fontWeight: 'bold' }}>Year: </span>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g. 2025"
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
          />
        </label>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => handleDownload('revenue')}
          style={{ marginRight: '10px' }}
        >
          Download Revenue Report
        </button>

        <button onClick={() => handleDownload('occupancy')}>
          Download Occupancy Report
        </button>
      </div>
    </div>
  );
};

export default ReportDownload;
