const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando build para Windows...\n');

const electronBuilderPath = path.join(__dirname, 'node_modules', 'electron-builder', 'cli.js');
const command = `node "${electronBuilderPath}" --win`;

const process = exec(command, { cwd: __dirname });

process.stdout.on('data', (data) => {
  process.stdout.write(data);
});

process.stderr.on('data', (data) => {
  process.stderr.write(data);
});

process.on('close', (code) => {
  console.log(`\nProcesso finalizado com código: ${code}`);
  if (code === 0) {
    console.log('✅ Build concluído com sucesso!');
  } else {
    console.log('❌ Build falhou!');
  }
  process.exit(code);
});

