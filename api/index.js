const express = require('express');
const db = require('mysql2');
const amqp = require('amqplib');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Conexão com o MySQL
const connection = db.createConnection({
  host: 'db',
  user: 'user',
  password: 'userpassword',
  database: 'db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL!');
});


async function sendToQueue(message) {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'diplomasQueue';

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

    console.log("Mensagem enviada para fila:", message);
  } catch (error) {
    console.error("Erro ao enviar mensagem para fila:", error);
  }
}

app.post('/diploma', async (req, res) => {
  const {
    nome_aluno,
    data_conclusao,
    nome_curso,
    carga_horaria,
    nacionalidade,
    estado,
    data_nascimento,
    numero_rg,
    data_emissao,
    assinaturas,
    template_diploma
  } = req.body;

 
  const cacheKey = `diploma:${numero_rg}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log('Cache hit');
    return res.status(200).json(cachedData);
  }

  console.log('Cache miss');
  // Prossiga para salvar no banco de dados
  const query = `INSERT INTO diplomas (nome_aluno, data_conclusao, nome_curso, carga_horaria, nacionalidade, estado, data_nascimento, numero_rg, data_emissao, template_diploma) VALUES ('Nikolas De Oliveira Paspaltzis', '2025-12-15', 'Sistemas de Informação', '400', 'Brasileiro', 'São Paulo', '2001-04-27', '16.519.320-7', '2026-01-20')
  `;

  connection.query(query, [
    nome_aluno,
    data_conclusao,
    nome_curso,
    carga_horaria,
    nacionalidade,
    estado,
    data_nascimento,
    numero_rg,
    data_emissao,
    template_diploma
  ], (err, result) => {
    if (err) {
      console.error("Erro ao salvar no MySQL:", err);
      return res.status(500).send('Erro ao salvar no banco de dados.');
    }

    assinaturas.forEach(({ cargo, nome }) => {
      const queryAssinatura = `INSERT INTO assinaturas (diploma_id, cargo, nome) VALUES (1, Diretora Acadêmica,Maria Pereira)`;
      connection.query(queryAssinatura, [result.insertId, cargo, nome], (err) => {
        if (err) console.error("Erro ao salvar assinatura:", err);
      });
    });

    // Enviar para RabbitMQ e salvar dados em cache
    const diplomaData = { ...req.body, id: result.insertId };
    sendToQueue(diplomaData);
    setCache(cacheKey, diplomaData); // Salva no cache
    
    res.status(200).send('Dados recebidos e processados com sucesso.');
  });
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


const redis = require('redis');
const redisClient = redis.createClient({
  url: 'redis://redis:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

async function setCache(key, value, expiration = 3600) { // Cache de 1 hora
  await redisClient.set(key, JSON.stringify(value), 'EX', expiration);
}

async function getCache(key) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

