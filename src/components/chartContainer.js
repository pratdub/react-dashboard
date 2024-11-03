import React from 'react';
import Chart from 'react-apexcharts';
import './ChartContainer.css';

const ChartContainer = ({ type, series, options }) => (
  <div className="chart-wrapper">
    <div className="chart-container">
      <Chart options={options} series={series} type={type} height="700px" width="100%" />
    </div>
  </div>
);

export default ChartContainer;
