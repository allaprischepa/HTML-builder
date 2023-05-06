const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const destionationPath = path.join(__dirname, 'project-dist', 'bundle.css');
const sourceStylesPath = path.join(__dirname, 'styles');

// Check if directory is readable.
fs.access(sourceStylesPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${sourceStylesPath} is not readable: ${err}`);
    return;
  }

  mergeStyles(sourceStylesPath, destionationPath);
});

/**
 * Merge styles into one bundle.
 * @param {*} sourceStylesPath
 * @param {*} destionationPath
 */
async function mergeStyles(sourceStylesPath, destionationPath) {
  const objects = await readdir(sourceStylesPath, { withFileTypes: true });
  const writeStream = fs.createWriteStream(destionationPath);
  const cssFiles = [];

  // Create array of necessary styles files.
  for (const obj of objects) {
    if (obj.isFile() && path.extname(obj.name) === '.css') {
      cssFiles.push(obj.name);
    }
  }

  // Write every styles file into destination.
  for (const [ind, fileName] of cssFiles.entries()) {
    const styleFilePath = path.join(sourceStylesPath, fileName);
    const input = fs.createReadStream(styleFilePath, 'utf-8');

    for await (const chunk of input) {
      writeStream.write(chunk);
    }

    if (ind === (cssFiles.length - 1)) continue;

    writeStream.write('\n');
  }

  writeStream.end();
}
