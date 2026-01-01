// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/service-worker.js')
      .catch(err => {
        console.error('Erro ao registrar Service Worker:', err);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.id = 'pwa-install-btn';
installButton.className = 'btn-export';
installButton.style.display = 'none';
installButton.innerHTML = '<i class="fas fa-mobile-alt"></i> Instalar App';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = 'inline-flex';

  // Adicionar botão no header
  const dateControls = document.querySelector('.date-controls');
  if (dateControls) {
    dateControls.appendChild(installButton);
  }
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;
  installButton.style.display = 'none';
});

// Detectar quando app foi instalado
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
});
