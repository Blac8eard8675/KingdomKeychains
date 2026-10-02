const groups = {
  Crosses: ["Emmanuel","Eternity Cross","Healer","Holy Spirit Cross","Shalom","Spiral Cross"],
  Chainlinks: ["Elohim","Holy Spirit Chainlinks","Jesus Fish","Spiral Chainlinks"],
  Ropes: ["Brave Rope","DNA Rope","Eternity","Holy Spirit Rope","Spiral Rope"]
};
const loginPanel=document.querySelector("#loginPanel"), adminPanel=document.querySelector("#adminPanel");
const loginForm=document.querySelector("#loginForm"), form=document.querySelector("#productForm");
const aCategory=document.querySelector("#aCategory"), aSub=document.querySelector("#aSubcategory");
const list=document.querySelector("#adminProducts");

function updateAdminSubs(){aSub.innerHTML=groups[aCategory.value].map(x=>`<option>${x}</option>`).join("");}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

async function check(){
 const me=await fetch("/api/me").then(r=>r.json());
 loginPanel.hidden=me.authenticated; adminPanel.hidden=!me.authenticated;
 if(me.authenticated){updateAdminSubs();loadProducts();}
}
async function loadProducts(){
 const ps=await fetch("/api/products").then(r=>r.json());
 list.innerHTML=ps.sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`
 <div class="admin-product"><div><strong>${esc(p.name)}</strong> — ${esc(p.category)} / ${esc(p.subcategory)} — $${Number(p.price).toFixed(2)} — ${esc(p.color)}</div>
 <button class="delete" data-id="${p.id}">Delete</button></div>`).join("");
}
loginForm.addEventListener("submit",async e=>{
 e.preventDefault(); const body=Object.fromEntries(new FormData(loginForm));
 const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 if(!r.ok){document.querySelector("#loginError").textContent=(await r.json()).error;return;}
 check();
});
form.addEventListener("submit",async e=>{
 e.preventDefault(); const r=await fetch("/api/products",{method:"POST",body:new FormData(form)});
 const data=await r.json();
 document.querySelector("#productMessage").textContent=r.ok?"Keychain added!":data.error;
 if(r.ok){form.reset();updateAdminSubs();loadProducts();}
});

document.querySelector("#credentialsForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const message=document.querySelector("#credentialsMessage");
 const r=await fetch("/api/admin/credentials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});
 const data=await r.json();
 message.textContent=data.message || data.error;
 message.style.color=r.ok ? "#176b35" : "#a00000";
 if(r.ok) e.target.reset();
});

list.addEventListener("click",async e=>{
 if(!e.target.classList.contains("delete"))return;
 if(!confirm("Delete this keychain?"))return;
 await fetch("/api/products/"+e.target.dataset.id,{method:"DELETE"}); loadProducts();
});
document.querySelector("#logout").onclick=async()=>{await fetch("/api/logout",{method:"POST"});check();};
aCategory.addEventListener("change",updateAdminSubs);
check();