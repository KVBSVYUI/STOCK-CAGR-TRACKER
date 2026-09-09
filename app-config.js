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

// Branding and account-security UI enhancements.
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

  const getFirebaseAuth = async () => {
    const mod = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
    const appsMod = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
    const apps = appsMod.getApps();
    if (!apps.length) throw new Error('Firebase is not ready yet.');
    return mod.getAuth(apps[0]);
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
    button.style.cssText = 'background:none;border:0;padding:4px 0;cursor:pointer;font:inherit;font-weight:600;color:#79a9ff';
    button.addEventListener('click', () => {
      alert('Password recovery email is not fully configured yet. Once you add a recovery email in Account Settings, this button will send the reset link there.');
    });
    row.appendChild(button);
    passwordInput.parentElement?.after(row);
    authCard.dataset.passwordRecoveryAdded = '1';
  };

  const addChangePassword = () => {
    const right = document.querySelector('.right');
    if (!right || right.dataset.changePasswordAdded === '1') return;
    const buttons = right.querySelectorAll('button');
    if (!buttons.length) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon';
    button.title = 'Change password';
    button.setAttribute('aria-label', 'Change password');
    button.textContent = '🔐';
    button.addEventListener('click', async () => {
      let auth;
      try { auth = await getFirebaseAuth(); } catch (e) { alert('Firebase is still loading. Please try again.'); return; }
      const user = auth.currentUser;
      if (!user) { alert('Please sign in first.'); return; }

      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:#000b;display:flex;align-items:flex-end;justify-content:center;padding:12px;z-index:9999';
      modal.innerHTML = `<div style="width:min(420px,100%);background:#0c141f;border:1px solid #2a3a51;border-radius:22px;padding:20px;box-shadow:0 30px 90px #000b;color:#f4f7fb">
        <button id="closePw" style="float:right;border:0;background:none;color:#8291a6;font-size:24px">×</button>
        <h3 style="margin:0;font-size:18px">Change password</h3>
        <p style="color:#8997aa;font-size:11px;line-height:1.5">Choose a new password with at least 6 characters.</p>
        <input id="newPw" type="password" placeholder="New password" style="width:100%;background:#080f19;border:1px solid #202b3b;color:#f4f7fb;border-radius:11px;padding:11px;margin-top:8px">
        <input id="newPw2" type="password" placeholder="Confirm new password" style="width:100%;background:#080f19;border:1px solid #202b3b;color:#f4f7fb;border-radius:11px;padding:11px;margin-top:8px">
        <div id="pwMsg" style="min-height:18px;color:#ff7180;font-size:10px;margin-top:8px"></div>
        <button id="savePw" style="width:100%;border:0;border-radius:12px;padding:11px;background:linear-gradient(135deg,#56e6a4,#2ac785);font-weight:800;color:#06120c;margin-top:8px">Update password</button>
      </div>`;
      document.body.appendChild(modal);
      const close = () => modal.remove();
      modal.querySelector('#closePw').onclick = close;
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      modal.querySelector('#savePw').onclick = async () => {
        const a = modal.querySelector('#newPw').value;
        const b = modal.querySelector('#newPw2').value;
        const msg = modal.querySelector('#pwMsg');
        if (a.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
        if (a !== b) { msg.textContent = 'Passwords do not match.'; return; }
        try {
          const {updatePassword} = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
          await updatePassword(user, a);
          alert('Password changed successfully.');
          close();
        } catch (error) {
          console.error(error);
          msg.textContent = error?.code === 'auth/requires-recent-login' ? 'For security, sign out and sign in again, then change your password.' : 'Could not change the password. Please try again.';
        }
      };
    });

    right.insertBefore(button, right.firstChild);
    right.dataset.changePasswordAdded = '1';
  };

  const applyBranding = () => {
    applyPuppyLogo();
    applyLoginMessage();
    addPasswordRecovery();
    addChangePassword();
  };

  applyBranding();
  new MutationObserver(applyBranding).observe(document.body, {childList: true, subtree: true});
});
