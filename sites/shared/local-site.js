(async () => {
  const page = document.querySelector(".local-page");
  const siteId = page?.dataset.site;
  if (!siteId) return;
  const catalog = await fetch("/local-sites.json").then((response) => response.json());
  const site = catalog[siteId];
  let locale = localStorage.getItem(`auditaxes-${siteId}-locale`) || "es";
  const text = (key) => site[key][locale];
  const languageNames = { es: "Español", en: "English", pt: "Português" };
  const languageWrap = document.querySelector(".local-languages");
  if (languageWrap) {
    languageWrap.outerHTML = `<details class="local-language-switcher"><summary><span class="local-flag flag-es" aria-hidden="true"></span><span data-language-name>Español</span><svg class="local-language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><nav aria-label="Idioma"><button data-language="es"><span class="local-flag flag-es" aria-hidden="true"></span>Español<small>ES</small></button><button data-language="en"><span class="local-flag flag-en" aria-hidden="true"></span>English<small>EN</small></button><button data-language="pt"><span class="local-flag flag-pt" aria-hidden="true"></span>Português<small>PT</small></button></nav></details>`;
  }
  document.querySelectorAll(".local-brand").forEach((brand) => {
    const country = brand.querySelector("[data-brand-country]")?.textContent || "";
    if (!brand.querySelector("svg")) brand.innerHTML = `<span class="local-brand-audit">Audit</span><span class="local-brand-axes">axes</span><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 13.5 11 10l4 1 1.5 3.5-2 3.5 3 2.5-1 4-4 1-2.5-3-3-1M20 4l3 4 4 .5 2 3.5-3.5 1-2-4 1-3-2.5-2L20 4ZM23 21l4-2 3 2-1 5-4 3-4-2Z" fill="currentColor" opacity=".9"/><span class="local-brand-country" data-brand-country> | ${country}</span></svg>`;
  });
  const render = () => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
    document.title = `AUDITAXES | ${text("country")}`;
    document.querySelectorAll("[data-back]").forEach((node) => { node.setAttribute("href", "http://localhost:4321/"); if (!node.classList.contains("local-brand")) node.textContent = text("back"); });
    document.querySelectorAll("[data-brand-country]").forEach((node) => node.textContent = ` | ${text("country")}`);
    document.querySelectorAll("[data-label]").forEach((node) => node.textContent = site.labels[node.dataset.label][locale]);
    document.querySelectorAll("[data-slogan]").forEach((node) => node.textContent = text("slogan"));
    document.querySelector("[data-hero-title]").textContent = text("hero");
    document.querySelector("[data-hero-body]").textContent = text("intro");
    document.querySelector("[data-firm-title]").textContent = text("firmTitle");
    document.querySelector("[data-firm-body]").textContent = text("firmBody");
    document.querySelector("[data-practice-title]").textContent = text("practiceTitle");
    document.querySelector("[data-partners-title]").textContent = text("partnersTitle");
    document.querySelector("[data-partners-body]").textContent = text("partnersBody");
    document.querySelector("[data-contact-title]").textContent = text("contactTitle");
    document.querySelectorAll("[data-address]").forEach((node) => node.textContent = site.address);
    document.querySelectorAll("[data-phone]").forEach((node) => node.textContent = site.phone);
    document.querySelectorAll("[data-email]").forEach((node) => node.textContent = site.email);
    document.querySelector("[data-privacy]").textContent = text("privacy");
    document.querySelector("[data-registration]").textContent = text("registration");
    document.querySelector("[data-cross-border]").textContent = locale === "es" ? "Explorar sedes en Centroamérica y Sudamérica" : locale === "en" ? "Explore offices across Central and South America" : "Explore escritórios na América Central e do Sul";
    document.querySelector("[data-local-cta]").textContent = text("contactTitle");
    document.querySelector("[data-service-line]").textContent = site.labels.serviceLine[locale];
    document.querySelector("[data-practices]").innerHTML = site.practices[locale].map((practice) => `<li>${practice}</li>`).join("");
    document.querySelector("[data-partners]").innerHTML = site.partners.map((partner) => `<article class="local-partner"><strong>${partner.name}</strong><span>${partner.role[locale]}</span></article>`).join("");
    document.querySelectorAll("[data-language]").forEach((button) => { button.setAttribute("aria-current", button.dataset.language === locale ? "true" : "false"); });
    const languageName = document.querySelector("[data-language-name]");
    if (languageName) languageName.textContent = languageNames[locale];
    const languageFlag = document.querySelector(".local-language-switcher summary .local-flag");
    if (languageFlag) languageFlag.className = `local-flag flag-${locale}`;
    document.querySelector(".local-language-switcher")?.removeAttribute("open");
  };
  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => { locale = button.dataset.language; localStorage.setItem(`auditaxes-${siteId}-locale`, locale); render(); }));
  document.querySelector("[data-menu]")?.addEventListener("click", () => document.querySelector("[data-nav]")?.classList.toggle("is-open"));
  render();
})();
