const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Suprimir avisos do VAAPI (aceleração de hardware de vídeo)
// Esses erros são comuns no Linux e não afetam a funcionalidade
// Apenas desabilita o uso de VAAPI para evitar mensagens de erro no console
app.commandLine.appendSwitch('disable-features', 'VaapiVideoDecoder');

let mainWindow;

// Função auxiliar para obter o comando yt-dlp correto baseado no sistema operacional
function getYtDlpCommand() {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Quando empacotado, o yt-dlp.exe fica em resources/ (extraResources)
    // Quando em desenvolvimento, fica na raiz do projeto
    let ytdlpPath;
    if (app.isPackaged) {
      // No build, extraResources fica em process.resourcesPath
      ytdlpPath = path.join(process.resourcesPath, 'yt-dlp.exe');
    } else {
      // Em desenvolvimento, está na raiz
      ytdlpPath = path.join(__dirname, 'yt-dlp.exe');
    }
    
    // Verifica se o yt-dlp.exe existe junto com o app
    if (fs.existsSync(ytdlpPath)) {
      return ytdlpPath;
    }
    
    // Se não encontrar, tenta no PATH do sistema
    return 'yt-dlp.exe';
  }
  
  // No Linux/Mac, usa apenas yt-dlp do PATH
  return 'yt-dlp';
}

