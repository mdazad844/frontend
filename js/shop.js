
// Load existing cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
    const item = { name, price };

    cart.push(item);

    // Save back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show feedback
    alert(name + " added to cart!");
}
