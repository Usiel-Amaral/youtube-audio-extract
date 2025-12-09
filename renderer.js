const { ipcRenderer } = require('electron');
const path = require('path');

// Elementos do DOM
const cookiesFileInput = document.getElementById('cookies-file-input');
const cookiesFileBtn = document.getElementById('cookies-file-btn');
const cookiesFilePath = document.getElementById('cookies-file-path');
const videoUrlInput = document.getElementById('video-url-input');
const videoUrlBtn = document.getElementById('video-url-btn');
const destPathInput = document.getElementById('dest-path-input');
const destPathBtn = document.getElementById('dest-path-btn');
const extractBtn = document.getElementById('extract-btn');
const previewArea = document.getElementById('preview-area');
const previewTitle = document.getElementById('preview-title');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const progressText = document.getElementById('progress-text');
const statusMessage = document.getElementById('status-message');
const fileLinkContainer = document.getElementById('file-link-container');
const fileLink = document.getElementById('file-link');

// Estado da aplicação
let selectedCookiesPath = null;
let selectedDestPath = null;
let isExtracting = false;

// Validação de URL do YouTube
function isValidYouTubeUrl(url) {
  if (!url) return false;
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url.trim()));
}

// Seleção de arquivo de cookies
cookiesFileBtn.addEventListener('click', async () => {
  try {
    const filePath = await ipcRenderer.invoke('select-cookies-file');
    if (filePath) {
      selectedCookiesPath = filePath;
      cookiesFileInput.value = filePath;
      cookiesFilePath.textContent = path.basename(filePath);
      cookiesFilePath.style.display = 'inline';
      updateExtractButton();
      clearStatus();
    }
  } catch (error) {
    showStatus('Erro ao selecionar arquivo de cookies: ' + error.message, 'error');
  }
});

// Seleção de diretório de destino
destPathBtn.addEventListener('click', async () => {
  try {
    const dirPath = await ipcRenderer.invoke('select-destination');
    if (dirPath) {
      selectedDestPath = dirPath;
      destPathInput.value = dirPath;
      updateExtractButton();
      clearStatus();
    }
  } catch (error) {
    showStatus('Erro ao selecionar diretório: ' + error.message, 'error');
  }
});

// Buscar preview do vídeo quando URL for inserida
videoUrlInput.addEventListener('blur', async () => {
  const url = videoUrlInput.value.trim();
  
  if (!url) {
    previewArea.style.display = 'none';
    return;
  }

  if (!isValidYouTubeUrl(url)) {
    previewArea.style.display = 'none';
    return;
  }

  // Mostrar loading no preview
  previewTitle.textContent = 'Carregando informações...';
  previewArea.style.display = 'block';

  try {
    const videoInfo = await ipcRenderer.invoke('get-video-info', url);
    previewTitle.textContent = videoInfo.title;
    updateExtractButton();
    clearStatus();
  } catch (error) {
    previewTitle.textContent = 'Erro ao carregar informações do vídeo';
    previewTitle.style.color = '#e74c3c';
    showStatus(error.message, 'error');
  }
});

// Botão de extração
extractBtn.addEventListener('click', async () => {
  if (isExtracting) return;

  const videoUrl = videoUrlInput.value.trim();

  // Validações
  if (!selectedCookiesPath) {
    showStatus('Por favor, selecione o arquivo de cookies.', 'error');
    return;
  }

  if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
    showStatus('Por favor, insira uma URL válida do YouTube.', 'error');
    return;
  }

  if (!selectedDestPath) {
    showStatus('Por favor, selecione o diretório de destino.', 'error');
    return;
  }

  // Iniciar extração
  isExtracting = true;
  extractBtn.disabled = true;
  extractBtn.textContent = 'Extraindo...';
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  progressText.textContent = 'Iniciando...';
  fileLinkContainer.style.display = 'none';
  clearStatus();

  try {
    const result = await ipcRenderer.invoke('extract-audio', {
      videoUrl: videoUrl,
      cookiesPath: selectedCookiesPath,
      destPath: selectedDestPath
    });

    showStatus(result.message, 'success');
    progressBar.style.width = '100%';
    progressText.textContent = 'Concluído!';
    
    // Mostrar link para abrir o arquivo se disponível
    if (result.filePath) {
      fileLink.dataset.filePath = result.filePath;
      fileLinkContainer.style.display = 'block';
    }
  } catch (error) {
    showStatus('Erro: ' + error.message, 'error');
    progressBar.style.width = '0%';
    progressText.textContent = 'Erro no download';
    fileLinkContainer.style.display = 'none';
  } finally {
    isExtracting = false;
    extractBtn.disabled = false;
    extractBtn.textContent = 'Extrair Áudio';
    
    // Ocultar barra de progresso após 3 segundos se sucesso
    setTimeout(() => {
      if (progressText.textContent === 'Concluído!') {
        progressContainer.style.display = 'none';
      }
    }, 3000);
  }
});

