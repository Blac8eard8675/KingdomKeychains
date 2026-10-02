const groups = {
  Crosses: ["Emmanuel","Eternity Cross","Healer","Holy Spirit Cross","Shalom","Spiral Cross"],
  Chainlinks: ["Elohim","Holy Spirit Chainlinks","Jesus Fish","Spiral Chainlinks"],
  Ropes: ["Brave Rope","DNA Rope","Eternity","Holy Spirit Rope","Spiral Rope"]
};
let products = [];

const category = document.querySelector("#category");
const subcategory = document.querySelector("#subcategory");
const price = document.querySelector("#price");
const color = document.querySelector("#color");
const grid = document.querySelector("#productGrid");
const empty = document.querySelector("#empty");

function updateSubcategories() {
  const list = category.value ? groups[category.value] : Object.values(groups).flat();
  subcategory.innerHTML = '<option value="">All Subcategories</option>' +
    [...new Set(list)].sort((a,b)=>a.localeCompare(b)).map(x=>`<option>${x}</option>`).join("");
}

function updateColors() {
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  color.innerHTML = '<option value="">All Colors</option>' + colors.map(x=>`<option>${x}</option>`).join("");
}

function render() {
  const filtered = products.filter(p =>
    (!category.value || p.category === category.value) &&
    (!subcategory.value || p.subcategory === subcategory.value) &&
    (!price.value || Number(p.price) === Number(price.value)) &&
    (!color.value || p.color === color.value)
  ).sort((a,b)=>a.name.localeCompare(b.name));

  grid.innerHTML = filtered.map(p => `
    <article class="product">
      <div class="product-image">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : '<span>Keychain Photo</span>'}</div>
      <div class="product-info">
        <span class="tag">${escapeHtml(p.subcategory)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || "")}</p>
        <div class="product-bottom"><strong>$${Number(p.price).toFixed(2)}</strong><span>${escapeHtml(p.color)}</span></div>
      </div>
    </article>`).join("");
  empty.hidden = filtered.length !== 0;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function load() {
  products = await fetch("/api/products").then(r=>r.json());
  updateSubcategories();
  updateColors();
  render();
}
category.addEventListener("change", () => { updateSubcategories(); subcategory.value=""; render(); });
[subcategory, price, color].forEach(x => x.addEventListener("change", render));
document.querySelector("#year").textContent = new Date().getFullYear();
load();