const { login } = require('./_shared/adminAuth');
exports.handler = async (event) => {
  const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers,body:JSON.stringify({ok:false,error:'method'})};
  try {
    const {password} = JSON.parse(event.body || '{}');
    const token = login(String(password || ''));
    if (!token) return {statusCode:401,headers,body:JSON.stringify({ok:false,error:'Kredensial admin salah atau environment belum dikonfigurasi.'})};
    return {statusCode:200,headers,body:JSON.stringify({ok:true,token})};
  } catch (e) { return {statusCode:400,headers,body:JSON.stringify({ok:false,error:'Request tidak valid'})}; }
};