// Listener para atualizações de progresso
ipcRenderer.on('progress-update', (event, data) => {
  if (data.progress !== undefined) {
    progressBar.style.width = data.progress + '%';
  }
  if (data.message) {
    progressText.textContent = data.message;
  }
});

// Handler para abrir arquivo no player padrão
fileLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const filePath = fileLink.dataset.filePath;
  if (filePath) {
    try {
      await ipcRenderer.invoke('open-file', filePath);
    } catch (error) {
      showStatus('Erro ao abrir arquivo: ' + error.message, 'error');
    }
  }
});

// Funções auxiliares
function updateExtractButton() {
  const hasCookies = selectedCookiesPath !== null;
  const hasUrl = videoUrlInput.value.trim() && isValidYouTubeUrl(videoUrlInput.value.trim());
  const hasDest = selectedDestPath !== null;
  
  extractBtn.disabled = !(hasCookies && hasUrl && hasDest) || isExtracting;
}

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  statusMessage.style.display = 'block';
}

function clearStatus() {
  statusMessage.style.display = 'none';
  statusMessage.textContent = '';
}

// Atualizar botão quando campos mudarem
videoUrlInput.addEventListener('input', () => {
  updateExtractButton();
  if (!videoUrlInput.value.trim()) {
    previewArea.style.display = 'none';
  }
});

destPathInput.addEventListener('input', () => {
  selectedDestPath = destPathInput.value.trim() || null;
  updateExtractButton();
});

// Elementos do Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

