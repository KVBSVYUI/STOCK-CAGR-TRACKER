(function(){
  const APP='https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
  const AUTH='https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
  const FS='https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
  const OWNER_USERNAME='mohitx12';
  const OWNER_EMAIL=OWNER_USERNAME+'@bookedprofittracker.app';
  const APP_VERSION='v44';
  let firebasePromise=null;
  let current=null;
  let isAdmin=false;
  const loadFirebase=async()=>{if(firebasePromise)return firebasePromise;firebasePromise=Promise.all([import(APP),import(AUTH),import(FS)]);return firebasePromise};
  const waitForApp=()=>new Promise((resolve,reject)=>{let n=0;const t=setInterval(async()=>{try{const [a,am,fs]=await loadFirebase();const apps=a.getApps();if(apps[0]){clearInterval(t);resolve({a,am,fs,app:apps[0]});return}}catch(e){}if(++n>80){clearInterval(t);reject(Error('Firebase app not ready'))}},250)});
  const modal=(html)=>{document.querySelectorAll('.app-drawer,.modal-back').forEach(x=>x.remove());const b=document.createElement('div');b.className='modal-back open';b.innerHTML='<div class="modal" style="max-width:900px;max-height:88vh;overflow:auto">'+html+'</div>';document.body.appendChild(b);b.onclick=e=>{if(e.target===b)b.remove()};b.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>b.remove());return b};
  const account=async()=>{const b=modal('<button class="close" data-close type="button">×</button><h3>Account</h3><p style="color:#8997aa">Manage your account and sign out securely.</p><div class="modal-actions"><button id="bptSignOut" class="secondary" type="button">Sign out</button></div>');b.querySelector('#bptSignOut').onclick=async()=>{try{const {am,auth}=current||{};if(auth)await am.signOut(auth)}catch(e){alert('Could not sign out. Please try again.')}}};
  const mailbox=async()=>{const b=modal('<button class="close" data-close type="button">×</button><h3>📬 Mailbox</h3><p style="color:#8997aa;font-size:12px">Announcements and important updates.</p><div id="bptMailboxList" style="display:grid;gap:10px;margin-top:16px">Loading…</div>');try{const {fs,app,user}=current,db=fs.getFirestore(app);const [as,rs]=await Promise.all([fs.getDocs(fs.query(fs.collection(db,'announcements'),fs.orderBy('createdAt','desc'),fs.limit(30))),fs.getDocs(fs.collection(db,'users',user.uid,'mailboxState'))]);const read=new Set(rs.docs.map(x=>x.id));const list=b.querySelector('#bptMailboxList');if(!as.size){list.innerHTML='<div style="padding:24px;text-align:center;color:#8997aa">No announcements yet.</div>';return}list.innerHTML=as.docs.map(d=>{const x=d.data()||{};return `<article style="padding:14px;border:1px solid #243247;border-radius:14px;background:#0e1927"><div style="display:flex;justify-content:space-between;gap:10px"><b>${esc(x.title||'Announcement')}</b>${read.has(d.id)?'':'<span style="font-size:10px;color:#55d6a0">● NEW</span>'}</div><div style="white-space:pre-wrap;margin-top:8px;line-height:1.55;color:#c8d1dd;font-size:13px">${esc(x.body||'')}</div></article>`}).join('');for(const d of as.docs){if(!read.has(d.id))await fs.setDoc(fs.doc(db,'users',user.uid,'mailboxState',d.id),{readAt:fs.serverTimestamp()},{merge:true})}}catch(e){b.querySelector('#bptMailboxList').innerHTML='<div style="color:#ff8d8d">Could not load mailbox.</div>'}};
  const openMenu=()=>{document.querySelector('.app-drawer')?.remove();const d=document.createElement('div');d.className='app-drawer';d.style.cssText='position:fixed;inset:0;z-index:9999;background:#000b';d.innerHTML='<aside style="width:min(330px,88vw);height:100%;background:#0c141f;border-right:1px solid #2a3a51;padding:22px;box-shadow:20px 0 60px #0008"><button id="bptMenuClose" class="icon" type="button" style="float:right">×</button><h2 style="margin:4px 0 6px;font-size:20px">Menu</h2><p style="color:#8997aa;font-size:11px">Account and app tools</p><div style="margin-top:22px;display:grid;gap:8px"><button id="bptMenuAccount" class="secondary" type="button" style="text-align:left">👤 Account</button><button id="bptMenuMailbox" class="secondary" type="button" style="text-align:left">📬 Mailbox</button>'+(isAdmin?'<button id="bptMenuAdmin" class="secondary" type="button" style="text-align:left">🛡️ Admin</button>':'')+'</div></aside>';document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.remove()};d.querySelector('#bptMenuClose').onclick=()=>d.remove();d.querySelector('#bptMenuAccount').onclick=account;d.querySelector('#bptMenuMailbox').onclick=mailbox;if(isAdmin)d.querySelector('#bptMenuAdmin').onclick=adminDashboard};
  async function adminDashboard(){
  if(!current){
    try{
      const [a,am,fs]=await loadFirebase();
      const apps=a.getApps();
      if(!apps[0])throw new Error('Firebase app is not ready yet.');
      const app=apps[0],auth=am.getAuth(app),user=auth.currentUser;
      if(!user)throw new Error('Please sign in again.');
      current={a,am,fs,app,auth,user};
      isAdmin=String(user.email||'').toLowerCase()===OWNER_EMAIL||String(user.displayName||'').toLowerCase()===OWNER_USERNAME;
      window.__bptAdminUid=user.uid;
      window.__bptIsAdmin=isAdmin;
    }catch(e){
      alert(e.message||'Admin session is still loading. Please open Admin again.');
      return;
    }
  }

  const b=modal('<style>.bpt-admin-head{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:4px 2px 16px}.bpt-admin-title{display:flex;align-items:center;gap:11px}.bpt-admin-shield{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#172b42,#102033);border:1px solid #2c425d;font-size:22px}.bpt-admin-title h3{margin:0;font-size:19px;letter-spacing:-.02em}.bpt-admin-title p{margin:4px 0 0;color:#718096;font-size:11px}.bpt-admin-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:4px 0 16px}.bpt-admin-stat{padding:13px 12px;border:1px solid #203047;border-radius:16px;background:linear-gradient(145deg,#101b29,#0b1420)}.bpt-admin-stat small{display:block;color:#718096;font-size:9px;text-transform:uppercase;letter-spacing:.07em}.bpt-admin-stat b{display:block;margin-top:5px;font-size:19px;line-height:1.1;color:#eef5ff}.bpt-admin-stat:nth-child(2) b{color:#55d6a0}.bpt-admin-stat:nth-child(3) b{color:#8fc7ff}.bpt-admin-stat:nth-child(4) b{color:#d7b8ff}.bpt-admin-meta{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px;padding:10px 12px;border-radius:13px;background:#0b1522;border:1px solid #1d2c40;color:#718096;font-size:10px}.bpt-admin-meta strong{color:#55d6a0}.bpt-admin-search{width:100%;box-sizing:border-box;margin:0 0 12px;padding:12px 14px!important;border-radius:13px!important;background:#0b1522!important;border:1px solid #25364c!important;color:#eef5ff!important;outline:none}.bpt-user-list{display:grid;gap:9px}.bpt-user-card{padding:13px;border:1px solid #203047;border-radius:17px;background:linear-gradient(145deg,#101b29,#0b1420);transition:.15s}.bpt-user-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.bpt-user-id{display:flex;align-items:center;gap:10px;min-width:0}.bpt-avatar{width:39px;height:39px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#203954,#14263a);border:1px solid #2d4965;color:#bfe0ff;font-weight:800;font-size:13px;flex:none}.bpt-user-name{min-width:0}.bpt-user-name b{display:block;color:#eef5ff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bpt-user-name small{display:block;margin-top:3px;color:#718096;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bpt-user-profit{text-align:right;flex:none}.bpt-user-profit small{display:block;color:#718096;font-size:8px;text-transform:uppercase;letter-spacing:.06em}.bpt-user-profit b{display:block;margin-top:3px;font-size:15px;color:#55d6a0}.bpt-user-bottom{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:11px;padding-top:10px;border-top:1px solid #1a293b}.bpt-user-metrics{display:flex;gap:13px;color:#7f91a6;font-size:9px}.bpt-user-metrics b{color:#cbd6e3;font-size:10px}.bpt-user-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.bpt-user-actions button{font-size:9px!important;padding:6px 9px!important;border-radius:9px!important}.bpt-empty{padding:28px 12px;text-align:center;color:#718096;border:1px dashed #26384e;border-radius:15px}.bpt-owner-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;background:#0c2b22;color:#55d6a0;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.bpt-disabled-badge{display:inline-flex;padding:4px 8px;border-radius:999px;background:#3a2024;color:#ff9b9b;font-size:8px;font-weight:800}@media(max-width:600px){.bpt-admin-head{align-items:flex-start}.bpt-admin-grid{grid-template-columns:repeat(2,1fr)}.bpt-admin-stat b{font-size:17px}.bpt-admin-meta{align-items:flex-start;flex-direction:column}.bpt-user-top{align-items:flex-start}.bpt-user-profit b{font-size:14px}.bpt-user-bottom{align-items:flex-end}.bpt-user-metrics{gap:9px}.bpt-user-actions{max-width:170px}.bpt-admin-title h3{font-size:18px}}</style><button class="close" data-close type="button">×</button><div class="bpt-admin-head"><div class="bpt-admin-title"><div class="bpt-admin-shield">🛡️</div><div><h3>Admin Dashboard</h3><p>Users, performance & app administration</p></div></div><button id="bptAnnounce" class="primary" type="button">📢 Announcement</button></div><div id="bptAdminBody" style="color:#8997aa">Loading admin data…</div>');
  b.querySelector('#bptAnnounce').onclick=sendAnnouncement;

  try{
    const {fs,app}=current;
    const db=fs.getFirestore(app);
    const ps=await fs.getDocs(fs.collection(db,'users'));
    const users=ps.docs.map(d=>({uid:d.id,...d.data(),tradeCount:0,profit:0,installations:0}));

    await Promise.all(users.map(async u=>{
      const [ts,us]=await Promise.all([
        fs.getDocs(fs.collection(db,'users',u.uid,'trades')),
        fs.getDocs(fs.collection(db,'users',u.uid,'usage'))
      ]);
      u.installations=us.size;
      ts.docs.forEach(d=>{
        const x=d.data()||{};
        const cost=Number(x.cost??((Number(x.quantity)||0)*(Number(x.avgBuy)||0)));
        const sale=Number(x.sale??((Number(x.quantity)||0)*(Number(x.sellPrice)||0)));
        u.tradeCount++;
        u.profit+=sale-cost;
      });
    }));

    const now=Date.now();
    const active30=users.filter(u=>{const v=u.lastSeen?.toMillis?u.lastSeen.toMillis():0;return v&&now-v<30*86400000}).length;
    const new7=users.filter(u=>{const v=u.createdAt?.toMillis?u.createdAt.toMillis():0;return v&&now-v<7*86400000}).length;
    const installations=users.reduce((n,u)=>n+u.installations,0);
    const totalProfit=users.reduce((n,u)=>n+u.profit,0);

    const body=b.querySelector('#bptAdminBody');
    body.innerHTML='<div class="bpt-admin-grid"><div class="bpt-admin-stat"><small>Registered users</small><b>'+users.length+'</b></div><div class="bpt-admin-stat"><small>Active · 30d</small><b>'+active30+'</b></div><div class="bpt-admin-stat"><small>New · 7d</small><b>'+new7+'</b></div><div class="bpt-admin-stat"><small>Installations</small><b>'+installations+'</b></div></div><div class="bpt-admin-meta"><span>Owner · <strong>'+esc(OWNER_USERNAME)+'</strong> · Total booked profit '+money(totalProfit)+'</span><span>First launches/devices · not APK downloads</span></div><input id="bptUserSearch" class="bpt-admin-search" placeholder="🔎  Search username, email or UID…"><div id="bptUserRows" class="bpt-user-list"></div>';

    const render=()=>{
      const q=b.querySelector('#bptUserSearch').value.trim().toLowerCase();
      const arr=users.filter(u=>[u.username,u.email,u.uid].some(v=>String(v||'').toLowerCase().includes(q)));
      b.querySelector('#bptUserRows').innerHTML=arr.map(u=>{
        const name=String(u.username||u.displayName||'User');
        const initials=name.slice(0,2).toUpperCase();
        const profitClass=u.profit>=0?'':'color:#ff8f8f!important';
        const owner=String(u.email||'').toLowerCase()===OWNER_EMAIL||String(name).toLowerCase()===OWNER_USERNAME;
        return '<div class="bpt-user-card"><div class="bpt-user-top"><div class="bpt-user-id"><div class="bpt-avatar">'+esc(initials)+'</div><div class="bpt-user-name"><b>'+esc(name)+'</b><small>'+esc(u.email||'')+'</small></div></div><div class="bpt-user-profit"><small>Booked profit</small><b style="'+profitClass+'">'+(u.profit>=0?'+':'')+money(u.profit)+'</b></div></div><div class="bpt-user-bottom"><div class="bpt-user-metrics"><span>Trades <b>'+u.tradeCount+'</b></span><span>Devices <b>'+u.installations+'</b></span>'+(owner?'<span class="bpt-owner-badge">Owner</span>':(u.disabled?'<span class="bpt-disabled-badge">Disabled</span>':''))+'</div><div class="bpt-user-actions"><button class="secondary bpt-mini" data-view="'+esc(u.uid)+'">View</button><button class="secondary bpt-mini" data-toggle="'+esc(u.uid)+'">'+(u.disabled?'Enable':'Disable')+'</button>'+(u.uid===current.user.uid?'':'<button class="danger bpt-mini" data-delete="'+esc(u.uid)+'">Delete</button>')+'</div></div></div>';
      }).join('')||'<div class="bpt-empty">No users found.</div>';

      b.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>userDetails(x.dataset.view));
      b.querySelectorAll('[data-toggle]').forEach(x=>x.onclick=()=>toggleUser(x.dataset.toggle,!users.find(u=>u.uid===x.dataset.toggle)?.disabled));
      b.querySelectorAll('[data-delete]').forEach(x=>x.onclick=()=>deleteUserData(x.dataset.delete));
    };

    b.querySelector('#bptUserSearch').oninput=render;
    render();
  }catch(e){
    b.querySelector('#bptAdminBody').innerHTML='<div style="color:#ff8d8d;padding:18px;border:1px solid #5b3036;border-radius:14px;background:#25151a">Could not load admin data: '+esc(e.message||e)+'</div>';
  }
}
  window.BPT_ADMIN_DASHBOARD=adminDashboard;
  async function userDetails(uid){try{const {fs,app}=current,db=fs.getFirestore(app);const [p,t,c,u]=await Promise.all([fs.getDoc(fs.doc(db,'users',uid)),fs.getDocs(fs.collection(db,'users',uid,'trades')),fs.getDocs(fs.collection(db,'users',uid,'charges')),fs.getDocs(fs.collection(db,'users',uid,'usage'))]);const x=p.data()||{};let profit=0;t.docs.forEach(d=>{const z=d.data()||{};profit+=Number(z.sale??0)-Number(z.cost??0)});modal('<button class="close" data-close type="button">×</button><h3>'+esc(x.username||'User')+'</h3><p style="color:#8997aa;font-size:12px">'+esc(x.email||'')+' · '+(x.disabled?'Disabled':'Active')+' · '+u.size+' installation record(s)</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0"><div class="bpt-stat"><small>Trades</small><b>'+t.size+'</b></div><div class="bpt-stat"><small>Booked profit</small><b>'+money(profit)+'</b></div><div class="bpt-stat"><small>Charges</small><b>'+c.size+'</b></div></div><h4>Trade history</h4><div style="overflow:auto"><table style="width:100%;font-size:11px"><thead><tr><th>Stock</th><th>Buy</th><th>Sell</th><th>Profit</th></tr></thead><tbody>'+t.docs.map(d=>{const z=d.data()||{};return '<tr><td>'+esc(z.ticker||z.stock||'—')+'</td><td>'+esc(z.buyDate||'—')+'</td><td>'+esc(z.sellDate||'—')+'</td><td>'+money(Number(z.sale??0)-Number(z.cost??0))+'</td></tr>'}).join('')+'</tbody></table></div>')}catch(e){alert(e.message||'Could not load user details.')}}
  async function toggleUser(uid,disabled){if(uid===current.user.uid&&disabled)return alert('You cannot disable your own administrator access.');if(!confirm(disabled?'Disable this user in the tracker?':'Enable this user in the tracker?'))return;try{const db=current.fs.getFirestore(current.app);await current.fs.setDoc(current.fs.doc(db,'users',uid),{disabled:!!disabled,disabledAt:disabled?current.fs.serverTimestamp():null},{merge:true});adminDashboard()}catch(e){alert(e.message||'Could not update user.')}}
  async function deleteUserData(uid){if(uid===current.user.uid)return alert('You cannot delete your own administrator data.');if(!confirm('Delete this user’s tracker data? The Firebase Authentication account itself remains.'))return;try{const db=current.fs.getFirestore(current.app);for(const sub of ['trades','charges','usage','mailboxState']){const s=await current.fs.getDocs(current.fs.collection(db,'users',uid,sub));for(const d of s.docs)await current.fs.deleteDoc(d.ref)}await current.fs.deleteDoc(current.fs.doc(db,'users',uid));adminDashboard()}catch(e){alert(e.message||'Could not delete user data.')}}
  async function sendAnnouncement(){const b=modal('<button class="close" data-close type="button">×</button><h3>📢 Send Announcement</h3><label style="display:block;margin-top:16px">Title<input id="bptAnnTitle" maxlength="120" placeholder="Important update"></label><label style="display:block;margin-top:12px">Message<textarea id="bptAnnBody" maxlength="4000" rows="7" placeholder="Write your announcement…" style="width:100%;resize:vertical"></textarea></label><div class="modal-actions"><button class="secondary" data-close type="button">Cancel</button><button id="bptAnnSend" class="primary" type="button">Send to everyone</button></div>');b.querySelector('#bptAnnSend').onclick=async()=>{const title=b.querySelector('#bptAnnTitle').value.trim(),body=b.querySelector('#bptAnnBody').value.trim();if(!title||!body)return alert('Enter a title and message.');try{const db=current.fs.getFirestore(current.app);await current.fs.addDoc(current.fs.collection(db,'announcements'),{title,body,createdAt:current.fs.serverTimestamp(),createdBy:current.user.uid});alert('Announcement sent to all users.');b.remove()}catch(e){alert(e.message||'Could not send announcement.')}}}
  async function boot(){
    try{
      const {a,am,fs,app}=await waitForApp();
      const auth=am.getAuth(app);
      am.onAuthStateChanged(auth,async user=>{
        if(!user){
          current=null;
          isAdmin=false;
          window.__bptIsAdmin=false;
          return;
        }

        const ownerByAuth=
          String(user.email||'').toLowerCase()===OWNER_EMAIL ||
          String(user.displayName||'').toLowerCase()===OWNER_USERNAME;

        // Set owner state before any Firestore operation.
        isAdmin=ownerByAuth;
        current={a,am,fs,app,auth,user};
        window.__bptAdminUid=user.uid;
        window.__bptIsAdmin=isAdmin;

        const m=document.getElementById('bptMenuButton');
        if(m)m.onclick=openMenu;

        try{
          const db=fs.getFirestore(app);
          const ref=fs.doc(db,'users',user.uid);
          const p=await fs.getDoc(ref);
          const profile=p.exists()?p.data()||{}:{};

          if(profile.disabled===true){
            await am.signOut(auth);
            return;
          }

          if(!p.exists()){
            await fs.setDoc(ref,{
              email:user.email||'',
              username:(user.email||'').split('@')[0]||'User',
              displayName:user.displayName||'',
              createdAt:fs.serverTimestamp(),
              lastSeen:fs.serverTimestamp()
            });
          }else{
            await fs.setDoc(ref,{lastSeen:fs.serverTimestamp()},{merge:true});
          }

          let installId='';
          try{
            installId=localStorage.getItem('bpt_install_id_v1')||'';
            if(!installId){
              installId=crypto?.randomUUID
                ?crypto.randomUUID()
                :'bpt_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2);
              localStorage.setItem('bpt_install_id_v1',installId);
            }
          }catch(e){
            installId='bpt_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2);
          }

          await fs.setDoc(
            fs.doc(db,'users',user.uid,'usage',installId),
            {
              firstSeen:fs.serverTimestamp(),
              lastSeen:fs.serverTimestamp(),
              platform:navigator.platform||'',
              language:navigator.language||'',
              userAgent:navigator.userAgent||'',
              appVersion:'v50',
              standalone:window.matchMedia?.('(display-mode: standalone)').matches===true
            },
            {merge:true}
          );

          try{
            const ar=await fs.getDoc(fs.doc(db,'admins',user.uid));
            isAdmin=ownerByAuth || (ar.exists()&&ar.data()?.admin===true);
          }catch(e){
            isAdmin=ownerByAuth;
          }

          window.__bptIsAdmin=isAdmin;
          const mm=document.getElementById('bptMenuButton');
          if(mm)mm.onclick=openMenu;
        }catch(e){
          isAdmin=ownerByAuth;
          window.__bptIsAdmin=isAdmin;
          window.__bptAdminUid=user.uid;
          const mm=document.getElementById('bptMenuButton');
          if(mm)mm.onclick=openMenu;
          console.error('BPT admin bootstrap Firestore step failed',e);
        }
      });
    }catch(e){
      console.error('BPT admin loader failed',e);
    }
  }
  boot();
})();
