/**
 * ==========================================================================
 * MAIN APPLICATION LOGIC - SQUAD A ("OS DEBS" - FICR)
 * Mobile Menu, Smooth UI Interactivity, Form Feedback & Global Helpers
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Fechar menu ao clicar em qualquer link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.innerHTML = '☰';
      });
    });
  }

  // 2. Header Box-Shadow on Scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Highlight Current Active Page in Navigation
  const currentPath = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'home.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Contact Form Validation and Toast Feedback (contato.html)
  const contactForm = document.querySelector('form.contact-form, .formulario form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nomeInput = contactForm.querySelector('#nome') || contactForm.querySelector('input[name="nome"]');
      const emailInput = contactForm.querySelector('#email') || contactForm.querySelector('input[name="email"]');
      const mensagemInput = contactForm.querySelector('#mensagem') || contactForm.querySelector('textarea[name="mensagem"]');

      const nome = nomeInput ? nomeInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const mensagem = mensagemInput ? mensagemInput.value.trim() : '';

      if (!nome || !email || !mensagem) {
        showToast('Por favor, preencha todos os campos antes de enviar.', 'error');
        return;
      }

      // Feedback visual de carregamento
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Enviar';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
        contactForm.reset();
        showToast(`Obrigado pelo contato, ${nome}! Sua mensagem foi enviada com sucesso à equipe do Squad A.`, 'success');
      }, 900);
    });
  }

  // 5. Toast Notification Component
  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 90px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 360px;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.style.cssText = `
      background: ${isError ? '#ef4444' : '#10b981'};
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      animation: slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <span>${isError ? '⚠️' : '✅'} ${message}</span>
      <button style="background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer;">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
});
