"use strict";

/* ---------- Data ---------- */
const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Mobiles", "Books", "Sports"];
const NAV_ITEMS = ["All", "Best Sellers", "Today's Deals", ...CATEGORIES];

const PRODUCTS = [
  { id: 1,  name: "Nova Wireless Headphones",     category: "Electronics",    icon: "🎧", price: 1999,  original: 3999,  rating: 4.4, reviews: 5210, color: "#dbeafe" },
  { id: 2,  name: "PixelView 4K Smart TV 43\"",   category: "Electronics",    icon: "📺", price: 24999, original: 39999, rating: 4.2, reviews: 1890, color: "#e0e7ff" },
  { id: 3,  name: "Urban Fit Denim Jacket",       category: "Fashion",        icon: "🧥", price: 1299,  original: 2599,  rating: 4.0, reviews: 820,  color: "#fce7f3" },
  { id: 4,  name: "Stride Running Shoes",         category: "Fashion",        icon: "👟", price: 1799,  original: 2999,  rating: 4.5, reviews: 3340, color: "#fee2e2" },
  { id: 5,  name: "ChefMate Air Fryer 4L",        category: "Home & Kitchen", icon: "🍳", price: 4499,  original: 7999,  rating: 4.3, reviews: 2760, color: "#fef3c7" },
  { id: 6,  name: "CozyNest Memory Foam Pillow",  category: "Home & Kitchen", icon: "🛏️", price: 599,   original: 1199,  rating: 4.1, reviews: 960,  color: "#ede9fe" },
  { id: 7,  name: "Glow Vitamin C Face Serum",    category: "Beauty",         icon: "🧴", price: 449,   original: 899,   rating: 4.3, reviews: 4120, color: "#ffedd5" },
  { id: 8,  name: "Silk Touch Lipstick Set",      category: "Beauty",         icon: "💄", price: 699,   original: 1299,  rating: 3.9, reviews: 540,  color: "#fbcfe8" },
  { id: 9,  name: "Orbit X5 5G Smartphone",       category: "Mobiles",        icon: "📱", price: 14999, original: 19999, rating: 4.4, reviews: 8800, color: "#cffafe" },
  { id: 10, name: "Orbit Buds Pro Earbuds",       category: "Mobiles",        icon: "🎵", price: 1499,  original: 2999,  rating: 4.2, reviews: 2210, color: "#d1fae5" },
  { id: 11, name: "The Code Within – Paperback",  category: "Books",          icon: "📘", price: 299,   original: 499,   rating: 4.6, reviews: 1530, color: "#e0f2fe" },
  { id: 12, name: "Mindful Habits Journal",       category: "Books",          icon: "📓", price: 199,   original: 349,   rating: 4.5, reviews: 770,  color: "#fef9c3" },
  { id: 13, name: "ProGrip Yoga Mat 6mm",         category: "Sports",         icon: "🧘", price: 699,   original: 1499,  rating: 4.2, reviews: 1980, color: "#dcfce7" },
  { id: 14, name: "Smash Pro Cricket Bat",        category: "Sports",         icon: "🏏", price: 2199,  original: 3499,  rating: 4.1, reviews: 640,  color: "#ffe4e6" }
];

const SLIDES = [
  { title: "Big Festive Sale",      text: "Up to 60% off on electronics",    icon: "🛍️", bg: "linear-gradient(120deg,#232f3e,#37475a)", filter: "Electronics" },
  { title: "Fresh Fashion Drop",    text: "New styles from ₹499",            icon: "👗", bg: "linear-gradient(120deg,#9d174d,#db2777)", filter: "Fashion" },
  { title: "Smart Home Savings",    text: "Kitchen & home essentials",       icon: "🏠", bg: "linear-gradient(120deg,#065f46,#10b981)", filter: "Home & Kitchen" },
  { title: "Read More, Pay Less",   text: "Bestselling books under ₹399",    icon: "📚", bg: "linear-gradient(120deg,#1e3a8a,#3b82f6)", filter: "Books" }
];

/* ---------- State ---------- */
const state = { category: "All", query: "", sort: "featured", cart: loadCart(), slide: 0 };

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const formatPrice = (n) => "₹" + n.toLocaleString("en-IN");
const discountPercent = (p) => Math.round((1 - p.price / p.original) * 100);

function loadCart() {
  try { return JSON.parse(localStorage.getItem("shopsphere-cart")) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("shopsphere-cart", JSON.stringify(state.cart)); } catch { /* storage unavailable */ }
}

/* ---------- Product list ---------- */
function getVisibleProducts() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => {
    const matchCategory = state.category === "All" || state.category === "Best Sellers" || state.category === "Today's Deals" || p.category === state.category;
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });
  if (state.category === "Best Sellers") list = list.filter((p) => p.rating >= 4.3);
  if (state.category === "Today's Deals") list = list.filter((p) => discountPercent(p) >= 40);

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => discountPercent(b) - discountPercent(a)
  };
  return sorters[state.sort] ? [...list].sort(sorters[state.sort]) : list;
}

