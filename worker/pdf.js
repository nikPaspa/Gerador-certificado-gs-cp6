const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { listeners } = require('process');

async function gerarPDF(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', landscape: true });
  await browser.close();
  return pdfBuffer;
}


let diplomaHTML = fs.readFileSync(path.join(__dirname, 'diploma.html'), 'utf-8');


const placeholders = {
  "{{nome}}": "Nikolas De Oliveira Paspaltzis",
  "{{nacionalidade}}": "Brasileiro",
  "{{estado}}": "São Paulo",
  "{{data_nascimento}}": "27/04/2001",
  "{{documento}}": "16.519.320-7",
  "{{data_conclusao}}": "15/12/2025",
  "{{curso}}": "Sistemas de Informação",
  "{{carga_horaria}}": "400",
  "{{data_emissao}}": "20/01/2026",
  "{{nome_assinatura}}": "Maria Pereira",
  "{{cargo}}": "Diretora Acadêmica"
};

for (const [placeholder, value] of Object.entries(placeholders)) {
    diplomaHTML = diplomaHTML.replace(new RegExp(placeholder, 'g'), value);
}

(async () => {
  const pdfBuffer = await gerarPDF(diplomaHTML);
  fs.writeFileSync(path.join(__dirname, 'certificado.pdf'), pdfBuffer);
  console.log('PDF gerado com sucesso: certificado.pdf');
})();



console.log(diplomaHTML);