import Papa from "papaparse";

// Function to read and parse CSV files
export const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true, // Fetches the CSV from the given URL
      header: true, // Treats the first row as header
      complete: (results) => resolve(results.data), // Resolves with the parsed data
      error: (error) => reject(error), // Rejects on error
    });
  });
};
