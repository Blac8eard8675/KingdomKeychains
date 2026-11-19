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
    const items = document.getElementById("kkCartItems");
    if (items) {
      items.replaceChildren();

      if (!cart.length) {
        const empty = document.createElement("p");
        empty.className = "kk-cart-empty";
        empty.textContent = "Your cart is empty.";
        items.appendChild(empty);
      }

      cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "kk-cart-item";

        const img = document.createElement("img");
        img.src = "images/" + String(item.image || "").replace(/^\/+/, "");
        img.alt = item.color || "Kingdom Keychain";

        const details = document.createElement("div");
        details.className = "kk-cart-details";

        const title = document.createElement("strong");
        title.textContent = item.color || "Keychain";

        const meta = document.createElement("span");
        meta.textContent = [item.category, item.subcategory, item.style].filter(Boolean).join(" • ");

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
    }

    const subtotal = document.getElementById("kkCartSubtotal");
    if (subtotal) {
      subtotal.textContent = money(cart.reduce((sum, item) => sum + priceOf(item), 0));
    }

    const checkoutButton = document.getElementById("kkCheckoutButton");
    if (checkoutButton) {
      checkoutButton.disabled = cart.length === 0;
      checkoutButton.onclick = () => {
        if (cart.length) window.location.assign("checkout.html");
      };
    }

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
    dock.innerHTML = '<a id="kkCartLink" class="kk-cart-icon-link" href="cart.html" aria-label="Go to shopping cart" title="Shopping cart"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M2.5 4h4l3.2 16.1a2.5 2.5 0 0 0 2.45 2h13.1a2.5 2.5 0 0 0 2.4-1.8L30 10H8" /><path d="M12 26.5a1.8 1.8 0 1 0 0 .1M24 26.5a1.8 1.8 0 1 0 0 .1" /></svg></a>';
    document.body.appendChild(dock);
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