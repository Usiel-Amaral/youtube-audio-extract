# Guia para Publicar no GitHub

## Passo 1: Criar repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository" (ou vá em https://github.com/new)
3. Preencha:
   - **Repository name**: `youtube-audio-extract`
   - **Description**: `Aplicativo cross-platform para extrair áudio MP3 de vídeos do YouTube`
   - Escolha se será público ou privado
   - **NÃO** marque "Initialize this repository with a README" (já temos um)
4. Clique em "Create repository"

## Passo 2: Executar os comandos no terminal

Execute os seguintes comandos no diretório do projeto:

```bash
# Inicializar o repositório git
git init

# Adicionar todos os arquivos (exceto os ignorados pelo .gitignore)
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: YouTube Audio Extract app"

# Adicionar o repositório remoto do GitHub
# SUBSTITUA 'seu-usuario' pelo seu nome de usuário do GitHub
git remote add origin https://github.com/seu-usuario/youtube-audio-extract.git

# Renomear a branch principal para 'main' (se necessário)
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

## Passo 3: Atualizar o package.json

Após criar o repositório, atualize a URL no `package.json` com o seu nome de usuário real do GitHub.

## Notas Importantes

- O arquivo `.gitignore` já está configurado para ignorar `node_modules/` e outros arquivos desnecessários
- O `README.md` já está criado com informações do projeto
- Certifique-se de ter o Git instalado: `git --version`
- Se pedir credenciais, use um Personal Access Token do GitHub (Settings > Developer settings > Personal access tokens)

