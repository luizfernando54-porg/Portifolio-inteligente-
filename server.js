/**
 * Servidor HTTP Local e Hospedagem com API Proxy para Google Gemini
 * Squad A - "OS Debs" (FICR)
 * 
 * Uso: node server.js ou npm start
 * Acesse: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Carregamento robusto e nativo de variáveis de ambiente do arquivo .env
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    if (typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(envPath);
        return;
      } catch (e) {
        // Prossegue para o parser de fallback se necessário
      }
    }
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      });
    } catch (err) {
      console.warn('Aviso: erro ao carregar variáveis do .env:', err.message);
    }
  }
})();

const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const ANGELINA_SYSTEM_INSTRUCTION = `Você é Angelina, a assistente virtual e membro de Inteligência Artificial do Squad A ("OS Debs"), uma equipe de desenvolvedores da Faculdade Imaculada Conceição do Recife (FICR).

DIRETRIZES FUNDAMENTAIS:
1. IDIOMA: Responda EXCLUSIVAMENTE em Português do Brasil (PT-BR), com tom caloroso, prestativo, profissional e inteligente.
2. DIÁLOGO DINÂMICO: NUNCA dê respostas pré-fabricadas ou robóticas. Dialogue naturalmente com o usuário, raciocine sobre o que ele perguntou, responda com riqueza de detalhes e faça perguntas de acompanhamento ou sugestões pertinentes quando fizer sentido.
3. ESCOPO ESTRITO: Seu conhecimento e atuação são rigorosamente focados no portfólio, projetos, equipe e serviços do Squad A.

BASE DE CONHECIMENTO COMPLETA DO SQUAD A:
- MEMBROS DA EQUIPE:
  * Luiz Fernando Gervásio da Silva (18 anos): Especialista em Banco de Dados, modelagem relacional de dados, otimização de consultas e queries SQL, raciocínio analítico, alta percepção a detalhes e versionamento Git/GitHub. Criou o Sistema de Autenticação e Cadastro com validação em tempo real e usabilidade. Contato: luizfernando@gmail.com.
  * Jonas Gabriel Silva (18 anos): Técnico em Redes de Computadores, foco em Front-end, automação de rotinas com Python, virtualização, segurança básica e documentação técnica. Criou a Interface de Busca Minimalista de alta velocidade inspirada no Google. Contato: jonasgabriel@gmail.com.
  * Joan Antonio (19 anos): Especialista em Infraestrutura de Redes (TCP/IP, DHCP, DNS), suporte corporativo de TI, manutenção de hardware/software e lógica de programação (C e JavaScript). Criou o Portal de Gestão de Suporte & Monitoramento de Redes. Contato: joanjunior91@gmail.com.
- INSTITUIÇÃO:
  * Faculdade Imaculada Conceição do Recife (FICR), curso de Análise e Desenvolvimento de Sistemas (ADS). Localização: Recife - PE, Brasil. Telefone: (81) 99999-9999.
- PROJETOS:
  1. Sistema de Autenticação e Cadastro (Luiz Fernando): Validação em tempo real, interface intuitiva e segura, estruturada para persistência em SQL relacional.
  2. Interface de Busca Minimalista (Jonas Gabriel): Foco automático, responsividade total, design minimalista e código ultra otimizado.
  3. Portal de Suporte & Monitoramento de Redes (Joan Antonio): Central de chamados, checagem de conectividade DNS/DHCP e gestão de incidentes.
- PLANOS E SERVIÇOS:
  * Plano Básico (R$ 600,00): Criação de site institucional responsivo, hospedagem inclusa e banco de dados estruturado.
  * Plano Gold (R$ 900,00): Site completo multi-páginas, hospedagem, banco de dados, aplicativo móvel integrado e atendimento técnico priorizado.
  * Plano Premium (R$ 1.500,00): Site completo + Aplicativo Móvel, hospedagem corporativa, banco de dados avançado, Agente de Inteligência Artificial integrado (como você!), prazo acelerado de até 1 mês para grandes projetos e atendimento prioritário VIP.
- CASES DE SUCESSO:
  * Otimização de Banco de Dados: Redução de 65% na latência de consultas e relatórios gerados em milissegundos por Luiz Fernando.
  * Automação com Python em Redes: Economia de 15 horas semanais e zero perda de dados em rotinas de backup por Jonas Gabriel.
  * Reestruturação de Topologia de Rede: Queda de 80% em falhas de conectividade com DHCP segmentado e DNS por Joan Antonio.

REGRA DE FRONTEIRA:
Se o usuário perguntar algo totalmente fora do portfólio (por exemplo: receitas de culinária, política partidária, previsões de loteria, fofocas, etc.), recuse educadamente em português explicando que você é a Angelina, a assistente do Squad A ("OS Debs"), e convide o usuário a conhecer mais sobre os membros, habilidades, projetos ou planos da equipe.`;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota de Status da IA e Servidor: GET /api/status
  if (req.method === 'GET' && req.url === '/api/status') {
    const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'online',
      hasServerKey: hasServerKey,
      model: GEMINI_MODEL,
      version: '1.0.0'
    }));
    return;
  }

  // Rota de Health Check para Plataformas de Hospedagem: GET /api/health
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Rota de API do Chat com Gemini: POST /api/chat
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userApiKey = req.headers['x-gemini-key'] || payload.apiKey || process.env.GEMINI_API_KEY;

        if (!userApiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            error: 'MISSING_KEY',
            message: 'Chave de API do Gemini não configurada. Defina GEMINI_API_KEY no arquivo .env do servidor ou insira no ícone ⚙️ do chat.'
          }));
          return;
        }

        const rawMessages = payload.messages || [];
        if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'INVALID_MESSAGES', message: 'Nenhuma mensagem enviada.' }));
          return;
        }

        // Formatar histórico para a API do Gemini
        const contents = rawMessages.map(m => ({
          role: m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text || m.content || '' }]
        }));

        // Lista de modelos suportados para garantir compatibilidade resiliente
        const requestedModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const candidateModels = [
          requestedModel,
          'gemini-2.5-flash',
          'gemini-2.0-flash'
        ].filter((m, i, arr) => m && arr.indexOf(m) === i);

        let candidateText = null;
        let successfulModel = requestedModel;
        let lastErrorMsg = '';

        for (const modelToTry of candidateModels) {
          try {
            // Endpoint padrão do Google Gemini: models/gemini-2.5-flash:generateContent
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelToTry)}:generateContent?key=${encodeURIComponent(userApiKey)}`;

            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: ANGELINA_SYSTEM_INSTRUCTION }]
                },
                contents: contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000
                }
              })
            });

            const geminiData = await geminiResponse.json();

            if (!geminiResponse.ok) {
              const errMsg = geminiData.error?.message || 'Erro ao comunicar com o Google Gemini.';
              lastErrorMsg = errMsg;
              // Se o modelo for 404/não suportado no v1beta, tenta automaticamente o próximo da lista
              if (geminiResponse.status === 404 || errMsg.includes('not found') || errMsg.includes('not supported')) {
                console.warn(`[Gemini API] Modelo ${modelToTry} não disponível. Tentando modelo alternativo...`);
                continue;
              }
              // Erro com chave de API (400/403) ou outro erro definitivo
              res.writeHead(geminiResponse.status, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: 'GEMINI_ERROR', message: errMsg }));
              return;
            }

            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              candidateText = text;
              successfulModel = modelToTry;
              break;
            }
          } catch (errLoop) {
            lastErrorMsg = errLoop.message;
          }
        }

        if (!candidateText) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'GEMINI_ERROR', message: lastErrorMsg || 'A IA não retornou texto válido.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ reply: candidateText, model: successfulModel }));
      } catch (err) {
        console.error('Erro no endpoint /api/chat:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Erro interno ao processar mensagem.' }));
      }
    });
    return;
  }

  // Servir Arquivos Estáticos
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/home.html';
  }

  const safePath = path.normalize(path.join(BASE_DIR, reqPath));
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Proibido');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Arquivo Não Encontrado');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor Squad A ativo em: http://localhost:${PORT}`);
  console.log(`🌍 Disponível para hospedagem em 0.0.0.0:${PORT}`);
  console.log(`✨ Rota Gemini API ativa em: POST /api/chat`);
  console.log(`📡 Status da IA: GET /api/status`);
  console.log(`🔑 Chave Gemini (.env): ${hasKey ? 'CONFIGURADA (Ativa)' : 'NÃO DETECTADA (Defina no .env ou no chat)'}`);
  console.log(`🧠 Modelo da IA: ${GEMINI_MODEL}`);
  console.log(`💬 Angelina dialogando em tempo real com o Gemini!`);
  console.log(`Pressione Ctrl+C para encerrar.`);
  console.log(`======================================================\n`);
});
