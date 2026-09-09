window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",
    authDomain: "booked-profit-tracker.firebaseapp.com",
    projectId: "booked-profit-tracker",
    storageBucket: "booked-profit-tracker.firebasestorage.app",
    messagingSenderId: "401080852754",
    appId: "1:401080852754:web:8f449ad7d2cd44314993cb"
  },
  logoDevToken: ""
};

// Use the new puppy icon anywhere the app renders its built-in brand mark.
document.addEventListener('DOMContentLoaded', () => {
  const applyPuppyLogo = () => {
    document.querySelectorAll('.mark, .auth-mark').forEach(el => {
      if (el.dataset.puppyLogo === '1') return;
      el.dataset.puppyLogo = '1';
      el.innerHTML = '';
      const img = document.createElement('img');
      img.src = './icons/icon-192.png';
      img.alt = 'Booked Profit Tracker';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = 'inherit';
      el.appendChild(img);
    });
  };

  const applyLoginMessage = () => {
    const text = document.querySelector('.auth-card p');
    if (!text) return;
    if (text.dataset.customLoginMessage === '1') return;
    text.textContent = 'Sign in to securely track your booked profits, trade history and performance.';
    text.dataset.customLoginMessage = '1';
  };

  const applyBranding = () => {
    applyPuppyLogo();
    applyLoginMessage();
  };

  applyBranding();
  new MutationObserver(applyBranding).observe(document.body, {childList: true, subtree: true});
});
