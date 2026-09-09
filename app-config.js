window.APP_CONFIG={firebase:{apiKey:"AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",authDomain:"booked-profit-tracker.firebaseapp.com",projectId:"booked-profit-tracker",storageBucket:"booked-profit-tracker.firebasestorage.app",messagingSenderId:"401080852",appId:"1:401080852754:web:8f449ad7d2cd44314993cb"},logoDevToken:""};

/* Lightweight UI patch. Deliberately avoids a MutationObserver so the page cannot get trapped in repeated DOM work. */
(function(){
  const FIREBASE_APP='https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
  const FIREBASE_AUTH='https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
  const getAuth=async()=>{const [a,m]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH)]);return m.getAuth(a.getApps()[0])};
  let done=false;
  function account(){
    document.querySelectorAll('.app-drawer,.modal-back').forEach(x=>x.remove());
    const back=document.createElement('div');back.className='modal-back open';
    back.innerHTML='<div class="modal"><button class="close" id="bptAccountClose" type="button">×</button><h3>Account</h3><p>Manage your account and sign out securely.</p><div class="modal-actions"><button class="secondary" id="bptSignOut" type="button">Sign out</button></div></div>';
    document.body.appendChild(back);
    document.getElementById('bptAccountClose').onclick=()=>back.remove();
    back.onclick=e=>{if(e.target===back)back.remove()};
    document.getElementById('bptSignOut').onclick=async()=>{try{const a=await getAuth();await (await import(FIREBASE_AUTH)).signOut(a)}catch(e){alert('Could not sign out. Please try again.')}};
  }
  function menu(){
    document.querySelector('.app-drawer')?.remove();
    const d=document.createElement('div');d.className='app-drawer';d.style.cssText='position:fixed;inset:0;z-index:9999;background:#000b';
    d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="bptMenuClose" class="icon" type="button" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button id="bptMenuAccount" class="secondary" type="button" style="text-align:left">👤 Account</button><button id="bptMenuMailbox" class="secondary" type="button" style="text-align:left">📬 Mailbox</button></div></aside>';
    document.body.appendChild(d);
    document.getElementById('bptMenuClose').onclick=()=>d.remove();
    document.getElementById('bptMenuAccount').onclick=account;
    document.getElementById('bptMenuMailbox').onclick=()=>alert('Mailbox will be connected after the click issue is fully fixed.');
    d.onclick=e=>{if(e.target===d)d.remove()};
  }
  function apply(){
    const p=document.querySelector('.auth-card p');
    if(p&&!p.dataset.bptFixed){p.textContent='Sign in to securely track your booked profits, trade history and performance.';p.dataset.bptFixed='1'}
    document.querySelectorAll('.mark,.auth-mark').forEach(el=>{
      if(el.dataset.bptLogo)return;
      el.dataset.bptLogo='1';el.innerHTML='';
      const i=document.createElement('img');i.src='./icons/icon-192.png';i.alt='Booked Profit Tracker';i.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit';el.appendChild(i);
    });
    const top=document.querySelector('.top'),brand=document.querySelector('.brand'),right=document.querySelector('.right');
    if(top&&brand&&right){
      let m=document.getElementById('bptMenuButton');
      if(!m){m=document.createElement('button');m.id='bptMenuButton';m.type='button';m.className='icon';m.textContent='☰';m.title='Menu';m.setAttribute('aria-label','Open menu');m.style.cssText='font-size:21px;font-weight:800;display:grid;place-items:center;flex:none';top.insertBefore(m,brand);m.onclick=menu}
      let a=document.getElementById('bptAccountButton');
      if(!a){a=document.createElement('button');a.id='bptAccountButton';a.type='button';a.className='icon';a.textContent='👤';a.title='Account';a.setAttribute('aria-label','Account');right.insertBefore(a,right.firstChild);a.onclick=account}
      const s=document.getElementById('settings');if(s)s.onclick=account;
      done=true;
    }
  }
  function start(){apply();let n=0;const timer=setInterval(()=>{apply();if(++n>=80||done)clearInterval(timer)},250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();