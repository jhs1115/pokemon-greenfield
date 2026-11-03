const http=require('node:http'),{createHarness}=require('./pvp-harness.cjs');
(async()=>{const h=await createHarness();const server=http.createServer(async(req,res)=>{const chunks=[];for await(const part of req)chunks.push(part);const body=Buffer.concat(chunks);try{
 if(req.url==='/shutdown'){res.end('ok');server.close();await h.db.close();return;}
 if(req.url==='/expire'&&req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','content-type');res.end();return;}
 if(req.url==='/expire'){const input=JSON.parse(body);await h.db.query("update public.pvp_matches set deadline=clock_timestamp()-interval '1 second' where id=$1",[input.id]);res.setHeader('Access-Control-Allow-Origin','*');res.end('ok');return;}
 const request=new Request('http://127.0.0.1:8766'+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}: {})});const response=await h.handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch(e){console.error(e);res.writeHead(500);res.end('test error');}});server.listen(8766,'127.0.0.1',()=>console.log('PvP test server ready: http://127.0.0.1:8766 (in-memory, two QA users only)'));
})().catch(e=>{console.error(e);process.exitCode=1;});
