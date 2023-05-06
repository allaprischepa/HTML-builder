const fs = require('fs');
const { mkdir, readdir, copyFile, rm } = require('fs/promises');
const path = require('path');
const sourcePath = path.join(__dirname, 'files');
const destinationPath = path.join(__dirname, 'files-copy');

// Check if directory is readable.
fs.access(sourcePath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${sourcePath} is not readable: ${err}`);
    return;
  }

  copyDir(sourcePath, destinationPath);
});

async function copyDir(sourcePath, destinationPath) {
  try {

    await mkdir(destinationPath, { recursive: true });
    await purge(destinationPath);
    const objects = await readdir(sourcePath, {withFileTypes: true});

    // Copy directory content.
    for (const obj of objects) {
      const objName = obj.name;
      const sourceObjPath = path.join(sourcePath, objName);
      const destinationObjPath = path.join(destinationPath, objName);

      if (obj.isDirectory()) {
        await copyDir(sourceObjPath, destinationObjPath);
      }
      else {
        await copyFile(sourceObjPath, destinationObjPath);
      }

    }
  } catch (err) {

    console.error(err.message);
  }
}

/**
 * Remove files and directories.
 * @param {*} destinationPath
 */
async function purge(destinationPath) {
  const destinationObjects = await readdir(destinationPath, {withFileTypes: true});
  for (const obj of destinationObjects) {
    if (obj.isDirectory()) {
      const destinationDirPath = path.join(destinationPath, obj.name);
      await purge(destinationDirPath);
      await rm(destinationDirPath, {recursive: true});
    }
    else {
      const pathToCheck = path.join(sourcePath, obj.name);
      fs.access(pathToCheck, fs.F_OK, (err) => {
        if (err) {
          const destinationFilePath = path.join(destinationPath, obj.name);
          rm(destinationFilePath, {recursive: true});
        }
      });
    }
  }
}