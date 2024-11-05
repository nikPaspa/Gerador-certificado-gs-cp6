const puppeteer = require('puppeteer');

async function gerarPDF(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4', landscape: true });
  await browser.close();
  return pdfBuffer;
}


const pdfBuffer = await gerarPDF(html);
fs.writeFileSync(path.join(__dirname, 'certificado.pdf'), pdfBuffer);
