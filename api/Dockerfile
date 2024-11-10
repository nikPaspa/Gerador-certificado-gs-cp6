# Usar a imagem oficial do Node.js
FROM node:14

# Criar e definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar o package.json e o package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install puppeteer
RUN npm install fs
RUN npm install path
RUN npm install process
RUN npm install body-parser
RUN npm install mysql2
RUN npm install amqplib
RUN npm install express

# Copiar o restante do código
COPY . .

# Expor a porta em que o app irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"]
