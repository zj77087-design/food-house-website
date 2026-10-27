/* =====================================================
   FOOD HOUSE — COMPLETE JAVASCRIPT
   Search • Filters • Sorting • Cart • Checkout
   Forms • Notifications • Mobile Menu
===================================================== */

"use strict";

/* ---------- 1. CONFIGURATION ---------- */

const DELIVERY_FEE = 200;
const CART_STORAGE_KEY = "foodHouseCart";

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* ---------- 2. DOM ELEMENTS ---------- */

const menuToggle = $("#menuToggle");
const mainNavigation = $("#mainNavigation");

const menuGrid = $("#menuGrid");
const menuSearch = $("#menuSearch");
const clearSearch = $("#clearSearch");
const menuSort = $("#menuSort");
const menuCategories = $("#menuCategories");
const menuEmptyMessage = $("#menuEmptyMessage");

const openCartButton = $("#openCart");
const closeCartButton = $("#closeCart");
const continueShoppingButton = $("#continueShopping");

const cartDrawer = $("#cartDrawer");
const cartOverlay = $("#cartOverlay");
const cartCount = $("#cartCount");
const cartItems = $("#cartItems");
const emptyCart = $("#emptyCart");
const cartSummary = $("#cartSummary");

const cartSubtotal = $("#cartSubtotal");
const deliveryFeeElement = $("#deliveryFee");
const cartTotal = $("#cartTotal");

const proceedToCheckout = $("#proceedToCheckout");
const checkoutSection = $("#checkout");
const checkoutForm = $("#checkoutForm");
const checkoutItems = $("#checkoutItems");
const checkoutSubtotal = $("#checkoutSubtotal");
const checkoutDelivery = $("#checkoutDelivery");
const checkoutTotal = $("#checkoutTotal");
const checkoutMessage = $("#checkoutMessage");
const backToMenuButton = $("#backToMenu");

const orderSuccessSection = $("#orderSuccess");
const orderSuccessMessage = $("#orderSuccessMessage");
const orderAgainButton = $("#orderAgain");

const newsletterForm = $("#newsletterForm");
const newsletterMessage = $("#newsletterMessage");

const contactForm = $("#contactForm");
const contactFormMessage = $("#contactFormMessage");

const toastContainer = $("#toastContainer");
const scrollTopButton = $("#scrollTopButton");


/* ---------- 3. HELPER FUNCTIONS ---------- */

function formatPrice(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-PK");
}

function showToast(message) {
    if (!toastContainer) {
        console.log(message);
        return;
    }

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Automatically remove the notification after a few seconds.
    window.setTimeout(() => {
        toast.remove();
    }, 3500);
}

