const { chromium } = require('playwright');

const TARGET_URL = 'https://crm-lovable-pp.vercel.app';

(async () => {
  console.log('🤖 Iniciando Robô de Teste E2E...');
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('pageerror', exception => {
    errors.push(`[RUNTIME ERROR] ${exception}`);
    console.log(`❌ ERRO CAPTURADO: ${exception}`);
  });

  console.log(`Navegando para o ambiente de produção: ${TARGET_URL}`);
  await page.goto(TARGET_URL);
  
  // Vamos dar um tempo pro usuário logar, caso esteja deslogado
  console.log(`\n⏳ ATENÇÃO: Se aparecer tela de Login, você tem 20 SEGUNDOS para colocar seu e-mail e senha e entrar!`);
  
  try {
    // Tenta esperar até entrar no dashboard ou outra página autenticada
    await page.waitForTimeout(15000); // tempo fixo provisório
    
    // Captura os botões da sidebar/menu para testar cada página do CRM
    console.log('🔍 Coletando links visíveis no menu lateral...');
    
    // Procura todos os links que apontam para páginas internas
    const links = await page.locator('a[href^="/"]').all();
    const urlsToVisit = [];
    
    for(const link of links) {
        const href = await link.getAttribute('href');
        if(href && href !== '/' && href !== '/login' && !urlsToVisit.includes(href)) {
            urlsToVisit.push(href);
        }
    }
    
    console.log(`Encontradas ${urlsToVisit.length} páginas internas para testar: ${urlsToVisit.join(', ')}`);
    
    for (const href of urlsToVisit) {
      console.log(`➡️ Testando página: ${href}`);
      await page.goto(`${TARGET_URL}${href}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // espera renderizar os dados do supabase
      
      // tira screenshot da página renderizada para o usuário conferir depois
      const fileName = `C:\\Users\\Pichau\\Desktop\\AGORASIMEIN\\crm-lovable-pp\\crm-lovable-pp-main\\screenshot-${href.replace(/\\//g,'_')}.png`;
      try {
        await page.screenshot({ path: fileName, fullPage: true });
        console.log(`📸 Captura salva: ${fileName}`);
      } catch(e) {
        // ignora erro de screenshot
      }
    }

  } catch(e) {
    console.log(`Algum erro na navegação estrutural: ${e.message}`);
  }
  
  console.log('\n=========================================');
  console.log('RESULTADO DO TESTE PELA PLATAFORMA TODA:');
  
  if (errors.length > 0) {
    console.log('❌ FORAM ENCONTRADOS ERROS FATAIS ("Telas Brancas"):');
    console.log(errors.join('\n'));
  } else {
    console.log('✅ NENHUM ERRO CRÍTICO/TELA BRANCA ENCONTRADO! O CRM SOBREVIVEU AO CLICK-TEST!');
  }
  console.log('=========================================');

  console.log('Fechando navegador em 10 segundos...');
  await page.waitForTimeout(10000);
  await browser.close();
})();
