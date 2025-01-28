const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

function cleanup() {
  const command = isWindows
    ? `netstat -ano | findstr :5000 && FOR /F "tokens=5" %a in ('netstat -ano | findstr :5000') do taskkill /F /PID %a`
    : `lsof -ti:5000 | xargs kill -9`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log('No processes to clean up');
      return;
    }
    console.log('Cleaned up port 5000');
  });
}

cleanup(); 