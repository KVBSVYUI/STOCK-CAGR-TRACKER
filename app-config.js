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

// Branding and small authentication UI enhancements.
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

  const addPasswordRecovery = () => {
    const authCard = document.querySelector('.auth-card');
    if (!authCard || authCard.dataset.passwordRecoveryAdded === '1') return;

    const inputs = authCard.querySelectorAll('input');
    if (!inputs.length) return;
    const passwordInput = Array.from(inputs).find(input => /password/i.test(input.type) || /password/i.test(input.placeholder || '') || /password/i.test(input.name || ''));
    if (!passwordInput) return;

    const usernameInput = Array.from(inputs).find(input => input !== passwordInput && /user|name/i.test((input.placeholder || '') + ' ' + (input.name || '') + ' ' + (input.type || '')));
    if (!usernameInput) return;

    const row = document.createElement('div');
    row.style.marginTop = '8px';
    row.style.textAlign = 'right';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Forgot password?';
    button.style.background = 'none';
    button.style.border = '0';
    button.style.padding = '4px 0';
    button.style.cursor = 'pointer';
    button.style.font = 'inherit';
    button.style.fontWeight = '600';
    button.style.color = 'var(--accent, #45d6c8)';

    button.addEventListener('click', async () => {
      const username = String(usernameInput.value || '').trim().toLowerCase();
      if (!username) {
        alert('Enter your username first.');
        usernameInput.focus();
        return;
      }

      const email = username + '@bookedprofittracker.app';
      try {
        if (typeof window.firebaseAuth === 'undefined') {
          alert('Please wait a moment and try again.');
          return;
        }
        await window.firebaseAuth.sendPasswordResetEmail(email);
        alert('Password reset instructions have been sent to the email address connected to this account.');
      } catch (error) {
        console.error(error);
        alert('Unable to send the reset email. Please check your username and try again.');
      }
    });

    row.appendChild(button);
    passwordInput.parentElement?.after(row);
    authCard.dataset.passwordRecoveryAdded = '1';
  };

  const applyBranding = () => {
    applyPuppyLogo();
    applyLoginMessage();
    addPasswordRecovery();
  };

  applyBranding();
  new MutationObserver(applyBranding).observe(document.body, {childList: true, subtree: true});
});
