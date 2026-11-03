const http=require('node:http'),{createHarness}=require('./trade-harness.cjs');
(async()=>{const h=await createHarness();const server=http.createServer(async(req,res)=>{try{
 if(req.url==='/shutdown'){res.end('ok');server.close();await h.db.close();return;}
 if(req.url?.startsWith('/save?')){const side=Number(new URL(req.url,'http://localhost').searchParams.get('side'))===1?1:0;res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type','application/json');res.end(JSON.stringify((await h.save(side)).state));return;}
 const chunks=[];for await(const part of req)chunks.push(part);const response=await h.handler(new Request('http://127.0.0.1:8767/trade',{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e);res.writeHead(500);res.end('test error');}});server.listen(8767,'127.0.0.1',()=>console.log('Trade QA server ready on 8767 (in-memory; no real saves)'));
})().catch(e=>{console.error(e);process.exitCode=1;});
