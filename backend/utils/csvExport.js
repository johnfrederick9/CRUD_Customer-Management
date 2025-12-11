const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

async function exportToCSV(customers) {
  const filePath = path.join(__dirname, '../exports', `customers_${Date.now()}.csv`);
  
  // Ensure exports directory exists
  const exportDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'first_name', title: 'First Name' },
      { id: 'last_name', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
      { id: 'date_created', title: 'Date Created' }
    ]
  });

  await csvWriter.writeRecords(customers);
  return filePath;
}

module.exports = { exportToCSV };