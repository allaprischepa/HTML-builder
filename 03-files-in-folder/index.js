//import { readdir } from 'node:fs/promises';
const fs = require('fs');
const { readdir, stat } = require('fs/promises');
const path = require('path');
const directoryPath = path.join(__dirname, 'secret-folder');

/**
 * Convert bytes to kiloBytes and etc.
 * @param {} bytes
 * @returns
 */
const convertBytes = (bytes) => {
  const measures = ['Bytes', 'kB', 'mB', 'gB', 'tB'];
  const denominator = 1000;

  if (bytes == 0) {
    return '0 Bytes';
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(denominator)));

  const size = (i == 0) ? bytes : (bytes / Math.pow(denominator, i)).toFixed(1);

  return `${size} ${measures[i]}`;
};

// Check if directory is readable.
fs.access(directoryPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${directoryPath} is not readable: ${err}`);
    return;
  }

  readDir(directoryPath, {withFileTypes: true});
});

// Read directory.
async function readDir(directoryPath, options = {}) {
  try {

    const objects = await readdir(directoryPath, options);

    // Output info about each file.
    for (const obj of objects) {
      if (obj.isFile()) {
        const fileName = obj.name;
        const filePath = path.join(directoryPath, fileName);
        const { name, ext } = path.parse(filePath);
        const fileStat = await stat(filePath);
        const size = convertBytes(fileStat.size);

        console.log(`${name} - ${ext.replace('.', '')} - ${size}`);
      }
    }

  } catch (error) {

    console.error(error);
  }
}

