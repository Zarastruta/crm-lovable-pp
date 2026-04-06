import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = [
  { name: 'Oswald-Medium', url: 'https://github.com/google/fonts/raw/main/ofl/oswald/static/Oswald-Medium.ttf' },
  { name: 'Oswald-Regular', url: 'https://github.com/google/fonts/raw/main/ofl/oswald/static/Oswald-Regular.ttf' },
  { name: 'Barlow-Regular', url: 'https://github.com/google/fonts/raw/main/ofl/barlow/Barlow-Regular.ttf' },
  { name: 'Barlow-Light', url: 'https://github.com/google/fonts/raw/main/ofl/barlow/Barlow-Light.ttf' }
];

const fontDir = __dirname;
const outputFile = path.join(fontDir, 'font-data.ts');

async function downloadFont(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFont(res.headers.location).then(resolve).catch(reject);
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    });
  });
}

async function run() {
  console.log('--- Iniciando download das fontes oficiais ---');
  let tsContent = '// Arquivo gerado automaticamente - Não editar manualmente\n\n';
  
  for (const font of fonts) {
    try {
      console.log(`Baixando ${font.name}...`);
      const buffer = await downloadFont(font.url);
      const base64 = buffer.toString('base64');
      tsContent += `export const ${font.name.replace('-', '_')}_B64 = "${base64}";\n\n`;
      console.log(`✓ ${font.name} convertido.`);
    } catch (err) {
      console.error(`✗ Erro ao processar ${font.name}:`, err.message);
    }
  }

  fs.writeFileSync(outputFile, tsContent);
  console.log(`\nArquivo gerado com sucesso: ${outputFile}`);
}

run();
