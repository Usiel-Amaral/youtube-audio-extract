# YouTube Audio Extract

Aplicativo cross-platform desenvolvido com Electron para extrair áudio MP3 de vídeos do YouTube de forma simples e intuitiva.

## 🚀 Características

- ✅ Interface gráfica moderna e intuitiva
- ✅ Extração de áudio MP3 de vídeos do YouTube
- ✅ Suporte a autenticação via cookies
- ✅ Preview do título do vídeo antes do download
- ✅ Barra de progresso em tempo real
- ✅ Abertura automática do arquivo no player padrão
- ✅ Compatível com Linux, Windows e macOS

## 📋 Requisitos

### Software Necessário

- **yt-dlp**: Ferramenta de linha de comando para download de vídeos
- **Node.js**: Runtime JavaScript (já incluído no Electron)

### Instalação do yt-dlp

#### Linux (Ubuntu/Debian):
```bash
sudo apt install yt-dlp
```

#### Ou via pip:
```bash
pip install yt-dlp
```

#### Verificar instalação:
```bash
yt-dlp --version
```

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/youtube-audio-extract.git
cd youtube-audio-extract
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação:
```bash
npm start
```

## 🎯 Como Usar

1. **Obter arquivo de cookies**: Exporte os cookies do seu navegador usando uma extensão como "Get cookies.txt LOCALLY" (veja instruções na aplicação)

2. **Selecionar arquivo de cookies**: Clique em "Selecionar" e escolha o arquivo .txt exportado

3. **Inserir URL do vídeo**: Cole a URL completa do vídeo do YouTube

4. **Selecionar diretório de destino**: Escolha onde deseja salvar o arquivo MP3

5. **Extrair áudio**: Clique em "Extrair Áudio" e aguarde a conclusão

6. **Abrir arquivo**: Após a conclusão, clique no link para abrir o arquivo no player padrão

## 📖 Obter Arquivo de Cookies

### Método Recomendado: Extensão "Get cookies.txt LOCALLY"

1. Instale a extensão no seu navegador (Chrome, Firefox, Edge, etc.)
2. Faça login no YouTube
3. Clique no ícone da extensão e exporte os cookies
4. Salve o arquivo .txt em um local de fácil acesso

Outras extensões similares:
- cookies.txt
- EditThisCookie
- Cookie-Editor

## 🛠️ Tecnologias Utilizadas

- **Electron**: Framework para aplicações desktop
- **Node.js**: Runtime JavaScript
- **yt-dlp**: Ferramenta de download de vídeos
- **HTML/CSS/JavaScript**: Interface e lógica da aplicação

## 📝 Estrutura do Projeto

```
youtube-audio-extract/
├── main.js          # Processo principal do Electron
├── renderer.js      # Lógica da interface
├── index.html       # Interface do usuário
├── styles.css       # Estilos da aplicação
├── package.json     # Configurações e dependências
└── README.md        # Este arquivo
```

## 🔧 Desenvolvimento

### Executar em modo de desenvolvimento:
```bash
npm start
```

## 📄 Licença

ISC

## 👤 Autor

Desenvolvido com ❤️ usando Electron

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Nota**: Este projeto utiliza yt-dlp para realizar os downloads. Certifique-se de ter o yt-dlp instalado e atualizado no seu sistema.

