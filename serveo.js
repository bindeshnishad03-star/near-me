const { spawn } = require('child_process');

console.log('📡 Requesting secure public tunnel from serveo.net...');

const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-R', '80:localhost:3000',
  'serveo.net'
]);

ssh.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
});

ssh.stderr.on('data', (data) => {
  console.error(data.toString());
});

ssh.on('close', (code) => {
  console.log(`🔌 Serveo process exited with code ${code}`);
});

// Keep node alive
process.stdin.resume();
