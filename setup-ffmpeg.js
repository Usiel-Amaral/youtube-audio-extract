const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Usando o release essentials do GitHub do BtbN (alternativa mais estável que gyan.dev para automação)
// Ou mantendo gyan.dev com user-agent correto. Vamos tentar gyan.dev com redirect handling primeiro.
const FFMPEG_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
const ZIP_FILE = 'ffmpeg.zip';
const EXTRACT_DIR = 'ffmpeg_temp';

console.log('--- Configuração Automática do FFmpeg ---');

function downloadFile(url, dest, callback) {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    }, (response) => {
        // Manipular redirecionamentos (301, 302, 303, 307, 308)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            console.log(`Redirecionando (Status ${response.statusCode}) para: ${response.headers.location}`);
            file.close();
            fs.unlink(dest, () => {}); // Apaga arquivo vazio
            downloadFile(response.headers.location, dest, callback);
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`Falha no download. Status Code: ${response.statusCode}`);
            file.close();
            fs.unlink(dest, () => {});
            return;
        }

        const len = parseInt(response.headers['content-length'], 10);
        let cur = 0;
        const total = len / 1048576; // MB

        response.on('data', (chunk) => {
            cur += chunk.length;
            if (len) {
                const percent = (100.0 * cur / len).toFixed(2);
                process.stdout.write(`Baixando: ${percent}% (${(cur / 1048576).toFixed(2)} MB de ${total.toFixed(2)} MB)\r`);
            }
        });

        response.pipe(file);

        file.on('finish', () => {
            file.close((err) => {
                if (err) {
                    console.error('Erro ao fechar arquivo:', err);
                    return;
                }
                console.log('\nDownload concluído e arquivo fechado.');
                setTimeout(callback, 2000); // 2s delay
            });
        });
    });

    request.on('error', (err) => {
        fs.unlink(dest, () => {});
        console.error('Erro na requisição:', err.message);
    });
}

// 1. Iniciar Download
console.log(`Baixando FFmpeg de: ${FFMPEG_URL}`);
downloadFile(FFMPEG_URL, ZIP_FILE, extractAndMove);

function extractAndMove() {
  try {
    // Verificar tamanho do arquivo
    const stats = fs.statSync(ZIP_FILE);
    console.log(`Tamanho do arquivo baixado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (stats.size < 1000000) { // Menor que 1MB provavelmente é erro
        console.error('❌ O arquivo baixado parece muito pequeno. Provavelmente corrompido ou erro HTML.');
        return;
    }

    // 2. Extração
    console.log('Extraindo arquivos...');
    
    if (!fs.existsSync(EXTRACT_DIR)) {
      fs.mkdirSync(EXTRACT_DIR);
    }

    const absZipPath = path.resolve(ZIP_FILE);
    const absExtractPath = path.resolve(EXTRACT_DIR);
    
    // Expand-Archive do PowerShell
    const script = `powershell -Command "Expand-Archive -Path '${absZipPath}' -DestinationPath '${absExtractPath}' -Force"`;
    
    execSync(script, { stdio: 'inherit' });
    
    // 3. Mover arquivos
    console.log('Movendo binários para a raiz do projeto...');
    
    function findFile(dir, filename) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const found = findFile(fullPath, filename);
          if (found) return found;
        } else if (file === filename) {
          return fullPath;
        }
      }
      return null;
    }

    const ffmpegPath = findFile(EXTRACT_DIR, 'ffmpeg.exe');
    const ffprobePath = findFile(EXTRACT_DIR, 'ffprobe.exe');

    if (ffmpegPath && ffprobePath) {
      fs.copyFileSync(ffmpegPath, path.join(__dirname, 'ffmpeg.exe'));
      fs.copyFileSync(ffprobePath, path.join(__dirname, 'ffprobe.exe'));
      console.log('✅ ffmpeg.exe e ffprobe.exe copiados com sucesso!');
    } else {
      console.error('❌ Não foi possível encontrar os executáveis dentro do zip.');
    }

    // 4. Limpeza
    console.log('Limpando arquivos temporários...');
    try {
        fs.unlinkSync(ZIP_FILE);
        fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
    } catch (e) {
        console.log('Aviso: Não foi possível limpar alguns arquivos temporários automaticamente.');
    }
    
    console.log('--- Concluído ---');

  } catch (error) {
    console.error('Erro durante a extração/movimentação:', error);
  }
}