function setFormMessage(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#ff9b9b" : "#f1d77a";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


/* ---------- 4. MOBILE NAVIGATION ---------- */

function closeMobileMenu() {
    if (!menuToggle || !mainNavigation) return;

    mainNavigation.classList.remove("is-open", "open", "active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function toggleMobileMenu() {
    if (!menuToggle || !mainNavigation) return;

    const isOpen = !mainNavigation.classList.contains("is-open");

    mainNavigation.classList.toggle("is-open", isOpen);

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
}

if (menuToggle && mainNavigation) {
    menuToggle.addEventListener("click", toggleMobileMenu);

    $$(".nav-link", mainNavigation).forEach(link => {
        link.addEventListener("click", () => {
            closeMobileMenu();

            $$(".nav-link", mainNavigation).forEach(navLink => {
                navLink.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    document.addEventListener("click", event => {
        if (
            !mainNavigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            closeMobileMenu();
        }
    });
}


/* ---------- 5. MENU SEARCH AND FILTERS ---------- */

let activeCategory = "all";

function getFoodCards() {
    return menuGrid ? $$(".food-card", menuGrid) : [];
}

function filterMenu() {
    const searchTerm = menuSearch
        ? menuSearch.value.trim().toLowerCase()
        : "";

    let visibleCount = 0;

    getFoodCards().forEach(card => {
        const name = (card.dataset.name || "").toLowerCase();
        const category = (card.dataset.category || "").toLowerCase();

        const descriptionElement = $(".food-description", card);
        const description = descriptionElement
            ? descriptionElement.textContent.toLowerCase()
            : "";

        const categoryTextElement = $(".food-category", card);
        const categoryText = categoryTextElement
            ? categoryTextElement.textContent.toLowerCase()
            : "";

        const matchesSearch =
            name.includes(searchTerm) ||
            description.includes(searchTerm) ||
            category.includes(searchTerm) ||
            categoryText.includes(searchTerm);

        const matchesCategory =
            activeCategory === "all" ||
            category === activeCategory;

        const isVisible = matchesSearch && matchesCategory;

        card.hidden = !isVisible;

        if (isVisible) {
            visibleCount++;
        }
    });

    if (menuEmptyMessage) {
        menuEmptyMessage.hidden = visibleCount !== 0;
    }

    if (clearSearch) {
        clearSearch.hidden = !searchTerm;
    }
}

if (menuSearch) {
    menuSearch.addEventListener("input", filterMenu);
}

if (clearSearch) {
    clearSearch.addEventListener("click", () => {
        if (menuSearch) {
            menuSearch.value = "";
            menuSearch.focus();
        }

        filterMenu();
    });
}

if (menuCategories) {
    $$(".category-button", menuCategories).forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "all";

            $$(".category-button", menuCategories).forEach(categoryButton => {
                const isActive = categoryButton === button;

                categoryButton.classList.toggle("active", isActive);
                categoryButton.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            filterMenu();
        });
    });
}


/* ---------- 6. MENU SORTING ---------- */

// Keep the original order so Featured can restore it.
const originalMenuOrder = getFoodCards();

function sortMenu() {
    if (!menuGrid || !menuSort) return;

    const cards = getFoodCards();
    const sortType = menuSort.value;

    if (sortType === "featured") {
        originalMenuOrder.forEach(card => {
            if (card.parentElement === menuGrid) {
                menuGrid.appendChild(card);
            }
        });

        filterMenu();
        return;
    }

    const sortedCards = [...cards];

    sortedCards.sort((first, second) => {
        const firstPrice = Number(first.dataset.price) || 0;
        const secondPrice = Number(second.dataset.price) || 0;

        const firstName = first.dataset.name || "";
        const secondName = second.dataset.name || "";

        if (sortType === "price-low") {
            return firstPrice - secondPrice;
        }

        if (sortType === "price-high") {
            return secondPrice - firstPrice;
        }

        if (sortType === "name") {
            return firstName.localeCompare(secondName);
        }

        return 0;
    });

    sortedCards.forEach(card => menuGrid.appendChild(card));

    filterMenu();
}

if (menuSort) {
    menuSort.addEventListener("change", sortMenu);
}


/* ---------- 7. CART DATA ---------- */

let cart = [];

function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) return [];

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) return [];

        return parsedCart
            .filter(item => {
                return (
                    item &&
                    typeof item.id === "string" &&
                    Number.isFinite(Number(item.quantity)) &&
                    Number(item.quantity) > 0
                );
            })
            .map(item => ({
                id: item.id,
                quantity: Math.min(99, Math.floor(Number(item.quantity)))
            }));
    } catch (error) {
        console.warn("Saved cart could not be loaded.", error);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.warn("Cart could not be saved in this browser.", error);
    }
}

function findProduct(productId) {
    const card = getFoodCards().find(item => {
        return item.dataset.id === productId;
    });

    if (!card) return null;

    return {
        id: card.dataset.id,
        name: card.dataset.name || "Food Item",
        price: Number(card.dataset.price) || 0
    };
}

function getCartQuantity() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
    return cart.reduce((total, item) => {
        const product = findProduct(item.id);

        if (!product) return total;

        return total + product.price * item.quantity;
    }, 0);
}

function cleanCart() {
    cart = cart.filter(item => findProduct(item.id) !== null);
}


/* ---------- 8. ADD ITEMS TO CART ---------- */

function addToCart(productId) {
    const product = findProduct(productId);

    if (!product) {
        showToast("This food item is not available.");
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity >= 99) {
            showToast("Maximum quantity reached.");
            return;
        }

        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();
    renderCart();

    showToast(product.name + " added to your cart.");
}

if (menuGrid) {
    menuGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-add-to-cart]");

        if (!button || !menuGrid.contains(button)) return;

        addToCart(button.dataset.addToCart);
    });
}


