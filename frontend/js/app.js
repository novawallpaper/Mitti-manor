
/* =========================================================
   MITTI MANOR — APP.JS
   Frontend Application Logic
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const AppState = {
    cart: JSON.parse(localStorage.getItem("mitti_manor_cart") || "[]"),
    wishlist: JSON.parse(localStorage.getItem("mitti_manor_wishlist") || "[]"),
    currentPage: "home",
    searchQuery: "",
    isMenuOpen: false,
    isCartOpen: false,
    isAuthOpen: false
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
    return [...parent.querySelectorAll(selector)];
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {
    loader: $("#app-loader"),

    menuBtn: $("#menu-btn"),
    closeMenuBtn: $("#close-menu-btn"),
    sideMenu: $("#side-menu"),
    menuOverlay: $("#menu-overlay"),

    searchBtn: $("#search-btn"),
    searchPanel: $("#search-panel"),
    searchInput: $("#search-input"),
    searchForm: $("#search-form"),
    clearSearch: $("#clear-search"),
    searchSuggestions: $("#search-suggestions"),

    wishlistBtn: $("#wishlist-btn"),

    cartBtn: $("#cart-btn"),
    cartBadge: $("#cart-badge"),
    cartDrawer: $("#cart-drawer"),
    closeCartBtn: $("#close-cart-btn"),
    cartOverlay: $("#cart-overlay"),
    cartItems: $("#cart-items"),
    cartSubtotal: $("#cart-subtotal"),
    cartDelivery: $("#cart-delivery"),
    cartTotal: $("#cart-total"),
    checkoutBtn: $("#checkout-btn"),
    continueShoppingBtn: $("#continue-shopping-btn"),

    authOverlay: $("#auth-overlay"),
    authModal: $("#auth-modal"),
    closeAuthBtn: $("#close-auth-btn"),
    phoneLoginBtn: $("#phone-login-btn"),
    emailLoginBtn: $("#email-login-btn"),

    toast: $("#toast"),
    toastMessage: $("#toast-message"),

    productGrid: $("#product-grid"),
    categoryGrid: $("#category-grid"),
    newArrivals: $("#new-arrivals"),

    ordersContainer: $("#orders-container"),
    wishlistContainer: $("#wishlist-container"),
    profileContainer: $("#profile-container")
};


/* =========================================================
   SAMPLE PRODUCTS
   TEMPORARY — REAL PRODUCTS WILL COME FROM FIREBASE
========================================================= */

const PRODUCTS = [
    {
        id: "MM001",
        name: "Premium Disposable Plates",
        category: "Disposable",
        price: 499,
        oldPrice: 599,
        unit: "Pack",
        image: "assets/products/plates.jpg",
        featured: true,
        newArrival: true
    },
    {
        id: "MM002",
        name: "Premium Disposable Bowls",
        category: "Disposable",
        price: 399,
        oldPrice: 499,
        unit: "Pack",
        image: "assets/products/bowls.jpg",
        featured: true,
        newArrival: true
    },
    {
        id: "MM003",
        name: "Heavy Duty Paper Cups",
        category: "Disposable",
        price: 299,
        oldPrice: 349,
        unit: "Pack",
        image: "assets/products/cups.jpg",
        featured: true,
        newArrival: false
    },
    {
        id: "MM004",
        name: "Premium Food Containers",
        category: "Packaging",
        price: 699,
        oldPrice: 799,
        unit: "Pack",
        image: "assets/products/containers.jpg",
        featured: true,
        newArrival: true
    },
    {
        id: "MM005",
        name: "Disposable Serving Trays",
        category: "Disposable",
        price: 549,
        oldPrice: 649,
        unit: "Pack",
        image: "assets/products/trays.jpg",
        featured: true,
        newArrival: false
    },
    {
        id: "MM006",
        name: "Premium Tissue Paper",
        category: "Tissue",
        price: 249,
        oldPrice: 299,
        unit: "Pack",
        image: "assets/products/tissue.jpg",
        featured: false,
        newArrival: true
    }
];


