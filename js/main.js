document.addEventListener("DOMContentLoaded", function () {
  setFooterYear();
  setupMobileMenu();
  setupOrderPage();
  setupContactForm();
});

function setFooterYear() {
  const yearElements = document.querySelectorAll("#year");
  const year = new Date().getFullYear();

  yearElements.forEach(el => {
    el.textContent = year;
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function setupOrderPage() {
  const orderForm = document.getElementById("orderForm");
  const summary = document.getElementById("orderSummary");
  const totals = document.getElementById("orderTotals");
  const orderMessage = document.getElementById("orderMessage");

  if (!orderForm || !summary || !totals || !orderMessage) return;

  const qtyButtons = orderForm.querySelectorAll(".qty-btn");

  qtyButtons.forEach(button => {
    button.addEventListener("click", function () {
      const targetId = button.dataset.target;
      const action = button.dataset.action;
      const input = document.getElementById(targetId);

      if (!input) return;

      let value = parseInt(input.value || "0", 10);
      if (isNaN(value) || value < 0) value = 0;

      if (action === "increase") {
        value += 1;
      }

      if (action === "decrease") {
        value = Math.max(0, value - 1);
      }

      input.value = value;
      updateSummary();
    });
  });

  const BOTTLE_PRICE = 2.00;
  const BOX_PRICE = 7.00;
  const VAT_RATE = 0.18;

  const products = [
    { name: "Marsiglia", bottleId: "marsigliaBottle", boxId: "marsigliaBox" },
    { name: "Nero", bottleId: "neroBottle", boxId: "neroBox" },
    { name: "Blue Matic", bottleId: "blueMaticBottle", boxId: "blueMaticBox" },
    { name: "Dishwashing Soap", bottleId: "dishwashingBottle", boxId: "dishwashingBox" },
    { name: "Floor Detergent", bottleId: "floorBottle", boxId: "floorBox" },
    { name: "Softener", bottleId: "softenerBottle", boxId: "softenerBox" }
  ];

  function getIntValue(id) {
    const value = parseInt(document.getElementById(id)?.value || "0", 10);
    return isNaN(value) || value < 0 ? 0 : value;
  }

  function formatMoney(value) {
    return `€${value.toFixed(2)}`;
  }

  function getSelections() {
    return products.map(product => {
      const bottles = getIntValue(product.bottleId);
      const boxes = getIntValue(product.boxId);
      const lineSubtotal = (bottles * BOTTLE_PRICE) + (boxes * BOX_PRICE);

      return {
        ...product,
        bottles,
        boxes,
        lineSubtotal
      };
    }).filter(item => item.bottles > 0 || item.boxes > 0);
  }

  function updateSummary() {
    const selections = getSelections();

    if (selections.length === 0) {
      summary.innerHTML = "<p>No products selected yet.</p>";
      totals.innerHTML = `
        <div class="summary-total-row">
          <span>Subtotal (excl. VAT)</span>
          <strong>€0.00</strong>
        </div>
        <div class="summary-total-row">
          <span>VAT (18%)</span>
          <strong>€0.00</strong>
        </div>
        <div class="summary-total-row grand-total">
          <span>Total (incl. VAT)</span>
          <strong>€0.00</strong>
        </div>
      `;
      return;
    }

    const summaryItems = selections.map(item => {
      const parts = [];
      if (item.bottles > 0) parts.push(`${item.bottles} bottle${item.bottles > 1 ? "s" : ""}`);
      if (item.boxes > 0) parts.push(`${item.boxes} box${item.boxes > 1 ? "es" : ""}`);
      return `<li><strong>${item.name}</strong> — ${parts.join(" + ")} <span class="summary-line-price">(${formatMoney(item.lineSubtotal)} excl. VAT)</span></li>`;
    }).join("");

    const subtotal = selections.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    summary.innerHTML = `<ul>${summaryItems}</ul>`;

    totals.innerHTML = `
      <div class="summary-total-row">
        <span>Subtotal (excl. VAT)</span>
        <strong>${formatMoney(subtotal)}</strong>
      </div>
      <div class="summary-total-row">
        <span>VAT (18%)</span>
        <strong>${formatMoney(vat)}</strong>
      </div>
      <div class="summary-total-row grand-total">
        <span>Total (incl. VAT)</span>
        <strong>${formatMoney(total)}</strong>
      </div>
    `;

    document.getElementById("orderBreakdownField").value = selections.map(item => {
      return `${item.name}: ${item.bottles} bottles, ${item.boxes} boxes`;
    }).join(" | ");
    document.getElementById("subtotalField").value = subtotal.toFixed(2);
    document.getElementById("vatField").value = vat.toFixed(2);
    document.getElementById("totalField").value = total.toFixed(2);
  }

const qtyInputs = orderForm.querySelectorAll(".qty-stepper input");

qtyInputs.forEach(input => {
  input.addEventListener("input", updateSummary);
});

  updateSummary();

  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const selections = getSelections();

    orderMessage.textContent = "";
    orderMessage.className = "form-message";

    if (!fullName || !email || !phone || !address) {
      orderMessage.textContent = "Please fill in all required customer details.";
      orderMessage.classList.add("error");
      return;
    }

    if (selections.length === 0) {
      orderMessage.textContent = "Please select at least one product.";
      orderMessage.classList.add("error");
      return;
    }

    updateSummary();

    try {
      const response = await fetch(orderForm.action, {
        method: "POST",
        body: new FormData(orderForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        orderMessage.textContent = "Your order request has been sent successfully. We will contact you when the order is ready.";
        orderMessage.classList.add("success");
        orderForm.reset();
        updateSummary();
      } else {
        orderMessage.textContent = "Something went wrong. Please try again.";
        orderMessage.classList.add("error");
      }
    } catch (error) {
      orderMessage.textContent = "Something went wrong. Please try again.";
      orderMessage.classList.add("error");
    }
  });

  orderForm.addEventListener("reset", function () {
    setTimeout(() => {
      updateSummary();
    }, 0);
  });
}

function setupContactForm() {
  const contactForm = document.getElementById("contactForm");
  const contactFormMessage = document.getElementById("contactFormMessage");

  if (!contactForm || !contactFormMessage) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    contactFormMessage.textContent = "";
    contactFormMessage.className = "form-message";

    if (!name || !email || !message) {
      contactFormMessage.textContent = "Please complete all required fields.";
      contactFormMessage.classList.add("error");
      return;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        contactFormMessage.textContent = "Your message has been sent successfully.";
        contactFormMessage.classList.add("success");
        contactForm.reset();
      } else {
        contactFormMessage.textContent = "Something went wrong. Please try again.";
        contactFormMessage.classList.add("error");
      }
    } catch (error) {
      contactFormMessage.textContent = "Something went wrong. Please try again.";
      contactFormMessage.classList.add("error");
    }
  });
}