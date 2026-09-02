const STORAGE_KEY = "localcart";
const API = "data/menu.json";

// DOM Elements
const searchCart = document.querySelector("#search");
const menuCart = document.querySelector("#menu");
const listMenu = document.querySelector("#listMenu");
const listCart = document.querySelector("#cart");
const totalEl = document.querySelector("#total");
const formCart = document.querySelector("#checkout");
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const areaSelect = document.querySelector("#area");
const formError = document.querySelector("#form-error");

// App State
const state = {
  cartItem: [],      // Stores fetched menu items (array)
  orderItems: [],    // Stores items added to cart
  searchItems: ""    // Current search term
};

// 1. LocalStorage Management
function savecart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orderItems));
}

function loadcart() {
  const cart = localStorage.getItem(STORAGE_KEY);
  if (cart) {
    state.orderItems = JSON.parse(cart);
    renderCart();
  }
}

// 2. Data Fetching
async function loadItems() {
  try {
    const response = await fetch(API);
    if (!response.ok) {
      throw new Error(`Failed to fetch`);
    }
    const items = await response.json();
    state.cartItem = items;
    renderMenu();
  } catch (err) {
    listMenu.innerHTML = `<p class="error">Failed to load menu items.</p>`;
    console.error(err);
  }
}

// 3. Rendering Functions
function renderMenu() {
  const term = state.searchItems.toLowerCase();
  const shown = state.cartItem.filter(item => 
    item.name.toLowerCase().includes(term)
  );

  if (shown.length === 0) {
    listMenu.innerHTML = "<p>No dishes found.</p>";
    return;
  }

  listMenu.innerHTML = shown.map(d => `
    <li>
      <article class="dish" data-id="${d.id}">
        <h3>${d.name}</h3>
        <p class="price">${d.price} ETB</p>
        <button class="add" data-id="${d.id}">Add</button>
      </article>
    </li>
  `).join("");
}

function renderCart() {
  if (state.orderItems.length === 0) {
    listCart.innerHTML = "<li>Your cart is empty.</li>";
    totalEl.textContent = "0.00 ETB";
    return;
  }

  listCart.innerHTML = state.orderItems.map((item, index) => `
    <li>
      <span>${item.name} - ${item.price} ETB</span>
      <button class="remove" data-index="${index}" type="button">Remove</button>
    </li>
  `).join("");

  const total = state.orderItems.reduce((sum, item) => sum + item.price, 0);
  totalEl.textContent = `${total.toFixed(2)} ETB`;
}

// 4. Event Listeners
searchCart.addEventListener("input", (e) => {
  state.searchItems = e.target.value;
  renderMenu();
});

listMenu.addEventListener("click", (e) => {
  if (!e.target.matches(".add")) return;
  const id = Number(e.target.dataset.id);
  const selectedDish = state.cartItem.find(item => item.id === id);

  if (selectedDish) {
    state.orderItems.push(selectedDish);
    savecart();
    renderCart();
  }
});

listCart.addEventListener("click", (e) => {
  if (!e.target.matches(".remove")) return;
  const index = Number(e.target.dataset.index);
  state.orderItems.splice(index, 1);
  savecart();
  renderCart();
});

formCart.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!nameInput.value.trim() || !phoneInput.value.trim()) {
    formError.textContent = "Please fill in all required fields.";
    return;
  }
  formError.textContent = "";
  alert(`Order placed successfully for ${nameInput.value}!`);
  state.orderItems = [];
  savecart();
  renderCart();
  formCart.reset();
});

// Initial load sequence
loadcart();
loadItems();