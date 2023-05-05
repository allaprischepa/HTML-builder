const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(filePath);
const { stdin, stdout, stderr } = process;

stdout.write('Please, input text:\n');

// Write data from user's input.
stdin.on('data', data => {
  const dataStringified = data.toString();

  if (dataStringified.trim() === 'exit') {
    process.exit();
  }

  writeStream.write(data);
});

// Finish the process.
process.on('exit', code => {
  if (code === 0) {
    stdout.write('\nThe process is finished. Bye!\n');
  } else {
    stderr.write(`Something went wrong. Error code: ${code}`);
  }
});

// Finish on Ctrl + C.
process.on('SIGINT', () => {
  process.exit(0);
});
