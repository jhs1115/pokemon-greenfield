const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
export function createPvpHandler(admin,Rules){
return async request=>{
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});if(request.method!=='POST')return response({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const token=request.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');if(!token)return response({error:'AUTH_REQUIRED'},401);
  const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return response({error:'AUTH_REQUIRED'},401);const uid=auth.user.id;
  const text=await request.text();if(text.length>32768)return response({error:'REQUEST_TOO_LARGE'},413);const input=JSON.parse(text),action=input.action;
  if(!['join','sync','leave','pick','submit'].includes(action))return response({error:'INVALID_ACTION'},400);const payload={...(input.payload||{})};
  if(action==='join'){
   if(![1,2,3].includes(payload.slot))throw Error('INVALID_SLOT');
   const {data:save,error}=await admin.from('game_saves').select('state').eq('user_id',uid).eq('slot',payload.slot).maybeSingle();if(error)throw error;if(!save)throw Error('SAVE_REQUIRED');
   payload.team=Rules.prepareTeam(save.state,payload.team);
  }
  if(action==='submit'){
   const {data:match,error}=await admin.from('pvp_matches').select('*').eq('id',payload.matchId).maybeSingle();if(error)throw error;if(!match||![match.player1,match.player2].includes(uid))throw Error('NOT_PARTICIPANT');
   if(match.phase==='battle'&&match.round===payload.round&&new Date(match.deadline).getTime()>Date.now())payload.command=Rules.replay(match).command(match.player1===uid?0:1,payload.command);
  }
  const {data:out,error}=await admin.rpc('pvp_gateway',{p_actor:uid,p_action:action,p_payload:payload});if(error)throw error;
  if(out.status!=='match')return response(out);let match=out.match;
  if(out.claimed){const result=Rules.resolve(match);const {data:resolved,error}=await admin.rpc('pvp_finish',{p_id:match.id,p_token:match.resolve_token,p_state:result.state,p_event:result.event,p_commands:result.commands,p_winner:result.winner,p_delay:result.delayMs});
   if(error){if(error.message?.includes('RESOLUTION_EXPIRED')){const {data:current}=await admin.from('pvp_matches').select('*').eq('id',match.id).single();match=current;}else throw error;}else match=resolved;
  }
  return response({status:'match',match:Rules.publicMatch(match,uid,Number(input.afterVersion)||0)});
 }catch(error){const message=String(error?.message||'PVP_ERROR');const known=['SIX_REQUIRED','THREE_REQUIRED','NOT_OWNED','DUPLICATE_POKEMON','DUPLICATE_ITEM','ITEM_NOT_OWNED','INVALID_SLOT','SAVE_REQUIRED','NOT_PARTICIPANT','INVALID_SWITCH','INVALID_MOVE','INVALID_TARGET','CANNOT_MOVE','STALE_TURN','PLAYBACK_ACTIVE','INVALID_PICK','AUTH_REQUIRED','RESOLUTION_EXPIRED'];const code=known.find(c=>message.includes(c));if(code)return response({error:code},code==='NOT_PARTICIPANT'?403:400);console.error('PVP request failed',message);return response({error:'PVP_NOT_READY'},503);}
};
}
