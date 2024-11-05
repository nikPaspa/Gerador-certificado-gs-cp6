# Dockerfile

# Usar imagem oficial do Node.js
FROM node:18

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código restante da aplicação
COPY . .

# Expor porta usada pelo servidor
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "index.js"]
