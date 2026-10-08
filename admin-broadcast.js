const webpush = require('web-push');
const { getStore } = require('@netlify/blobs');
const { verify } = require('./_shared/adminAuth');
const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization'};
const PUB = process.env.VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers};
  const token = String(event.headers?.authorization || '').replace(/^Bearer\s+/i,'');
  if (!verify(token)) return {statusCode:401,headers,body:JSON.stringify({ok:false,error:'Unauthorized'})};
  if (!PUB || !PRIV) return {statusCode:500,headers,body:JSON.stringify({ok:false,error:'VAPID key belum dikonfigurasi'})};
  try {
    const body = JSON.parse(event.body || '{}');
    const title = String(body.title || 'WRS Gempa').slice(0,80);
    const message = String(body.body || 'Peringatan dari WRS Gempa').slice(0,220);
    webpush.setVapidDetails('mailto:wrs-gempa@example.com',PUB,PRIV);
    const store = getStore('push-subscriptions');
    const {blobs=[]} = await store.list();
    let sent=0, removed=0;
    await Promise.all(blobs.map(async ({key})=>{
      const item = await store.get(key,{type:'json'}); if(!item) return;
      const sub = item.subscription?.endpoint ? item.subscription : item;
      if(!sub?.endpoint) return;
      try { await webpush.sendNotification(sub, JSON.stringify({title,body:message,url:'/?view=history'})); sent++; }
      catch(e){ if(e.statusCode===404||e.statusCode===410){await store.delete(key);removed++;} }
    }));
    return {statusCode:200,headers,body:JSON.stringify({ok:true,sent,removed})};
  } catch(e){ return {statusCode:400,headers,body:JSON.stringify({ok:false,error:String(e)})}; }
};
