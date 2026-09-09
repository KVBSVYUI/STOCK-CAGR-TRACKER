window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",
    authDomain: "booked-profit-tracker.firebaseapp.com",
    projectId: "booked-profit-tracker",
    storageBucket: "booked-profit-tracker.firebasestorage.app",
    messagingSenderId: "401080852852",
    appId: "1:401080852754:web:8f449ad7d2cd44314993cb"
  },
  logoDevToken: ""
};

document.addEventListener('DOMContentLoaded', () => {
  const getAuth = async () => {
    const m=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
    const a=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
    return m.getAuth(a.getApps()[0]);
  };
  const applyPuppyLogo=()=>document.querySelectorAll('.mark,.auth-mark').forEach(el=>{if(el.dataset.puppyLogo)return;el.dataset.puppyLogo='1';el.innerHTML='';const img=document.createElement('img');img.src='./icons/icon-192.png';img.alt='Booked Profit Tracker';img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit';el.appendChild(img)});
  const applyLoginMessage=()=>{const p=document.querySelector('.auth-card p');if(p&&!p.dataset.customLoginMessage){p.textContent='Sign in to securely track your booked profits, trade history and performance.';p.dataset.customLoginMessage='1'}};
  const cleanAccountModal=()=>{document.querySelectorAll('.modal').forEach(modal=>{const h=modal.querySelector('h3');if(h&&h.textContent.trim()==='Account'){const p=modal.querySelector('p');if(p)p.textContent='Manage your account and sign out securely.'}})};
  const addHeaderControls=async()=>{const top=document.querySelector('.top'),brand=document.querySelector('.brand'),right=document.querySelector('.right');if(!top||!brand||!right||top.dataset.headerControls)return;top.dataset.headerControls='1';const menu=document.createElement('button');menu.type='button';menu.className='icon';menu.title='Menu';menu.setAttribute('aria-label','Open menu');menu.textContent='☰';menu.style.cssText='font-size:21px;font-weight:800;display:grid;place-items:center;flex:none';top.insertBefore(menu,brand);const account=document.createElement('div');account.style.cssText='display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid #202b3b;background:#0d141f;border-radius:12px;max-width:170px';account.innerHTML='<span style="font-size:17px">👤</span><span style="font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Account</span>';right.insertBefore(account,right.firstChild);try{const a=await getAuth(),u=a.currentUser;if(u){const name=(u.email||'').split('@')[0]||'Account';account.querySelector('span:last-child').textContent=name;account.title='Signed in as '+name}}catch(e){}menu.onclick=()=>{let d=document.querySelector('.app-drawer');if(d){d.remove();return}d=document.createElement('div');d.className='app-drawer';d.style.cssText='position:fixed;inset:0;z-index:9998;background:#0009';d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="closeMenu" class="icon" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button class="secondary" style="text-align:left">👤 Account</button><button class="secondary" style="text-align:left">🔐 Security & password</button><button class="secondary" style="text-align:left">📬 Mailbox</button></div></aside>';document.body.appendChild(d);d.querySelector('#closeMenu').onclick=()=>d.remove();d.onclick=e=>{if(e.target===d)d.remove()}}};
  const addChangePassword=async()=>{const right=document.querySelector('.right');if(!right||right.dataset.changePasswordAdded)return;const b=document.createElement('button');b.type='button';b.className='icon';b.title='Change password';b.textContent='🔐';b.onclick=async()=>{try{const a=await getAuth(),u=a.currentUser;if(!u){alert('Please sign in first.');return}const n=prompt('Enter your new password (minimum 6 characters):');if(n===null)return;if(n.length<6){alert('Password must be at least 6 characters.');return}const {updatePassword}=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');await updatePassword(u,n);alert('Password changed successfully.')}catch(e){alert(e?.code==='auth/requires-recent-login'?'For security, sign out and sign in again, then change your password.':'Could not change the password.')}};right.insertBefore(b,right.firstChild);right.dataset.changePasswordAdded='1'};
  const addPasswordRecovery=()=>{const card=document.querySelector('.auth-card');if(!card||card.dataset.recoveryAdded)return;const inputs=[...card.querySelectorAll('input')],pw=inputs.find(x=>x.type==='password'),user=inputs.find(x=>x!==pw);if(!pw||!user)return;const row=document.createElement('div');row.style.cssText='margin-top:8px;text-align:right';const b=document.createElement('button');b.type='button';b.textContent='Forgot password?';b.style.cssText='background:none;border:0;padding:4px 0;color:#79a9ff;font:inherit;font-weight:600;cursor:pointer';b.onclick=()=>alert('Password recovery will be available after you add a recovery email in Account Settings.');row.appendChild(b);pw.parentElement?.after(row);card.dataset.recoveryAdded='1'};
  const patchSameDayTradeSave=()=>{
    const save=document.getElementById('save'),bd=document.getElementById('mBD'),sd=document.getElementById('mSD');
    if(!save||!bd||!sd||save.dataset.sameDayPatched)return;
    save.dataset.sameDayPatched='1';
    const original=save.onclick;
    save.onclick=async function(e){
      if(sd.value && bd.value && sd.value===bd.value){
        try{
          const [appMod,authMod,fs]=await Promise.all([
            import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js')
          ]);
          const apps=appMod.getApps();
          const firebaseApp=apps[0];
          if(!firebaseApp)throw new Error('Firebase is not ready');
          const user=authMod.getAuth(firebaseApp).currentUser;
          if(!user)throw new Error('Not signed in');
          const ticker=document.getElementById('mTicker').value.trim().toUpperCase().replace(/\s+/g,''),q=Number(document.getElementById('mQty').value),b=Number(document.getElementById('mBuy').value),s=Number(document.getElementById('mSell').value);
          if(!ticker||!(q>0)||!(b>0)||!(s>=0)||!bd.value||!sd.value){alert('Please complete all fields.');return}
          const logoUrl=t=>t?`https://dharunashokkumar.github.io/indian-listed-company-logos/nse/NSE_${encodeURIComponent(String(t).toUpperCase())}.svg`:'';
          const db=fs.getFirestore(firebaseApp);
          await fs.addDoc(fs.collection(db,'users',user.uid,'trades'),{ticker,stock:ticker,quantity:q,avgBuy:b,sellPrice:s,buyDate:bd.value,sellDate:sd.value,cost:q*b,sale:q*s,logoUrl:logoUrl(ticker),createdAt:fs.serverTimestamp()});
          document.querySelector('.modal-back.open')?.remove();
        }catch(err){console.error(err);alert('Could not save trade: '+(err.code||err.message||'error'));}
        return;
      }
      if(typeof original==='function')return original.call(this,e);
    };
  };
  const apply=()=>{applyPuppyLogo();applyLoginMessage();cleanAccountModal();addHeaderControls();addChangePassword();addPasswordRecovery();patchSameDayTradeSave()};apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
});
