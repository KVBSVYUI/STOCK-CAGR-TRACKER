window.APP_CONFIG={firebase:{apiKey:"AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",authDomain:"booked-profit-tracker.firebaseapp.com",projectId:"booked-profit-tracker",storageBucket:"booked-profit-tracker.firebasestorage.app",messagingSenderId:"401080852",appId:"1:401080852754:web:8f449ad7d2cd44314993cb"},logoDevToken:""};
import('./admin.js').catch(()=>{});

/* Lightweight UI patch. Deliberately avoids a MutationObserver so the page cannot get trapped in repeated DOM work. */
(function(){
  const FIREBASE_APP='https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
  const FIREBASE_AUTH='https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
  const FIREBASE_FIRESTORE='https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
  const getAuth=async()=>{const [a,m]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH)]);return m.getAuth(a.getApps()[0])};
  const STOCK_BASE='https://dharunashokkumar.github.io/indian-listed-company-logos/';
  let stockCatalogPromise=null;
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
  function loadStocks(){
    if(stockCatalogPromise)return stockCatalogPromise;
    stockCatalogPromise=fetch(STOCK_BASE+'data/logos.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('stock list unavailable');return r.json()}).then(data=>{
      const seen=new Set();
      return (data.logos||[]).map(x=>({ticker:String(x.ticker||'').toUpperCase(),name:String(x.company||x.name||x.ticker||''),exchange:String(x.exchange||'NSE').toUpperCase()})).filter(x=>x.ticker&&x.name).filter(x=>{const key=x.exchange+'|'+x.ticker;if(seen.has(key))return false;seen.add(key);return true});
    }).catch(()=>[]);
    return stockCatalogPromise;
  }
  function stockAutocomplete(){
    const input=document.getElementById('mTicker');
    if(!input||input.dataset.stockAutocomplete)return;
    input.dataset.stockAutocomplete='1';
    input.placeholder='Type company name or ticker';
    const field=input.parentElement;field.style.position='relative';
    const box=document.createElement('div');box.style.cssText='position:absolute;left:0;right:0;top:100%;margin-top:5px;background:#0b1421;border:1px solid #2a3a51;border-radius:12px;box-shadow:0 20px 45px #000b;z-index:1000;display:none;overflow:hidden;max-height:280px;overflow-y:auto';field.appendChild(box);
    const clean=s=>String(s||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
    let catalog=[];
    const render=items=>{box.innerHTML=items.slice(0,8).map((x,i)=>`<button type="button" data-stock-index="${i}" style="display:flex;width:100%;gap:10px;align-items:center;text-align:left;padding:10px 12px;border:0;border-bottom:1px solid #202b3b;background:#0b1421;color:#f4f7fb;cursor:pointer"><span style="width:32px;height:32px;border-radius:8px;background:#172438;display:grid;place-items:center;overflow:hidden;flex:none;font-size:9px;font-weight:800"><img src="${STOCK_BASE+(x.exchange==='BSE'?'bse/BSE_':'nse/NSE_')+encodeURIComponent(x.ticker)+'.svg'}" style="width:100%;height:100%;object-fit:contain;background:#fff" onerror="this.style.display='none';this.parentElement.textContent='${clean(x.ticker).slice(0,2)}'"></span><span style="min-width:0"><b style="display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${clean(x.name)}</b><small style="display:block;color:#8997aa;margin-top:2px">${clean(x.ticker)} · ${clean(x.exchange)}</small></span></button>`).join('');box.style.display=items.length?'block':'none';box.querySelectorAll('[data-stock-index]').forEach(b=>b.onclick=()=>{const x=items[Number(b.dataset.stockIndex)];if(!x)return;input.value=x.ticker;input.dataset.selectedCompany=x.name;input.dataset.selectedExchange=x.exchange;box.style.display='none'})};
    input.addEventListener('input',async()=>{const q=input.value.trim().toLowerCase();if(!q){box.style.display='none';return}catalog=await loadStocks();const matches=catalog.filter(x=>x.ticker.toLowerCase().startsWith(q)||x.name.toLowerCase().includes(q)).sort((a,b)=>{const score=x=>x.ticker.toLowerCase()===q?0:x.ticker.toLowerCase().startsWith(q)?1:x.name.toLowerCase().startsWith(q)?2:3;return score(a)-score(b)||a.name.localeCompare(b.name)});render(matches)});
    input.addEventListener('focus',()=>{if(input.value.trim())input.dispatchEvent(new Event('input'))});
    document.addEventListener('click',e=>{if(!field.contains(e.target))box.style.display='none'});
  }
  async function saveSameDayTrade(){
    const ticker=document.getElementById('mTicker').value.trim().toUpperCase().replace(/\s+/g,'');
    const q=Number(document.getElementById('mQty').value),b=Number(document.getElementById('mBuy').value),s=Number(document.getElementById('mSell').value);
    const bd=document.getElementById('mBD').value,sd=document.getElementById('mSD').value;
    if(!ticker||!(q>0)||!(b>0)||!(s>=0)||!bd||!sd)return alert('Please complete all fields.');
    if(sd!==bd)return false;
    try{
      const [appMod,authMod,fs]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH),import(FIREBASE_FIRESTORE)]);
      const a=authMod.getAuth(appMod.getApps()[0]);
      const user=a.currentUser;
      if(!user)return alert('Please sign in again.');
      const db=fs.getFirestore(appMod.getApps()[0]);
      await fs.addDoc(fs.collection(db,'users',user.uid,'trades'),{ticker,stock:ticker,quantity:q,avgBuy:b,sellPrice:s,buyDate:bd,sellDate:sd,cost:q*b,sale:q*s,logoUrl:STOCK_BASE+'nse/NSE_'+encodeURIComponent(ticker)+'.svg',createdAt:fs.serverTimestamp()});
      document.querySelector('.modal-back.open')?.remove();
    }catch(e){alert('Could not save trade: '+(e.code||'error'));}
    return true;
  }
  function patchSameDaySave(){
    const save=document.getElementById('save');
    if(!save||save.dataset.bptSameDayClick)return;
    const original=save.onclick;
    if(typeof original!=='function')return;
    save.dataset.bptSameDayClick='1';
    save.onclick=async function(e){
      const bd=document.getElementById('mBD')?.value||'',sd=document.getElementById('mSD')?.value||'';
      if(bd&&sd&&bd===sd){
        e?.preventDefault();
        e?.stopPropagation();
        return saveSameDayTrade();
      }
      return original.call(this,e);
    };
  }
  function sameDayTradeGuard(){
    if(document.documentElement.dataset.bptSameDayGuard)return;
    document.documentElement.dataset.bptSameDayGuard='1';
    document.addEventListener('click',async e=>{
      const save=e.target.closest?.('#save');
      if(!save||!document.getElementById('mBD')||!document.getElementById('mSD'))return;
      if(document.getElementById('mBD').value!==document.getElementById('mSD').value)return;
      e.preventDefault();e.stopImmediatePropagation();
      await saveSameDayTrade();
    },true);
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
      if(!m){m=document.createElement('button');m.id='bptMenuButton';m.type='button';m.className='icon';m.textContent='☰';m.title='Menu';m.setAttribute('aria-label','Open menu');m.style.cssText='font-size:21px;font-weight:800;display:grid;place-items:center;flex:none';top.insertBefore(m,brand)}
      if(!m.onclick)m.onclick=menu;
      let a=document.getElementById('bptAccountButton');
      if(!a){a=document.createElement('button');a.id='bptAccountButton';a.type='button';a.className='icon';a.textContent='👤';a.title='Account';a.setAttribute('aria-label','Account');right.insertBefore(a,right.firstChild);a.onclick=account}
      const s=document.getElementById('settings');if(s)s.onclick=account;
      const add=document.getElementById('addTradeOpen');if(add&&!add.dataset.bptStockHook){add.dataset.bptStockHook='1';add.addEventListener('click',()=>setTimeout(()=>{stockAutocomplete();patchSameDaySave()},0))}
      done=true;
    }
    stockAutocomplete();
    patchSameDaySave();
  }
  function start(){sameDayTradeGuard();apply();let n=0;const timer=setInterval(()=>{apply();if(++n>=80||done)clearInterval(timer)},250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
