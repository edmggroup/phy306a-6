/* Opens the course page at once from the phone's stored copy, then checks GitHub for a newer one. */
const C='phy306a-v1';let pending=false;
self.addEventListener('message',e=>{if(e.data==='hello'&&pending){pending=false;e.source.postMessage('updated')}});
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add('./')).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate';
  const work=caches.open(C).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const old=nav&&hit?hit.clone():null;
    const net=fetch(r.url.split('?')[0],{cache:'no-cache'}).then(async res=>{
      if(res.ok){
        if(old){const [a,b]=await Promise.all([old.text(),res.clone().text()]);if(a!==b){await c.put(r,res.clone());pending=true;(await self.clients.matchAll()).forEach(x=>x.postMessage('updated'));return res}}
        await c.put(r,res.clone());
      }
      return res});
    e.waitUntil(net.catch(()=>{}));
    return hit||net});
  e.respondWith(work);
});
