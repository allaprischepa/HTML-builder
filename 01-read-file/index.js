const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'text.txt');

// Check if file is readable.
fs.access(filePath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`File ${filePath} is not readable: ${err}`);
    return;
  }

  // Read file.
  const readStream = fs.createReadStream(filePath, 'utf-8');

  readStream.on('data', chunk => console.log(chunk));

  readStream.on('error', (err) => {
    console.error(`Error reading file: ${err}`);
  });
});