// Botões do Menu
const aboutBtn = document.getElementById('about-btn');
const requirementsBtn = document.getElementById('requirements-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const cookiesBtn = document.getElementById('cookies-btn');

// Conteúdo dos Modais
const modalContent = {
  about: {
    title: 'Sobre o YouTube Audio Extract',
    body: `
      <p><strong>YouTube Audio Extract</strong> é uma aplicação cross-platform desenvolvida com Electron que permite extrair áudio MP3 de vídeos do YouTube de forma simples e rápida.</p>
      
      <h3>Funcionalidades</h3>
      <ul>
        <li>Extrai áudio MP3 de vídeos do YouTube</li>
        <li>Interface gráfica intuitiva e moderna</li>
        <li>Suporte a autenticação via cookies</li>
        <li>Preview do título do vídeo antes do download</li>
        <li>Barra de progresso em tempo real</li>
        <li>Abertura automática do arquivo no player padrão</li>
      </ul>
      
      <h3>Versão</h3>
      <p>Versão 1.0.0</p>
      
      <h3>Desenvolvedor</h3>
      <p><strong>Usiel Amaral</strong></p>
      <p>📧 Email: suporte@usis.com.br</p>
      <p>🐙 GitHub: <a href="https://github.com/Usiel-Amaral" target="_blank">@Usiel-Amaral</a></p>
      
      <h3>Desenvolvido com Assistência de IA</h3>
      <p>Este projeto foi desenvolvido com a assistência de Inteligência Artificial (IA) para acelerar o processo de desenvolvimento, incluindo geração de código, resolução de problemas técnicos e documentação. A IA foi utilizada como ferramenta de desenvolvimento, mas todas as decisões de design, arquitetura e implementação foram tomadas pelo desenvolvedor.</p>
      
      <h3>Licença</h3>
      <p>Este software está licenciado sob a <strong>ISC License</strong> - uma licença de código aberto gratuita e permissiva que permite uso comercial, modificação e distribuição.</p>
      
      <h3>Tecnologias Utilizadas</h3>
      <p>Electron, Node.js, yt-dlp, HTML, CSS, JavaScript</p>
    `
  },
  requirements: {
    title: 'Requisitos do Sistema',
    body: `
      <h3>Software Necessário</h3>
      <ul>
        <li><strong>yt-dlp:</strong> Ferramenta de linha de comando para download de vídeos do YouTube</li>
        <li><strong>Node.js:</strong> Runtime JavaScript (já incluído no Electron)</li>
      </ul>
      
      <h3>Como Instalar o yt-dlp</h3>
      
      <h4>Linux (Ubuntu/Debian):</h4>
      <code>sudo apt install yt-dlp</code>
      
      <h4>Ou via pip:</h4>
      <code>pip install yt-dlp</code>
      
      <h4>Verificar Instalação:</h4>
      <code>yt-dlp --version</code>
      
      <h3>Arquivo de Cookies</h3>
      <p>É necessário ter um arquivo de cookies (.txt) exportado do seu navegador. Veja a seção "Como obter Cookies" para instruções detalhadas.</p>
      
      <h3>Sistema Operacional</h3>
      <p>Compatível com Linux, Windows e macOS.</p>
    `
  },
  instructions: {
    title: 'Instruções de Uso',
    body: `
      <h3>Passo a Passo</h3>
      
      <ol>
        <li><strong>Obter o arquivo de cookies:</strong> Veja a seção "Como obter Cookies" para exportar o arquivo de cookies do seu navegador.</li>
        
        <li><strong>Selecionar o arquivo de cookies:</strong> Clique no botão "Selecionar" ao lado do campo "Arquivo de Cookies" e escolha o arquivo .txt exportado.</li>
        
        <li><strong>Inserir a URL do vídeo:</strong> Cole a URL completa do vídeo do YouTube no campo "URL do Vídeo do YouTube". O sistema irá buscar automaticamente o título do vídeo para pré-visualização.</li>
        
        <li><strong>Selecionar diretório de destino:</strong> Clique no botão "Selecionar" ao lado do campo "Diretório de Destino" e escolha onde deseja salvar o arquivo MP3.</li>
        
        <li><strong>Extrair áudio:</strong> Clique no botão "Extrair Áudio" para iniciar o processo. A barra de progresso mostrará o andamento do download e conversão.</li>
        
        <li><strong>Abrir o arquivo:</strong> Após a conclusão, um link aparecerá para abrir o arquivo MP3 no player padrão do sistema.</li>
      </ol>
      
      <h3>Dicas</h3>
      <ul>
        <li>Certifique-se de que o arquivo de cookies está atualizado (exportado recentemente)</li>
        <li>Alguns vídeos podem estar restritos e exigir autenticação válida</li>
        <li>O processo pode demorar dependendo do tamanho do vídeo e velocidade da conexão</li>
        <li>O arquivo será salvo com o nome do título do vídeo</li>
      </ul>
    `
  },
  cookies: {
    title: 'Como Obter o Arquivo de Cookies',
    body: `
      <h3>Método 1: Extensão "Get cookies.txt LOCALLY"</h3>
      
      <ol>
        <li><strong>Instalar a extensão:</strong>
          <ul>
            <li>Abra seu navegador (Chrome, Firefox, Edge, etc.)</li>
            <li>Vá até a loja de extensões do navegador</li>
            <li>Procure por "Get cookies.txt LOCALLY"</li>
            <li>Instale a extensão</li>
          </ul>
        </li>
        
        <li><strong>Fazer login no YouTube:</strong>
          <ul>
            <li>Acesse <code>youtube.com</code> e faça login na sua conta</li>
            <li>Certifique-se de estar autenticado corretamente</li>
          </ul>
        </li>
        
        <li><strong>Exportar os cookies:</strong>
          <ul>
            <li>Clique no ícone da extensão "Get cookies.txt LOCALLY" na barra de ferramentas</li>
            <li>Ou clique com o botão direito na página do YouTube e selecione a opção da extensão</li>
            <li>Escolha "Export" ou "Download cookies.txt"</li>
            <li>Salve o arquivo em um local de fácil acesso</li>
          </ul>
        </li>
      </ol>
      
      <h3>Método 2: Outras Extensões Similares</h3>
      <ul>
        <li><strong>cookies.txt:</strong> Outra extensão popular para exportar cookies</li>
        <li><strong>EditThisCookie:</strong> Permite visualizar e exportar cookies</li>
        <li><strong>Cookie-Editor:</strong> Editor de cookies com função de exportação</li>
      </ul>
      
      <h3>Método 3: Via Linha de Comando (Avançado)</h3>
      <p>Você também pode usar ferramentas como <code>curl</code> ou scripts Python para exportar cookies, mas o método mais simples é usar uma extensão do navegador.</p>
      
      <h3>Importante</h3>
      <ul>
        <li>O arquivo de cookies deve estar no formato <code>.txt</code> (formato Netscape)</li>
        <li>Exporte os cookies enquanto estiver logado no YouTube</li>
        <li>Os cookies expiram após algum tempo - exporte novamente se necessário</li>
        <li>Não compartilhe seu arquivo de cookies - ele contém suas credenciais de autenticação</li>
        <li>Use cookies atualizados para garantir que o download funcione corretamente</li>
      </ul>
      
      <h3>Links Úteis</h3>
      <ul>
        <li>Extensão Get cookies.txt LOCALLY: <a href="https://chrome.google.com/webstore" target="_blank">Chrome Web Store</a> ou <a href="https://addons.mozilla.org" target="_blank">Firefox Add-ons</a></li>
      </ul>
    `
  }
};

// Função para abrir modal
function openModal(content) {
  modalTitle.textContent = content.title;
  modalBody.innerHTML = content.body;
  modalOverlay.classList.add('active');
}

// Função para fechar modal
function closeModal() {
  modalOverlay.classList.remove('active');
}

// Event Listeners para os botões do menu
aboutBtn.addEventListener('click', () => openModal(modalContent.about));
requirementsBtn.addEventListener('click', () => openModal(modalContent.requirements));
instructionsBtn.addEventListener('click', () => openModal(modalContent.instructions));
cookiesBtn.addEventListener('click', () => openModal(modalContent.cookies));

// Fechar modal ao clicar no X ou fora do modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// Inicialização
updateExtractButton();
previewArea.style.display = 'none';
progressContainer.style.display = 'none';
statusMessage.style.display = 'none';
fileLinkContainer.style.display = 'none';