/* ---------- 9. CHANGE QUANTITY / REMOVE ITEMS ---------- */

function changeQuantity(productId, amount) {
    const item = cart.find(cartItem => cartItem.id === productId);

    if (!item) return;

    const nextQuantity = item.quantity + amount;

    if (nextQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (nextQuantity > 99) {
        showToast("Maximum quantity reached.");
        return;
    }

    item.quantity = nextQuantity;

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    const product = findProduct(productId);

    cart = cart.filter(item => item.id !== productId);

    saveCart();
    renderCart();

    if (product) {
        showToast(product.name + " removed from your cart.");
    }
}


/* ---------- 10. RENDER CART ---------- */

function renderCart() {
    cleanCart();

    const quantity = getCartQuantity();
    const subtotal = getCartSubtotal();
    const total = subtotal + (quantity > 0 ? DELIVERY_FEE : 0);

    if (cartCount) {
        cartCount.textContent = String(quantity);
        cartCount.setAttribute("aria-label", quantity + " items in cart");
    }

    if (cartItems) {
        // Remove previously rendered rows, but preserve the empty-cart block.
        $$(".cart-product-row", cartItems).forEach(row => row.remove());

        if (emptyCart) {
            emptyCart.hidden = quantity > 0;
        }

        cart.forEach(item => {
            const product = findProduct(item.id);

            if (!product) return;

            const row = document.createElement("div");
            row.className = "cart-product-row cart-item";

            row.innerHTML = `
                <div class="cart-product-info">
                    <strong>${escapeHTML(product.name)}</strong>
                    <p>${formatPrice(product.price)} each</p>
                    <p class="cart-product-line-total">
                        ${formatPrice(product.price * item.quantity)}
                    </p>
                </div>

                <div class="cart-product-controls">
                    <button
                        type="button"
                        class="quantity-button"
                        data-cart-action="decrease"
                        data-product-id="${escapeHTML(product.id)}"
                        aria-label="Decrease ${escapeHTML(product.name)} quantity"
                    >−</button>

                    <span class="cart-product-quantity">${item.quantity}</span>

                    <button
                        type="button"
                        class="quantity-button"
                        data-cart-action="increase"
                        data-product-id="${escapeHTML(product.id)}"
                        aria-label="Increase ${escapeHTML(product.name)} quantity"
                    >+</button>

                    <button
                        type="button"
                        class="remove-cart-item"
                        data-cart-action="remove"
                        data-product-id="${escapeHTML(product.id)}"
                    >Remove</button>
                </div>
            `;

            cartItems.appendChild(row);
        });
    }

    if (cartSummary) {
        cartSummary.hidden = quantity === 0;
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
    }

    if (deliveryFeeElement) {
        deliveryFeeElement.textContent = formatPrice(
            quantity > 0 ? DELIVERY_FEE : 0
        );
    }

    if (cartTotal) {
        cartTotal.textContent = formatPrice(total);
    }

    if (proceedToCheckout) {
        proceedToCheckout.disabled = quantity === 0;
    }

    renderCheckoutSummary();
}

if (cartItems) {
    cartItems.addEventListener("click", event => {
        const button = event.target.closest("[data-cart-action]");

        if (!button) return;

        const productId = button.dataset.productId;
        const action = button.dataset.cartAction;

        if (action === "increase") {
            changeQuantity(productId, 1);
        } else if (action === "decrease") {
            changeQuantity(productId, -1);
        } else if (action === "remove") {
            removeFromCart(productId);
        }
    });
}


/* ---------- 11. OPEN / CLOSE CART ---------- */

function openCart() {
    if (!cartDrawer) return;

    renderCart();

    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartDrawer.removeAttribute("inert");

    if (cartOverlay) {
        cartOverlay.hidden = false;
    }

    document.body.style.overflow = "hidden";

    if (closeCartButton) {
        closeCartButton.focus();
    }
}

function closeCart() {
    if (!cartDrawer) return;

    cartDrawer.classList.remove("is-open", "open", "active");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.setAttribute("inert", "");

    if (cartOverlay) {
        cartOverlay.hidden = true;
    }

    document.body.style.overflow = "";

    if (openCartButton) {
        openCartButton.focus();
    }
}

if (openCartButton) {
    openCartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
}

if (continueShoppingButton) {
    continueShoppingButton.addEventListener("click", () => {
        closeCart();

        const menuSection = $("#menu");

        if (menuSection) {
            menuSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}


/* ---------- 12. CHECKOUT SUMMARY ---------- */

function renderCheckoutSummary() {
    const subtotal = getCartSubtotal();
    const quantity = getCartQuantity();
    const delivery = quantity > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    if (checkoutItems) {
        checkoutItems.replaceChildren();

        if (quantity === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "Your cart is empty.";
            checkoutItems.appendChild(emptyMessage);
        } else {
            cart.forEach(item => {
                const product = findProduct(item.id);

                if (!product) return;

                const row = document.createElement("div");
                row.className = "cart-summary-row";

                const name = document.createElement("span");
                name.textContent =
                    product.name + " × " + item.quantity;

                const price = document.createElement("span");
                price.textContent = formatPrice(
                    product.price * item.quantity
                );

                row.append(name, price);
                checkoutItems.appendChild(row);
            });
        }
    }

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = formatPrice(subtotal);
    }

    if (checkoutDelivery) {
        checkoutDelivery.textContent = formatPrice(delivery);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = formatPrice(total);
    }
}


/* ---------- 13. OPEN CHECKOUT ---------- */

function showCheckout() {
    if (getCartQuantity() === 0) {
        showToast("Please add food items to your cart first.");
        return;
    }

    closeCart();

    if (orderSuccessSection) {
        orderSuccessSection.hidden = true;
    }

    if (checkoutSection) {
        checkoutSection.hidden = false;
        renderCheckoutSummary();

        checkoutSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

if (proceedToCheckout) {
    proceedToCheckout.addEventListener("click", showCheckout);
}

if (backToMenuButton) {
    backToMenuButton.addEventListener("click", () => {
        if (checkoutSection) {
            checkoutSection.hidden = true;
        }

        const menuSection = $("#menu");

        if (menuSection) {
            menuSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}


/* ---------- 14. PLACE DEMO ORDER ---------- */

if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!checkoutForm.reportValidity()) {
            return;
        }

        if (getCartQuantity() === 0) {
            setFormMessage(
                checkoutMessage,
                "Your cart is empty. Please add an item first.",
                true
            );

            showToast("Your cart is empty.");
            return;
        }

        const formData = new FormData(checkoutForm);

        const customerName = String(
            formData.get("customerName") || ""
        ).trim();

        const customerPhone = String(
            formData.get("customerPhone") || ""
        ).trim();

        const customerAddress = String(
            formData.get("customerAddress") || ""
        ).trim();

        if (!customerName || !customerPhone || !customerAddress) {
            setFormMessage(
                checkoutMessage,
                "Please complete all required delivery details.",
                true
            );
            return;
        }

        const orderReference =
            "FH-" + Date.now().toString().slice(-8);

        const orderTotal =
            getCartSubtotal() + DELIVERY_FEE;

        /*
         * DEMO ONLY:
         * This order is not sent to a restaurant or server.
         * Connect a secure backend/order service for real orders.
         */

        if (orderSuccessMessage) {
            orderSuccessMessage.textContent =
                "Demo order " + orderReference +
                " prepared for " + customerName +
                ". Order total: " + formatPrice(orderTotal) +
                ". This is a local demonstration; the restaurant has not received this order.";
        }

        cart = [];
        saveCart();
        renderCart();

        checkoutForm.reset();

        if (checkoutSection) {
            checkoutSection.hidden = true;
        }

        if (orderSuccessSection) {
            orderSuccessSection.hidden = false;

            orderSuccessSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        showToast("Demo order summary created.");
    });
}


/* ---------- 15. ORDER AGAIN ---------- */

if (orderAgainButton) {
    orderAgainButton.addEventListener("click", () => {
        if (checkoutSection) {
            checkoutSection.hidden = true;
        }

        if (orderSuccessSection) {
            orderSuccessSection.hidden = true;
        }

        const menuSection = $("#menu");

        if (menuSection) {
            menuSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}


/* ---------- 16. NEWSLETTER FORM ---------- */

if (newsletterForm) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!newsletterForm.reportValidity()) {
            return;
        }

        /*
         * DEMO ONLY:
         * No email service is connected, so no subscription
         * is saved or sent anywhere.
         */

        setFormMessage(
            newsletterMessage,
            "Demo only: connect an email service to save subscriptions."
        );

        showToast("Newsletter demo completed.");
        newsletterForm.reset();
    });
}


/* ---------- 17. CONTACT FORM ---------- */

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        /*
         * DEMO ONLY:
         * This message is not sent or stored on a server.
         */

        setFormMessage(
            contactFormMessage,
            "Demo only: connect a form service to send your message."
        );

        showToast("Contact form demo completed.");
        contactForm.reset();
    });
}


/* ---------- 18. SCROLL TO TOP ---------- */

function updateScrollButton() {
    if (!scrollTopButton) return;

    scrollTopButton.hidden = window.scrollY < 350;
}

if (scrollTopButton) {
    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener("scroll", updateScrollButton, {
        passive: true
    });
}


/* ---------- 19. ACTIVE NAVIGATION ON SCROLL ---------- */

const observedSections = $$("#home, #menu, #about, #reviews, #contact");

if ("IntersectionObserver" in window && observedSections.length > 0) {
    const sectionObserver = new IntersectionObserver(entries => {
        const visibleSections = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length === 0) return;

        const activeId = visibleSections[0].target.id;

        $$(".main-navigation .nav-link").forEach(link => {
            const isActive = link.getAttribute("href") === "#" + activeId;

            link.classList.toggle("active", isActive);
        });
    }, {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
    });

    observedSections.forEach(section => {
        sectionObserver.observe(section);
    });
}


/* ---------- 20. KEYBOARD SUPPORT ---------- */

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
        closeMobileMenu();
    }
});


/* ---------- 21. CURRENT YEAR ---------- */

const currentYear = $("#currentYear");

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}


/* ---------- 22. INITIALIZE WEBSITE ---------- */

function initializeFoodHouse() {
    cart = loadCart();
    cleanCart();

    // Start with the cart closed and hidden from assistive technology.
    if (cartDrawer) {
        cartDrawer.classList.remove("is-open", "open", "active");
        cartDrawer.setAttribute("aria-hidden", "true");
        cartDrawer.setAttribute("inert", "");
    }

    if (cartOverlay) {
        cartOverlay.hidden = true;
    }

    document.body.style.overflow = "";

    if (checkoutSection) {
        checkoutSection.hidden = true;
    }

    if (orderSuccessSection) {
        orderSuccessSection.hidden = true;
    }

    closeMobileMenu();
    filterMenu();
    renderCart();
    updateScrollButton();
}

initializeFoodHouse();

console.log("Food House JavaScript initialized successfully.");