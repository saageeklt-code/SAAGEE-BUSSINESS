const EDIT=new URLSearchParams(location.search).has('edit');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const CATS=['Flex','Hoardings','Bus Ads','Wall Painting','Shop Boards','Backlit Boards','Newspaper Ads','Visiting Cards','Other'];
const TK=[['eb','.eb'],['h1','h1'],['hp','.hero p'],['ak','#about .k'],['ah','#about h2'],['ap','.ab p'],['st','.stt i'],['sl','.stt span'],['wk','#works .k'],['wh','#works h2'],['ws','#works .sub'],['sk','#showcase .k'],['sh','#showcase h2'],['ss','#showcase .sub'],['vk','#services .k'],['vh','#services h2'],['vs','#services .sub'],['ark','#areas .k'],['arh','#areas h2'],['ars','#areas .sub'],['ck','#clients .k'],['ch','#clients h2'],['cs','#clients .sub'],['tk','#tst .k'],['th','#tst h2'],['fk','#faq .k'],['fh','#faq h2'],['cth','#contact h2']];
const CF=[['phone1','Phone 1 (e.g. +91 90922 17774)'],['phone2','Phone 2 (e.g. 04323-222399)'],['whatsapp','WhatsApp number, digits with country code (e.g. 919092217774)'],['email','Email'],['address','Address'],['mapsLink','Google Maps link'],['instagram','Instagram link'],['facebook','Facebook link'],['youtube','YouTube link']];
const shrink=(file,max,q,type='image/jpeg')=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,max/Math.max(i.width,i.height)),w=Math.round(i.width*s),h=Math.round(i.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(type==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,w,h)}x.drawImage(i,0,0,w,h);let d=c.toDataURL(type,q);while(d.length>850000&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}res(d)};i.onerror=()=>rej(new Error('Not an image'));i.src=r.result};r.readAsDataURL(file)});
const pickF=acc=>new Promise(r=>{const i=document.createElement('input');i.type='file';i.accept=acc;i.onchange=()=>r([...i.files]);i.click()});
const pick=m=>new Promise(r=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.multiple=!!m;i.onchange=()=>r([...i.files]);i.click()});
const toast=t=>{let m=$('#tt');if(!m){m=document.createElement('div');m.id='tt';document.body.appendChild(m)}m.textContent=t;m.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>m.style.display='none',3500)};
function modal(title,fields,ok){const m=document.createElement('div');m.className='md';m.innerHTML=`<form><h3>${E(title)}</h3>${fields.map(f=>`<label>${E(f.l)}</label>`+(f.t==='area'?`<textarea name="${f.k}" rows="4">${E(f.v)}</textarea>`:f.t==='sel'?`<select name="${f.k}">${f.o.map(o=>`<option${o===f.v?' selected':''}>${E(o)}</option>`).join('')}</select>`:f.t==='file'?`<input type="file" name="${f.k}" accept="image/*"${f.m?' multiple':''}>`:`<input name="${f.k}" value="${E(f.v)}">`)).join('')}<div><button type="submit">Save</button><button type="button" class="cn">Cancel</button></div></form>`;document.body.appendChild(m);$('.cn',m).onclick=()=>m.remove();$('form',m).onsubmit=async e=>{e.preventDefault();const v={};fields.forEach(f=>{const el=e.target.elements[f.k];v[f.k]=f.t==='file'?[...el.files]:el.value.trim()});m.remove();try{await ok(v)}catch(x){toast('Error: '+x.message)}}}
(async()=>{try{
const {firebaseConfig:c}=await import('./firebase-config.js');
if(!c||!c.apiKey||c.apiKey.startsWith('PASTE'))return;
const B='https://www.gstatic.com/firebasejs/10.12.2/';
const [{initializeApp},fsm,A]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-firestore.js'),EDIT?import(B+'firebase-auth.js'):null]);
const {getFirestore,collection,getDocs,getDoc,doc,setDoc,addDoc,deleteDoc,updateDoc}=fsm;
const app=initializeApp(c),db=getFirestore(app);let auth;
if(EDIT){auth=A.getAuth(app);const u=await new Promise(r=>{let un;un=A.onAuthStateChanged(auth,x=>{if(un)un();r(x)})});if(!u){location.href='admin.html';return}}
const all=async n=>(await getDocs(collection(db,n))).docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.createdAt-a.createdAt);
let [W,C,V,sd,lg]=await Promise.all([all('works'),all('clients'),all('reviews'),getDoc(doc(db,'settings','site')),getDoc(doc(db,'settings','logo'))]);
const S=sd.exists()?sd.data():{};
let SV=Array.isArray(S.services)?S.services:$$('#sg .sv').map(e=>({n:$('h3',e).textContent,d:$('p',e).textContent}));
let FQ=Array.isArray(S.faq)?S.faq:$$('.fq details').map(e=>({q:$('summary',e).textContent,a:$('p',e).textContent}));
let AR=Array.isArray(S.areas)?S.areas:$$('.ar span').map(e=>e.textContent);
let SC=Array.isArray(S.showcase)?S.showcase:$$('.mt').map(e=>({c:$('h4',e).textContent,bg:e.style.background,ar:e.style.aspectRatio,col:$('h4',e).style.color||'#fff',svg:$('.fr',e).innerHTML,img:''}));
let cur='All',dirty=false;
const X=(a,i)=>EDIT?`<button class="ed x" data-a="${a}" data-i="${i}" title="Delete">&times;</button>`:'';
const BAR=(a,b,id)=>EDIT?`<div class="ed bar"><button data-a="${a}" data-i="${id}">${b}</button><button class="dl" data-a="${a==='we'?'wd':a==='cr'?'cd':'rd'}" data-i="${id}">Delete</button></div>`:'';
const rSV=()=>{$('#sg').innerHTML=SV.map((x,i)=>`<div class="sv rv in">${X('sd',i)}<small>${String(i+1).padStart(2,'0')}</small><div><h3>${E(x.n)}</h3><p>${E(x.d)}</p></div></div>`).join('');const T=SV.map(x=>`<span>${E(x.n)}</span><i>&#10022;</i>`).join('');$('#tick').innerHTML=`<div>${T}${T}</div>`};
const rFQ=()=>{$('.fq').innerHTML=FQ.map((x,i)=>EDIT?`<div class="qi">${X('fd',i)}<strong>${E(x.q)}</strong><p>${E(x.a)}</p></div>`:`<details><summary>${E(x.q)}</summary><p>${E(x.a)}</p></details>`).join('')};
const rAR=()=>{$('.ar').innerHTML=AR.map((x,i)=>EDIT?`<span><b>${E(x)}</b>${X('ad',i)}</span>`:`<span>${E(x)}</span>`).join('')};
const rW=()=>{$('#works').style.display=(W.length||EDIT)?'':'none';const cats=['All',...new Set(W.map(w=>w.category))];if(!cats.includes(cur))cur='All';$('#tbw').innerHTML=cats.map(x=>`<button class="${x===cur?'on':''}" data-c="${E(x)}">${E(x)}</button>`).join('');$('#gw').innerHTML=W.filter(w=>cur==='All'||w.category===cur).map(w=>`<figure data-i="${w.id}"><img loading="lazy" src="${w.thumb}" alt="${E(w.title||w.category)}"><figcaption>${E(w.title||w.category)}</figcaption>${BAR('we','Edit',w.id)}</figure>`).join('')+(W.length||!EDIT?'':'<p style="color:#7a6270">No photos yet. Click "+ Add photos" below. Visitors will not see this section until you add your first photo.</p>')};
const rC=()=>{const s=$('#clients');if(!C.length&&!EDIT){s.style.display='none';return}s.style.display='';const t=C.map(x=>`<div class="lg">${BAR('cr','Replace',x.id)}<img src="${x.logo}" alt="${E(x.name)}"></div>`).join('');const r=t.repeat(Math.max(2,Math.ceil(10/Math.max(C.length,1))));$('#rw').innerHTML=!C.length?'':EDIT?`<div class="rw">${t}</div>`:`<div class="rw">${r}${r}</div>`};
const rV=()=>{$('#tst').style.display=(V.length||EDIT)?'':'none';$('#rvg').innerHTML=V.map(r=>`<div class="rvc">${BAR('re','Edit',r.id)}<b>${'&#9733;'.repeat(r.rating||5)}</b><p>${E(r.text)}</p><strong>${E(r.name)}</strong><small>${E(r.company)}</small></div>`).join('')};
const rSC=()=>{$('#showcase').style.display=(SC.length||EDIT)?'':'none';$('.ms').innerHTML=SC.map((x,i)=>`<div class="mt rv in" style="background:${x.bg};aspect-ratio:${x.ar}">${EDIT?`<button class="ed x" data-a="xd" data-i="${i}" title="Delete">&times;</button><div class="ed bar"><button data-a="xr" data-i="${i}">Replace image</button></div>`:''}<div style="flex:1;display:flex;align-items:center;min-height:0"><div class="fr" style="width:100%;max-height:100%">${x.img?`<img src="${x.img}" alt="" style="width:100%;max-height:100%;object-fit:cover;display:block">`:x.svg}</div></div><h4 style="color:${x.col}">${E(x.c)}</h4></div>`).join('')};
$('#showcase').insertAdjacentHTML('beforebegin','<section class="sec" id="works"><div class="w"><div class="k">OUR WORK</div><h2>Work that <em>worked.</em></h2><p class="sub">Real projects delivered by Saagee Ads.</p><div class="tbw" id="tbw"></div><div class="gw" id="gw"></div></div></section>');
$('#tbw').onclick=e=>{if(e.target.dataset.c){cur=e.target.dataset.c;rW();mk()}};
$('#gw').onclick=async e=>{if(EDIT||e.target.closest('.ed'))return;const f=e.target.closest('figure');if(!f)return;const w=W.find(x=>x.id===f.dataset.i),lb=document.createElement('div');lb.className='lb';lb.innerHTML=`<img src="${w.thumb}">`;lb.onclick=()=>lb.remove();document.body.appendChild(lb);try{const d=await getDoc(doc(db,'workFull',w.id));if(d.exists())lb.querySelector('img').src=d.data().full}catch{}};
if(W.length)$$('a[href="#showcase"]').forEach(a=>a.href='#works');
$('#faq').insertAdjacentHTML('beforebegin','<section class="sec alt" id="tst"><div class="w"><div class="k">TESTIMONIALS</div><h2>What clients <em>say.</em></h2><div class="rvg" id="rvg" style="margin-top:40px"></div></div></section>');
const mk=()=>{if(!EDIT)return;$$('#sg h3,#sg p,.fq .qi strong,.fq .qi p,.ar span b,.mt h4').forEach(e=>e.setAttribute('contenteditable','true'));TK.forEach(([n,s])=>$$(s).forEach(e=>e.setAttribute('contenteditable','true')))};
const col=()=>{if(!EDIT)return;SV=$$('#sg .sv').map(e=>({n:$('h3',e).innerText.trim(),d:$('p',e).innerText.trim()}));FQ=$$('.fq .qi').map(e=>({q:$('strong',e).innerText.trim(),a:$('p',e).innerText.trim()}));AR=$$('.ar span b').map(e=>e.innerText.trim()).filter(Boolean);$$('.mt h4').forEach((h,i)=>{if(SC[i])SC[i].c=h.innerText.trim()})};
rSV();rFQ();rAR();rW();rSC();rC();rV();
const t=S.t||{};TK.forEach(([n,s])=>$$(s).forEach((e,i)=>{const k=n+'_'+i;if(t[k]!=null)e.innerHTML=t[k]}));
if(lg.exists())$('.br img').src=lg.data().data;
const rep=(a,b)=>{if(!b||a===b)return;$$('a').forEach(x=>x.setAttribute('href',(x.getAttribute('href')||'').split(a).join(b)));const w=document.createTreeWalker(document.body,4);let n;while(n=w.nextNode())n.nodeValue=n.nodeValue.split(a).join(b)};
const dg=x=>(x||'').replace(/[^\d+]/g,'');
if(S.phone1){const d=dg(S.phone1);rep('+919092217774',d);rep('+91 90922 17774',S.phone1);window.WA=(S.whatsapp||d).replace(/\D/g,'')}
if(S.whatsapp){const w=S.whatsapp.replace(/\D/g,'');rep('919092217774',w);window.WA=w}
if(S.phone2){rep('04323222399',dg(S.phone2));rep('04323-222399',S.phone2)}
const rt=$('.rt');
if(S.email)rt.insertAdjacentHTML('beforeend',`<a href="mailto:${E(S.email)}" style="font-size:18px">${E(S.email)}</a>`);
const so=[['instagram','Instagram'],['facebook','Facebook'],['youtube','YouTube']].filter(x=>S[x[0]]).map(x=>`<a href="${E(S[x[0]])}" target="_blank" rel="noopener" style="display:inline-block;margin-left:14px">${x[1]}</a>`).join('');
if(so)rt.insertAdjacentHTML('beforeend',`<div style="margin-top:12px">${so}</div>`);
if(S.address)$('footer .fg>div:nth-child(3) p').innerHTML=E(S.address).replace(/\n/g,'<br>');
if(S.mapsLink)$$('a[href*="maps/search"]').forEach(a=>a.href=S.mapsLink);
if(!EDIT)return;
$$('.rv').forEach(e=>e.classList.add('in'));
const st=document.createElement('style');st.textContent=`[contenteditable]{outline:2px dashed transparent;outline-offset:3px;cursor:text;transition:.2s}[contenteditable]:hover{outline-color:#ffc400}[contenteditable]:focus{outline:2px solid #d6006f;background:#ffffff33;border-radius:4px}.sv,.rvc,.lg,figure,.ar span{position:relative}.fl{display:none}
.ed.x{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;border:0;background:#fff;color:#d6006f;font:700 20px/1 sans-serif;cursor:pointer;box-shadow:0 2px 8px #0005;z-index:5}.ar .x{top:50%;right:6px;transform:translateY(-50%);width:24px;height:24px;font-size:16px}.ar span{padding-right:40px}
.ed.bar{position:absolute;left:8px;right:8px;top:8px;display:flex;gap:6px;z-index:5;opacity:0;transition:.2s}figure:hover .bar,.lg:hover .bar,.rvc:hover .bar,.mt:hover .bar{opacity:1}.mt .bar{right:52px}.bar button{flex:1;border:0;border-radius:8px;padding:7px;font:700 12px sans-serif;cursor:pointer;background:#fff;color:#33102a}.bar .dl{background:#c0392b;color:#fff}
.edb{display:block;margin:26px 0 0;padding:14px 22px;border:2px dashed #d6006f;background:#fff;color:#d6006f;border-radius:14px;font:700 15px "Plus Jakarta Sans",sans-serif;cursor:pointer}.rw{animation:none!important;flex-wrap:wrap;width:auto!important;padding:0 28px;justify-content:center}
.qi{border-bottom:2px solid #f6dbe4;padding:22px 44px 22px 0;position:relative}.qi strong{display:block;font-size:20px}.qi p{color:#7a6270;margin:8px 0 0}
#eb{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#33102a;color:#fff;padding:10px 16px;border-radius:999px;display:flex;gap:10px;align-items:center;z-index:300;box-shadow:0 10px 30px #0006;font:700 13px sans-serif;flex-wrap:wrap;justify-content:center}#eb b{color:#ffc400;letter-spacing:2px}#eb button,#eb a{background:#d6006f;color:#fff;border:0;border-radius:999px;padding:9px 16px;font:700 13px sans-serif;cursor:pointer;text-decoration:none}#eb a{background:#ffc400;color:#33102a}
#tt{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#ffc400;color:#33102a;padding:10px 18px;border-radius:999px;font:700 14px sans-serif;display:none;z-index:301}
.md{position:fixed;inset:0;background:#33102acc;z-index:400;display:flex;align-items:center;justify-content:center;padding:16px}.md form{background:#fff;color:#33102a;border-radius:16px;padding:24px;width:min(480px,100%);max-height:90vh;overflow:auto;font:15px sans-serif}.md label{display:block;font-weight:700;font-size:13px;margin-top:10px}.md input,.md select,.md textarea{width:100%;padding:10px;border:1.5px solid #f1d3df;border-radius:9px;font:inherit;margin-top:4px}.md button{margin:16px 8px 0 0;padding:11px 20px;border:0;border-radius:9px;background:#d6006f;color:#fff;font:700 14px sans-serif;cursor:pointer}.md .cn{background:#eee;color:#333}`;document.head.appendChild(st);
const eb=document.createElement('div');eb.id='eb';eb.innerHTML='<b>EDIT MODE</b><button data-a="save">Save text changes</button><button data-a="contact">Contact details</button><button data-a="backup">Backup</button><button data-a="restore">Restore</button><a href="index.html">View live site</a><button data-a="out">Logout</button>';document.body.appendChild(eb);
const add=(sel,a,l)=>$(sel).insertAdjacentHTML('afterend',`<div class="w" style="padding:0"><button class="edb" data-a="${a}">${l}</button></div>`);
add('#sg','sa','+ Add service');add('.fq','fa','+ Add question');add('.ar','aa','+ Add area');add('#gw','wa','+ Add photos');add('#rw','ca','+ Add client logo');add('#rvg','ra','+ Add review');add('.ms','xa','+ Add showcase tile');
$('.br').dataset.a='logo';$('.br').title='Click to replace logo';
mk();addEventListener('input',()=>dirty=true);addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
const rvM=(r,ok)=>modal(r?'Edit review':'Add review',[{k:'name',l:'Name',v:r?r.name:''},{k:'company',l:'Company / role',v:r?r.company:''},{k:'rating',l:'Rating',t:'sel',o:['5','4','3'],v:String(r?r.rating:5)},{k:'text',l:'Review',t:'area',v:r?r.text:''}],ok);
const lst=(f,a)=>()=>{col();f();a();mk();dirty=true};
const getAll=async n=>(await getDocs(collection(db,n))).docs.map(d=>({id:d.id,...d.data()}));
const mkBackup=async()=>{const [works,workFull,clients,reviews,site,logo]=await Promise.all([getAll('works'),getAll('workFull'),getAll('clients'),getAll('reviews'),getDoc(doc(db,'settings','site')),getDoc(doc(db,'settings','logo'))]);return {app:'saagee-ads-backup',version:1,date:new Date().toISOString(),works,workFull,clients,reviews,settings:{site:site.exists()?site.data():null,logo:logo.exists()?logo.data():null}}};
const dl=(o,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)};
const ACT={
backup:async()=>{toast('Preparing backup...');const b=await mkBackup();dl(b,`saagee-backup-${b.date.slice(0,10)}.json`);toast(`Backup downloaded: ${b.works.length} photos, ${b.clients.length} logos, ${b.reviews.length} reviews`)},
restore:async()=>{const [f]=await pickF('.json,application/json');if(!f)return;let b;try{b=JSON.parse(await f.text())}catch{return toast('This is not a valid backup file')}
if(!b||b.app!=='saagee-ads-backup'||!Array.isArray(b.works))return toast('This is not a Saagee Ads backup file');
if(!confirm(`Restore the backup from ${(b.date||'').slice(0,10)}?\n\nThis REPLACES all current photos, logos, reviews and text with the backup (${b.works.length} photos, ${(b.clients||[]).length} logos, ${(b.reviews||[]).length} reviews).\n\nA safety backup of your current data will download first.`))return;
toast('Saving safety backup...');dl(await mkBackup(),'saagee-safety-backup-before-restore.json');
const N=['works','workFull','clients','reviews'];toast('Restoring... please wait');
for(const n of N)for(const d of await getAll(n))await deleteDoc(doc(db,n,d.id));
for(const n of N)for(const {id,...x} of (b[n]||[]))await setDoc(doc(db,n,id),x);
if(b.settings&&b.settings.site)await setDoc(doc(db,'settings','site'),b.settings.site);
if(b.settings&&b.settings.logo)await setDoc(doc(db,'settings','logo'),b.settings.logo);
dirty=false;toast('Restored! Reloading...');setTimeout(()=>location.reload(),1500)},
sd:i=>{col();SV.splice(+i,1);rSV();mk();dirty=true},sa:()=>{col();SV.push({n:'New service',d:'Short description'});rSV();mk();dirty=true},
fd:i=>{col();FQ.splice(+i,1);rFQ();mk();dirty=true},fa:()=>{col();FQ.push({q:'New question?',a:'Answer here.'});rFQ();mk();dirty=true},
ad:i=>{col();AR.splice(+i,1);rAR();mk();dirty=true},aa:()=>{col();AR.push('New area');rAR();mk();dirty=true},
wd:async i=>{if(!confirm('Delete this photo?'))return;await deleteDoc(doc(db,'works',i));await deleteDoc(doc(db,'workFull',i));W=W.filter(w=>w.id!==i);rW();toast('Deleted')},
xd:i=>{col();SC.splice(+i,1);rSC();mk();dirty=true},
xr:async i=>{const [f]=await pick();if(!f)return;col();SC[+i].img=await shrink(f,800,.7);rSC();mk();dirty=true;toast('Image replaced. Click Save text changes to keep it.')},
xa:async()=>{const [f]=await pick();if(!f)return;col();SC.push({c:'New format',bg:'#d6006f',ar:'1.1 / 1',col:'#fff',svg:'',img:await shrink(f,800,.7)});rSC();mk();dirty=true;toast('Added. Edit the caption, then click Save text changes.')},

we:async i=>{const w=W.find(x=>x.id===i);modal('Edit photo',[{k:'title',l:'Title',v:w.title},{k:'cat',l:'Category',t:'sel',o:CATS.includes(w.category)?CATS:[...CATS,w.category],v:w.category},{k:'f',l:'Replace photo (optional)',t:'file'}],async v=>{const u={title:v.title,category:v.cat};if(v.f[0]){toast('Replacing photo...');u.thumb=await shrink(v.f[0],520,.75);await setDoc(doc(db,'workFull',i),{full:await shrink(v.f[0],1400,.82)})}await updateDoc(doc(db,'works',i),u);Object.assign(w,u);rW();toast('Updated')})},
wa:()=>modal('Add work photos',[{k:'title',l:'Title (optional)',v:''},{k:'cat',l:'Category',t:'sel',o:CATS,v:'Flex'},{k:'f',l:'Photos (select many)',t:'file',m:1}],async v=>{if(!v.f.length)return toast('Choose photos first');let n=0;for(const f of v.f){toast(`Uploading ${++n}/${v.f.length}...`);const thumb=await shrink(f,520,.75),full=await shrink(f,1400,.82),createdAt=Date.now()+n,r=await addDoc(collection(db,'works'),{title:v.title,category:v.cat,thumb,createdAt});await setDoc(doc(db,'workFull',r.id),{full});W.unshift({id:r.id,title:v.title,category:v.cat,thumb,createdAt});rW()}toast('Uploaded')}),
cd:async i=>{if(!confirm('Delete this logo?'))return;await deleteDoc(doc(db,'clients',i));C=C.filter(x=>x.id!==i);rC();toast('Deleted')},
cr:async i=>{const [f]=await pick();if(!f)return;toast('Replacing...');const logo=await shrink(f,420,.9,'image/png');await updateDoc(doc(db,'clients',i),{logo});C.find(x=>x.id===i).logo=logo;rC();toast('Logo replaced')},
ca:()=>modal('Add client logo',[{k:'name',l:'Client name',v:''},{k:'f',l:'Logo image (PNG with transparent background is best)',t:'file'}],async v=>{if(!v.f[0])return toast('Choose a logo first');const logo=await shrink(v.f[0],420,.9,'image/png'),createdAt=Date.now(),r=await addDoc(collection(db,'clients'),{name:v.name,logo,createdAt});C.unshift({id:r.id,name:v.name,logo,createdAt});rC();toast('Added')}),
rd:async i=>{if(!confirm('Delete this review?'))return;await deleteDoc(doc(db,'reviews',i));V=V.filter(x=>x.id!==i);rV();toast('Deleted')},
re:i=>{const r=V.find(x=>x.id===i);rvM(r,async v=>{const u={name:v.name,company:v.company,rating:+v.rating,text:v.text};await updateDoc(doc(db,'reviews',i),u);Object.assign(r,u);rV();toast('Updated')})},
ra:()=>rvM(null,async v=>{if(!v.name||!v.text)return toast('Name and review are required');const o={name:v.name,company:v.company,rating:+v.rating,text:v.text,createdAt:Date.now()},r=await addDoc(collection(db,'reviews'),o);V.unshift({id:r.id,...o});rV();toast('Added')}),
logo:async()=>{const [f]=await pick();if(!f)return;const d=await shrink(f,300,.9,'image/png');await setDoc(doc(db,'settings','logo'),{data:d});$('.br img').src=d;toast('Logo replaced')},
contact:()=>modal('Contact details',CF.map(([k,l])=>({k,l,v:S[k]||''})),async v=>{await setDoc(doc(db,'settings','site'),v,{merge:true});Object.assign(S,v);toast('Saved. Reload the page to see the new numbers.')}),
save:async()=>{col();const o={};TK.forEach(([n,s])=>$$(s).forEach((e,i)=>o[n+'_'+i]=e.innerHTML));const p={t:o,services:SV,faq:FQ,areas:AR,showcase:SC};if(JSON.stringify(p).length>900000)return toast('Showcase images are too large. Delete some tiles.');await setDoc(doc(db,'settings','site'),p,{merge:true});dirty=false;toast('Saved! Your website is updated.')},
out:async()=>{await A.signOut(auth);location.href='index.html'}};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;e.preventDefault();e.stopPropagation();try{await (ACT[b.dataset.a]||(()=>{}))(b.dataset.i)}catch(x){toast('Error: '+x.message)}},true);
}catch(e){console.warn('Saagee site.js',e)}})();
