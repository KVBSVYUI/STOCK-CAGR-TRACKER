(function(){
  'use strict';
  const KEY='bpt_app_lock_v1';
  const ROOT=document.documentElement;
  const STYLE=`#bpt-app-lock{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:20px;background:radial-gradient(800px 500px at 20% 0%,#15243a,#070b12 65%);color:#f4f7fb;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:auto}#bpt-app-lock *{box-sizing:border-box}#bpt-app-lock .bpt-lock-card{width:min(420px,100%);padding:26px 22px;border:1px solid #2a3a51;border-radius:25px;background:linear-gradient(180deg,#111c2b,#0b121d);box-shadow:0 24px 80px #000a}#bpt-app-lock h1{font-size:25px;letter-spacing:-.04em;margin:0}#bpt-app-lock p{font-size:13px;line-height:1.5;color:#94a3b8;margin:9px 0 20px}#bpt-app-lock label{display:block;font-size:12px;color:#aab8ca;margin:0 0 7px}#bpt-app-lock input{width:100%;height:54px;border:1px solid #2b3c52;border-radius:14px;background:#070e18;color:#fff;text-align:center;font-size:24px;letter-spacing:.28em;outline:none}#bpt-app-lock input:focus{border-color:#42d99d;box-shadow:0 0 0 3px #42d99d20}#bpt-app-lock button{width:100%;min-height:48px;border:0;border-radius:13px;margin-top:10px;padding:12px;font-weight:800;font-size:14px;background:linear-gradient(135deg,#6ce8b5,#2bc88d);color:#062015}#bpt-app-lock button.secondary{background:#172233;border:1px solid #2b3c52;color:#e8eef7}#bpt-app-lock .bpt-lock-error{min-height:18px;margin-top:8px;color:#ff8d95;font-size:12px;text-align:center}#bpt-app-lock .bpt-lock-note{font-size:10px;color:#66788f;text-align:center;margin-top:16px}html.bpt-locking body>*:not(#bpt-app-lock){visibility:hidden!important}html.bpt-locking body{overflow:hidden!important}html.bpt-locking #bpt-app-lock{visibility:visible!important}`;
  ROOT.classList.add('bpt-locking');
  const style=document.createElement('style');style.textContent=STYLE;(document.head||ROOT).appendChild(style);
  let overlay=null,failures=0,blockedUntil=0,unlocked=false;
  const enc=new TextEncoder();
  function b64u(bytes){let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const x=atob(s);return Uint8Array.from(x,c=>c.charCodeAt(0))}
  function random(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a}
  function cfg(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
  async function hashPin(pin,salt){const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64u(salt),iterations:180000,hash:'SHA-256'},key,256);return b64u(bits)}
  function shell(title,desc,body){if(!overlay){overlay=document.createElement('div');overlay.id='bpt-app-lock';document.body.appendChild(overlay)}overlay.innerHTML='<section class="bpt-lock-card" role="dialog" aria-modal="true" aria-labelledby="bpt-lock-title"><h1 id="bpt-lock-title">🔒 '+title+'</h1><p>'+desc+'</p>'+body+'<div class="bpt-lock-error" id="bpt-lock-error" role="status"></div><div class="bpt-lock-note">App lock is local to this browser/device. Firebase login and cloud data are unchanged.</div></section>'}
  function error(msg){const e=document.getElementById('bpt-lock-error');if(e)e.textContent=msg}
  function unlock(){unlocked=true;ROOT.classList.remove('bpt-locking');if(overlay){overlay.remove();overlay=null}document.removeEventListener('visibilitychange',onVisibility);document.addEventListener('visibilitychange',onVisibility); }
  function lock(){if(!cfg()||document.visibilityState==='hidden'){}unlocked=false;ROOT.classList.add('bpt-locking');if(document.body)showUnlock()}
  function onVisibility(){if(document.visibilityState==='hidden'){lock()}}
  async function createPin(){
    const pin=document.getElementById('bpt-pin').value,confirm=document.getElementById('bpt-pin-confirm').value;
    if(!/^\d{4,8}$/.test(pin)){error('Choose a PIN of 4–8 digits.');return}
    if(pin!==confirm){error('PINs do not match.');return}
    const salt=b64u(random(16)),digest=await hashPin(pin,salt);
    localStorage.setItem(KEY,JSON.stringify({salt,digest,passkey:null}));
    showPasskeySetup();
  }
  function showSetup(){
    shell('Set up app lock','Create a 4–8 digit PIN. This adds a local lock without changing your account or saved trades.','<label for="bpt-pin">New PIN</label><input id="bpt-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" aria-label="New PIN"><label for="bpt-pin-confirm" style="margin-top:13px">Confirm PIN</label><input id="bpt-pin-confirm" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" aria-label="Confirm PIN"><button id="bpt-create-pin">Create PIN</button>');
    document.getElementById('bpt-create-pin').onclick=createPin;
  }
  function showPasskeySetup(){
    shell('Add fingerprint / passkey?','If supported, your device can verify you with its screen lock or fingerprint. You can also continue with your PIN.','<button id="bpt-enable-passkey">Enable fingerprint / passkey</button><button class="secondary" id="bpt-skip-passkey">Continue with PIN</button>');
    document.getElementById('bpt-enable-passkey').onclick=async()=>{const b=document.getElementById('bpt-enable-passkey');b.disabled=true;b.textContent='Waiting for device…';try{await registerPasskey();unlock()}catch(e){console.warn('Passkey setup unavailable',e);error('Could not enable passkey. You can continue with your PIN.');b.disabled=false;b.textContent='Try fingerprint / passkey again';document.getElementById('bpt-skip-passkey').onclick=unlock}};
    document.getElementById('bpt-skip-passkey').onclick=unlock;
  }
  function showUnlock(){
    const c=cfg();if(!c){showSetup();return}
    shell('Welcome back','Enter your app PIN to unlock Booked Profit Tracker. Your Firebase session remains unchanged.','<label for="bpt-pin">App PIN</label><input id="bpt-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="current-password" aria-label="App PIN"><button id="bpt-unlock">Unlock</button>'+(c.passkey?'<button class="secondary" id="bpt-passkey">Use fingerprint / passkey</button>':''));
    const input=document.getElementById('bpt-pin');
    document.getElementById('bpt-unlock').onclick=verifyPin;
    input.addEventListener('keydown',e=>{if(e.key==='Enter')verifyPin()});
    if(c.passkey)document.getElementById('bpt-passkey').onclick=verifyPasskey;
    setTimeout(()=>input.focus({preventScroll:true}),100);
  }
  async function verifyPin(){
    const c=cfg(),pin=document.getElementById('bpt-pin').value;
    if(Date.now()<blockedUntil){error('Too many attempts. Wait a little and try again.');return}
    if(!/^\d{4,8}$/.test(pin)){error('Enter your 4–8 digit PIN.');return}
    const b=document.getElementById('bpt-unlock');b.disabled=true;b.textContent='Checking…';
    try{if(await hashPin(pin,c.salt)===c.digest){failures=0;unlock();return}failures++;if(failures>=5){blockedUntil=Date.now()+30000;failures=0}error('Incorrect PIN. Please try again.')}
    catch(e){error('Could not verify PIN on this device.')}
    b.disabled=false;b.textContent='Unlock';document.getElementById('bpt-pin').value='';document.getElementById('bpt-pin').focus();
  }
  function derToRaw(sig){const a=new Uint8Array(sig);if(a[0]!==0x30)return a;let i=2;if(a[i++]!==0x02)return a;let rl=a[i++],r=a.slice(i,i+rl);i+=rl;if(a[i++]!==0x02)return a;let sl=a[i++],s=a.slice(i,i+sl);while(r.length>32&&r[0]===0)r=r.slice(1);while(s.length>32&&s[0]===0)s=s.slice(1);const out=new Uint8Array(64);out.set(r,32-r.length);out.set(s,64-s.length);return out}
  async function registerPasskey(){
    if(!window.PublicKeyCredential||!navigator.credentials||!crypto.subtle)throw new Error('WebAuthn unavailable');
    const host=location.hostname;if(!host||!location.protocol.startsWith('https:'))throw new Error('HTTPS required');
    const challenge=random(32),userId=random(16);
    const cred=await navigator.credentials.create({publicKey:{challenge,rp:{name:'Booked Profit Tracker',id:host},user:{id:userId,name:'local-app-lock',displayName:'Booked Profit Tracker'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'required',requireResidentKey:true,userVerification:'required'},timeout:60000,attestation:'none'}});
    if(!cred||!cred.response.getPublicKey)throw new Error('Browser cannot export the public key');
    const publicKey=cred.response.getPublicKey(),alg=cred.response.getPublicKeyAlgorithm();
    if(!publicKey||![-7,-257].includes(alg))throw new Error('Unsupported passkey algorithm');
    const c=cfg();c.passkey={id:b64u(cred.rawId),publicKey:b64u(publicKey),alg};localStorage.setItem(KEY,JSON.stringify(c));
  }
  async function verifyPasskey(){
    const c=cfg(),p=c&&c.passkey;if(!p)return error('No passkey is registered.');
    const button=document.getElementById('bpt-passkey');button.disabled=true;button.textContent='Waiting for device…';
    try{
      const challenge=random(32),cred=await navigator.credentials.get({publicKey:{challenge,rpId:location.hostname,allowCredentials:[{type:'public-key',id:unb64u(p.id)}],userVerification:'required',timeout:60000}});
      if(!cred||cred.id!==p.id)throw new Error('Credential mismatch');
      const clientBytes=new Uint8Array(cred.response.clientDataJSON),client=JSON.parse(new TextDecoder().decode(clientBytes));
      if(client.type!=='webauthn.get'||client.challenge!==b64u(challenge)||client.origin!==location.origin)throw new Error('Invalid challenge or origin');
      const authData=new Uint8Array(cred.response.authenticatorData),rpHash=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(location.hostname)));
      if(authData.length<37||authData.slice(0,32).some((v,i)=>v!==rpHash[i])||(authData[32]&5)!==5)throw new Error('Device verification missing');
      const clientHash=new Uint8Array(await crypto.subtle.digest('SHA-256',clientBytes)),signed=new Uint8Array(authData.length+clientHash.length);signed.set(authData);signed.set(clientHash,authData.length);
      const key=await crypto.subtle.importKey('spki',unb64u(p.publicKey),p.alg===-7?{name:'ECDSA',namedCurve:'P-256'}:{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
      const sig=p.alg===-7?derToRaw(cred.response.signature):unb64u(b64u(cred.response.signature));
      const valid=await crypto.subtle.verify(p.alg===-7?{name:'ECDSA',hash:'SHA-256'}:{name:'RSASSA-PKCS1-v1_5'},key,sig,signed);
      if(!valid)throw new Error('Signature invalid');unlock();
    }catch(e){console.warn('Passkey unlock failed',e);error(e&&e.name==='NotAllowedError'?'Passkey cancelled or unavailable. Enter your PIN instead.':'Passkey could not verify. Enter your PIN instead.');button.disabled=false;button.textContent='Use fingerprint / passkey'}
  }
  function init(){if(!document.body){document.addEventListener('DOMContentLoaded',init,{once:true});return}showUnlock();document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',()=>{if(cfg())lock()});window.addEventListener('pageshow',e=>{if(cfg()&&e.persisted)lock()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();