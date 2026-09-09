const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,FieldPath}=require('firebase-admin/firestore');

initializeApp();
const db=getFirestore();
const auth=getAuth();
const bootstrapSecret=defineSecret('ADMIN_BOOTSTRAP_SECRET');

function requireAdmin(request){
  if(!request.auth||request.auth.token?.admin!==true)throw new HttpsError('permission-denied','Administrator access required.');
  return request.auth.uid;
}
function safeUser(u){
  return {uid:u.uid,username:(u.email||'').split('@')[0]||u.displayName||'User',email:u.email||'',disabled:!!u.disabled,createdAt:u.metadata.creationTime||null,lastSignIn:u.metadata.lastSignInTime||null};
}

exports.bootstrapAdmin=onCall({secrets:[bootstrapSecret],region:'asia-south1'},async request=>{
  if(!request.auth)throw new HttpsError('unauthenticated','Please sign in first.');
  const supplied=String(request.data?.secret||'');
  const configured=bootstrapSecret.value();
  if(!configured||supplied!==configured)throw new HttpsError('permission-denied','Invalid administrator setup code.');
  await auth.setCustomUserClaims(request.auth.uid,{...(request.auth.token||{}),admin:true});
  return {ok:true,message:'Administrator access enabled. Sign out and sign in again to refresh your security token.'};
});

exports.getAdminDashboard=onCall({region:'asia-south1'},async request=>{
  requireAdmin(request);
  const users=[];let token;
  do{
    const page=await auth.listUsers(1000,token);
    for(const u of page.users){
      const item=safeUser(u);
      const tradesSnap=await db.collection('users').doc(u.uid).collection('trades').get();
      let invested=0,sold=0,profit=0;
      tradesSnap.forEach(d=>{const x=d.data()||{};const cost=Number(x.cost??(Number(x.quantity)||0)*(Number(x.avgBuy)||0));const sale=Number(x.sale??(Number(x.quantity)||0)*(Number(x.sellPrice)||0));invested+=Number.isFinite(cost)?cost:0;sold+=Number.isFinite(sale)?sale:0;profit+=Number.isFinite(sale-cost)?sale-cost:0;});
      item.tradeCount=tradesSnap.size;item.invested=invested;item.sold=sold;item.profit=profit;
      users.push(item);
    }
    token=page.pageToken;
  }while(token);
  users.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  return {users,counts:{users:users.length,active:users.filter(x=>!x.disabled).length,disabled:users.filter(x=>x.disabled).length,trades:users.reduce((n,x)=>n+x.tradeCount,0),profit:users.reduce((n,x)=>n+x.profit,0)}};
});

exports.getAdminUser=onCall({region:'asia-south1'},async request=>{
  requireAdmin(request);
  const uid=String(request.data?.uid||'');
  if(!uid)throw new HttpsError('invalid-argument','User id is required.');
  const u=await auth.getUser(uid);
  const trades=await db.collection('users').doc(uid).collection('trades').orderBy('sellDate','desc').get();
  const charges=await db.collection('users').doc(uid).collection('charges').get();
  return {user:safeUser(u),trades:trades.docs.map(d=>({id:d.id,...d.data()})),charges:charges.docs.map(d=>({id:d.id,...d.data()}))};
});

exports.setUserDisabled=onCall({region:'asia-south1'},async request=>{
  const adminUid=requireAdmin(request);const uid=String(request.data?.uid||'');const disabled=!!request.data?.disabled;
  if(!uid)throw new HttpsError('invalid-argument','User id is required.');
  if(uid===adminUid&&disabled)throw new HttpsError('failed-precondition','You cannot disable your own administrator account.');
  await auth.updateUser(uid,{disabled});
  return {ok:true,disabled};
});

exports.deleteUser=onCall({region:'asia-south1',timeoutSeconds:540},async request=>{
  const adminUid=requireAdmin(request);const uid=String(request.data?.uid||'');
  if(!uid)throw new HttpsError('invalid-argument','User id is required.');
  if(uid===adminUid)throw new HttpsError('failed-precondition','You cannot delete your own administrator account.');
  const userRef=db.collection('users').doc(uid);
  await db.recursiveDelete(userRef);
  await auth.deleteUser(uid);
  return {ok:true};
});

exports.sendAnnouncement=onCall({region:'asia-south1'},async request=>{
  const adminUid=requireAdmin(request);
  const title=String(request.data?.title||'').trim().slice(0,120);
  const body=String(request.data?.body||'').trim().slice(0,4000);
  if(!title||!body)throw new HttpsError('invalid-argument','Title and message are required.');
  const ref=await db.collection('announcements').add({title,body,createdAt:new Date(),createdBy:adminUid});
  return {ok:true,id:ref.id};
});