/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
    {
        id: "featured",
        name: "Featured",
        subtitle: "Popular products",
        number: "01"
    },
    {
        id: "disposable",
        name: "Disposable",
        subtitle: "Everyday essentials",
        number: "02"
    },
    {
        id: "packaging",
        name: "Packaging",
        subtitle: "Business packaging",
        number: "03"
    },
    {
        id: "tissue",
        name: "Tissue",
        subtitle: "Clean & essential",
        number: "04"
    }
];


/* =========================================================
   APP INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initLoader();

    initMenu();

    initSearch();

    initCart();

    initAuth();

    initNavigation();

    initWishlist();

    renderCategories();

    renderProducts();

    renderNewArrivals();

    renderCart();

    updateCartBadge();

    updateWishlistButton();

    handleInitialRoute();

});


/* =========================================================
   LOADER
========================================================= */

function initLoader() {

    if (!elements.loader) {
        return;
    }

    window.setTimeout(() => {
        elements.loader.classList.add("hidden");
    }, 500);
}


/* =========================================================
   MENU
========================================================= */

function initMenu() {

    elements.menuBtn?.addEventListener("click", openMenu);

    elements.closeMenuBtn?.addEventListener("click", closeMenu);

    elements.menuOverlay?.addEventListener("click", closeMenu);

    $$(".side-link").forEach(link => {

        link.addEventListener("click", () => {
            closeMenu();
        });

    });
}


function openMenu() {

    if (!elements.sideMenu) {
        return;
    }

    elements.sideMenu.classList.add("open");

    elements.menuOverlay.hidden = false;

    elements.sideMenu.setAttribute("aria-hidden", "false");

    AppState.isMenuOpen = true;

    document.body.classList.add("menu-open");

    requestAnimationFrame(() => {
        elements.menuOverlay.style.opacity = "1";
    });
}


function closeMenu() {

    if (!elements.sideMenu) {
        return;
    }

    elements.sideMenu.classList.remove("open");

    elements.sideMenu.setAttribute("aria-hidden", "true");

    AppState.isMenuOpen = false;

    document.body.classList.remove("menu-open");

    window.setTimeout(() => {

        if (!AppState.isMenuOpen) {
            elements.menuOverlay.hidden = true;
        }

    }, 250);
}


/* =========================================================
   SEARCH
========================================================= */

function initSearch() {

    elements.searchBtn?.addEventListener("click", toggleSearch);

    elements.searchForm?.addEventListener("submit", event => {
        event.preventDefault();

        performSearch();
    });

    elements.searchInput?.addEventListener("input", event => {

        AppState.searchQuery = event.target.value.trim();

        renderSearchSuggestions(AppState.searchQuery);

    });

    elements.clearSearch?.addEventListener("click", clearSearch);

    document.addEventListener("click", event => {

        const clickedInsideSearch =
            elements.searchPanel?.contains(event.target);

        const clickedSearchButton =
            elements.searchBtn?.contains(event.target);

        if (
            !clickedInsideSearch &&
            !clickedSearchButton
        ) {
            closeSearchSuggestions();
        }

    });
}


function toggleSearch() {

    if (!elements.searchPanel) {
        return;
    }

    elements.searchPanel.hidden = !elements.searchPanel.hidden;

    if (!elements.searchPanel.hidden) {

        window.setTimeout(() => {
            elements.searchInput?.focus();
        }, 100);

    }
}


function performSearch() {

    const query = elements.searchInput?.value
        ?.trim()
        .toLowerCase();

    if (!query) {
        showToast("Type a product name to search.");
        return;
    }

    AppState.searchQuery = query;

    const results = PRODUCTS.filter(product => {

        return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

    });

    renderProducts(results);

    closeSearchSuggestions();

    document
        .querySelector("#products")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    if (results.length === 0) {
        showToast("No products found.");
    } else {
        showToast(`${results.length} product(s) found.`);
    }
}


