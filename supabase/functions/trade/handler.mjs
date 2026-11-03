const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
export function createTradeHandler(admin){return async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const token=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');if(!token)return json({error:'AUTH_REQUIRED'},401);
  const {data,error}=await admin.auth.getUser(token);if(error||!data?.user)return json({error:'AUTH_REQUIRED'},401);
  const body=await req.text();if(body.length>4096)return json({error:'REQUEST_TOO_LARGE'},413);
  let input;try{input=JSON.parse(body);}catch{return json({error:'INVALID_REQUEST'},400);}
  if(!['host','join','sync','offer','confirm','unready','leave'].includes(input.action))return json({error:'INVALID_ACTION'},400);
  const payload=input.payload||{};
  if(input.action==='join'&&!/^[A-Z0-9]{8}$/i.test(payload.code||''))return json({error:'ROOM_NOT_FOUND'},400);
  if(!['host','join'].includes(input.action)&&!/^[0-9a-f-]{36}$/i.test(payload.roomId||''))return json({error:'ROOM_NOT_FOUND'},400);
  const out=await admin.rpc('trade_gateway',{p_actor:data.user.id,p_action:input.action,p_payload:payload});if(out.error)throw out.error;
  return json(out.data);
 }catch(e){const text=String(e?.message||''),code=['AUTH_REQUIRED','INVALID_SLOT','SAVE_REQUIRED','ALREADY_IN_ROOM','ROOM_NOT_FOUND','SELF_TRADE','ROOM_FULL','ROOM_CLOSED','NOT_OWNED','OFFER_REQUIRED','OFFER_CHANGED','SAVE_CHANGED','ALREADY_OWNED','INVALID_ACTION'].find(c=>text.includes(c));
  if(code)return json({error:code},400);console.error('Trade request failed',text);return json({error:'TRADE_NOT_READY'},503);
 }
};}
