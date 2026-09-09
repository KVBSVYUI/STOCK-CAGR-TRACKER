window.APP_CONFIG={firebase:{apiKey:"AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",authDomain:"booked-profit-tracker.firebaseapp.com",projectId:"booked-profit-tracker",storageBucket:"booked-profit-tracker.firebasestorage.app",messagingSenderId:"401080852",appId:"1:401080852754:web:8f449ad7d2cd44314993cb"},logoDevToken:""};

(function(){
  const FIREBASE_APP='https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
  const FIREBASE_AUTH='https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
  const FIREBASE_FS='https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
  const getAuth=async()=>{const [a,m]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH)]);return m.getAuth(a.getApps()[0])};

  function logo(){document.querySelectorAll('.mark,.auth-mark').forEach(el=>{if(el.dataset.puppy)return;el.dataset.puppy='1';el.innerHTML='';const i=document.createElement('img');i.src='./icons/icon-192.png';i.alt='Booked Profit Tracker';i.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit';el.appendChild(i)})}
  function loginText(){const p=document.querySelector('.auth-card p');if(p&&!p.dataset.fixed)p.textContent='Sign in to securely track your booked profits, trade history and performance.',p.dataset.fixed='1'}

  function closeLayers(){document.querySelectorAll('.app-drawer').forEach(x=>x.remove());document.querySelectorAll('.modal-back').forEach(x=>x.remove())}
  function account(){
    closeLayers();
    const back=document.createElement('div');back.className='modal-back open';
    back.innerHTML='<div class="modal"><button class="close" id="fixAccountClose" type="button">×</button><h3>Account</h3><p>Manage your account and sign out securely.</p><div class="modal-actions"><button class="secondary" id="fixSignOut" type="button">Sign out</button></div></div>';
    document.body.appendChild(back);
    document.getElementById('fixAccountClose').onclick=()=>back.remove();
    back.onclick=e=>{if(e.target===back)back.remove()};
    document.getElementById('fixSignOut').onclick=async()=>{try{const a=await getAuth();await (await import(FIREBASE_AUTH)).signOut(a)}catch(e){alert('Could not sign out. Please try again.')}};
  }
  function password(){
    const n=prompt('Enter your new password (minimum 6 characters):');if(n===null)return;
    if(n.length<6)return alert('Password must be at least 6 characters.');
    getAuth().then(async a=>{try{await (await import(FIREBASE_AUTH)).updatePassword(a.currentUser,n);alert('Password changed successfully.')}catch(e){alert(e?.code==='auth/requires-recent-login'?'For security, sign out and sign in again, then change your password.':'Could not change the password.')}});
  }
  function mailbox(){
    closeLayers();
    const back=document.createElement('div');back.className='modal-back open';
    back.innerHTML='<div class="modal"><button class="close" id="fixMailboxClose" type="button">×</button><h3>📬 Mailbox</h3><p>No announcements yet.</p><div class="modal-actions"><button class="secondary" id="fixMailboxOk" type="button">Close</button></div></div>';
    document.body.appendChild(back);document.getElementById('fixMailboxClose').onclick=()=>back.remove();document.getElementById('fixMailboxOk').onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()};
  }
  function menu(){
    document.querySelector('.app-drawer')?.remove();
    const d=document.createElement('div');d.className='app-drawer';d.style.cssText='position:fixed;inset:0;z-index:9999;background:#000b';
    d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="fixMenuClose" class="icon" type="button" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button id="fixMenuAccount" class="secondary" type="button" style="text-align:left">👤 Account</button><button id="fixMenuPassword" class="secondary" type="button" style="text-align:left">🔐 Security & password</button><button id="fixMenuMailbox" class="secondary" type="button" style="text-align:left">📬 Mailbox</button></div></aside>';
    document.body.appendChild(d);
    document.getElementById('fixMenuClose').onclick=()=>d.remove();document.getElementById('fixMenuAccount').onclick=account;document.getElementById('fixMenuPassword').onclick=()=>{d.remove();password()};document.getElementById('fixMenuMailbox').onclick=mailbox;d.onclick=e=>{if(e.target===d)d.remove()};
  }
  function header(){
    const top=document.querySelector('.top'),brand=document.querySelector('.brand'),right=document.querySelector('.right');
    if(!top||!brand||!right)return;
    let m=document.getElementById('appMenu');
    if(!m){m=document.createElement('button');m.id='appMenu';m.type='button';m.className='icon';m.textContent='☰';m.title='Menu';m.setAttribute('aria-label','Open menu');m.style.cssText='font-size:21px;font-weight:800;display:grid;place-items:center;flex:none';top.insertBefore(m,brand)}
    m.onclick=menu;
    let c=document.getElementById('appAccount');
    if(!c){c=document.createElement('button');c.id='appAccount';c.type='button';c.className='icon';c.textContent='👤';c.title='Account';c.setAttribute('aria-label','Account');right.insertBefore(c,right.firstChild)}
    c.onclick=account;
    const s=document.getElementById('settings');if(s)s.onclick=account;
    let lock=document.getElementById('appPassword');if(!lock){lock=document.createElement('button');lock.id='appPassword';lock.type='button';lock.className='icon';lock.textContent='🔐';lock.title='Change password';right.insertBefore(lock,right.firstChild)}lock.onclick=password;
  }
  function sameDay(){
    const save=document.getElementById('save'),bd=document.getElementById('mBD'),sd=document.getElementById('mSD');
    if(!save||!bd||!sd||save.dataset.sameDay)return;save.dataset.sameDay='1';const original=save.onclick;
    save.onclick=async function(e){
      if(sd.value&&bd.value&&sd.value===bd.value){try{const [am,au,fs]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH),import(FIREBASE_FS)]);const app=am.getApps()[0],user=au.getAuth(app).currentUser;if(!user)throw new Error('Not signed in');const t=document.getElementById('mTicker').value.trim().toUpperCase().replace(/\s+/g,''),q=Number(document.getElementById('mQty').value),b=Number(document.getElementById('mBuy').value),s=Number(document.getElementById('mSell').value);if(!t||!(q>0)||!(b>0)||!(s>=0))return alert('Please complete all fields.');await fs.addDoc(fs.collection(fs.getFirestore(app),'users',user.uid,'trades'),{ticker:t,stock:t,quantity:q,avgBuy:b,sellPrice:s,buyDate:bd.value,sellDate:sd.value,cost:q*b,sale:q*s,logoUrl:`https://dharunashokkumar.github.io/indian-listed-company-logos/nse/NSE_${encodeURIComponent(t)}.svg`,createdAt:fs.serverTimestamp()});document.querySelector('.modal-back.open')?.remove()}catch(err){alert('Could not save trade: '+(err.code||err.message||'error'))}return}
      if(typeof original==='function')return original.call(this,e);
    };
  }
  function apply(){logo();loginText();header();sameDay()}
  document.addEventListener('DOMContentLoaded',()=>{apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true})});
})();