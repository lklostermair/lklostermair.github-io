const PROFILE={
  name:"Lukas Klostermair",
  title:"Researcher",
  shortBio:"Short bio goes here.",
  longBio:"Longer biography text for more details.",
  speakerBio:"Speaker biography for events.",
  email:"mailto:lukas@example.com",
  socials:{
    github:"https://github.com/lklostermair",
    scholar:"https://scholar.google.com",
    twitter:"https://twitter.com",
    linkedin:"https://linkedin.com"
  }
};
const PUBLICATIONS=[
  {title:"Sample Publication",authors:"L. Klostermair",venue:"Journal",year:"2024",link:"#",tags:["ml","ai"]}
];
const PROJECTS=[
  {title:"Sample Project",blurb:"Project description.",stack:["JS","CSS"],github:"https://github.com",live:"#"}
];

function qs(sel){return document.querySelector(sel);}
function qsa(sel){return [...document.querySelectorAll(sel)];}

function renderProfile(){
  qs('#name').textContent=PROFILE.name;
  qs('#title').textContent=PROFILE.title;
  qs('#short-intro').textContent=PROFILE.shortBio;
  qs('#email').href=PROFILE.email;
  const socials=qs('.social-icons');
  for(const [key,url] of Object.entries(PROFILE.socials)){
    const a=document.createElement('a');
    a.href=url;a.target="_blank";a.rel="noopener";
    const img=document.createElement('img');
    img.src=`assets/social/${key}.svg`;img.alt=key;
    a.appendChild(img);socials.appendChild(a);
  }
  const tablist=qs('.tablist');
  ['shortBio','longBio','speakerBio'].forEach((k,i)=>{
    const btn=document.createElement('button');
    btn.id=`tab-${k}`;btn.setAttribute('role','tab');btn.setAttribute('aria-controls',`panel-${k}`);btn.textContent=k.replace('Bio','');
    if(i===0)btn.classList.add('active');
    tablist.appendChild(btn);
    const panel=document.createElement('div');
    panel.id=`panel-${k}`;panel.setAttribute('role','tabpanel');
    panel.textContent=PROFILE[k];
    if(i===0)panel.classList.add('active');
    panel.setAttribute('aria-labelledby',btn.id);
    qs('#about').appendChild(panel);
    btn.addEventListener('click',()=>setBio(k));
  });
}
function setBio(key){
  qsa('[role="tab"]').forEach(b=>{b.classList.toggle('active',b.id===`tab-${key}`);b.setAttribute('aria-selected',b.id===`tab-${key}`)});
  qsa('[role="tabpanel"]').forEach(p=>{p.classList.toggle('active',p.id===`panel-${key}`);});
}

function renderPublications(){
  const list=qs('#pub-list');
  const tags=new Set();
  PUBLICATIONS.forEach(p=>{p.tags.forEach(t=>tags.add(t));});
  const params=new URLSearchParams(location.search);
  const active=params.get('tags')?.split(',')||[];
  const filter=qs('#pub-filter');
  tags.forEach(tag=>{
    const btn=document.createElement('button');btn.textContent=tag;btn.dataset.tag=tag;btn.classList.toggle('active',active.includes(tag));
    filter.appendChild(btn);
  });
  function update(){
    const selected=qsa('#pub-filter button.active').map(b=>b.dataset.tag);
    const q=new URLSearchParams(location.search);
    selected.length?q.set('tags',selected.join(',')):q.delete('tags');
    history.replaceState(null,'',`?${q}`);
    list.innerHTML='';
    let count=0;
    PUBLICATIONS.forEach(p=>{
      if(selected.length && !p.tags.some(t=>selected.includes(t)))return;
      const li=document.createElement('li');
      li.innerHTML=`<span class="title"><a href="${p.link}" target="_blank" rel="noopener">${p.title}</a></span> <span class="meta">${p.authors} – ${p.venue} (${p.year})</span>`;
      list.appendChild(li);count++;});
    qs('#pub-count').textContent=`${count} result${count===1?'':'s'}`;
  }
  filter.addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){e.target.classList.toggle('active');update();}});
  update();
}

function renderProjects(){
  const grid=qs('.projects-grid');
  PROJECTS.forEach(p=>{
    const card=document.createElement('div');card.className='project-card reveal';
    card.innerHTML=`<h3>${p.title}</h3><p>${p.blurb}</p>`;
    const t=document.createElement('div');t.className='tags';p.stack.forEach(s=>{const span=document.createElement('span');span.textContent=s;t.appendChild(span);});
    card.appendChild(t);
    const links=document.createElement('p');
    if(p.github){links.innerHTML+=`<a href="${p.github}" target="_blank" rel="noopener">GitHub</a> `;}
    if(p.live){links.innerHTML+=`<a href="${p.live}" target="_blank" rel="noopener">Live</a>`;}
    card.appendChild(links);
    grid.appendChild(card);
  });
}

async function renderCV(){
  try{
    const res=await fetch('assets/cv.json');
    const data=await res.json();
    const list=qs('#cv-list');
    data.forEach(item=>{
      const li=document.createElement('li');li.textContent=`${item.year} – ${item.position}, ${item.institution}`;list.appendChild(li);});
  }catch(e){console.error(e);}
}

function themeInit(){
  const stored=localStorage.getItem('theme')||'default';
  document.documentElement.dataset.theme=stored;
  qs('#theme-current').textContent=stored;
}
function themeSwitch(){
  const order=['default','warm','cool'];
  let idx=order.indexOf(document.documentElement.dataset.theme);
  idx=(idx+1)%order.length;
  const t=order[idx];
  document.documentElement.dataset.theme=t;
  localStorage.setItem('theme',t);
  qs('#theme-current').textContent=t;
}

function reveal(){
  const io=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.12});
  qsa('section').forEach((sec,i)=>{io.observe(sec);});
}

function portraitParallax(){
  const p=qs('.portrait');
  p.addEventListener('pointermove',e=>{
    const rect=p.getBoundingClientRect();
    const x=(e.clientX-rect.left-rect.width/2)/rect.width;
    const y=(e.clientY-rect.top-rect.height/2)/rect.height;
    const dx=Math.max(Math.min(x*6,6),-6);
    const dy=Math.max(Math.min(y*-6,6),-6);
    p.style.transform=`rotateX(${dy}deg) rotateY(${dx}deg)`;
  });
  p.addEventListener('pointerleave',()=>{p.style.transform='';});
}

function lastUpdated(){
  qs('#updated').textContent=new Date(document.lastModified).toLocaleDateString();
}

document.addEventListener('DOMContentLoaded',()=>{
  renderProfile();
  renderPublications();
  renderProjects();
  renderCV();
  themeInit();
  qs('#theme-btn').addEventListener('click',themeSwitch);
  reveal();
  portraitParallax();
  lastUpdated();
});
