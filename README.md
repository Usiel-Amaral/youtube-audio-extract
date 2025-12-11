# YouTube Audio Extract

Aplicativo cross-platform desenvolvido com Electron para extrair áudio MP3 de vídeos do YouTube de forma simples e intuitiva.

## 📥 Download

### Instaladores Disponíveis

Baixe a versão **v1.0.0** para seu sistema operacional:

| Plataforma | Instalador | Status |
|------------|-----------|--------|
| 🐧 **Linux** | [AppImage](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/download/v1.0.0/YouTube.Audio.Extract-1.0.0.AppImage) • [Debian/Ubuntu (.deb)](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/download/v1.0.0/youtube-audio-extract_1.0.0_amd64.deb) | ✅ Disponível |
| 🪟 **Windows** | [aplicativo portátil](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/download/v1.0.0/YouTube.Audio.Extract.1.0.0.exe) | ✅ Disponível |
| 🍎 **macOS** | [Ver na página de Releases](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/tag/v1.0.0) | ⏳ Em breve |

👉 **[Ver todas as versões e downloads](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/tag/v1.0.0)**

### Instalação Rápida

1. Clique no link do instalador para sua plataforma acima
2. Ou acesse a [página de Releases v1.0.0](https://github.com/Usiel-Amaral/youtube-audio-extract/releases/tag/v1.0.0)
3. Baixe o instalador para seu sistema operacional
4. Execute o instalador e siga as instruções

**Nota:** Você também precisará ter o [yt-dlp](https://github.com/yt-dlp/yt-dlp) instalado no seu sistema.

**Versão atual:** v1.0.0

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
git clone https://github.com/Usiel-Amaral/youtube-audio-extract.git
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

Este projeto está licenciado sob a **ISC License** - uma licença de código aberto gratuita e permissiva.

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### O que a licença ISC permite:

- ✅ **Uso comercial**: Você pode usar este software em projetos comerciais
- ✅ **Modificação**: Você pode modificar o código como desejar
- ✅ **Distribuição**: Você pode distribuir o software livremente
- ✅ **Uso privado**: Você pode usar o software para qualquer propósito
- ✅ **Sem garantias**: O software é fornecido "como está", sem garantias

## 👤 Desenvolvedor

**Usiel Amaral**

- 📧 Email: suporte@usis.com.br
- 🐙 GitHub: [@Usiel-Amaral](https://github.com/Usiel-Amaral)

### Desenvolvido com Assistência de IA

Este projeto foi desenvolvido com a assistência de Inteligência Artificial (IA) para acelerar o processo de desenvolvimento, incluindo:
- Geração e otimização de código
- Resolução de problemas técnicos
- Documentação e estruturação do projeto
- Configuração de ferramentas

A IA foi utilizada como ferramenta de desenvolvimento, mas todas as decisões de design, arquitetura e implementação foram tomadas pelo desenvolvedor.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 📝 Melhorar a documentação
- 🔧 Enviar pull requests

Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🙏 Agradecimentos

- **yt-dlp**: Ferramenta essencial para download de vídeos do YouTube
- **Electron**: Framework que torna possível aplicações desktop cross-platform
- **Comunidade Open Source**: Por todas as ferramentas e bibliotecas utilizadas

---

**Nota**: Este projeto utiliza yt-dlp para realizar os downloads. Certifique-se de ter o yt-dlp instalado e atualizado no seu sistema.

