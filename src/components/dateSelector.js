import React from 'react';
import './DateSelector.css';

const DateSelector = ({ startDate, endDate, setStartDate, setEndDate, onFilter }) => (
  <div className="date-selector">
    <label>
      Start Date:
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
    </label>
    <label>
      End Date:
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
    </label>
    <button onClick={onFilter}>Filter Data</button>
  </div>
);

export default DateSelector;
