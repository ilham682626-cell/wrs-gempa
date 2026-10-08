const { getStore } = require('@netlify/blobs');
const { verify } = require('./_shared/adminAuth');
const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,PUT,OPTIONS'};
const defaults = { minMag: 4, notifyAll: false, tsunamiPriority: true, maintenance: false, announcement: '', updatedAt: null };
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers};
  const token = String(event.headers?.authorization || '').replace(/^Bearer\s+/i,'');
  if (!verify(token)) return {statusCode:401,headers,body:JSON.stringify({ok:false,error:'Unauthorized'})};
  const store = getStore('wrs-admin');
  try {
    if (event.httpMethod === 'GET') {
      const data = (await store.get('settings',{type:'json'})) || defaults;
      return {statusCode:200,headers,body:JSON.stringify({ok:true,settings:{...defaults,...data}})};
    }
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const current = (await store.get('settings',{type:'json'})) || defaults;
      const next = {...current,...body,updatedAt:new Date().toISOString()};
      next.minMag = Math.max(1.5, Math.min(9.9, Number(next.minMag) || 4));
      await store.setJSON('settings', next);
      return {statusCode:200,headers,body:JSON.stringify({ok:true,settings:next})};
    }
    return {statusCode:405,headers,body:JSON.stringify({ok:false,error:'method'})};
  } catch (e) { return {statusCode:500,headers,body:JSON.stringify({ok:false,error:String(e)})}; }
};
