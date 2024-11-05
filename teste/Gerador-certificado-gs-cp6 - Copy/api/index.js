// index.js
const express = require('express');
const mysql = require('mysql2');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const fs = require('fs');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

// Conexão com o MySQL
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

// Função para gerar o PDF
async function gerarPdf(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', landscape: true });
  await browser.close();
  return pdf;
}

// Função para enviar mensagem para RabbitMQ
async function sendToQueue(message) {
  try {
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    const channel = await connection.createChannel();
    const queue = 'diplomasQueue';
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (error) {
    console.error("Erro ao enviar mensagem para fila:", error);
  }
}

// Endpoint para processar diploma
app.post('/diploma', async (req, res) => {
  const { nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, assinaturas, template_diploma } = req.body;

  // Lendo o template HTML
  const templateHtml = fs.readFileSync('certificado.html', 'utf8');
  const template = Handlebars.compile(templateHtml);
  const htmlContent = template({
    nome: nome_aluno,
    nacionalidade,
    estado: naturalidade,
    data_nascimento,
    documento: numero_rg,
    data_conclusao,
    curso: nome_curso,
    carga_horaria: '360',
    data_emissao,
    nome_assinatura: assinaturas[0]?.nome,
    cargo: assinaturas[0]?.cargo
  });

  // Gerar PDF
  const pdfBuffer = await gerarPdf(htmlContent);

  // Salvando o PDF localmente
  const pdfPath = `./certificados/${nome_aluno.replace(/\s+/g, '_')}_certificado.pdf`;
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Inserir dados no MySQL
  const query = `INSERT INTO diplomas (nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, template_diploma) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  connection.query(query, [nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, template_diploma], (err, result) => {
    if (err) {
      console.error("Erro ao salvar no MySQL:", err);
      return res.status(500).send('Erro ao salvar no banco de dados.');
    }

    // Enviar dados para a fila RabbitMQ
    sendToQueue(req.body);

    res.status(200).send('Dados recebidos e processados com sucesso.');
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
