(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
function createCloudStore({client,storage,schedule=setTimeout,cancel=clearTimeout}){
 let user=null,epoch=0,loaded=false,loading=null,flushing=null,timer=null,recovery=false,lastError=null;
 let slots=new Map(),revisions=new Map(),pending=new Map(),conflicts=new Map(),deleting=new Set();
 const listeners=new Set(),key=id=>'greenfield-cloud-pending-v1-'+id;
 const notify=()=>listeners.forEach(fn=>fn());
 function persist(){if(!user)return;try{storage.setItem(key(user.id),JSON.stringify([...pending.values()]));}catch{lastError=new Error('기기 백업 공간이 부족합니다');}}
 function status(){return {user,loaded,recovery,error:lastError,pending:pending.size,conflicts:[...conflicts.keys()],saving:!!flushing,deleting:[...deleting]};}
 function observe(event,session){const next=session?.user||null;if(user?.id!==next?.id){epoch++;user=next;loaded=false;loading=null;flushing=null;slots=new Map();revisions=new Map();pending=new Map();conflicts=new Map();deleting=new Set();lastError=null;cancel(timer);if(user){try{for(const p of JSON.parse(storage.getItem(key(user.id))||'[]'))if([1,2,3].includes(p.slot)&&p.state&&Number.isInteger(p.baseRevision))pending.set(p.slot,p);}catch{}}}else user=next;
  if(event==='PASSWORD_RECOVERY')recovery=true;if(!next)recovery=false;notify();
 }
 async function init(){client.auth.onAuthStateChange((event,session)=>schedule(()=>observe(event,session),0));const {data,error}=await client.auth.getSession();if(error)throw error;observe('INITIAL_SESSION',data.session);return status();}
 async function load(){if(!user)throw Error('로그인이 필요합니다');if(loaded)return;if(loading)return loading;const ownEpoch=epoch,uid=user.id;
  const task=(async()=>{const {data,error}=await client.from('game_saves').select('slot,state,revision,updated_at').eq('user_id',uid).order('slot');if(ownEpoch!==epoch)return;if(error){lastError=error;throw error;}
   slots=new Map();revisions=new Map();for(const row of data){slots.set(row.slot,clone(row.state));revisions.set(row.slot,Number(row.revision));}
   for(const [slot,p]of pending){const revision=revisions.get(slot)||0;if(revision===p.baseRevision){slots.set(slot,clone(p.state));}else if(stable(slots.get(slot))===stable(p.state)){pending.delete(slot);}else conflicts.set(slot,{remote:clone(slots.get(slot)||null),local:clone(p.state)});}
   loaded=true;lastError=null;persist();notify();if(pending.size&&!conflicts.size)queueFlush();
  })();loading=task;try{await task;}finally{if(ownEpoch===epoch)loading=null;}
 }
 function read(slot){return slots.has(slot)&&slots.get(slot)?.deleted!==true?clone(slots.get(slot)):null;}
 function save(slot,state){if(!user||!loaded)throw Error('클라우드 파일을 먼저 불러와 주세요');if(![1,2,3].includes(slot))throw Error('잘못된 파일 번호입니다');if(deleting.has(slot))throw Error('파일을 삭제하는 중입니다');if(conflicts.has(slot))throw Error('다른 기기의 저장 내용을 먼저 확인해 주세요');
  const value=clone(state),entry={slot,state:value,baseRevision:pending.get(slot)?.baseRevision??(revisions.get(slot)||0)};pending.set(slot,entry);slots.set(slot,value);persist();notify();queueFlush();
 }
 function queueFlush(){cancel(timer);timer=schedule(()=>{flush().catch(()=>{});},650);}
 async function flush(){cancel(timer);if(flushing)return flushing;if(!user||!loaded)return;const ownEpoch=epoch,owner=user.id;
  const task=(async()=>{for(const [slot]of pending){if(conflicts.has(slot))continue;while(pending.has(slot)&&!conflicts.has(slot)){
   const sent=pending.get(slot);const {data,error}=await client.rpc('save_game_slot',{p_slot:slot,p_state:sent.state,p_expected_revision:sent.baseRevision,p_owner:owner});if(ownEpoch!==epoch)return;
   if(error){lastError=error;if(String(error.message).includes('SAVE_CONFLICT'))conflicts.set(slot,{local:clone(pending.get(slot).state),remote:null});persist();throw error;}
   const row=Array.isArray(data)?data[0]:data;if(!row||!Number.isInteger(Number(row.revision)))throw Error('저장 응답을 확인할 수 없습니다');revisions.set(slot,Number(row.revision));
   if(pending.get(slot)===sent)pending.delete(slot);else pending.get(slot).baseRevision=Number(row.revision);lastError=null;persist();notify();
  }}})();flushing=task;notify();try{await task;}finally{if(ownEpoch===epoch){flushing=null;notify();}}
 }
 async function reloadConflict(slot){if(!conflicts.has(slot))return;const ownEpoch=epoch,uid=user.id;const {data,error}=await client.from('game_saves').select('slot,state,revision,updated_at').eq('user_id',uid).eq('slot',slot).maybeSingle();if(error)throw error;if(ownEpoch!==epoch)return;
  // Keep the discarded local progress as a separate, account-scoped recovery copy.
  storage.setItem('greenfield-conflict-backup-'+uid+'-'+slot+'-'+Date.now(),JSON.stringify(pending.get(slot)?.state||conflicts.get(slot).local));
  pending.delete(slot);conflicts.delete(slot);if(data){slots.set(slot,clone(data.state));revisions.set(slot,Number(data.revision));}else{slots.delete(slot);revisions.delete(slot);}lastError=null;persist();notify();
 }
 async function remove(slot){if(!user||!loaded)throw Error('클라우드 파일을 먼저 불러와 주세요');if(![1,2,3].includes(slot))throw Error('잘못된 파일 번호입니다');if(deleting.has(slot))throw Error('파일을 삭제하는 중입니다');const ownEpoch=epoch,owner=user.id;deleting.add(slot);notify();try{await flush();if(ownEpoch!==epoch)throw Error('AUTH_REQUIRED');if(conflicts.has(slot)||pending.has(slot))throw Error('SAVE_CONFLICT');const expected=revisions.get(slot)||0;if(!slots.has(slot)||slots.get(slot)?.deleted===true)return;
  // Erase progress while keeping the revision so stale clients cannot resurrect it.
  const {data,error}=await client.rpc('save_game_slot',{p_slot:slot,p_state:{version:2,deleted:true},p_expected_revision:expected,p_owner:owner});if(ownEpoch!==epoch)throw Error('AUTH_REQUIRED');if(error){lastError=error;if(String(error.message).includes('SAVE_CONFLICT'))conflicts.set(slot,{local:clone(slots.get(slot)||null),remote:null});throw error;}const row=Array.isArray(data)?data[0]:data;if(!row||!Number.isInteger(Number(row.revision))||Number(row.revision)<=expected)throw Error('삭제 응답을 확인할 수 없습니다');slots.set(slot,{version:2,deleted:true});revisions.set(slot,Number(row.revision));pending.delete(slot);conflicts.delete(slot);lastError=null;persist();notify();
 }finally{if(ownEpoch===epoch){deleting.delete(slot);notify();}}}
 async function signOut(){if(deleting.size)throw Error('파일 삭제가 끝난 뒤 로그아웃해 주세요');await flush();if(pending.size)throw Error('저장이 끝난 뒤 로그아웃해 주세요');const {error}=await client.auth.signOut();if(error)throw error;observe('SIGNED_OUT',null);}
 async function refreshSlot(slot){if(!user||![1,2,3].includes(slot))throw Error('AUTH_REQUIRED');await flush();if(pending.has(slot)||conflicts.has(slot))throw Error('SAVE_CHANGED');const ownEpoch=epoch,uid=user.id;const {data,error}=await client.from('game_saves').select('slot,state,revision,updated_at').eq('user_id',uid).eq('slot',slot).maybeSingle();if(error)throw error;if(ownEpoch!==epoch)throw Error('AUTH_REQUIRED');if(pending.has(slot)||conflicts.has(slot))throw Error('SAVE_CHANGED');if(!data)throw Error('SAVE_REQUIRED');slots.set(slot,clone(data.state));revisions.set(slot,Number(data.revision));lastError=null;notify();if(data.state?.deleted===true)throw Error('SAVE_REQUIRED');return read(slot);}
 return {configured:true,refreshSlot,async trade(action,payload={}){const {data,error}=await client.functions.invoke('trade',{body:{action,payload}});if(error){let code='TRADE_NOT_READY';try{const detail=await error.context?.json();if(detail?.error)code=detail.error;}catch{}throw Error(code);}if(data?.error)throw Error(data.error);return data;},async pvp(action,payload={},afterVersion=0){const {data,error}=await client.functions.invoke('pvp',{body:{action,payload,afterVersion}});if(error){let code='PVP_NOT_READY';try{const detail=await error.context?.json();if(detail?.error)code=detail.error;}catch{}throw Error(code);}if(data?.error)throw Error(data.error);return data;},init,load,read,save,remove,flush,status,reloadConflict,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  async signIn(email,password){const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;observe('SIGNED_IN',data.session);},
  async signUp(email,password,redirect){const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:redirect}});if(error)throw error;if(data.session)observe('SIGNED_IN',data.session);return !!data.session;},
  async resetPassword(email,redirect){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect});if(error)throw error;},
  async updatePassword(password){const {error}=await client.auth.updateUser({password});if(error)throw error;recovery=false;notify();},signOut};
}
root.createCloudStore=createCloudStore;if(typeof module==='object')module.exports={createCloudStore};
const config=root.SUPABASE_CONFIG;if(root.document&&config?.url&&config?.publishableKey){try{
 if(config.publishableKey.startsWith('sb_secret_'))throw Error('브라우저에는 Publishable key만 사용할 수 있습니다');
 if(config.publishableKey.split('.').length===3){const claims=JSON.parse(root.atob(config.publishableKey.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(claims.role!=='anon')throw Error('브라우저에는 anon public key만 사용할 수 있습니다');}
 root.GameAccount=createCloudStore({client:root.SupabaseSDK.createClient(config.url,config.publishableKey),storage:root.localStorage});
}catch{root.GameAccountConfigError=true;}}
})(typeof window==='object'?window:globalThis);
