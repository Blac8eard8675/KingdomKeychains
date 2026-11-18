/* KINGDOM KEYCHAINS — CART (development branch) */
(() => {
  const STORAGE_KEY = "kingdomKeychainsCartV1";
  const readCart = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
  let cart = readCart();
  const priceOf = p => Number(p.price || 5);
  const money = n => "$" + n.toFixed(2);
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (error) { console.warn("Kingdom Keychains cart could not be saved in this browser.", error); } renderCart(); };
  const ensureUI = () => {
    if (document.getElementById("kkCartDock")) return;
    const dock = document.createElement("div");
    dock.id = "kkCartDock";
    dock.innerHTML = '<button type="button" id="kkCartToggle" class="kk-cart-toggle" aria-expanded="false">🛒 Cart <span id="kkCartCount">0</span></button><aside id="kkCartPanel" class="kk-cart-panel hidden" aria-label="Shopping cart"><div class="kk-cart-heading"><h2>Your Cart</h2><button type="button" id="kkCartClose" aria-label="Close cart">×</button></div><div id="kkCartItems"></div><div class="kk-cart-total"><span>Subtotal</span><strong id="kkCartSubtotal">$0.00</strong></div><p class="kk-cart-note">Shipping and checkout will be added in the next store-building step.</p></aside>';
    document.body.appendChild(dock);
    dock.querySelector("#kkCartToggle").addEventListener("click", () => {
      const panel = dock.querySelector("#kkCartPanel"); panel.classList.toggle("hidden");
      dock.querySelector("#kkCartToggle").setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
    });
    dock.querySelector("#kkCartClose").addEventListener("click", () => {
      dock.querySelector("#kkCartPanel").classList.add("hidden"); dock.querySelector("#kkCartToggle").setAttribute("aria-expanded","false");
    });
  };
  const renderCart = () => {
    const count = cart.reduce((s,i)=>s+i.iQty,0);
    const badge = document.getElementById("kkCartCount"); if (badge) badge.textContent = count;
    const items = document.getElementById("kkCartItems"); if (!items) return;
    items.innerHTML = "";
    if (!cart.length) { items.innerHTML = '<p class="kk-cart-empty">Your cart is empty.</p>'; }
    cart.forEach(item => {
      const row = document.createElement("div"); row.className="kk-cart-item";
      const img = document.createElement("img"); img.src="images/"+item.image; img.alt=item.color;
      const details = document.createElement("div"); details.className="kk-cart-details";
      const title=document.createElement("strong"); title.textContent=item.color;
      const meta=document.createElement("span"); meta.textContent=item.category+" • "+item.subcategory+(item.style?" • "+item.style:"");
      const price=document.createElement("span"); price.textContent=money(priceOf(item))+" each";
      const controls=document.createElement("div"); controls.className="kk-cart-quantity";
      const minus=document.createElement("button"); minus.type="button"; minus.textContent="−"; minus.setAttribute("aria-label","Decrease quantity");
      const qty=document.createElement("span"); qty.textContent=item.iQty;
      const plus=document.createElement("button"); plus.type="button"; plus.textContent="+";
      const remove=document.createElement("button"); remove.type="button"; remove.className="kk-cart-remove"; remove.textContent="Remove";
      minus.addEventListener("click",()=>{item.iQty--; if(item.iQty<=0) cart=cart.filter(x=>x.key!==item.key); save();});
      plus.addEventListener("click",()=>{item.iQty++; save();});
      remove.addEventListener("click",()=>{cart=cart.filter(x=>x.key!==item.key); save();});
      controls.append(minus,qty,plus,remove); details.append(title,meta,price,controls); row.append(img,details); items.appendChild(row);
    });
    const subtotal=document.getElementById("kkCartSubtotal"); if(subtotal) subtotal.textContent=money(cart.reduce((s,i)=>s+priceOf(i)*i.iQty,0));
  };
  const addButtons = () => {
    document.querySelectorAll(".product-card").forEach(card=>{
      if(card.querySelector(".kk-add-cart")) return;
      const imageEl=card.querySelector("img");
      const color=card.dataset.color||"Keychain";
      const data={category:card.dataset.category||"",subcategory:card.dataset.subcategory||"",style:card.dataset.style||"",color,image:(imageEl?.getAttribute("src")||"").replace(/^images\//,""),price:Number(card.dataset.price||5)};
      const key=[data.category,data.subcategory,data.style,data.color,data.image].join("|");
      const button=document.createElement("button"); button.type="button"; button.className="kk-add-cart"; button.textContent="Add to Cart";
      button.addEventListener("click",()=>{
        const existing=cart.find(i=>i.key===key);
        if(existing) existing.iQty++; else cart.push({...data,key,iQty:1});
        save();
        const panel=document.getElementById("kkCartPanel"); panel?.classList.remove("hidden");
        document.getElementById("kkCartToggle")?.setAttribute("aria-expanded","true");
      });
      card.appendChild(button);
    });
  };
  const init = () => {
    ensureUI();
    addButtons();
    renderCart();
    if (!document.documentElement.dataset.kkCartObserver) {
      const observer = new MutationObserver(() => addButtons());
      observer.observe(document.body, { childList: true, subtree: true });
      document.documentElement.dataset.kkCartObserver = "true";
    }
  };
  document.addEventListener("DOMContentLoaded",init);
  if(document.readyState!=="loading") init();
})();