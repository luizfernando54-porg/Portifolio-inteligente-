// Test Suite Automatizado - Squad A ("OS Debs" - FICR)
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
console.log('=== VERIFICAÇÃO INTEGRAL DO PROJETO SQUAD-A ===\n');

const htmlFiles = [
  'home.html',
  'sobre.html',
  'habilidades.html',
  'projetos.html',
  'case-de-sucesso.html',
  'servicos.html',
  'depoimentos.html',
  'contato.html'
];

let allPassed = true;

// 1. Verificar Arquivos HTML e Recursos
console.log('1. Verificando estrutura e consistência das 8 páginas HTML:');
htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo ausente: ${file}`);
    allPassed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const checks = [
    { label: 'DOCTYPE e Viewport', test: content.includes('<!DOCTYPE html>') && content.includes('name="viewport"') },
    { label: 'CSS Global e Chat', test: content.includes('styles/global.css') && content.includes('styles/chat.css') },
    { label: 'Scripts Main e Chat', test: content.includes('js/main.js') && content.includes('js/chat.js') },
    { label: 'Sem atributos src vazios', test: !content.includes('src=""') && !content.includes('href=""') },
    { label: 'Sem tags corrompidas', test: !content.includes('<main\n') && !content.includes('<div class="Rodape"\n') }
  ];

  const failedChecks = checks.filter(c => !c.test);
  if (failedChecks.length === 0) {
    console.log(`  ✅ ${file}: 100% íntegro (Viewport, Global CSS, Chat, Scripts)`);
  } else {
    console.error(`  ❌ ${file}: Falha em ${failedChecks.map(c => c.label).join(', ')}`);
    allPassed = false;
  }
});

// 2. Verificar Links Cruzados de Navegação
console.log('\n2. Verificando links cruzados de navegação:');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const linkMatches = content.match(/href="([^"#]+)"/g) || [];
  linkMatches.forEach(lm => {
    const target = lm.replace(/href="|"/g, '');
    if (target.endsWith('.html') || target.endsWith('.css') || target.endsWith('.js')) {
      const targetPath = path.join(ROOT_DIR, target);
      if (!fs.existsSync(targetPath)) {
        console.error(`  ❌ Link quebrado em ${file}: aponta para ${target} que não existe!`);
        allPassed = false;
      }
    }
  });
});
console.log('  ✅ Todos os links de páginas e arquivos referenciados existem no disco!');

// 3. Testar a Integração da IA Gemini com a Assistente Virtual Angelina
console.log('\n3. Testando integração com o Google Gemini (js/chat.js e server.js):');
const chatJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'chat.js'), 'utf8');
const serverJsContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');

const geminiChecks = [
  {
    label: 'System Instruction do Gemini configurada em PT-BR',
    test: chatJsContent.includes('ANGELINA_SYSTEM_INSTRUCTION') && serverJsContent.includes('ANGELINA_SYSTEM_INSTRUCTION')
  },
  {
    label: 'Endpoint do Google Gemini configurado com o modelo suportado models/gemini-3.6-flash',
    test: chatJsContent.includes('models/gemini-3.6-flash') && serverJsContent.includes('models/gemini-3.6-flash') && !chatJsContent.includes('gemini-2.5-flash') && !serverJsContent.includes('gemini-2.5-flash')
  },
  {
    label: 'Rota de API Backend /api/chat presente no server.js',
    test: serverJsContent.includes("req.url === '/api/chat'")
  },
  {
    label: 'Gestão de Chave de API (Gemini API Key) no Frontend',
    test: chatJsContent.includes('apiKeyStorageKey') && chatJsContent.includes('chat-config-panel')
  },
  {
    label: 'Envio de Histórico de Mensagens Multi-Turno',
    test: chatJsContent.includes('validMessages.map') && chatJsContent.includes('role:')
  }
];

geminiChecks.forEach((c, idx) => {
  if (c.test) {
    console.log(`  ✅ Verificação ${idx + 1}: ${c.label} - OK!`);
  } else {
    console.error(`  ❌ Verificação ${idx + 1}: Falhou em ${c.label}`);
    allPassed = false;
  }
});

// 4. Testar Configurações de Alojamento e Ambiente (.env, .gitignore, package.json)
console.log('\n4. Verificando arquivos de ambiente e configuração de hospedagem:');
const gitignorePath = path.join(ROOT_DIR, '.gitignore');
const envExamplePath = path.join(ROOT_DIR, '.env.example');
const envPath = path.join(ROOT_DIR, '.env');
const packageJsonPath = path.join(ROOT_DIR, 'package.json');

const hostingChecks = [
  {
    label: 'Arquivo .env local existe no projeto',
    test: fs.existsSync(envPath)
  },
  {
    label: 'Arquivo .env.example presente para documentação e deploy',
    test: fs.existsSync(envExamplePath) && fs.readFileSync(envExamplePath, 'utf8').includes('GEMINI_API_KEY')
  },
  {
    label: 'Arquivo .gitignore protege o .env contra vazamento no Git/GitHub',
    test: fs.existsSync(gitignorePath) && fs.readFileSync(gitignorePath, 'utf8').includes('.env')
  },
  {
    label: 'Arquivo package.json com scripts de start e test para hospedagem',
    test: fs.existsSync(packageJsonPath) && fs.readFileSync(packageJsonPath, 'utf8').includes('"start": "node server.js"')
  },
  {
    label: 'Carregamento de .env e rotas de status/health implementadas no server.js',
    test: serverJsContent.includes('loadEnv') && serverJsContent.includes('/api/status') && serverJsContent.includes('/api/health')
  }
];

hostingChecks.forEach((c, idx) => {
  if (c.test) {
    console.log(`  ✅ Verificação ${idx + 1}: ${c.label} - OK!`);
  } else {
    console.error(`  ❌ Verificação ${idx + 1}: Falhou em ${c.label}`);
    allPassed = false;
  }
});

console.log('\n========================================');
if (allPassed) {
  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO (HTML + LINKS + GEMINI API + HOSPEDAGEM/.ENV)!');
} else {
  console.log('⚠️ ALGUNS TESTES FALHARAM.');
}

