import Papa from 'papaparse';

export const loadData = async () => {
  return new Promise((resolve, reject) => {
    Papa.parse("/data/hotel_bookings_1000.csv", {
      download: true,
      header: true,
      complete: results => {
        const data = results.data.map(row => ({
          ...row,
          arrival_date: new Date(
            row.arrival_date_year,
            new Date(`${row.arrival_date_month} 1, 2000`).getMonth(),
            row.arrival_date_day_of_month
          )
        }));
        resolve(data);
      },
      error: error => reject(error)
    });
  });
};

export const filterDataByDate = (data, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return data.filter(row => row.arrival_date >= start && row.arrival_date <= end);
};
