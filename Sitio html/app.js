(async function () {
  "use strict";
  const meta = name => document.querySelector(`meta[name="${name}"]`)?.content || "";
  const route = meta("static-route");
  const depth = route.split("/").length;
  const root = "../".repeat(depth);
  const isPublications = route.endsWith("/publicaciones");
  const siteRoute = route.replace(/\/publicaciones$/, "");
  const localeByName = { English: "en", Español: "es", Português: "pt", Français: "fr" };
  const navIds = {
    global: ["consorcio", "servicios", "industrias", "red", "perspectivas", "contacto", "novedades"],
    mexico: ["firma", "metodo", "capacidades", "experiencia", "equipo", "contacto", "novedades"],
    "el-salvador": ["firma", "metodo", "capacidades", "experiencia", "equipo", "contacto", "novedades"]
  };
  const localNavTargets = siteRoute === "el-salvador" ? ["#firma", "#red", "#capacidades", "#experiencia", "#equipo", "#contacto", "#novedades"] : [".local-firm", ".local-method", ".practice-area", ".local-industries", ".partners", "#contacto", "#novedades"];

  const [pagesResponse, globalResponse, networkResponse, sharedResponse, mexicoResponse, salvadorResponse, salvadorProfileResponse, newsDetailsResponse, newsTranslationsResponse, legalResponse] = await Promise.all([
    fetch(`${root}data/pages.json`, { cache: "no-cache" }),
    fetch(`${root}data/global.json`, { cache: "no-cache" }),
    fetch(`${root}data/network.json`, { cache: "no-cache" }),
    fetch(`${root}data/shared.json`, { cache: "no-cache" }),
    fetch(`${root}data/countries/mexico.json`, { cache: "no-cache" }),
    fetch(`${root}data/countries/salvador.json`, { cache: "no-cache" }),
    fetch(`${root}data/countries/salvador-profile.json`, { cache: "no-cache" }),
    fetch(`${root}data/news-details.json`, { cache: "no-cache" }),
    fetch(`${root}data/news-translations.json`, { cache: "no-cache" }),
    fetch(`${root}data/legal-disclaimer.json`, { cache: "no-cache" })
  ]);
  if (!pagesResponse.ok) throw new Error(`No fue posible cargar data/pages.json (${pagesResponse.status})`);
  const pages = await pagesResponse.json();
  const globalContent = globalResponse.ok ? await globalResponse.json() : null;
  const networkContent = networkResponse.ok ? await networkResponse.json() : null;
  const sharedContent = sharedResponse.ok ? await sharedResponse.json() : null;
  const mexicoContent = mexicoResponse.ok ? await mexicoResponse.json() : null;
  const salvadorContent = salvadorResponse.ok ? await salvadorResponse.json() : null;
  const salvadorProfile = salvadorProfileResponse.ok ? await salvadorProfileResponse.json() : null;
  const newsDetails = newsDetailsResponse.ok ? await newsDetailsResponse.json() : {};
  const newsTranslations = newsTranslationsResponse.ok ? await newsTranslationsResponse.json() : {};
  const legalContent = legalResponse.ok ? await legalResponse.json() : null;
  const routeData = pages.routes[route];
  if (!routeData) throw new Error(`La ruta ${route} no existe en data/pages.json`);
  const params = new URLSearchParams(location.search);
  const requested = params.get("lang") || localStorage.getItem("auditaxes-language") || routeData.defaultLocale;
  const locale = routeData.locales[requested] ? requested : routeData.defaultLocale;
  const page = routeData.locales[locale];

  document.documentElement.lang = locale;
  document.title = page.title;
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement("meta");
    description.name = "description";
    document.head.appendChild(description);
  }
  description.content = page.description;
  document.getElementById("site-root").innerHTML = page.html;
  const brandScope = siteRoute === "el-salvador" ? "auditaxes-el-salvador" : "auditaxes-international";
  document.querySelectorAll(".brand").forEach(brand => {
    const inverse = brand.classList.contains("inverse") || Boolean(brand.closest("footer,.publications-site-header"));
    const tone = inverse ? "blanco" : "gris";
    const label = siteRoute === "el-salvador" ? "Auditaxes El Salvador" : "Auditaxes International";
    brand.classList.add("brand-image");
    brand.innerHTML = `<img src="${root}images/brand/${brandScope}-${tone}.png" alt="${label}">`;
  });
  localStorage.setItem("auditaxes-language", locale);

  if (legalContent && siteRoute === "global") {
    document.querySelectorAll("#site-root footer").forEach(footer => {
      const contactColumn = footer.querySelector("nav:last-of-type");
      if (!contactColumn || footer.querySelector(".footer-legal")) return;
      footer.classList.add("footer-has-legal");
      const legalColumn = document.createElement("nav");
      legalColumn.className = "footer-legal";
      legalColumn.innerHTML = `<strong>${legalContent.columnTitle[locale] || legalContent.columnTitle.en}</strong><button type="button">${legalContent.linkLabel[locale] || legalContent.linkLabel.en}</button>`;
      footer.insertBefore(legalColumn, contactColumn);
      legalColumn.querySelector("button").addEventListener("click", () => {
        const modal = document.createElement("div");
        const closeLabel = legalContent.close[locale] || legalContent.close.en;
        modal.className = "legal-modal";
        modal.setAttribute("role", "presentation");
        modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="legal-title"><header><div><p>${legalContent.entity}</p><h2 id="legal-title">${legalContent.title[locale] || legalContent.title.en}</h2></div><button type="button" class="legal-modal-x" aria-label="${closeLabel}">×</button></header><div class="legal-modal-copy">${legalContent.paragraphs[locale].map(paragraph => `<p>${paragraph}</p>`).join("")}</div><footer><button type="button" class="legal-modal-close">${closeLabel}</button></footer></section>`;
        const previousOverflow = document.body.style.overflow;
        const onKey = event => { if (event.key === "Escape") close(); };
        const close = () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); modal.remove(); legalColumn.querySelector("button").focus(); };
        modal.addEventListener("mousedown", event => { if (event.target === modal) close(); });
        modal.querySelector(".legal-modal-x").addEventListener("click", close);
        modal.querySelector(".legal-modal-close").addEventListener("click", close);
        document.addEventListener("keydown", onKey);
        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";
        modal.querySelector(".legal-modal-x").focus();
      });
    });
  }

  const localize = value => value?.[locale] || value?.en || "";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  if (!isPublications) {
    const pageContent = siteRoute === "global" ? globalContent : siteRoute === "mexico" ? mexicoContent : null;
    const hero = document.querySelector(siteRoute === "global" ? ".global-hero" : ".local-hero");
    const heroContent = pageContent?.sections?.hero;
    if (hero && heroContent) {
      hero.querySelector(".section-label").textContent = localize(heroContent.eyebrow);
      hero.querySelector("h1").textContent = localize(heroContent.title);
      hero.querySelector("div > p:not(.section-label)").textContent = localize(heroContent.body);
      hero.querySelector("a").firstChild.textContent = `${localize(heroContent.action.label)} `;
    }
  }
  const publicationItems = globalContent?.sections?.news?.items || [];
  const publicationId = params.get("publicacion");
  if (isPublications && publicationId) {
    const item = publicationItems.find(entry => entry.id === publicationId);
    const detail = newsDetails[publicationId];
    if (item && detail) {
      const translated = locale === "es" ? detail : newsTranslations[publicationId]?.[locale] || detail;
      const kindLabels = { news: { es: "Noticia", en: "News", pt: "Notícia", fr: "Actualité" }, article: { es: "Artículo", en: "Article", pt: "Artigo", fr: "Article" } };
      const labels = {
        back: { es: "Volver a novedades", en: "Back to news", pt: "Voltar às novidades", fr: "Retour aux actualités" },
        source: { es: "Ver publicación original", en: "View original publication", pt: "Ver publicação original", fr: "Voir la publication originale" }
      };
      const date = new Intl.DateTimeFormat({ es: "es-MX", en: "en-US", pt: "pt-BR", fr: "fr-FR" }[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${detail.date}T12:00:00Z`));
      const sections = translated.sections.map(block => `<section>${block.heading ? `<h2>${escapeHtml(block.heading)}</h2>` : ""}${(block.paragraphs || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}${block.bullets ? `<ul>${block.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</section>`).join("");
      const article = document.createElement("article");
      article.className = "publication-detail";
      article.innerHTML = `<header><button type="button" class="publication-detail-back">← ${escapeHtml(localize(labels.back))}</button><div class="publication-detail-meta"><span class="publication-tag ${detail.kind}">${escapeHtml(localize(kindLabels[detail.kind]))}</span><time datetime="${escapeHtml(detail.date)}">${escapeHtml(date)}</time></div><h1>${escapeHtml(localize(item.title))}</h1><p>${escapeHtml(translated.summary)}</p></header><img class="publication-detail-image" src="${root}${escapeHtml(item.image.src.replace(/^\//, ""))}" alt="${escapeHtml(localize(item.image.alt))}"><div class="publication-detail-body">${sections}<a href="${escapeHtml(detail.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(localize(labels.source))} ↗</a></div>`;
      const main = document.querySelector("#site-root > main");
      const footer = main?.querySelector(":scope > footer");
      if (main) {
        [...main.children].forEach(child => { if (child.tagName !== "HEADER" && child.tagName !== "FOOTER") child.remove(); });
        main.insertBefore(article, footer || null);
      }
    }
  }
  if (siteRoute === "el-salvador" && !isPublications && salvadorContent && salvadorProfile) {
    const labels = salvadorProfile.labels[locale];
    const rootElement = document.getElementById("site-root");
    document.title = localize(salvadorContent.metadata.title);
    description.content = localize(salvadorContent.metadata.description);
    [...rootElement.querySelectorAll(".section-navigation button")].forEach((button,index) => {
      const item = salvadorContent.navigation[index];
      if (item) button.textContent = localize(item.label);
    });
    const hero = rootElement.querySelector(".local-hero");
    const heroContent = salvadorContent.sections.hero;
    if (hero) {
      hero.querySelector(".section-label").textContent = localize(heroContent.eyebrow);
      hero.querySelector("h1").textContent = localize(heroContent.title);
      hero.querySelector("div > p:not(.section-label)").textContent = localize(heroContent.body);
      hero.querySelector("a").firstChild.textContent = `${localize(heroContent.action.label)} `;
    }
    rootElement.querySelectorAll(".local-firm,.local-method,.practice-area,.local-industries,.partners").forEach(element => element.remove());
    const paragraphs = values => values.map(text => `<p>${text}</p>`).join("");
    const profileHtml = `
      <section class="sv-overview" id="firma"><header><p class="section-label">AUDITAXES EL SALVADOR</p><h2>${labels.about}</h2></header><div class="sv-lead">${paragraphs(salvadorProfile.overview.intro[locale])}</div></section>
      <section class="sv-story"><div class="sv-story-heading"><p class="section-label">${labels.story}</p><h2>${labels.story}</h2></div><div class="sv-story-copy">${paragraphs(salvadorProfile.overview.story[locale])}</div></section>
      <section class="sv-network" id="red"><div><p class="section-label">AUDITAXES INTERNATIONAL</p><h2>${labels.network}</h2><div class="sv-network-stats"><article><span>27</span><small>${localize({es:"Países",en:"Countries",pt:"Países",fr:"Pays"})}</small></article><article><span>30</span><small>${localize({es:"Oficinas",en:"Offices",pt:"Escritórios",fr:"Bureaux"})}</small></article><article><span>1,000+</span><small>${localize({es:"Profesionales y socios",en:"Professionals and partners",pt:"Profissionais e sócios",fr:"Professionnels et associés"})}</small></article></div></div><div>${paragraphs(salvadorProfile.overview.network[locale])}</div></section>
      <section class="sv-pillars" id="capacidades"><header><p class="section-label">AUDITAXES</p><h2>${labels.pillars}</h2></header><div>${salvadorProfile.pillars.map((item,index)=>`<article><span>0${index+1}</span><h3>${localize(item.title)}</h3><p>${localize(item.body)}</p></article>`).join("")}</div></section>
      <section class="sv-credentials"><header><p class="section-label">COMPLIANCE</p><h2>${labels.credentials}</h2></header><div>${salvadorProfile.credentials.map(item=>`<article><strong>${item.value}</strong><p>${localize(item.text)}</p></article>`).join("")}</div></section>
      <section class="sv-team" id="equipo"><header><p class="section-label">AUDITAXES EL SALVADOR</p><h2>${labels.team}</h2><p>${labels.teamIntro}</p></header><div class="sv-team-grid">${salvadorProfile.people.map((person,index)=>`<details class="sv-person"><summary><span class="sv-person-index">0${index+1}</span><div><h3>${person.name}</h3><p>${localize(person.role)}</p></div><b><span class="open-label">${labels.readProfile}</span><span class="close-label">${labels.closeProfile}</span> ↗</b></summary><div class="sv-person-detail"><div class="sv-person-bio">${paragraphs(person.bio[locale])}</div><dl><div><dt>${labels.education}</dt><dd>${localize(person.education)}</dd></div>${person.associations?`<div><dt>${labels.associations}</dt><dd>${person.associations}</dd></div>`:""}<div><dt>${labels.languages}</dt><dd>${localize(person.languages)}</dd></div></dl><div class="sv-person-groups">${person.groups.map(group=>`<section><h4>${localize(group.label)}</h4><p>${group.items.join(" · ")}</p></section>`).join("")}</div></div></details>`).join("")}</div></section>
      <section class="sv-experience" id="experiencia"><header><p class="section-label">AUDITAXES EL SALVADOR</p><h2>${labels.experience}</h2><p>${labels.experienceIntro}</p></header><div>${Object.entries(salvadorProfile.clientPortfolio).map(([key,items])=>`<article><h3>${localize(salvadorProfile.portfolioLabels[key])}</h3><p>${items.join(" · ")}</p></article>`).join("")}</div></section>`;
    hero?.insertAdjacentHTML("afterend", profileHtml);
    const contact = rootElement.querySelector(".contact-section");
    if (contact) {
      const details = salvadorContent.sections.contact;
      const anchors = [...contact.querySelectorAll("aside a")];
      if (anchors[0]) { anchors[0].href = `mailto:${details.email}`; anchors[0].querySelector("small").textContent = details.email; }
      if (anchors[1]) { anchors[1].href = `tel:${details.phones[0].replace(/\s/g,"")}`; anchors[1].querySelector("small").textContent = details.phones.join(" · "); }
      if (anchors[2]) { anchors[2].href = `https://wa.me/${details.whatsapp.replace(/\D/g,"")}`; anchors[2].querySelector("small").textContent = details.phones[0]; }
      if (anchors[3]) { anchors[3].href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.mapsQuery)}`; anchors[3].querySelector("small").textContent = details.address; }
    }
    rootElement.querySelectorAll(`a[href^="mailto:"]`).forEach(anchor => { if (anchor.closest("footer")) { anchor.href = `mailto:${salvadorContent.sections.contact.email}`; anchor.textContent = salvadorContent.sections.contact.email; } });
    const footerPhone = rootElement.querySelector("footer nav:last-of-type > span");
    if (footerPhone) footerPhone.textContent = salvadorContent.sections.contact.phones[0];
  }

  const pageUrl = (slug, lang = locale, publications = false) => `${root}${slug}${publications ? "/publicaciones" : ""}/?lang=${lang}`;
  document.querySelectorAll(".section-navigation").forEach(nav => {
    [...nav.querySelectorAll("button")].forEach((button, index) => button.addEventListener("click", () => {
      const target = siteRoute === "global" ? document.getElementById(navIds.global[index]) : document.querySelector(localNavTargets[index]);
      target?.scrollIntoView({ behavior: "smooth" });
    }));
  });
  document.querySelectorAll(".language-menu button, .publications-languages button").forEach(button => {
    const lang = localeByName[button.textContent.trim()] || button.textContent.trim().toLowerCase().slice(0, 2);
    button.addEventListener("click", () => {
      const target = pageUrl(siteRoute, lang, isPublications);
      location.href = publicationId && isPublications ? `${target}&publicacion=${encodeURIComponent(publicationId)}` : target;
    });
  });
  document.querySelectorAll(".brand-button").forEach(button => button.addEventListener("click", () => location.href = pageUrl(siteRoute, locale, false)));
  document.querySelectorAll(".global-return").forEach(button => button.addEventListener("click", () => location.href = pageUrl("global", locale, false)));
  document.querySelectorAll("footer nav button").forEach(button => {
    const label = button.textContent.trim().toLowerCase();
    const slug = label.includes("global") ? "global" : label.includes("salvador") ? "el-salvador" : label.includes("méxico") || label.includes("mexico") || label.includes("mexique") ? "mexico" : null;
    if (slug) button.addEventListener("click", () => location.href = pageUrl(slug, locale, false));
  });
  document.querySelectorAll("section[data-enabled='false'], footer[data-enabled='false']").forEach(element => element.hidden = true);
  document.querySelectorAll("a[href^='#']").forEach(link => link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { event.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  }));

  const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }), { threshold: .12 });
  document.querySelectorAll("section, footer").forEach(element => { element.classList.add("reveal-ready"); reveal.observe(element); });

  function animateCounters(containerSelector, stats) {
    const elements = [...document.querySelectorAll(`${containerSelector} article > span`)];
    if (!elements.length || !stats?.length) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frames = [];
    const format = value => new Intl.NumberFormat(locale === "en" ? "en-US" : locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : "es-MX").format(value);
    const reset = () => elements.forEach((element, index) => element.textContent = `0${stats[index]?.suffix || ""}`);
    const run = () => {
      frames.forEach(cancelAnimationFrame); frames = [];
      const start = performance.now();
      elements.forEach((element, index) => {
        const stat = stats[index]; if (!stat) return;
        if (reducedMotion) { element.textContent = `${format(stat.value)}${stat.suffix || ""}`; return; }
        const tick = now => {
          const progress = Math.min((now - start) / 1350, 1);
          const value = Math.round(stat.value * (1 - Math.pow(1 - progress, 3)));
          element.textContent = `${format(value)}${stat.suffix || ""}`;
          if (progress < 1) frames.push(requestAnimationFrame(tick));
        };
        frames.push(requestAnimationFrame(tick));
      });
    };
    reset();
    const container = document.querySelector(containerSelector);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= .35) run();
      else if (!entry.isIntersecting) reset();
    }, { threshold: [0, .35] });
    observer.observe(container);
  }
  if (siteRoute === "global" && globalContent) {
    animateCounters(".network-counts", globalContent.sections.network.stats);
    animateCounters(".leadership-stats", globalContent.sections.leadership.stats);
  } else if (siteRoute === "mexico" && mexicoContent) {
    animateCounters(".partner-stats", mexicoContent.sections.team.stats);
  } else if (siteRoute === "el-salvador" && salvadorContent) {
    animateCounters(".partner-stats", salvadorContent.sections.team.stats);
  }

  function initializeWorldMap() {
    const countries = networkContent?.countries;
    const canvas = document.querySelector(".map-canvas");
    const stage = canvas?.querySelector(".map-stage");
    const listButtons = [...document.querySelectorAll(".location-list button")];
    const nodes = [...document.querySelectorAll(".map-node")];
    const card = canvas?.querySelector(".map-card");
    if (!countries?.length || !canvas || !stage || !card || !listButtons.length) return;
    const cardName = card.querySelector("strong");
    const cardStatus = card.querySelector("span");
    const visitButton = card.querySelector("button");
    const focus = stage.querySelector(".map-focus-cinematic");
    const connections = stage.querySelector(".map-connections");
    const globalButton = canvas.querySelector(".global-map-button");
    const actions = sharedContent?.mapActions?.[locale] || sharedContent?.mapActions?.en || {};
    const zoomByCountry = { mexico:3.6, guatemala:4.8, "el-salvador":5.2, "costa-rica":4.8, panama:4.7, belize:5, colombia:3.8, peru:3.6, argentina:3.6, "dominican-republic":4.8, venezuela:3.7, "united-kingdom":3.8, ecuador:4.1, uruguay:4, spain:4, albania:4.2, cyprus:4.3, egypt:4, france:4, "united-states":3.6, nicaragua:5, jamaica:5, "saint-kitts":5.2, dominica:5.2, grenada:5.2, "saint-vincent":5.2 };
    const pointFor = country => [((country.coordinates.longitude + 180) / 360) * 100, ((90 - country.coordinates.latitude) / 180) * 100];
    const distance = (a, b) => { const rad=Math.PI/180, dLat=(b.coordinates.latitude-a.coordinates.latitude)*rad, dLon=(b.coordinates.longitude-a.coordinates.longitude)*rad; const v=Math.sin(dLat/2)**2+Math.cos(a.coordinates.latitude*rad)*Math.cos(b.coordinates.latitude*rad)*Math.sin(dLon/2)**2; return 2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v)); };
    let selected = 0;
    let globalView = false;
    let initialized = false;
    let mapAnimation;
    const drawConnections = country => {
      if (!connections) return;
      const [x,y] = pointFor(country);
      const ranked = countries.map((item,index)=>({item,index,d:distance(country,item)})).filter(value=>value.index!==selected).sort((a,b)=>a.d-b.d);
      const chosen = [...ranked.slice(0,3).map(value=>({...value,kind:"near"})), {...ranked[ranked.length-1],kind:"far"}];
      connections.innerHTML = chosen.map(({item,kind})=>{ const [tx,ty]=pointFor(item), mx=(x+tx)/2, curve=(kind==="far"?-1:1)*Math.min(8,Math.abs(tx-x)*.12+2); return `<path class="${kind}" d="M ${x} ${y} Q ${mx} ${(y+ty)/2-curve} ${tx} ${ty}"></path>`; }).join("");
    };
    const selectCountry = index => {
      const previousTransform = initialized ? getComputedStyle(stage).transform : null;
      if (initialized) {
        mapAnimation?.cancel();
        stage.style.animation = "none";
        stage.style.transition = "none";
      }
      selected = index;
      globalView = false;
      const country = countries[index];
      const [x,y] = pointFor(country);
      const zoom = zoomByCountry[country.id] || 3.8;
      listButtons.forEach((button,i)=>button.classList.toggle("selected",i===index));
      nodes.forEach((node,i)=>node.classList.toggle("selected",i===index));
      canvas.classList.add("is-focused"); canvas.classList.remove("is-global");
      stage.style.setProperty("--focus-x",`${x}%`); stage.style.setProperty("--focus-y",`${y}%`);
      stage.style.setProperty("--pan-x",`${-x}%`); stage.style.setProperty("--pan-y",`${-y}%`);
      stage.style.setProperty("--zoom",zoom); stage.style.setProperty("--node-scale",1/zoom);
      stage.style.setProperty("--drag-x","0px"); stage.style.setProperty("--drag-y","0px");
      if (focus) { focus.style.left=`${x}%`; focus.style.top=`${y}%`; }
      cardName.textContent = country.name[locale] || country.name.en;
      cardStatus.textContent = country.status === "active" ? actions.active : actions.planned;
      visitButton.textContent = `${country.status === "active" ? actions.visit : actions.status} ↗`;
      visitButton.disabled = false;
      globalButton.firstChild.textContent = actions.global || globalButton.firstChild.textContent;
      drawConnections(country);
      if (previousTransform && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const targetTransform = getComputedStyle(stage).transform;
        mapAnimation = stage.animate(
          [{ transform: previousTransform }, { transform: targetTransform }],
          { duration: 1250, easing: "cubic-bezier(.16,1,.3,1)" }
        );
        mapAnimation.onfinish = () => { stage.style.transition = ""; };
        mapAnimation.oncancel = () => { stage.style.transition = "none"; };
      } else if (previousTransform) {
        stage.style.transition = "";
      }
      initialized = true;
    };
    listButtons.forEach((button,index)=>button.addEventListener("click",()=>selectCountry(index)));
    nodes.forEach((button,index)=>button.addEventListener("click",()=>selectCountry(index)));
    globalButton?.addEventListener("click",()=>{
      globalView=!globalView;
      if (!globalView) { selectCountry(selected); return; }
      canvas.classList.add("is-global"); canvas.classList.remove("is-focused");
      stage.style.setProperty("--focus-x","50%"); stage.style.setProperty("--focus-y","50%");
      stage.style.setProperty("--pan-x","-50%"); stage.style.setProperty("--pan-y","-50%");
      stage.style.setProperty("--zoom",1); stage.style.setProperty("--node-scale",1);
      globalButton.firstChild.textContent = `${actions.back || "Back to"} ${countries[selected].name[locale] || countries[selected].name.en}`;
    });
    visitButton.addEventListener("click",()=>{
      const country = countries[selected];
      if (country.status !== "active" || !country.siteId) return;
      const slug = country.siteId === "salvador" ? "el-salvador" : country.siteId;
      location.href = pageUrl(slug, locale, false);
    });
    selectCountry(0);
  }
  if (siteRoute === "global" && !isPublications) initializeWorldMap();
  document.querySelectorAll("form").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = [...data.entries()].map(([key, value]) => `${key}: ${value}`).join("\n\n");
    const email = form.closest("section")?.querySelector('a[href^="mailto:"]')?.getAttribute("href")?.slice(7) || "info@auditaxes.com";
    location.href = `mailto:${email}?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(lines)}`;
  }));
  document.querySelectorAll(".global-news-heading button").forEach(button => button.addEventListener("click", () => location.href = pageUrl("global", locale, true)));
  document.querySelectorAll(".publications-hero > button").forEach(button => button.addEventListener("click", () => location.href = pageUrl(siteRoute, locale, false)));
  document.querySelectorAll(".publication-detail-back").forEach(button => button.addEventListener("click", () => location.href = pageUrl("global", locale, true)));

  const cards = [...document.querySelectorAll(".global-news-grid article")];
  cards.forEach((card, index) => {
    const item = publicationItems[index];
    const button = card.querySelector(".news-card-button");
    if (!item || !button) return;
    button.addEventListener("click", () => location.href = `${pageUrl("global", locale, true)}&publicacion=${encodeURIComponent(item.id)}`);
  });
  document.querySelectorAll(".publication-filters button").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".publication-filters button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const label = button.textContent.toLowerCase();
    cards.forEach(card => {
      const type = card.querySelector(".publication-tag")?.classList.contains("article") ? "article" : "news";
      const showAll = /all|todas|todos|tous/.test(label);
      const newsWord = locale === "fr" ? "actualité" : locale === "pt" ? "notícia" : locale === "es" ? "noticia" : "news";
      card.hidden = !showAll && !label.includes(type === "article" ? "art" : newsWord);
    });
  }));
  document.querySelectorAll(".publication-order button").forEach(button => button.addEventListener("click", () => {
    const grid = document.querySelector(".global-news-grid");
    if (!grid) return;
    cards.reverse().forEach(card => grid.appendChild(card));
    document.querySelectorAll(".publication-order button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  }));
})().catch(error => {
  console.error(error);
  document.getElementById("site-root").innerHTML = '<main style="font-family:Arial,sans-serif;padding:3rem"><h1>AUDITAXES</h1><p>No fue posible cargar el contenido del sitio.</p></main>';
});