function renderSearchSuggestions(query) {

    if (!elements.searchSuggestions) {
        return;
    }

    if (!query) {
        closeSearchSuggestions();
        return;
    }

    const results = PRODUCTS
        .filter(product => {

            return (
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );

        })
        .slice(0, 5);


    if (results.length === 0) {

        elements.searchSuggestions.innerHTML = `
            <div style="
                padding:16px;
                color:#77756f;
                font-size:12px;
            ">
                No matching products
            </div>
        `;

    } else {

        elements.searchSuggestions.innerHTML = results
            .map(product => `
                <button
                    type="button"
                    class="search-result"
                    data-product-id="${escapeHTML(product.id)}"
                    style="
                        width:100%;
                        padding:12px 14px;
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        text-align:left;
                        border-bottom:1px solid #e8e7e3;
                        background:#fff;
                    "
                >
                    <span>
                        <strong
                            style="
                                display:block;
                                font-size:12px;
                            "
                        >
                            ${escapeHTML(product.name)}
                        </strong>

                        <small
                            style="
                                color:#77756f;
                                font-size:9px;
                            "
                        >
                            ${escapeHTML(product.category)}
                        </small>
                    </span>

                    <strong>
                        ${formatCurrency(product.price)}
                    </strong>
                </button>
            `)
            .join("");

        $$(".search-result", elements.searchSuggestions)
            .forEach(button => {

                button.addEventListener("click", () => {

                    const product = PRODUCTS.find(
                        item => item.id === button.dataset.productId
                    );

                    if (product) {
                        addToCart(product.id);
                    }

                    closeSearchSuggestions();

                });

            });

    }

    elements.searchSuggestions.hidden = false;
}


function closeSearchSuggestions() {

    if (elements.searchSuggestions) {
        elements.searchSuggestions.hidden = true;
    }
}


function clearSearch() {

    if (!elements.searchInput) {
        return;
    }

    elements.searchInput.value = "";

    AppState.searchQuery = "";

    closeSearchSuggestions();

    elements.searchInput.focus();

    renderProducts();
}


/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {

    if (!elements.categoryGrid) {
        return;
    }

    elements.categoryGrid.innerHTML = CATEGORIES
        .map(category => {

            return `
                <article
                    class="category-card"
                    data-category="${escapeHTML(category.id)}"
                >

                    <div class="category-image placeholder-image">
                        <span>
                            ${escapeHTML(category.number)}
                        </span>
                    </div>

                    <div class="category-info">

                        <h3>
                            ${escapeHTML(category.name)}
                        </h3>

                        <span>
                            ${escapeHTML(category.subtitle)}
                        </span>

                    </div>

                </article>
            `;

        })
        .join("");


    $$(".category-card", elements.categoryGrid)
        .forEach(card => {

            card.addEventListener("click", () => {

                const category = card.dataset.category;

                if (category === "featured") {
                    renderProducts(PRODUCTS);
                } else {

                    const filtered = PRODUCTS.filter(product =>
                        product.category
                            .toLowerCase()
                            .includes(category)
                    );

                    renderProducts(filtered);
                }

                document
                    .querySelector("#products")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            });

        });
}


/* =========================================================
   PRODUCTS
========================================================= */

function renderProducts(products = PRODUCTS) {

    if (!elements.productGrid) {
        return;
    }

    if (!products.length) {

        elements.productGrid.innerHTML = `
            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >
                <div class="empty-icon">⌕</div>

                <h3>No products found</h3>

                <p>
                    Try another category or search term.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    id="reset-products-btn"
                    style="margin-top:18px;"
                >
                    Show All Products
                </button>
            </div>
        `;

        $("#reset-products-btn")?.addEventListener(
            "click",
            () => renderProducts(PRODUCTS)
        );

        return;
    }


    elements.productGrid.innerHTML = products
        .map(product => createProductCard(product))
        .join("");


    attachProductEvents();
}


