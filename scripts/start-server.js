
const { spawn } = require('child_process');
const path = require('path');

// Démarrer le serveur Express
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

server.on('close', (code) => {
  console.log(`Serveur API arrêté avec le code ${code}`);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit();
});
