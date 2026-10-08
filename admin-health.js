const { getStore } = require('@netlify/blobs');
const { verify } = require('./_shared/adminAuth');
const { getQuakesCached } = require('./_shared/fetchQuakes');
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization'};
exports.handler=async(event)=>{
  if(event.httpMethod==='OPTIONS') return {statusCode:204,headers};
  const token=String(event.headers?.authorization||'').replace(/^Bearer\s+/i,'');
  if(!verify(token)) return {statusCode:401,headers,body:JSON.stringify({ok:false,error:'Unauthorized'})};
  try{
    const data=await getQuakesCached();
    const store=getStore('push-subscriptions');
    const {blobs=[]}=await store.list();
    return {statusCode:200,headers,body:JSON.stringify({ok:true,latest:data.latest||null,count:data.count||0,subscriptions:blobs.length,fetchedAt:data.fetchedAt,sources:data.sources||{}})};
  }catch(e){return {statusCode:500,headers,body:JSON.stringify({ok:false,error:String(e)})};}
};