function createProductCard(product) {

    const inWishlist =
        AppState.wishlist.includes(product.id);

    return `
        <article
            class="product-card"
            data-product-id="${escapeHTML(product.id)}"
        >

            <div class="product-image">

                ${
                    product.image
                        ? `
                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >
                          `
                        : ""
                }

                <button
                    type="button"
                    class="product-wishlist-btn"
                    data-wishlist-id="${escapeHTML(product.id)}"
                    aria-label="Add to wishlist"
                    style="
                        position:absolute;
                        top:10px;
                        right:10px;
                        width:32px;
                        height:32px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:50%;
                        background:rgba(255,255,255,.92);
                        color:${inWishlist ? "#b08a45" : "#111"};
                        font-size:16px;
                    "
                >
                    ${inWishlist ? "♥" : "♡"}
                </button>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-bottom">

                    <div>
                        <strong>
                            ${formatCurrency(product.price)}
                        </strong>

                        ${
                            product.oldPrice
                                ? `
                                    <del
                                        style="
                                            display:block;
                                            color:#999;
                                            font-size:8px;
                                        "
                                    >
                                        ${formatCurrency(product.oldPrice)}
                                    </del>
                                  `
                                : ""
                        }
                    </div>

                    <button
                        type="button"
                        class="add-cart-btn"
                        data-add-cart="${escapeHTML(product.id)}"
                    >
                        Add
                    </button>

                </div>

            </div>

        </article>
    `;
}


function attachProductEvents() {

    $$("[data-add-cart]").forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            addToCart(button.dataset.addCart);

        });

    });


    $$(".product-wishlist-btn").forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            toggleWishlist(button.dataset.wishlistId);

        });

    });


    $$(".product-card").forEach(card => {

        card.addEventListener("click", event => {

            if (
                event.target.closest(".add-cart-btn") ||
                event.target.closest(".product-wishlist-btn")
            ) {
                return;
            }

            openProduct(card.dataset.productId);

        });

    });
}


/* =========================================================
   NEW ARRIVALS
========================================================= */

function renderNewArrivals() {

    if (!elements.newArrivals) {
        return;
    }

    const products = PRODUCTS
        .filter(product => product.newArrival)
        .slice(0, 6);

    elements.newArrivals.innerHTML = products
        .map(product => createProductCard(product))
        .join("");

    attachHorizontalProductEvents();
}


function attachHorizontalProductEvents() {

    $$(
        ".horizontal-products .add-cart-btn"
    ).forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            addToCart(button.dataset.addCart);

        });

    });


    $$(
        ".horizontal-products .product-wishlist-btn"
    ).forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            toggleWishlist(button.dataset.wishlistId);

        });

    });
}


/* =========================================================
   PRODUCT DETAILS
========================================================= */

function openProduct(productId) {

    const product = PRODUCTS.find(
        item => item.id === productId
    );

    if (!product) {
        return;
    }

    showToast(product.name);
}


/* =========================================================
   CART
========================================================= */

function initCart() {

    elements.cartBtn?.addEventListener(
        "click",
        openCart
    );

    elements.closeCartBtn?.addEventListener(
        "click",
        closeCart
    );

    elements.cartOverlay?.addEventListener(
        "click",
        closeCart
    );

    elements.continueShoppingBtn?.addEventListener(
        "click",
        closeCart
    );

    elements.checkoutBtn?.addEventListener(
        "click",
        handleCheckout
    );
}


function addToCart(productId) {

    const product = PRODUCTS.find(
        item => item.id === productId
    );

    if (!product) {
        showToast("Product not found.");
        return;
    }


    const existing = AppState.cart.find(
        item => item.id === productId
    );


    if (existing) {
        existing.quantity += 1;
    } else {

        AppState.cart.push({
            id: product.id,
            quantity: 1
        });

    }


    saveCart();

    renderCart();

    updateCartBadge();

    showToast("Added to cart.");

}