// Função para verificar se yt-dlp está disponível
async function checkYtDlpAvailable() {
  return new Promise((resolve) => {
    const command = getYtDlpCommand();
    const isWindows = process.platform === 'win32';
    const check = spawn(command, ['--version'], { 
      shell: isWindows, // No Windows, usar shell ajuda a encontrar o comando no PATH
      stdio: 'ignore' 
    });
    
    check.on('close', (code) => {
      resolve(code === 0);
    });
    
    check.on('error', () => {
      resolve(false);
    });
  });
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: true, // Oculta a barra de menus
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

// Handler para seleção de arquivo de cookies
ipcMain.handle('select-cookies-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecione o arquivo de cookies',
    filters: [
      { name: 'Arquivos de Texto', extensions: ['txt'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Handler para seleção de diretório de destino
ipcMain.handle('select-destination', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecione o diretório de destino',
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Handler para obter informações do vídeo (preview)
ipcMain.handle('get-video-info', async (event, videoUrl) => {
  return new Promise(async (resolve, reject) => {
    // Validação básica da URL
    if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      reject(new Error('URL inválida. Por favor, insira uma URL válida do YouTube.'));
      return;
    }

    // Verificar se yt-dlp está disponível
    const isAvailable = await checkYtDlpAvailable();
    if (!isAvailable) {
      const platform = process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux';
      let errorMsg = `yt-dlp não encontrado no sistema (${platform}). Por favor, instale o yt-dlp e certifique-se de que está no PATH do sistema.`;
      
      if (platform === 'Windows') {
        errorMsg += `\n\nDownload: https://github.com/yt-dlp/yt-dlp/releases`;
      }
      
      reject(new Error(errorMsg));
      return;
    }

    const command = getYtDlpCommand();
    const isWindows = process.platform === 'win32';
    const ytdlp = spawn(command, ['--dump-json', videoUrl], {
      shell: isWindows // No Windows, usar shell ajuda a encontrar o comando no PATH
    });

    let output = '';
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const videoInfo = JSON.parse(output);
          resolve({
            title: videoInfo.title || 'Título não disponível',
            duration: videoInfo.duration || 0,
            thumbnail: videoInfo.thumbnail || null
          });
        } catch (error) {
          reject(new Error('Erro ao processar informações do vídeo.'));
        }
      } else {
        reject(new Error(errorOutput || 'Erro ao obter informações do vídeo. Verifique a URL e tente novamente.'));
      }
    });

    ytdlp.on('error', (error) => {
      if (error.code === 'ENOENT') {
        const platform = process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux';
        let errorMsg = `yt-dlp não encontrado no sistema (${platform}). Por favor, instale o yt-dlp e certifique-se de que está no PATH do sistema.`;
        
        if (platform === 'Windows') {
          errorMsg += `\n\nDownload: https://github.com/yt-dlp/yt-dlp/releases`;
        }
        
        reject(new Error(errorMsg));
      } else {
        reject(new Error(`Erro ao executar yt-dlp: ${error.message}`));
      }
    });
  });
});

// Handler para extrair áudio
ipcMain.handle('extract-audio', async (event, { videoUrl, cookiesPath, destPath }) => {
  return new Promise((resolve, reject) => {
    // Validações
    if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      reject(new Error('URL inválida.'));
      return;
    }

    if (!cookiesPath || !fs.existsSync(cookiesPath)) {
      reject(new Error('Arquivo de cookies não encontrado.'));
      return;
    }

    if (!destPath || !fs.existsSync(destPath)) {
      reject(new Error('Diretório de destino não encontrado.'));
      return;
    }

    // Sanitização do caminho de destino
    const safeDestPath = path.resolve(destPath);

    const command = getYtDlpCommand();
    const isWindows = process.platform === 'win32';

    // Comando yt-dlp
    // Definir local do ffmpeg (mesmo diretório do yt-dlp)
    const ffmpegPath = isWindows ? path.dirname(command) : null;
    
    const args = [
      '-x',
      '--audio-format', 'mp3',
      '--cookies', cookiesPath,
      '--progress',
      '-o', path.join(safeDestPath, '%(title)s.%(ext)s'),
      videoUrl
    ];
    
    if (ffmpegPath) {
       args.unshift('--ffmpeg-location', ffmpegPath);
    }

    const ytdlp = spawn(command, args, {
      shell: isWindows // No Windows, usar shell ajuda a encontrar o comando no PATH
    });

    let errorOutput = '';
    let lastProgress = 0;

    // Parse do output para progresso
    ytdlp.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;

      // Tentar extrair progresso do output do yt-dlp
      // Formato: [download] X.X% of Y at Z speed ETA HH:MM:SS
      const progressMatch = output.match(/\[download\]\s*(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        if (progress >= lastProgress) {
          lastProgress = progress;
          mainWindow.webContents.send('progress-update', {
            progress: progress,
            message: `Baixando: ${progress.toFixed(1)}%`
          });
        }
      }

      // Enviar mensagens de status gerais
      if (output.includes('[download]') || output.includes('[ExtractAudio]')) {
        const cleanMessage = output.trim().split('\n')[0];
        if (cleanMessage && !cleanMessage.match(/\[download\]\s*\d+%/)) {
          mainWindow.webContents.send('progress-update', {
            message: cleanMessage
          });
        }
      }
    });

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      
      // yt-dlp também pode enviar progresso pelo stdout
      const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        if (progress > lastProgress) {
          lastProgress = progress;
          mainWindow.webContents.send('progress-update', {
            progress: progress,
            message: `Baixando: ${progress.toFixed(1)}%`
          });
        }
      }
    });

    ytdlp.on('close', async (code) => {
      if (code === 0) {
        mainWindow.webContents.send('progress-update', {
          progress: 100,
          message: 'Download concluído!'
        });
        
        // Encontrar o arquivo MP3 mais recente no diretório
        let outputFilePath = null;
        try {
          const files = fs.readdirSync(safeDestPath);
          const mp3Files = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
              name: file,
              path: path.join(safeDestPath, file),
              time: fs.statSync(path.join(safeDestPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);
          
          if (mp3Files.length > 0) {
            // Pegar o arquivo mais recente (primeiro da lista ordenada)
            outputFilePath = mp3Files[0].path;
          }
        } catch (error) {
          console.error('Erro ao buscar arquivo gerado:', error);
        }
        
        resolve({ 
          success: true, 
          message: 'Extração concluída com sucesso!',
          filePath: outputFilePath
        });
      } else {
        reject(new Error(errorOutput || `yt-dlp retornou código de erro: ${code}`));
      }
    });

    ytdlp.on('error', (error) => {
      if (error.code === 'ENOENT') {
        const platform = process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux';
        let errorMsg = `yt-dlp não encontrado no sistema (${platform}). Por favor, instale o yt-dlp e certifique-se de que está no PATH do sistema.`;
        
        if (platform === 'Windows') {
          errorMsg += `\n\nDownload: https://github.com/yt-dlp/yt-dlp/releases`;
        }
        
        reject(new Error(errorMsg));
      } else {
        reject(new Error(`Erro ao executar yt-dlp: ${error.message}`));
      }
    });
  });
});

// Handler para abrir arquivo no player padrão do sistema
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('Arquivo não encontrado.');
    }
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    throw new Error(`Erro ao abrir arquivo: ${error.message}`);
  }
});

app.whenReady().then(() => {
  // Remover completamente o menu da aplicação
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
