window.APP_CONFIG={firebase:{apiKey:"AIzaSyAokMEP3H618OgHAMLSoQcbFVE_DtPAiig",authDomain:"booked-profit-tracker.firebaseapp.com",projectId:"booked-profit-tracker",storageBucket:"booked-profit-tracker.firebasestorage.app",messagingSenderId:"401080852",appId:"1:401080852754:web:8f449ad7d2cd44314993cb"},logoDevToken:""};
import('./admin.js').catch(()=>{});

/* Lightweight UI patch. Deliberately avoids a MutationObserver so the page cannot get trapped in repeated DOM work. */
(function(){
  const FIREBASE_APP='https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
  const FIREBASE_AUTH='https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
  const FIREBASE_FIRESTORE='https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
  const getAuth=async()=>{const [a,m]=await Promise.all([import(FIREBASE_APP),import(FIREBASE_AUTH)]);return m.getAuth(a.getApps()[0])};
  const STOCK_BASE='https://dharunashokkumar.github.io/indian-listed-company-logos/';
  const LOCAL_CATALOG='stock-catalog.json?v=25';
  const LIVE_CATALOG='https://bharatgraph.byvaibhav.com/api/company';
  const SPECIAL_LOGO_DOMAINS={VOGL:'vedantaoilandgas.com',SHIPROCKET:'shiprocket.in',BLEL:'beharilalengineering.com',SUNSHINE:'sunshinepictures.in'};
  const KNOWN_STOCK_NAMES={SUNSHINE:'Sunshine Pictures Limited',VOGL:'Vedanta Oil and Gas Limited',SHIPROCKET:'Shiprocket Limited',BLEL:'Behari Lal Engineering Limited'};
  const stockLogoUrl=x=>{const t=String(x?.ticker||'').toUpperCase();if(SPECIAL_LOGO_DOMAINS[t])return 'https://www.google.com/s2/favicons?domain='+encodeURIComponent(SPECIAL_LOGO_DOMAINS[t])+'&sz=128';return x?.isin?'https://company-logo.shareperks.in/logo/'+encodeURIComponent(String(x.isin).toUpperCase())+'/icon.svg':STOCK_BASE+(String(x?.exchange||'NSE').toUpperCase()==='BSE'?'bse/BSE_':'nse/NSE_')+encodeURIComponent(t)+'.svg'};
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
    d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="bptMenuClose" class="icon" type="button" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button id="bptMenuAccount" class="secondary" type="button" style="text-align:left">👤 Account</button><button id="bptMenuMailbox" class="secondary" type="button" style="text-align:left">📬 Mailbox</button>'+((window.__bptIsAdmin===true)?'<button id="bptMenuAdmin" class="secondary" type="button" style="text-align:left">🛡️ Admin</button>':'')+'</div></aside>';
    document.body.appendChild(d);
    document.getElementById('bptMenuClose').onclick=()=>d.remove();
    document.getElementById('bptMenuAccount').onclick=account;
    document.getElementById('bptMenuMailbox').onclick=()=>alert('Mailbox will be connected after the click issue is fully fixed.');
    const ad=document.getElementById('bptMenuAdmin');if(ad)ad.onclick=()=>window.BPT_ADMIN_DASHBOARD&&window.BPT_ADMIN_DASHBOARD();
    d.onclick=e=>{if(e.target===d)d.remove()};
  }
  function normalizeCatalog(data){
    const rows=Array.isArray(data)?data:(Array.isArray(data?.records)?data.records:(Array.isArray(data?.data)?data.data:(Array.isArray(data?.companies)?data.companies:[])));
    return rows.map(x=>({ticker:String(x.ticker||x.nse||x.NSE_symbol||x.symbol||x.bse||x.BSE_symbol||'').toUpperCase(),name:String(x.name||x.company||x.companyName||x.Company_Name||'').trim(),exchange:String(x.exchange||((x.nse||x.NSE_symbol)?'NSE':'BSE')).toUpperCase(),isin:String(x.isin||x.ISIN||'').toUpperCase()})).filter(x=>x.ticker&&x.name&&x.exchange).filter(x=>!x.name.toUpperCase().includes('MUTUAL FUND'));
  }
  function loadStocks(){
    if(stockCatalogPromise)return stockCatalogPromise;
    stockCatalogPromise=Promise.allSettled([
      fetch(LOCAL_CATALOG,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('local catalog unavailable');return r.json()}).then(normalizeCatalog),
      Promise.race([fetch(LIVE_CATALOG,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('live catalog unavailable');return r.json()}).then(normalizeCatalog),new Promise((_,reject)=>setTimeout(()=>reject(new Error('live catalog timeout')),3000))])
    ]).then(results=>{
      const seen=new Set(),all=[];
      for(const result of results){if(result.status!=='fulfilled')continue;for(const x of result.value){const k=x.exchange+'|'+x.ticker;if(!seen.has(k)){seen.add(k);all.push(x)}}}
      return all;
    }).catch(()=>[]);
    return stockCatalogPromise;
  }
  function findStock(catalog,ticker){
    const q=String(ticker||'').trim().toUpperCase().replace(/\s+/g,'');
    if(!q)return null;
    return catalog.find(x=>x.ticker===q&&x.exchange==='NSE')||catalog.find(x=>x.ticker===q)||null;
  }
  window.BPT_STOCK_RESOLVE=async function(ticker){
    const q=String(ticker||'').trim().toUpperCase().replace(/\s+/g,'');
    if(!q)return {ticker:q,name:'',exchange:'NSE',isin:''};
    const catalog=await loadStocks();
    const hit=findStock(catalog,q);
    if(hit)return hit;
    if(KNOWN_STOCK_NAMES[q])return {ticker:q,name:KNOWN_STOCK_NAMES[q],exchange:'NSE',isin:''};
    return {ticker:q,name:q,exchange:'NSE',isin:''};
  };
  function stockAutocomplete(){
    const input=document.getElementById('mTicker');
    if(!input||input.dataset.stockAutocomplete)return;
    input.dataset.stockAutocomplete='1';
    input.placeholder='Type company name or ticker';
    const field=input.parentElement;field.style.position='relative';
    const box=document.createElement('div');box.style.cssText='position:absolute;left:0;right:0;top:100%;margin-top:5px;background:#0b1421;border:1px solid #2a3a51;border-radius:12px;box-shadow:0 20px 45px #000b;z-index:1000;display:none;overflow:hidden;max-height:280px;overflow-y:auto';field.appendChild(box);
    const clean=s=>String(s||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
    let catalog=[];
    const render=items=>{box.innerHTML=items.slice(0,8).map((x,i)=>`<button type="button" data-stock-index="${i}" style="display:flex;width:100%;gap:10px;align-items:center;text-align:left;padding:10px 12px;border:0;border-bottom:1px solid #202b3b;background:#0b1421;color:#f4f7fb;cursor:pointer"><span style="width:32px;height:32px;border-radius:8px;background:#172438;display:grid;place-items:center;overflow:hidden;flex:none;font-size:9px;font-weight:800"><img src="${stockLogoUrl(x)}" style="width:100%;height:100%;object-fit:contain;background:#fff" onerror="this.style.display='none';this.parentElement.textContent='${clean(x.ticker).slice(0,2)}'"></span><span style="min-width:0"><b style="display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${clean(x.name)}</b><small style="display:block;color:#8997aa;margin-top:2px">${clean(x.ticker)} · ${clean(x.exchange)}</small></span></button>`).join('');box.style.display=items.length?'block':'none';box.querySelectorAll('[data-stock-index]').forEach(b=>b.onclick=()=>{const x=items[Number(b.dataset.stockIndex)];if(!x)return;input.value=x.ticker;input.dataset.selectedCompany=x.name;input.dataset.selectedExchange=x.exchange;input.dataset.selectedIsin=x.isin||'';box.style.display='none'})};
    const QUICK_STOCKS=[{ticker:'RELIANCE',name:'Reliance Industries Limited',exchange:'NSE',isin:'INE002A01018'},{ticker:'TCS',name:'Tata Consultancy Services Limited',exchange:'NSE',isin:'INE467B01029'},{ticker:'INFY',name:'Infosys Limited',exchange:'NSE',isin:'INE009A01021'},{ticker:'HDFCBANK',name:'HDFC Bank Limited',exchange:'NSE',isin:'INE040A01034'},{ticker:'ICICIBANK',name:'ICICI Bank Limited',exchange:'NSE',isin:'INE090A01021'}];
    const updateResults=raw=>{
      const q=String(raw||'').trim().toLowerCase();
      if(!q){box.style.display='none';return}
      const merged=[...QUICK_STOCKS,...catalog],seen=new Set();
      const pool=merged.filter(x=>{const k=x.exchange+'|'+x.ticker;if(seen.has(k))return false;seen.add(k);return true});
      const nq=q.replace(/[^a-z0-9]/g,'');
      const matches=pool.filter(x=>{
        const ticker=x.ticker.toLowerCase(),name=x.name.toLowerCase(),compactTicker=ticker.replace(/[^a-z0-9]/g,'');
        return ticker.startsWith(q)||compactTicker.startsWith(nq)||name.startsWith(q)||name.includes(q);
      }).sort((a,b)=>{
        const score=x=>{const ticker=x.ticker.toLowerCase(),name=x.name.toLowerCase();return ticker===q?0:ticker.startsWith(q)?1:name.startsWith(q)?2:name.includes(q)?3:4};
        return score(a)-score(b)||a.name.localeCompare(b.name);
      });
      render(matches);
    };
    input.addEventListener('input',()=>{
      const raw=input.value.trim(),exact=findStock([...QUICK_STOCKS,...catalog],raw);
      if(exact){input.dataset.selectedCompany=exact.name;input.dataset.selectedExchange=exact.exchange;input.dataset.selectedIsin=exact.isin||''}
      else{delete input.dataset.selectedCompany;delete input.dataset.selectedExchange;delete input.dataset.selectedIsin}
      updateResults(raw);
      loadStocks().then(x=>{catalog=x;updateResults(input.value)}).catch(()=>{});
    });
    input.addEventListener('focus',()=>{
      updateResults(input.value);
      loadStocks().then(x=>{catalog=x;updateResults(input.value)}).catch(()=>{});
    });
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
      const resolved=window.BPT_STOCK_RESOLVE?await window.BPT_STOCK_RESOLVE(ticker):{name:KNOWN_STOCK_NAMES[ticker]||document.getElementById('mTicker')?.dataset.selectedCompany||ticker,exchange:document.getElementById('mTicker')?.dataset.selectedExchange||'NSE',isin:document.getElementById('mTicker')?.dataset.selectedIsin||''};const companyName=resolved.name||ticker;const exchange=resolved.exchange||'NSE';const isin=resolved.isin||'';await fs.addDoc(fs.collection(db,'users',user.uid,'trades'),{ticker,stock:ticker,companyName,exchange,isin,quantity:q,avgBuy:b,sellPrice:s,buyDate:bd,sellDate:sd,cost:q*b,sale:q*s,logoUrl:stockLogoUrl({ticker,exchange,isin}),createdAt:fs.serverTimestamp()});
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
      const add=document.getElementById('addTradeOpen');if(add&&!add.dataset.bptStockHook){add.dataset.bptStockHook='1';add.addEventListener('click',()=>{setTimeout(()=>{stockAutocomplete();patchSameDaySave();const i=document.getElementById('mTicker');if(i)i.focus()},0)})}
      done=true;
    }
    stockAutocomplete();
    loadStocks();
    patchSameDaySave();
  }
  function start(){sameDayTradeGuard();apply();let n=0;const timer=setInterval(()=>{apply();if(++n>=80||done)clearInterval(timer)},250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
