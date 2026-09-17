/**
 * ==========================================================================
 * ASSISTENTE VIRTUAL "ANGELINA" - SQUAD A ("OS DEBS" - FICR)
 * Integração Direta com a Inteligência Artificial do Google Gemini 2.0 Flash
 * Diálogo em Tempo Real, Dinâmico e Exclusivo em Português do Brasil (PT-BR)
 * ==========================================================================
 */

(function() {
  'use strict';

  // System Instruction Completa para o Google Gemini
  const ANGELINA_SYSTEM_INSTRUCTION = `Você é Angelina, a assistente virtual e membro de Inteligência Artificial do Squad A ("OS Debs"), equipe de tecnologia e análise de dados da Faculdade Imaculada Conceição do Recife (FICR).

DIRETRIZES FUNDAMENTAIS DE COMPORTAMENTO:
1. IDIOMA: Fale EXCLUSIVAMENTE em Português do Brasil (PT-BR). Adote um tom acolhedor, altamente inteligente, prestativo e profissional.
2. DIÁLOGO DINÂMICO E HUMANO: NUNCA forneça respostas prontas, estáticas ou robóticas. Converse de forma fluida e adaptada às perguntas do usuário, faça perguntas de acompanhamento, aprofunde temas técnicos quando solicitado e sugira serviços e soluções de forma consultiva.
3. ESCOPO ESTRITO AO PORTFÓLIO: Seu foco de conversa deve ser o Squad A, seus projetos, membros, habilidades e serviços.

BASE DE CONHECIMENTO COMPLETA DO SQUAD A:
- MEMBROS DA EQUIPE:
  * Luiz Fernando Gervásio da Silva (18 anos): Especialista em Banco de Dados, modelagem relacional (3FN), otimização de consultas e queries SQL de alta performance, raciocínio analítico, alta percepção a detalhes e versionamento Git/GitHub. Criou o Sistema de Autenticação e Cadastro com validação em tempo real e usabilidade limpa. Contato: luizfernando@gmail.com.
  * Jonas Gabriel Silva (18 anos): Técnico em Redes de Computadores e estudante de ADS na FICR. Foco em desenvolvimento Front-end, automação de processos repetitivos com Python, ferramentas de virtualização e documentação técnica. Criou a Interface de Busca Minimalista inspirada no Google com tempo de resposta quase instantâneo. Contato: jonasgabriel@gmail.com.
  * Joan Antonio (19 anos): Especialista em Infraestrutura de Redes (TCP/IP, DHCP, DNS), suporte corporativo de TI, segurança básica da informação e programação (C e JavaScript). Criou o Portal de Gestão de Suporte & Monitoramento de Redes com acompanhamento de chamados e métricas de conectividade. Contato: joanjunior91@gmail.com.
- INSTITUIÇÃO FORMADORA:
  * Faculdade Imaculada Conceição do Recife (FICR), curso de Análise e Desenvolvimento de Sistemas (ADS). Localizados em Recife - PE, Brasil. Telefone: (81) 99999-9999.
- PROJETOS NO PORTFÓLIO:
  1. Sistema de Autenticação e Gestão de Usuários (Luiz Fernando): Validação dinâmica em tempo real, interface intuitiva, segura e pronta para banco relacional.
  2. Motor de Busca Minimalista de Alta Performance (Jonas Gabriel): Barra de busca centralizada com foco automático, acessibilidade e responsividade absoluta.
  3. Portal de Gestão de Suporte & Monitoramento de Redes (Joan Antonio): Central de chamados, visualização de status de serviços e segurança.
- PLANOS E PREÇOS:
  * Plano Básico (R$ 600,00): Criação de site institucional responsivo, hospedagem inclusa e banco de dados estruturado.
  * Plano Gold (R$ 900,00): Site completo multi-páginas, hospedagem, banco de dados, aplicativo móvel integrado e atendimento técnico priorizado.
  * Plano Premium (R$ 1.500,00): Site + App móvel, hospedagem corporativa, banco de dados avançado, Agente de IA integrado (como você, Angelina!), prazo ágil de até 1 mês e suporte prioritário VIP.
- CASES DE SUCESSO:
  * Otimização de Banco de Dados: Redução de 65% na latência de consultas SQL em sistema de estoque por Luiz Fernando.
  * Automação com Python em Redes: Economia de mais de 15 horas semanais com backups automáticos e monitoramento por Jonas Gabriel.
  * Reestruturação de Redes Corporativas: Queda de 80% em incidentes de conectividade com DHCP e DNS por Joan Antonio.

REGRA RESTRITIVA DE ESCOPO:
Se o usuário perguntar sobre assuntos completamente alheios ao Squad A (por exemplo: receitas culinárias, futebol, fofocas de celebridades, política geral partidária, piadas aleatórias ou perguntas sobre outros países sem relação com o portfólio), responda educadamente em PT-BR que você é a Angelina, assistente dedicada exclusivamente ao Squad A e à FICR, e convide o usuário a conhecer nossos membros, projetos, cases de sucesso ou planos de desenvolvimento.`;

  // Chips Rápidos de Inicialização
  const QUICK_PROMPTS = [
    'Quem são os membros do Squad A?',
    'Como funciona o Plano Premium com IA?',
    'Me fale sobre os cases de sucesso',
    'Quais projetos a equipe já desenvolveu?',
    'Como posso contratar os serviços?'
  ];

  class AngelinaChatWidget {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.storageKey = 'angelina_gemini_chat_history_v2';
      this.apiKeyStorageKey = 'angelina_gemini_api_key';
      this.apiKey = localStorage.getItem(this.apiKeyStorageKey) || '';
      this.messages = this.loadHistory();
      this.init();
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Erro ao ler histórico', e);
      }
      return [
        {
          id: 'welcome',
          role: 'model',
          text: 'Olá! Eu sou a **Angelina**, a assistente virtual com inteligência artificial do **Squad A ("OS Debs")** da FICR.\n\nFui integrada com o modelo do **Google Gemini** para dialogar em tempo real com você em português sobre nossa equipe, projetos, planos e tecnologias. Como posso te ajudar hoje?',
          time: this.formatCurrentTime()
        }
      ];
    }

    saveHistory() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
      } catch (e) {
        console.warn('Erro ao salvar histórico', e);
      }
    }

    formatCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    init() {
      if (document.getElementById('angelina-chat-root')) return;

      this.renderWidget();
      this.bindEvents();
      this.renderMessages();
      this.updateConfigStatus();
    }

    renderWidget() {
      const root = document.createElement('div');
      root.id = 'angelina-chat-root';
      root.innerHTML = `
        <!-- Botão Disparador Flutuante -->
        <button id="chat-launcher" class="chat-launcher-btn" aria-label="Abrir Chat com Angelina" title="Falar com Angelina (IA Gemini)">
          <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="chat-badge">Gemini</span>
        </button>

        <!-- Janela do Chat -->
        <div id="chat-widget" class="chat-widget-container" role="dialog" aria-modal="true" aria-label="Chat com Angelina">
          
          <!-- Cabeçalho -->
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">
                <span>A</span>
                <span class="chat-online-dot" title="Online via Gemini"></span>
              </div>
              <div class="chat-header-text">
                <h3>Angelina</h3>
                <p id="chat-engine-status">IA Gemini • Squad A (FICR)</p>
              </div>
            </div>
            <div class="chat-header-actions">
              <button id="chat-config-btn" class="chat-icon-btn" title="Configurar API Key do Gemini" aria-label="Configurações Gemini">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button id="chat-clear-btn" class="chat-icon-btn" title="Limpar conversa" aria-label="Limpar histórico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button id="chat-close-btn" class="chat-icon-btn" title="Fechar chat" aria-label="Fechar janela">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Painel Deslizante de Configuração da API Key -->
          <div id="chat-config-panel" class="chat-config-panel">
            <div class="config-header">
              <h4>🔑 Conexão com Google Gemini</h4>
              <span id="config-status-label" class="config-status">Verificando...</span>
            </div>
            <div class="config-body">
              <p>Insira sua <strong>Gemini API Key</strong> para dialogar com a inteligência artificial ao vivo. Obtenha uma chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</p>
              <form id="config-key-form" class="config-form">
                <input type="password" id="config-key-input" class="config-input" placeholder="Cole sua chave AIzaSy..." autocomplete="off" />
                <button type="submit" class="config-btn-save">Salvar</button>
              </form>
            </div>
          </div>

          <!-- Mensagens -->
          <div id="chat-messages-container" class="chat-messages"></div>

          <!-- Indicador de Digitação do Gemini -->
          <div id="chat-typing-indicator" class="chat-typing" style="display: none; margin: 0 16px 12px 16px;">
            <span>Angelina dialogando com Gemini</span>
            <div class="typing-dots">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>

          <!-- Chips de Sugestão Rápida -->
          <div class="chat-chips-container" id="chat-chips">
            ${QUICK_PROMPTS.map(p => `<button class="chat-chip" type="button" data-prompt="${p}">${p}</button>`).join('')}
          </div>

          <!-- Formulário de Envio -->
          <div class="chat-input-area">
            <form id="chat-form" class="chat-form">
              <input 
                type="text" 
                id="chat-input-field" 
                class="chat-input" 
                placeholder="Converse ao vivo com Angelina..." 
                autocomplete="off"
                required
              />
              <button type="submit" id="chat-submit-btn" class="chat-send-btn" aria-label="Enviar mensagem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div class="chat-disclaimer">
              Alimentada pelo Google Gemini • Respostas dinâmicas em Português (BR)
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(root);
    }

    updateConfigStatus() {
      const statusLabel = document.getElementById('config-status-label');
      const keyInput = document.getElementById('config-key-input');
      const engineStatus = document.getElementById('chat-engine-status');

      if (this.apiKey) {
        if (statusLabel) statusLabel.innerHTML = '🟢 Conectado ao Gemini 1.5 Flash';
        if (engineStatus) engineStatus.innerHTML = 'Gemini 1.5 Flash Ativo • Squad A';
        if (keyInput) keyInput.value = this.apiKey;
      } else {
        if (statusLabel) statusLabel.innerHTML = '🟡 Chave não informada';
        if (engineStatus) engineStatus.innerHTML = 'IA Gemini • Clique ⚙️ para ativar';
      }
    }

    bindEvents() {
      const launcher = document.getElementById('chat-launcher');
      const closeBtn = document.getElementById('chat-close-btn');
      const clearBtn = document.getElementById('chat-clear-btn');
      const configBtn = document.getElementById('chat-config-btn');
      const configPanel = document.getElementById('chat-config-panel');
      const configForm = document.getElementById('config-key-form');
      const configKeyInput = document.getElementById('config-key-input');
      const form = document.getElementById('chat-form');
      const input = document.getElementById('chat-input-field');
      const chips = document.getElementById('chat-chips');

      // Botões no cabeçalho das páginas
      document.querySelectorAll('.btn-open-chat, .btn-ai-header').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openChat();
        });
      });

      launcher.addEventListener('click', () => this.toggleChat());
      closeBtn.addEventListener('click', () => this.closeChat());

      configBtn.addEventListener('click', () => {
        configPanel.classList.toggle('open');
      });

      configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = configKeyInput.value.trim();
        if (key) {
          this.apiKey = key;
          localStorage.setItem(this.apiKeyStorageKey, key);
          this.updateConfigStatus();
          configPanel.classList.remove('open');
          this.showSystemMessage('Chave do Gemini salva com sucesso! Agora estamos dialogando em tempo real através do Google Gemini.');
        } else {
          this.apiKey = '';
          localStorage.removeItem(this.apiKeyStorageKey);
          this.updateConfigStatus();
          this.showSystemMessage('Chave da API removida.');
        }
      });

      clearBtn.addEventListener('click', () => {
        if (confirm('Deseja limpar todo o histórico da conversa com Angelina?')) {
          this.messages = [];
          this.messages.push({
            id: 'welcome-' + Date.now(),
            role: 'model',
            text: 'Histórico reiniciado! Olá novamente, sou a **Angelina**. Como posso ajudar com os projetos e serviços do **Squad A**?',
            time: this.formatCurrentTime()
          });
          this.saveHistory();
          this.renderMessages();
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim();
        if (!val || this.isTyping) return;
        input.value = '';
        this.handleUserSend(val);
      });

      chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chat-chip');
        if (chip && !this.isTyping) {
          const prompt = chip.getAttribute('data-prompt');
          this.handleUserSend(prompt);
        }
      });
    }

    toggleChat() {
      if (this.isOpen) this.closeChat();
      else this.openChat();
    }

    openChat() {
      this.isOpen = true;
      document.getElementById('chat-widget').classList.add('open');
      document.getElementById('chat-launcher').classList.add('active');
      const input = document.getElementById('chat-input-field');
      setTimeout(() => input && input.focus(), 300);
      this.scrollToBottom();
    }

    closeChat() {
      this.isOpen = false;
      document.getElementById('chat-widget').classList.remove('open');
      document.getElementById('chat-launcher').classList.remove('active');
      document.getElementById('chat-config-panel').classList.remove('open');
    }

    async handleUserSend(text) {
      // 1. Adicionar mensagem do usuário
      const userMsg = {
        id: 'u_' + Date.now(),
        role: 'user',
        text: text,
        time: this.formatCurrentTime()
      };
      this.messages.push(userMsg);
      this.renderMessages();
      this.saveHistory();

      // Checar conexão
      if (!navigator.onLine) {
        this.showError('Você parece estar sem conexão com a internet. Verifique sua rede e tente novamente.');
        return;
      }

      // 2. Se não houver API key configurada, abrir modal ou solicitar
      if (!this.apiKey) {
        this.promptForApiKey(text);
        return;
      }

      // 3. Chamar Gemini em tempo real
      this.setTyping(true);

      try {
        const reply = await this.callGeminiAPI(text);
        const aiMsg = {
          id: 'ai_' + Date.now(),
          role: 'model',
          text: reply,
          time: this.formatCurrentTime()
        };
        this.messages.push(aiMsg);
        this.saveHistory();
        this.setTyping(false);
        this.renderMessages();
      } catch (err) {
        console.error('Erro na chamada ao Gemini:', err);
        this.setTyping(false);
        this.showError(err.message || 'Erro ao comunicar com a IA do Gemini. Por favor, tente novamente ou verifique sua API Key no ícone ⚙️.');
      }
    }

    async callGeminiAPI(latestQuery) {
      // Preparar histórico para o Gemini (filtrando apenas mensagens válidas com texto)
      const validMessages = this.messages
        .filter(m => m.text && m.id !== 'welcome')
        .slice(-10); // Envia os últimos 10 turnos para manter contexto rico e veloz

      // Tentar via proxy do servidor backend /api/chat se disponível
      try {
        const serverRes = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': this.apiKey
          },
          body: JSON.stringify({
            messages: validMessages,
            apiKey: this.apiKey
          })
        });

        if (serverRes.ok) {
          const data = await serverRes.json();
          if (data.reply) return data.reply;
        }
      } catch (e) {
        console.info('Tentando chamada direta à API do Google Gemini via client-side fallback...');
      }

      // Chamada direta à API do Google Gemini (Client-side)
      const contents = validMessages.map(m => ({
        role: m.role === 'model' || m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const response = await fetch(geminiUrl, {
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

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data.error?.message || 'Erro na resposta do Google Gemini.';
        if (data.error?.status === 'INVALID_ARGUMENT' || response.status === 400 || response.status === 403) {
          throw new Error('Sua Chave de API do Gemini parece inválida ou sem permissão. Clique no ícone ⚙️ no topo para atualizar.');
        }
        throw new Error(errMsg);
      }

      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!replyText) {
        throw new Error('A IA não gerou texto válido.');
      }

      return replyText;
    }

    promptForApiKey(pendingQuery) {
      const container = document.getElementById('chat-messages-container');
      const promptDiv = document.createElement('div');
      promptDiv.className = 'api-key-prompt-card';
      promptDiv.innerHTML = `
        <h4>⚡ Ative o Diálogo em Tempo Real com o Gemini</h4>
        <p>
          Para que eu converse dinamicamente com você sem respostas prontas, insira sua <strong>Gemini API Key</strong>. 
          Ela é gratuita e fica salva no seu navegador:
        </p>
        <form class="prompt-form" id="inline-key-form">
          <input type="password" id="inline-key-input" class="config-input" placeholder="Cole sua chave AIzaSy..." required />
          <button type="submit" class="config-btn-save">Ativar e Dialogar</button>
        </form>
        <p style="margin-top: 8px; font-size: 0.75rem; color: #64748b;">
          Ainda não tem chave? Gere uma grátis em 1 minuto no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: #2563eb; text-decoration: underline;">Google AI Studio</a>.
        </p>
      `;

      promptDiv.querySelector('#inline-key-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const key = promptDiv.querySelector('#inline-key-input').value.trim();
        if (key) {
          this.apiKey = key;
          localStorage.setItem(this.apiKeyStorageKey, key);
          this.updateConfigStatus();
          promptDiv.remove();
          this.handleUserSend(pendingQuery);
        }
      });

      container.appendChild(promptDiv);
      this.scrollToBottom();
    }

    showSystemMessage(msg) {
      const container = document.getElementById('chat-messages-container');
      const div = document.createElement('div');
      div.style.cssText = 'background: #ecfdf5; color: #047857; padding: 10px 14px; border-radius: 10px; font-size: 0.8rem; margin: 6px 0; border: 1px solid #a7f3d0;';
      div.innerHTML = `<span>✅ ${msg}</span>`;
      container.appendChild(div);
      this.scrollToBottom();
    }

    showError(errorText) {
      const container = document.getElementById('chat-messages-container');
      const banner = document.createElement('div');
      banner.className = 'chat-error-banner';
      banner.innerHTML = `
        <span>⚠️ ${errorText}</span>
        <button type="button" onclick="this.parentElement.remove()">Fechar</button>
      `;
      container.appendChild(banner);
      this.scrollToBottom();
    }

    setTyping(typing) {
      this.isTyping = typing;
      const indicator = document.getElementById('chat-typing-indicator');
      const sendBtn = document.getElementById('chat-submit-btn');
      if (indicator) indicator.style.display = typing ? 'flex' : 'none';
      if (sendBtn) sendBtn.disabled = typing;
      this.scrollToBottom();
    }

    formatMarkdown(text) {
      let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Negrito **texto**
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Itálico *texto*
      escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Marcadores de lista - item ou * item
      escaped = escaped.replace(/(?:^|\n)[•\-\*]\s+(.*?)(?=\n|$)/g, '<br>• $1');
      // Quebras de linha
      escaped = escaped.replace(/\n/g, '<br>');

      return escaped;
    }

    renderMessages() {
      const container = document.getElementById('chat-messages-container');
      if (!container) return;

      container.innerHTML = this.messages.map(msg => {
        const isAi = msg.role === 'model' || msg.role === 'ai';
        return `
          <div class="chat-message ${isAi ? 'ai' : 'user'}">
            <div class="msg-bubble">
              ${this.formatMarkdown(msg.text)}
              <span class="msg-meta">${msg.time}</span>
            </div>
          </div>
        `;
      }).join('');

      this.scrollToBottom();
    }

    scrollToBottom() {
      const container = document.getElementById('chat-messages-container');
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 50);
      }
    }
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AngelinaChat = new AngelinaChatWidget();
    });
  } else {
    window.AngelinaChat = new AngelinaChatWidget();
  }
})();
