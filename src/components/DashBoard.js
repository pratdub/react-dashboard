import React, { useEffect, useState } from 'react';
import { loadData, filterDataByDate } from '../utils/dataUtils';
import DateSelector from './dateSelector';
import ChartContainer from './chartContainer';
import './DashBoard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await loadData();
        setData(csvData || []);
        setFilteredData(csvData || []);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterData = () => {
    try {
      const filtered = filterDataByDate(data, startDate, endDate);
      setFilteredData(filtered || []);
    } catch (err) {
      setError('Error filtering data');
      console.error('Error filtering data:', err);
    }
  };

  // Safe data processing functions
  const processLineChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return { categories: [], data: [] };
    
    const dates = data
      .filter(row => row?.arrival_date)
      .map(row => row.arrival_date.toISOString().split('T')[0]);
    
    const bookingCount = dates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return {
      categories: Object.keys(bookingCount),
      data: Object.values(bookingCount)
    };
  };

  const processBarChartData = (data) => {
    if (!Array.isArray(data)) return [];
    
    // Calculate totals
    const adults = data.reduce((acc, row) => acc + (parseInt(row?.adults, 10) || 0), 0);
    const children = data.reduce((acc, row) => acc + (parseInt(row?.children, 10) || 0), 0);
    const babies = data.reduce((acc, row) => acc + (parseInt(row?.babies, 10) || 0), 0);
    
    // Return data in the correct format for bar chart
    return [
      {
        name: 'Adults',
        data: [adults]
      },
      {
        name: 'Children',
        data: [children]
      },
      {
        name: 'Babies',
        data: [babies]
      }
    ];
  };

  const processPieChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return { labels: [], data: [] };
    
    const countryData = data.reduce((acc, row) => {
      if (row?.country) {
        acc[row.country] = (acc[row.country] || 0) + 1;
      }
      return acc;
    }, {});
    
    return {
      labels: Object.keys(countryData),
      data: Object.values(countryData)
    };
  };

  const processAreaChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return { categories: [], data: [] };
    
    // Filter for rows with `arrival_date_month` and group by month
    const months = data
      .filter(row => row?.arrival_date_month)
      .map(row => row.arrival_date_month);
  
    // Aggregate bookings by month
    const monthlyCount = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
  
    // Sort months to ensure chronological order in the chart
    const sortedMonths = Object.keys(monthlyCount).sort((a, b) => {
      // Assuming `arrival_date_month` values are full month names (e.g., 'January', 'February', etc.)
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });
  
    return {
      categories: sortedMonths,
      data: sortedMonths.map(month => monthlyCount[month])
    };
  };
  

  // Process chart data
  const lineChartData = processLineChartData(filteredData);
  const barChartData = processBarChartData(filteredData);
  const pieChartData = processPieChartData(filteredData);
  const areaChartData = processAreaChartData(filteredData);

  // Chart configurations
  const charts = [
    {
      type: 'line',
      data: lineChartData.data.length > 0 ? [{ name: 'Bookings', data: lineChartData.data }] : [],
      options: {
        chart: {
          type: 'line',
          height: 350
        },
        xaxis: { 
          categories: lineChartData.categories,
          title: {
            text: 'Date'
          }
        },
        yaxis: {
          title: {
            text: 'Number of Bookings'
          }
        },
        noData: { text: 'No data available' }
      }
    },
    {
      type: 'pie',
      data: pieChartData.data.length > 0 ? pieChartData.data : [],
      options: {
        labels: pieChartData.labels,
        title: {
          text: 'Bookings by Country',
          align: 'center'
        },
        noData: { text: 'No data available' }
      }
    },
    {
      type: 'area',
      data: areaChartData.data.length > 0 ? [{ name: 'Monthly Bookings', data: areaChartData.data }] : [],
      options: {
        chart: {
          type: 'area',
          height: 350
        },
        xaxis: { 
          categories: areaChartData.categories,
          title: {
            text: 'Month'
          }
        },
        yaxis: {
          title: {
            text: 'Number of Bookings'
          }
        },
        title: {
          text: 'Monthly Booking Trend',
          align: 'center'
        },
        noData: { text: 'No data available' }
      }
    },
    {
      type: 'bar',
      data: barChartData,
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        xaxis: {
          categories: ['Traveler Types'],
          title: {
            text: 'Traveler Category'
          }
        },
        yaxis: {
          title: {
            text: 'Number of Travelers'
          }
        },
        title: {
          text: 'Traveler Demographics',
          align: 'center'
        },
        noData: { text: 'No data available' },
        dataLabels: {
          enabled: true
        },
        legend: {
          position: 'top'
        }
      }
    },
  ];

  const nextChart = () => {
    setCurrentChartIndex((currentChartIndex + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentChartIndex((currentChartIndex - 1 + charts.length) % charts.length);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <DateSelector
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onFilter={filterData}
      />
      <div className="chart-carousel">
        <button 
          className="carousel-btn left" 
          onClick={prevChart}
          disabled={!filteredData.length}
        >
          ❮
        </button>
        <div className="chart-container">
          {filteredData.length > 0 ? (
            <ChartContainer
              type={charts[currentChartIndex].type}
              series={charts[currentChartIndex].data}
              options={charts[currentChartIndex].options}
            />
          ) : (
            <div className="no-data-message">No data available for the selected period</div>
          )}
        </div>
        <button 
          className="carousel-btn right" 
          onClick={nextChart}
          disabled={!filteredData.length}
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default Dashboard;