function removeFromCart(productId) {

    AppState.cart =
        AppState.cart.filter(
            item => item.id !== productId
        );

    saveCart();

    renderCart();

    updateCartBadge();

}


function changeQuantity(productId, change) {

    const item = AppState.cart.find(
        cartItem => cartItem.id === productId
    );

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();

    renderCart();

    updateCartBadge();
}


function saveCart() {

    localStorage.setItem(
        "mitti_manor_cart",
        JSON.stringify(AppState.cart)
    );
}


function renderCart() {

    if (!elements.cartItems) {
        return;
    }

    if (!AppState.cart.length) {

        elements.cartItems.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add products to start your order.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    id="continue-shopping-btn-inner"
                >
                    Continue Shopping
                </button>

            </div>
        `;

        $("#continue-shopping-btn-inner")
            ?.addEventListener(
                "click",
                closeCart
            );

        updateCartTotals();

        return;
    }


    elements.cartItems.innerHTML =
        AppState.cart
            .map(cartItem => {

                const product = PRODUCTS.find(
                    item => item.id === cartItem.id
                );

                if (!product) {
                    return "";
                }

                const lineTotal =
                    product.price * cartItem.quantity;

                return `
                    <div
                        class="cart-item"
                        data-cart-item="${escapeHTML(product.id)}"
                        style="
                            display:flex;
                            gap:12px;
                            padding:14px 0;
                            border-bottom:1px solid #e8e7e3;
                        "
                    >

                        <div
                            style="
                                width:72px;
                                height:72px;
                                flex:0 0 72px;
                                border-radius:10px;
                                overflow:hidden;
                                background:#f4f4f2;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                            "
                        >
                            ${
                                product.image
                                    ? `
                                        <img
                                            src="${escapeHTML(product.image)}"
                                            alt="${escapeHTML(product.name)}"
                                            style="
                                                width:100%;
                                                height:100%;
                                                object-fit:cover;
                                            "
                                            onerror="this.style.display='none'"
                                        >
                                      `
                                    : "MM"
                            }
                        </div>


                        <div style="flex:1;min-width:0;">

                            <strong
                                style="
                                    display:block;
                                    font-size:12px;
                                    line-height:1.35;
                                "
                            >
                                ${escapeHTML(product.name)}
                            </strong>

                            <span
                                style="
                                    display:block;
                                    margin-top:4px;
                                    color:#77756f;
                                    font-size:10px;
                                "
                            >
                                ${formatCurrency(product.price)}
                            </span>


                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    justify-content:space-between;
                                    margin-top:10px;
                                "
                            >

                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        border:1px solid #e8e7e3;
                                        border-radius:50px;
                                        overflow:hidden;
                                    "
                                >

                                    <button
                                        type="button"
                                        data-quantity-minus="${escapeHTML(product.id)}"
                                        style="
                                            width:30px;
                                            height:28px;
                                        "
                                    >
                                        −
                                    </button>

                                    <span
                                        style="
                                            min-width:28px;
                                            text-align:center;
                                            font-size:10px;
                                            font-weight:700;
                                        "
                                    >
                                        ${cartItem.quantity}
                                    </span>

                                    <button
                                        type="button"
                                        data-quantity-plus="${escapeHTML(product.id)}"
                                        style="
                                            width:30px;
                                            height:28px;
                                        "
                                    >
                                        +
                                    </button>

                                </div>


                                <strong
                                    style="font-size:12px;"
                                >
                                    ${formatCurrency(lineTotal)}
                                </strong>

                            </div>

                        </div>


                        <button
                            type="button"
                            data-remove-cart="${escapeHTML(product.id)}"
                            aria-label="Remove item"
                            style="
                                align-self:flex-start;
                                color:#77756f;
                                font-size:18px;
                            "
                        >
                            ×
                        </button>

                    </div>
                `;

            })
            .join("");


    $$("[data-remove-cart]").forEach(button => {

        button.addEventListener(
            "click",
            () => removeFromCart(button.dataset.removeCart)
        );

    });


    $$("[data-quantity-minus]").forEach(button => {

        button.addEventListener(
            "click",
            () => changeQuantity(
                button.dataset.quantityMinus,
                -1
            )
        );

    });


    $$("[data-quantity-plus]").forEach(button => {

        button.addEventListener(
            "click",
            () => changeQuantity(
                button.dataset.quantityPlus,
                1
            )
        );

    });


    updateCartTotals();
}


function updateCartTotals() {

    let subtotal = 0;

    AppState.cart.forEach(cartItem => {

        const product = PRODUCTS.find(
            item => item.id === cartItem.id
        );

        if (product) {
            subtotal +=
                product.price * cartItem.quantity;
        }

    });


    const delivery =
        subtotal > 0
            ? calculateDelivery(subtotal)
            : 0;

    const total = subtotal + delivery;


    if (elements.cartSubtotal) {
        elements.cartSubtotal.textContent =
            formatCurrency(subtotal);
    }

    if (elements.cartDelivery) {
        elements.cartDelivery.textContent =
            delivery === 0
                ? "FREE"
                : formatCurrency(delivery);
    }

    if (elements.cartTotal) {
        elements.cartTotal.textContent =
            formatCurrency(total);
    }

    if (elements.checkoutBtn) {
        elements.checkoutBtn.disabled =
            AppState.cart.length === 0;
    }
}


/* =========================================================
   DELIVERY
   TEMPORARY FRONTEND CALCULATION
========================================================= */

function calculateDelivery(subtotal) {

    if (subtotal >= 2000) {
        return 0;
    }

    return 80;
}


/* =========================================================
   CART BADGE
========================================================= */

function updateCartBadge() {

    if (!elements.cartBadge) {
        return;
    }

    const count =
        AppState.cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    if (count <= 0) {

        elements.cartBadge.hidden = true;

    } else {

        elements.cartBadge.hidden = false;

        elements.cartBadge.textContent =
            count > 99
                ? "99+"
                : count;

    }
}


/* =========================================================
   OPEN / CLOSE CART
========================================================= */

function openCart() {

    elements.cartDrawer?.classList.add("open");

    if (elements.cartOverlay) {
        elements.cartOverlay.hidden = false;
    }

    elements.cartDrawer?.setAttribute(
        "aria-hidden",
        "false"
    );

    AppState.isCartOpen = true;

    document.body.classList.add("cart-open");
}


function closeCart() {

    elements.cartDrawer?.classList.remove("open");

    elements.cartDrawer?.setAttribute(
        "aria-hidden",
        "true"
    );

    AppState.isCartOpen = false;

    document.body.classList.remove("cart-open");

    window.setTimeout(() => {

        if (!AppState.isCartOpen) {

            if (elements.cartOverlay) {
                elements.cartOverlay.hidden = true;
            }

        }

    }, 250);
}


/* =========================================================
   CHECKOUT
========================================================= */

function handleCheckout() {

    if (!AppState.cart.length) {
        showToast("Your cart is empty.");
        return;
    }

    /*
        IMPORTANT:

        Razorpay will be connected later.

        The final flow will be:

        Cart
          ↓
        Login / OTP
          ↓
        Address
          ↓
        Order creation
          ↓
        Backend
          ↓
        Razorpay Order
          ↓
        Payment
          ↓
        Verify payment
          ↓
        Confirm order
    */

    openAuth();

    showToast(
        "Please login before checkout."
    );
}


/* =========================================================
   AUTH
========================================================= */

function initAuth() {

    elements.closeAuthBtn?.addEventListener(
        "click",
        closeAuth
    );

    elements.authOverlay?.addEventListener(
        "click",
        closeAuth
    );

    elements.phoneLoginBtn?.addEventListener(
        "click",
        () => {

            closeAuth();

            showToast(
                "Phone OTP login will be connected with Firebase."
            );

        }
    );


    elements.emailLoginBtn?.addEventListener(
        "click",
        () => {

            closeAuth();

            showToast(
                "Email login will be connected with Firebase."
            );

        }
    );
}


function openAuth() {

    if (!elements.authModal) {
        return;
    }

    elements.authOverlay.hidden = false;

    elements.authModal.hidden = false;

    AppState.isAuthOpen = true;

    document.body.classList.add("modal-open");


    requestAnimationFrame(() => {

        elements.authModal.classList.add("open");

    });
}


function closeAuth() {

    if (!elements.authModal) {
        return;
    }

    elements.authModal.classList.remove("open");

    AppState.isAuthOpen = false;

    document.body.classList.remove("modal-open");


    window.setTimeout(() => {

        if (!AppState.isAuthOpen) {

            elements.authModal.hidden = true;

            elements.authOverlay.hidden = true;

        }

    }, 250);
}


/* =========================================================
   WISHLIST
========================================================= */

function initWishlist() {

    elements.wishlistBtn?.addEventListener(
        "click",
        () => {

            if (!AppState.wishlist.length) {

                showToast(
                    "Your wishlist is empty."
                );

                return;
            }

            showToast(
                `${AppState.wishlist.length} item(s) saved.`
            );

        }
    );
}


function toggleWishlist(productId) {

    const index =
        AppState.wishlist.indexOf(productId);


    if (index === -1) {

        AppState.wishlist.push(productId);

        showToast("Added to wishlist.");

    } else {

        AppState.wishlist.splice(index, 1);

        showToast("Removed from wishlist.");

    }


    localStorage.setItem(
        "mitti_manor_wishlist",
        JSON.stringify(AppState.wishlist)
    );


    updateWishlistButton();

    renderProducts();

    renderNewArrivals();
}


function updateWishlistButton() {

    if (!elements.wishlistBtn) {
        return;
    }

    const hasWishlist =
        AppState.wishlist.length > 0;

    elements.wishlistBtn.setAttribute(
        "aria-label",
        hasWishlist
            ? `Wishlist (${AppState.wishlist.length})`
            : "Wishlist"
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    window.addEventListener(
        "hashchange",
        handleRoute
    );


    $$(".bottom-nav-item").forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const route =
                    item.getAttribute("href")
                        ?.replace("#", "") || "home";

                setActiveNavigation(route);

            }
        );

    });
}


function handleInitialRoute() {

    const route =
        window.location.hash
            ?.replace("#", "") || "home";

    handleRoute(route);
}


function handleRoute() {

    const route =
        window.location.hash
            ?.replace("#", "") || "home";

    const validRoutes = [
        "home",
        "categories",
        "products",
        "orders",
        "wishlist",
        "profile"
    ];

    const currentRoute =
        validRoutes.includes(route)
            ? route
            : "home";


    AppState.currentPage =
        currentRoute;


    showPage(currentRoute);

    setActiveNavigation(currentRoute);
}


function showPage(route) {

    const homeSection =
        $("#home");

    const orders =
        $("#orders");

    const wishlist =
        $("#wishlist");

    const profile =
        $("#profile");


    if (homeSection) {
        homeSection.hidden =
            !["home", "categories", "products"].includes(route);
    }

    if (orders) {
        orders.hidden =
            route !== "orders";
    }

    if (wishlist) {
        wishlist.hidden =
            route !== "wishlist";
    }

    if (profile) {
        profile.hidden =
            route !== "profile";
    }


    if (route === "orders") {
        renderOrders();
    }

    if (route === "wishlist") {
        renderWishlistPage();
    }

    if (route === "profile") {
        renderProfile();
    }
}


function setActiveNavigation(route) {

    let activeRoute = route;

    if (
        route === "categories" ||
        route === "products"
    ) {
        activeRoute = "categories";
    }


    $$(".bottom-nav-item").forEach(item => {

        const itemRoute =
            item.dataset.nav;

        item.classList.toggle(
            "active",
            itemRoute === activeRoute
        );

    });
}


/* =========================================================
   ORDERS
========================================================= */

function renderOrders() {

    if (!elements.ordersContainer) {
        return;
    }

    elements.ordersContainer.innerHTML = `
        <div
            class="empty-state"
            style="padding:30px 20px;"
        >

            <div class="empty-icon">
                📦
            </div>

            <h3>
                No orders yet
            </h3>

            <p>
                Your confirmed orders will appear here.
            </p>

            <a
                href="#products"
                class="primary-btn"
                style="margin-top:18px;"
            >
                Start Shopping
            </a>

        </div>
    `;
}


/* =========================================================
   WISHLIST PAGE
========================================================= */

function renderWishlistPage() {

    if (!elements.wishlistContainer) {
        return;
    }


    const products =
        PRODUCTS.filter(product =>
            AppState.wishlist.includes(product.id)
        );


    if (!products.length) {

        elements.wishlistContainer.innerHTML = `
            <div
                class="empty-state"
                style="padding:30px 20px;"
            >

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Wishlist is empty
                </h3>

                <p>
                    Save products you want to order later.
                </p>

                <a
                    href="#products"
                    class="primary-btn"
                    style="margin-top:18px;"
                >
                    Explore Products
                </a>

            </div>
        `;

        return;
    }


    elements.wishlistContainer.innerHTML = `
        <div
            class="product-grid"
            style="padding:20px;"
        >
            ${products
                .map(product =>
                    createProductCard(product)
                )
                .join("")
            }
        </div>
    `;


    attachProductEvents();
}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    if (!elements.profileContainer) {
        return;
    }

    elements.profileContainer.innerHTML = `
        <div
            style="
                padding:20px;
                max-width:600px;
            "
        >

            <div
                style="
                    padding:22px;
                    border:1px solid #e8e7e3;
                    border-radius:18px;
                    background:#fff;
                "
            >

                <div
                    style="
                        width:60px;
                        height:60px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:50%;
                        background:#f2eee7;
                        font-size:24px;
                    "
                >
                    👤
                </div>

                <h3
                    style="
                        margin-top:15px;
                        font-family:'Playfair Display',serif;
                        font-size:24px;
                    "
                >
                    Welcome to MITTI MANOR
                </h3>

                <p
                    style="
                        margin-top:7px;
                        color:#77756f;
                        font-size:12px;
                    "
                >
                    Login to manage your business account,
                    orders and saved products.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    id="profile-login-btn"
                    style="margin-top:20px;"
                >
                    Login / Sign Up
                </button>

            </div>

        </div>
    `;


    $("#profile-login-btn")
        ?.addEventListener(
            "click",
            openAuth
        );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    if (!elements.toast || !elements.toastMessage) {
        return;
    }

    elements.toastMessage.textContent =
        message;

    elements.toast.hidden = false;

    requestAnimationFrame(() => {
        elements.toast.classList.add("show");
    });


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        elements.toast.classList.remove("show");

        setTimeout(() => {

            if (!elements.toast.classList.contains("show")) {
                elements.toast.hidden = true;
            }

        }, 250);

    }, 2200);
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        if (AppState.isMenuOpen) {
            closeMenu();
        }

        if (AppState.isCartOpen) {
            closeCart();
        }

        if (AppState.isAuthOpen) {
            closeAuth();
        }

        closeSearchSuggestions();
    }

});


/* =========================================================
   UTILITIES
========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount);
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   ERROR HANDLING
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "MITTI MANOR Error:",
            event.error || event.message
        );

    }
);


/* =========================================================
   EXPORT FOR FUTURE MODULES
========================================================= */

window.MittiManor = {
    state: AppState,
    products: PRODUCTS,

    addToCart,
    removeFromCart,
    changeQuantity,

    openCart,
    closeCart,

    openAuth,
    closeAuth,

    showToast,

    formatCurrency
};