function productCardHTML(p) {
  const stars = "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));
  return `<article class="card">
    <div class="img" style="background:${p.color}">${p.icon}</div>
    <h3>${p.name}</h3>
    <div class="stars">${stars} <small>${p.rating} (${p.reviews.toLocaleString("en-IN")})</small></div>
    <div class="price">${formatPrice(p.price)}<del>${formatPrice(p.original)}</del></div>
    <div class="off">${discountPercent(p)}% off</div>
    <button class="add" data-id="${p.id}">Add to Cart</button>
  </article>`;
}

function renderProducts() {
  const list = getVisibleProducts();
  $("resultsTitle").textContent = `${state.category === "All" ? "All products" : state.category} (${list.length})`;
  $("productGrid").innerHTML = list.length
    ? list.map(productCardHTML).join("")
    : `<div class="empty">No products match your search. Try something else.</div>`;
  document.querySelectorAll(".chip, .nav a").forEach((el) => el.classList.toggle("on", el.dataset.cat === state.category));
  document.querySelectorAll(".nav a").forEach((el) => el.classList.toggle("active", el.dataset.cat === state.category));
}

/* ---------- Filtering ---------- */
function setCategory(cat, scroll = false) {
  state.category = cat;
  renderProducts();
  if (scroll) document.querySelector(".products-section").scrollIntoView({ behavior: "smooth" });
}

function buildFilters() {
  $("mainNav").innerHTML = NAV_ITEMS.map((c) => `<a href="#" data-cat="${c}">${c}</a>`).join("");
  $("chips").innerHTML = ["All", ...CATEGORIES].map((c) => `<button class="chip" data-cat="${c}">${c}</button>`).join("");
  $("searchCategory").innerHTML = ["All", ...CATEGORIES].map((c) => `<option>${c}</option>`).join("");

  $("categoryCards").innerHTML = [
    ["Electronics", "Electronics", ["🎧", "📺", "🔌", "⌚"]],
    ["Fashion", "Fashion", ["🧥", "👟", "👜", "🕶️"]],
    ["Home & Kitchen", "Home & Kitchen", ["🍳", "🛏️", "🪴", "💡"]],
    ["Mobiles", "Mobiles", ["📱", "🎵", "🔋", "📷"]]
  ].map(([title, cat, icons]) => `<div class="cat-card" data-cat="${cat}">
      <h3>${title}</h3><div class="cat-tiles">${icons.map((i) => `<span>${i}</span>`).join("")}</div><a href="#">Shop now</a></div>`).join("");
}

/* ---------- Cart ---------- */
function updateCartCount() {
  $("cartCount").textContent = Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}
function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  updateCartCount();
  showToast(`Added "${PRODUCTS.find((p) => p.id === id).name}" to cart`);
}
let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}
function showCartSummary() {
  const items = Object.entries(state.cart);
  if (!items.length) return showToast("Your cart is empty");
  const total = items.reduce((sum, [id, qty]) => sum + PRODUCTS.find((p) => p.id == id).price * qty, 0);
  showToast(`${items.length} item type(s) in cart · Total ${formatPrice(total)}`);
}

/* ---------- Slider ---------- */
function buildSlider() {
  $("slides").innerHTML = SLIDES.map((s) => `<div class="slide" style="background:${s.bg}">
      <span class="emoji">${s.icon}</span><h1>${s.title}</h1><p>${s.text}</p>
      <button data-cat="${s.filter}">Shop ${s.filter}</button></div>`).join("");
  $("dots").innerHTML = SLIDES.map((_, i) => `<button data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join("");
  goToSlide(0);
}
function goToSlide(index) {
  state.slide = (index + SLIDES.length) % SLIDES.length;
  $("slides").style.transform = `translateX(-${state.slide * 100}%)`;
  [...$("dots").children].forEach((d, i) => d.classList.toggle("on", i === state.slide));
}
let sliderTimer;
function startAutoSlide() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(state.slide + 1), 4500);
}

/* ---------- Events ---------- */
function bindEvents() {
  // Event delegation for any element carrying data-cat (nav, chips, category cards, slide buttons)
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add");
    if (addBtn) return addToCart(Number(addBtn.dataset.id));

    const catEl = e.target.closest("[data-cat]");
    if (catEl) {
      e.preventDefault();
      setCategory(catEl.dataset.cat, !catEl.classList.contains("chip"));
      $("mainNav").classList.remove("open");
    }
    const dot = e.target.closest("[data-slide]");
    if (dot) { goToSlide(Number(dot.dataset.slide)); startAutoSlide(); }
  });

  $("prevSlide").addEventListener("click", () => { goToSlide(state.slide - 1); startAutoSlide(); });
  $("nextSlide").addEventListener("click", () => { goToSlide(state.slide + 1); startAutoSlide(); });

  $("searchInput").addEventListener("input", (e) => { state.query = e.target.value; renderProducts(); });
  $("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.category = $("searchCategory").value;
    state.query = $("searchInput").value;
    setCategory(state.category, true);
  });
  $("sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });
  $("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
  $("cartButton").addEventListener("click", showCartSummary);
  $("backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Init ---------- */
buildFilters();
buildSlider();
renderProducts();
updateCartCount();
bindEvents();
startAutoSlide();
