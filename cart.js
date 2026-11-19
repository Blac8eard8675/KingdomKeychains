/* KINGDOM KEYCHAINS — ONE-OF-A-KIND CART (development branch) */
(() => {
  const STORAGE_KEY = "kingdomKeychainsCartV1";

  const readCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      const unique = new Map();
      saved.forEach(item => {
        if (!item || typeof item !== "object" || !item.key) return;
        // Migrate older cart entries: every product is a single, unique item.
        if (!unique.has(item.key)) {
          const { iQty, ...oneOfAKindItem } = item;
          unique.set(item.key, oneOfAKindItem);
        }
      });
      return Array.from(unique.values());
    } catch {
      return [];
    }
  };

  let cart = readCart();
  const priceOf = item => Number(item.price ?? 5);
  const money = amount => "$" + amount.toFixed(2);

  const productData = card => {
    const imageEl = card.querySelector("img");
    return {
      category: card.dataset.category || "",
      subcategory: card.dataset.subcategory || "",
      style: card.dataset.style || "",
      color: card.dataset.color || "Keychain",
      image: (imageEl?.getAttribute("src") || "").replace(/^images\//, ""),
      price: Number(card.dataset.price || 5)
    };
  };

  const productKey = data =>
    [data.category, data.subcategory, data.style, data.color, data.image].join("|");

  const syncProductButtons = () => {
    document.querySelectorAll(".product-card").forEach(card => {
      const button = card.querySelector(".kk-add-cart");
      if (!button) return;
      const key = productKey(productData(card));
      const added = cart.some(item => item.key === key);
      button.textContent = added ? "Added to Cart" : "Add to Cart";
      button.disabled = added;
      button.setAttribute("aria-label", added ? "This unique item is already in your cart" : "Add this unique item to your cart");
      button.classList.toggle("kk-added-to-cart", added);
    });
  };

  const renderCart = () => {
    const badge = document.getElementById("kkCartCount");
    if (badge) badge.textContent = cart.length;

    const items = document.getElementById("kkCartItems");
    if (!items) return;
    items.innerHTML = "";

    if (!cart.length) {
      items.innerHTML = '<p class="kk-cart-empty">Your cart is empty.</p>';
    }

    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "kk-cart-item";

      const img = document.createElement("img");
      img.src = "images/" + item.image;
      img.alt = item.color;

      const details = document.createElement("div");
      details.className = "kk-cart-details";

      const title = document.createElement("strong");
      title.textContent = item.color;

      const meta = document.createElement("span");
      meta.textContent = item.category + " • " + item.subcategory + (item.style ? " • " + item.style : "");

      const price = document.createElement("span");
      price.textContent = money(priceOf(item));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "kk-cart-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        cart = cart.filter(product => product.key !== item.key);
        save();
      });

      details.append(title, meta, price, remove);
      row.append(img, details);
      items.appendChild(row);
    });

    const subtotal = document.getElementById("kkCartSubtotal");
    if (subtotal) {
      subtotal.textContent = money(cart.reduce((sum, item) => sum + priceOf(item), 0));
    }
    const checkoutButton = document.getElementById("kkCheckoutButton");
    if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    syncProductButtons();
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn("Kingdom Keychains cart could not be saved in this browser.", error);
    }
    renderCart();
  };

  const ensureUI = () => {
    if (document.getElementById("kkCartDock")) return;
    const dock = document.createElement("div");
    dock.id = "kkCartDock";
    dock.innerHTML = '<button type="button" id="kkCartToggle" class="kk-cart-toggle" aria-expanded="false">🛒 Cart <span id="kkCartCount">0</span></button><aside id="kkCartPanel" class="kk-cart-panel hidden" aria-label="Shopping cart"><div class="kk-cart-heading"><h2>Your Cart</h2><button type="button" id="kkCartClose" aria-label="Close cart">×</button></div><div id="kkCartItems"></div><div class="kk-cart-total"><span>Subtotal</span><strong id="kkCartSubtotal">$0.00</strong></div><button type="button" id="kkCheckoutButton" class="kk-checkout-link" disabled>Proceed to Checkout</button><p class="kk-cart-note">Shipping is calculated during checkout.</p></aside>';
    document.body.appendChild(dock);

    dock.querySelector("#kkCartToggle").addEventListener("click", () => {
      const panel = dock.querySelector("#kkCartPanel");
      panel.classList.toggle("hidden");
      dock.querySelector("#kkCartToggle").setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
    });

    dock.querySelector("#kkCartClose").addEventListener("click", () => {
      dock.querySelector("#kkCartPanel").classList.add("hidden");
      dock.querySelector("#kkCartToggle").setAttribute("aria-expanded", "false");
    });

    dock.querySelector("#kkCheckoutButton").addEventListener("click", () => {
      if (cart.length) window.location.assign("checkout.html");
    });
  };

  const addButtons = () => {
    document.querySelectorAll(".product-card").forEach(card => {
      if (card.querySelector(".kk-add-cart")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "kk-add-cart";
      button.textContent = "Add to Cart";

      button.addEventListener("click", () => {
        const data = productData(card);
        const key = productKey(data);
        if (cart.some(item => item.key === key)) return;

        cart.push({ ...data, key });
        save();

        const panel = document.getElementById("kkCartPanel");
        panel?.classList.remove("hidden");
        document.getElementById("kkCartToggle")?.setAttribute("aria-expanded", "true");
      });

      card.appendChild(button);
    });
    syncProductButtons();
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

  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();
})();