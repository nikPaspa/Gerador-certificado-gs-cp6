CREATE DATABASE IF NOT EXISTS Geradorcertificadogscp6;
USE Geradorcertificadogscp6;

CREATE TABLE IF NOT EXISTS diplomas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_aluno VARCHAR(255),
    data_conclusao DATE,
    nome_curso VARCHAR(255),
    carga_horaria INT,
    nacionalidade VARCHAR(255),
    estado VARCHAR(255),
    data_nascimento DATE,
    numero_rg VARCHAR(20),
    data_emissao DATE,
    template_diploma TEXT
);

CREATE TABLE IF NOT EXISTS assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diploma_id INT,
    cargo VARCHAR(255),
    nome VARCHAR(255),
    FOREIGN KEY (diploma_id) REFERENCES diplomas(id)
);

INSERT INTO diplomas
 (nome_aluno, data_conclusao, nome_curso, carga_horaria, nacionalidade, estado, data_nascimento, numero_rg, data_emissao) 
VALUES ('Nikolas De Oliveira Paspaltzis', '2025-12-15', 'Sistemas de Informação', '400', 'Brasileiro', 'São Paulo', '2001-04-27', '16.519.320-7', '2026-01-20');
INSERT INTO assinaturas (diploma_id, cargo, nome) VALUES (1, 'Diretora Acadêmica','Maria Pereira');