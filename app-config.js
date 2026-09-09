window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",
    authDomain: "booked-profit-tracker.firebaseapp.com",
    projectId: "booked-profit-tracker",
    storageBucket: "booked-profit-tracker.firebasestorage.app",
    messagingSenderId: "401080852",
    appId: "1:401080852754:web:8f449ad7d2cd44314993cb"
  },
  logoDevToken: ""
};

document.addEventListener('DOMContentLoaded', () => {
  const authMod = () => import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
  const appMod = () => import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');

  const applyPuppyLogo = () => document.querySelectorAll('.mark,.auth-mark').forEach(el => {
    if (el.dataset.puppyLogo) return;
    el.dataset.puppyLogo='1'; el.innerHTML='';
    const img=document.createElement('img'); img.src='./icons/icon-192.png'; img.alt='Booked Profit Tracker';
    img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit'; el.appendChild(img);
  });

  const applyLoginMessage = () => {
    const p=document.querySelector('.auth-card p');
    if(p) p.textContent='Sign in to securely track your booked profits, trade history and performance.';
  };

  const cleanAccountText = () => document.querySelectorAll('.modal p,p').forEach(p => {
    if(p.textContent.includes("Use this same username and password on your father's phone.") || p.textContent.includes('Firestore keeps the trades and charges synchronized live across devices.'))
      p.textContent='Manage your account and sign out securely.';
  });

  const showAccount = async () => {
    document.querySelectorAll('.app-drawer,.modal-back[data-account-fix]').forEach(x=>x.remove());
    const back=document.createElement('div'); back.className='modal-back open'; back.dataset.accountFix='1';
    back.innerHTML='<div class="modal"><button class="close" id="accountClose">×</button><h3>Account</h3><p>Manage your account and sign out securely.</p><div class="modal-actions"><button class="secondary" id="accountSignout">Sign out</button></div></div>';
    document.body.appendChild(back);
    back.querySelector('#accountClose').onclick=()=>back.remove();
    back.onclick=e=>{if(e.target===back)back.remove()};
    back.querySelector('#accountSignout').onclick=async()=>{
      try{const m=await authMod(); const a=(await appMod()).getApps()[0]; await m.signOut(m.getAuth(a));}
      catch(e){alert('Could not sign out. Please try again.');}
    };
  };

  const showMenu = () => {
    const old=document.querySelector('.app-drawer'); if(old){old.remove();return;}
    const d=document.createElement('div'); d.className='app-drawer';
    d.style.cssText='position:fixed;inset:0;z-index:9998;background:#0009';
    d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="closeMenu" class="icon" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button id="drawerAccount" class="secondary" style="text-align:left">👤 Account</button><button id="drawerSecurity" class="secondary" style="text-align:left">🔐 Security & password</button><button id="drawerMailbox" class="secondary" style="text-align:left">📬 Mailbox</button></div></aside>';
    document.body.appendChild(d);
    d.querySelector('#closeMenu').onclick=()=>d.remove();
    d.onclick=e=>{if(e.target===d)d.remove()};
    d.querySelector('#drawerAccount').onclick=()=>{d.remove();showAccount()};
    d.querySelector('#drawerSecurity').onclick=()=>{d.remove();document.querySelector('#settings')?.click()};
    d.querySelector('#drawerMailbox').onclick=()=>alert('Mailbox is coming next.');
  };

  const addHeaderControls = () => {
    const top=document.querySelector('.top'),brand=document.querySelector('.brand'),right=document.querySelector('.right');
    if(!top||!brand||!right||top.dataset.headerControls)return;
    top.dataset.headerControls='1';

    const menu=document.createElement('button'); menu.type='button'; menu.className='icon'; menu.title='Menu'; menu.setAttribute('aria-label','Open menu'); menu.textContent='☰';
    menu.style.cssText='font-size:21px;font-weight:800;display:grid;place-items:center;flex:none';
    menu.onclick=showMenu;
    top.insertBefore(menu,brand);

    const account=document.createElement('button'); account.type='button'; account.title='Account'; account.setAttribute('aria-label','Account');
    account.style.cssText='display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid #202b3b;background:#0d141f;color:#f4f7fb;border-radius:12px;max-width:170px;cursor:pointer';
    account.innerHTML='<span style="font-size:17px">👤</span><span style="font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Account</span>';
    account.onclick=showAccount;
    right.insertBefore(account,right.firstChild);

    appMod().then(am=>authMod().then(rm=>{try{const a=rm.getAuth(am.getApps()[0]);const u=a.currentUser;if(u){const name=(u.email||'').split('@')[0]||'Account';account.querySelector('span:last-child').textContent=name;}}catch(e){}})).catch(()=>{});
  };

  const addChangePassword=()=>{
    const right=document.querySelector('.right'); if(!right||right.dataset.changePasswordAdded)return;
    const b=document.createElement('button'); b.type='button'; b.className='icon'; b.title='Change password'; b.textContent='🔐';
    b.onclick=async()=>{try{const am=await appMod(),rm=await authMod(),u=rm.getAuth(am.getApps()[0]).currentUser;if(!u){alert('Please sign in first.');return}const n=prompt('Enter your new password (minimum 6 characters):');if(n===null)return;if(n.length<6){alert('Password must be at least 6 characters.');return}await rm.updatePassword(u,n);alert('Password changed successfully.')}catch(e){alert(e?.code==='auth/requires-recent-login'?'For security, sign out and sign in again, then change your password.':'Could not change the password.')}};
    right.insertBefore(b,right.firstChild); right.dataset.changePasswordAdded='1';
  };

  const addPasswordRecovery=()=>{const card=document.querySelector('.auth-card');if(!card||card.dataset.recoveryAdded)return;const pw=card.querySelector('input[type="password"]');if(!pw)return;const row=document.createElement('div');row.style.cssText='margin-top:8px;text-align:right';const b=document.createElement('button');b.type='button';b.textContent='Forgot password?';b.style.cssText='background:none;border:0;padding:4px 0;color:#79a9ff;font:inherit;font-weight:600;cursor:pointer';b.onclick=()=>alert('Password recovery will be available after you add a recovery email in Account Settings.');row.appendChild(b);pw.parentElement?.after(row);card.dataset.recoveryAdded='1'};

  const patchSameDayTradeSave=()=>{
    const save=document.getElementById('save'),bd=document.getElementById('mBD'),sd=document.getElementById('mSD'); if(!save||!bd||!sd||save.dataset.sameDayPatched)return;
    save.dataset.sameDayPatched='1'; const original=save.onclick;
    save.onclick=async function(e){
      if(sd.value&&bd.value&&sd.value===bd.value){
        try{const [am,rm,fs]=await Promise.all([appMod(),authMod(),import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js')]);const a=am.getApps()[0],u=rm.getAuth(a).currentUser;if(!u)throw new Error('Not signed in');const ticker=document.getElementById('mTicker').value.trim().toUpperCase().replace(/\s+/g,''),q=Number(document.getElementById('mQty').value),b=Number(document.getElementById('mBuy').value),s=Number(document.getElementById('mSell').value);if(!ticker||!(q>0)||!(b>0)||!(s>=0)||!bd.value||!sd.value){alert('Please complete all fields.');return}await fs.addDoc(fs.collection(fs.getFirestore(a),'users',u.uid,'trades'),{ticker,stock:ticker,quantity:q,avgBuy:b,sellPrice:s,buyDate:bd.value,sellDate:sd.value,cost:q*b,sale:q*s,logoUrl:`https://dharunashokkumar.github.io/indian-listed-company-logos/nse/NSE_${encodeURIComponent(ticker)}.svg`,createdAt:fs.serverTimestamp()});document.querySelector('.modal-back.open')?.remove()}catch(err){alert('Could not save trade: '+(err.code||err.message||'error'))}return;
      }
      if(typeof original==='function')return original.call(this,e);
    };
  };

  const apply=()=>{applyPuppyLogo();applyLoginMessage();cleanAccountText();addHeaderControls();addChangePassword();addPasswordRecovery();patchSameDayTradeSave()};
  apply();
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
});
