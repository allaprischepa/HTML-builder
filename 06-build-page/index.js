const fs = require('fs');
const { mkdir, readdir, copyFile, rm } = require('fs/promises');
const path = require('path');
const sourceHtmlPath = path.join(__dirname, 'template.html');
const destinationPath = path.join(__dirname, 'project-dist');
const componentsPath = path.join(__dirname, 'components');
const sourceStylesPath = path.join(__dirname, 'styles');
const destinationStyleFilePath = path.join(destinationPath, 'style.css');
const sorceAssetsPath = path.join(__dirname, 'assets');
const destinationAssetsPath = path.join(destinationPath, 'assets');

// Check if template.html file is readable.
fs.access(sourceHtmlPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`File ${sourceHtmlPath} is not readable: ${err}`);
    return;
  }

  buildPage();
});

// Check if styles directory is readable.
fs.access(sourceStylesPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${sourceStylesPath} is not readable: ${err}`);
    return;
  }

  mergeStyles(sourceStylesPath, destinationStyleFilePath);
});

// Check if assets directory is readable.
fs.access(sorceAssetsPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${sorceAssetsPath} is not readable: ${err}`);
    return;
  }

  copyDir(sorceAssetsPath, destinationAssetsPath);
});

/**
 * Build html file from template.
 */
async function buildPage() {
  await mkdir(destinationPath, { recursive: true });
  const htmlWriteStream = fs.createWriteStream(path.join(destinationPath, 'index.html'));
  const input = fs.createReadStream(sourceHtmlPath, 'utf-8');

  for await (let chunk of input) {
    const replaceRegex = /{{\s*(\w+)\s*}}/g;
    let match;

    // Replace pattern with component file.
    while ((match = replaceRegex.exec(chunk)) !== null) {
      const fileName = match[1];
      const replaceFilePath = path.join(componentsPath, `${fileName}.html`);
      const replaceContent = await readComponent(replaceFilePath);

      chunk = chunk.replace(match[0], replaceContent);
    }

    htmlWriteStream.write(chunk);
  }

  htmlWriteStream.end();
}

/**
 * Read component file.
 * @param {*} replaceFilePath
 * @returns
 */
async function readComponent(replaceFilePath) {
  const readStream = fs.createReadStream(replaceFilePath, 'utf-8');
  let content = '';

  return new Promise((resolve, reject) => {
    readStream.on('data', (data) => {
      content += data;
    });

    readStream.on('end', () => {
      resolve(content);
    });

    readStream.on('error', reject);
  });
}

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

/**
 * Copy directory.
 * @param {*} sourcePath
 * @param {*} destinationPath
 */
async function copyDir(sourcePath, destinationPath) {
  try {

    await mkdir(destinationPath, { recursive: true });
    await purge(destinationPath, sourcePath);
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
async function purge(destinationPath, sourcePath) {
  const destinationObjects = await readdir(destinationPath, {withFileTypes: true});
  for (const obj of destinationObjects) {
    if (obj.isDirectory()) {
      const destinationDirPath = path.join(destinationPath, obj.name);
      await purge(destinationDirPath, sourcePath);
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