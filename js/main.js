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
  const orderMessage = document.getElementById("orderMessage");

  if (!orderForm || !summary || !orderMessage) return;

  const productFields = [
    { id: "laundryQty", name: "Laundry Detergent" },
    { id: "floorQty", name: "Floor Cleaner" },
    { id: "dishQty", name: "Dishwashing Liquid" },
    { id: "glassQty", name: "Glass Cleaner" },
    { id: "surfaceQty", name: "Surface Cleaner" },
    { id: "bathroomQty", name: "Bathroom Cleaner" }
  ];

  function getSelectedProducts() {
    return productFields
      .map(product => {
        const input = document.getElementById(product.id);
        const qty = parseInt(input.value || "0", 10);
        return { name: product.name, qty: isNaN(qty) ? 0 : qty };
      })
      .filter(product => product.qty > 0);
  }

  function renderSummary() {
    const selected = getSelectedProducts();

    if (selected.length === 0) {
      summary.innerHTML = "<p>No products selected yet.</p>";
      return;
    }

    const items = selected.map(item => `<li>${item.name} - Qty: ${item.qty}</li>`).join("");
    summary.innerHTML = `<ul>${items}</ul>`;
  }

  productFields.forEach(product => {
    const input = document.getElementById(product.id);
    if (input) {
      input.addEventListener("input", renderSummary);
    }
  });

  renderSummary();

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    orderMessage.textContent = "";

    const fullName = document.getElementById("fullName").value.trim();
    const companyName = document.getElementById("companyName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const selected = getSelectedProducts();

    if (!fullName || !email || !phone || !address) {
      orderMessage.textContent = "Please fill in all required customer details.";
      return;
    }

    if (selected.length === 0) {
      orderMessage.textContent = "Please select at least one product quantity.";
      return;
    }

    const lines = selected.map(item => `- ${item.name}: ${item.qty}`).join("\n");

    const subject = encodeURIComponent(`LunaBlu Order Request - ${fullName}`);
    const body = encodeURIComponent(
`New order request

Customer Details
Name: ${fullName}
Company: ${companyName || "N/A"}
Email: ${email}
Phone: ${phone}
Address: ${address}

Products
${lines}

Notes
${notes || "N/A"}`
    );

    const businessEmail = "info@lunablu.com";
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
  });

  orderForm.addEventListener("reset", function () {
    setTimeout(() => {
      orderMessage.textContent = "";
      renderSummary();
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