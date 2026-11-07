import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, ChevronDown, CircleHelp,
  Clock3, FileText, Globe2, GripVertical, Languages, LayoutDashboard, LockKeyhole, LogOut,
  Menu, Newspaper, PanelLeftClose, Plus, Search, Settings, ShieldCheck,
  Sparkles, Trash2, Users, X
} from "lucide-react";
import "./styles.css";
import { createSection, deletePublication, deleteSection, getCurrentContent, getFieldAiJob, getPublications, getTranslationJob, getTranslationSection, login, logout as closeApiSession, restoreSession, savePublication, saveSection, saveSectionOrder, saveTranslation, startDraftAiJob, startTranslationJob, updateSectionStatus, uploadPublicationImage } from "./api";

const localLogin = ["localhost", "127.0.0.1"].includes(location.hostname);
const DEMO_PASSWORD = "Auditaxes2026";
const loginAccounts = [
  { role: "Administradora Global", email: "global@auditaxes.com" },
  { role: "Administrador México", email: "mexico@auditaxes.com" },
  { role: "Administradora El Salvador", email: "salvador@auditaxes.com" },
];

const sites = [
  { id: "global", short: "GL", name: "AUDITAXES Global", locale: "Inglés", domain: "auditaxes.suitmx.com", accent: "blue" },
  { id: "mexico", short: "MX", name: "AUDITAXES México", locale: "Español", domain: "mexico-auditaxes.suitmx.com", accent: "green" },
  { id: "salvador", short: "SV", name: "AUDITAXES El Salvador", locale: "Español", domain: "elsalvador-auditaxes.suitmx.com", accent: "cyan" },
];

function Logo({ light = false, siteId = "global" }) {
  const scope = siteId === "salvador" ? "el-salvador" : "international";
  const tone = light ? "blanco" : "gris";
  const label = siteId === "salvador" ? "Auditaxes El Salvador" : "Auditaxes International";
  return <div className={`logo logo-image ${light ? "light" : ""}`}><img src={`/brand/auditaxes-${scope}-${tone}.png`} alt={label}/></div>;
}

function LoginLogo({ light = false }) {
  return <Logo light={light}/>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const passwordField = useRef(null);

  function selectAccount(account) {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setShow(false);
    setError("");
    passwordField.current?.focus();
  }

  async function submit(event) {
    event.preventDefault();
    try { onLogin(await login(email, password)); }
    catch (reason) { setError(reason.message); }
  }

  return <main className="login-shell">
    <section className="login-story">
      <div className="story-top"><LoginLogo light/><span>PORTAL EDITORIAL</span></div>
      <div className="story-copy">
        <span className="eyebrow">CONTENIDO · TRADUCCIÓN · PUBLICACIÓN</span>
        <h1>Una sola voz.<br/><em>En todos los mercados.</em></h1>
        <p>Administra la presencia digital de AUDITAXES, coordina traducciones y publica contenido con confianza.</p>
      </div>
      <div className="story-foot"><span>27 países y territorios</span><span>4 idiomas</span><span>Una red global</span></div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <div className="mobile-logo"><LoginLogo /></div>
        <span className="eyebrow">ACCESO SEGURO</span>
        <h2>Bienvenido de nuevo</h2>
        <p className="intro">Ingresa tus credenciales para acceder al editor de contenidos.</p>
        <form onSubmit={submit}>
          <label>Correo electrónico<input type="email" value={email} onChange={e => {setEmail(e.target.value); setError("")}} placeholder="nombre@auditaxes.com" autoComplete="email" required /></label>
          <label>Contraseña<div className="password-field"><input ref={passwordField} type={show ? "text" : "password"} value={password} onChange={e => {setPassword(e.target.value); setError("")}} placeholder="••••••••••••" autoComplete="current-password" required /><button type="button" onClick={() => setShow(!show)} aria-label="Mostrar contraseña">{show ? <X/> : <LockKeyhole/>}</button></div></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="primary login-button">Ingresar al editor <ArrowRight /></button>
        </form>
        <div className="demo-note accounts-note"><ShieldCheck/><div>
          <b>{localLogin ? "Cuentas provisionales" : "Selecciona tu cuenta"}</b>
          {loginAccounts.map(account => <button type="button" key={account.email} onClick={() => selectAccount(account)}>
            <span>{account.role}</span><small>{account.email}</small>
          </button>)}
          {localLogin && <em>Contraseña común: {DEMO_PASSWORD}</em>}
        </div></div>
        <footer>Si necesitas acceso, contacta al administrador de tu sitio.</footer>
      </div>
    </section>
  </main>;
}

const nav = [
  ["Resumen", LayoutDashboard], ["Contenido", FileText], ["Publicaciones", Newspaper], ["Traducciones", Languages],
  ["Configuración", Settings]
];

function Sidebar({ active, setActive, open, setOpen, user, site }) {
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="sidebar-head"><Logo light siteId={site.id}/><button aria-label="Cerrar menú" onClick={() => setOpen(false)}><PanelLeftClose/></button></div>
    <div className="workspace"><span>ESPACIO DE TRABAJO</span><button disabled><i>{site.short}</i><span><b>{site.name}</b><small>{site.locale} · Sitio asignado</small></span><ShieldCheck/></button></div>
    <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} disabled={label === "Configuración"} onClick={() => { if (setActive(label)) setOpen(false); }}><Icon/><span>{label}{label === "Configuración" && <small> · Pendiente</small>}</span></button>)}</nav>
    <div className="sidebar-help"><CircleHelp/><div><b>Centro de ayuda</b><span>Pendiente</span></div></div>
    <div className="user-card"><span>{user.initials}</span><div><b>{user.name}</b><small>{user.role}</small></div></div>
  </aside>;
}

function Topbar({ title, openMenu, logout }) {
  return <header className="topbar"><button className="menu-button" aria-label="Abrir menú" onClick={openMenu}><Menu/></button><div><span>ADMINISTRACIÓN</span><b>{title}</b></div><div className="top-actions"><label><Search/><input aria-label="Búsqueda pendiente" placeholder="Búsqueda pendiente" disabled/></label><button className="icon-button" aria-label="Notificaciones pendientes" title="Notificaciones pendientes" disabled><Bell/></button><button className="logout" onClick={logout} title="Cerrar sesión"><LogOut/></button></div></header>;
}

function Stat({ label, value, detail, icon: Icon, tone }) {
  return <article className="stat"><div className={`stat-icon ${tone}`}><Icon/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function Overview({ goContent, user, site }) {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getCurrentContent().then(setDocument).catch(reason => setError(reason.message)); }, [site.id]);
  const values = Object.values(document?.editorial || {});
  const drafts = values.filter(item => item.status === "draft").length;
  const review = values.filter(item => item.status === "review").length;
  const translations = values.filter(item => Object.values(item.translations || {}).some(translation => ["translation_pending", "stale"].includes(translation.status))).length;
  const lastApproval = values.map(item => item.approvedAt).filter(Boolean).sort().at(-1);
  const progress = values.length ? Math.round(100 * values.filter(item => item.status === "approved").length / values.length) : 0;
  return <div className="page overview">
    <div className="page-heading"><div><span className="eyebrow">{new Date().toLocaleDateString("es-MX", { dateStyle: "full" }).toUpperCase()}</span><h1>Buenos días, {user.name.split(" ")[0]}.</h1><p>Este es el estado actual de {site.name}.</p></div><button className="primary" onClick={goContent}><Plus/> Nuevo contenido</button></div>
    {error && <p className="api-error">{error}</p>}
    <section className="stats-grid">
      <Stat label="Sitio asignado" value="1" detail={site.domain} icon={Globe2} tone="blue"/>
      <Stat label="Borradores" value={document ? String(drafts) : "…"} detail={`${review} en revisión`} icon={FileText} tone="green"/>
      <Stat label="Traducciones pendientes" value={document ? String(translations) : "…"} detail="Secciones por revisar" icon={Languages} tone="violet"/>
      <Stat label="Última aprobación" value={lastApproval ? new Date(lastApproval).toLocaleDateString("es-MX") : "—"} detail={site.name} icon={Clock3} tone="sand"/>
    </section>
    <section className="sites-section"><div className="section-heading"><div><h2>Tu sitio</h2><p>Tu cuenta tiene acceso exclusivo a este mercado.</p></div><span className="scope-badge"><LockKeyhole/> Acceso limitado por credencial</span></div><div className="site-grid single-site">
      <article className="site-card" key={site.id}><div className="site-card-top"><span className={`flag ${site.accent}`}>{site.short}</span></div><h3>{site.name}</h3><a href={`https://${site.domain}`} target="_blank" rel="noreferrer">{site.domain}</a><div className="meta"><span>Idioma predeterminado del sitio</span><b>{site.locale}</b></div><div className="status-row"><span className={drafts || review ? "pending" : "published"}>{drafts || review ? "Cambios pendientes" : "Sin cambios pendientes"}</span><small>{values.length} secciones</small></div><div className="progress"><i style={{width: `${progress}%`}}/></div><button className="manage" onClick={goContent}>Administrar contenido <ArrowRight/></button></article>
    </div></section>
  </div>;
}

const sectionLabels = {
  hero: ["Portada", "Título, introducción y llamada"], consortium: ["El consorcio", "Presentación y principios"],
  services: ["Especialidades", "Servicios profesionales"], network: ["Red", "Presencia internacional"],
  leadership: ["Liderazgo", "Dirección y propósito"], firm: ["La firma", "Presentación local"],
  method: ["Metodología", "Proceso de trabajo"], practices: ["Especialidades", "Servicios profesionales"],
  industries: ["Industrias", "Sectores atendidos"], team: ["Equipo", "Directorio de especialistas"],
  contact: ["Contacto", "Datos y formulario"], footer: ["Pie de página", "Información institucional"],
  auditDetail: ["Auditoría", "Información detallada"], offices: ["Oficinas", "Sedes y regiones"], insights: ["Perspectivas", "Artículos y novedades"],
};

const localeKeys = ["es", "en", "pt", "fr"];
const fieldLabels = { eyebrow:"Etiqueta superior", title:"Título", body:"Descripción", intro:"Introducción", label:"Etiqueta", href:"Enlace", src:"Imagen", alt:"Texto alternativo", name:"Nombre", role:"Cargo", email:"Correo electrónico", phone:"Teléfono", address:"Dirección", value:"Valor", suffix:"Sufijo", items:"Elementos", people:"Personas", stats:"Indicadores", steps:"Pasos", links:"Enlaces", social:"Redes sociales", legalNote:"Nota legal", blocks:"Bloques de contenido" };
const humanize = key => fieldLabels[key] || key.replace(/([A-Z])/g," $1").replace(/^./,letter=>letter.toUpperCase());
const isLocalized = value => value && typeof value === "object" && !Array.isArray(value) && localeKeys.some(key => key in value);
const blockLabels = { heading: "Subtítulo", text: "Texto", bullets: "Viñetas" };

function collectionItemTitle(item, locale, index) {
  if (item?.siteId) return sites.find(site=>site.id === item.siteId)?.name || "Sitio";
  const title = item?.title ?? item?.name ?? item?.label;
  if (isLocalized(title)) return title[locale] || title.en || title.es || `Elemento ${index + 1}`;
  if (typeof title === "string" && title.trim()) return title;
  return blockLabels[item?.type] || `Elemento ${index + 1}`;
}

const staticSalvadorSections = new Set(["firm", "method", "practices", "industries", "team"]);
const staticSection = (siteId, id) => siteId === "salvador" && staticSalvadorSections.has(id);
const fieldUnavailable = (siteId, sectionId, path) =>
  (sectionId === "news" && path[0] === "items") ||
  (siteId === "global" && sectionId === "contact" && ["labels", "phones", "whatsapp", "address", "mapsQuery"].includes(path[0])) ||
  (siteId === "global" && sectionId === "leadership" && path[0] === "people" && path.at(-1) === "name");

function ImageUploadStatus() {
  return <div className="upload-feedback" role="status">
    <div className="upload-feedback-panel">
      <strong>Subiendo imagen…</strong>
      <span className="upload-feedback-track" aria-hidden="true"><span/></span>
    </div>
  </div>;
}

function SectionImageField({ src, onUpload, onChange, pending, disabled, error }) {
  const picker = useRef(null);
  const [failedSrc, setFailedSrc] = useState(null);
  return <div className="section-image-field">
    <div className="section-image-preview">
      {src && failedSrc !== src
        ? <img key={src} src={src} alt="Vista previa de la imagen" onError={()=>setFailedSrc(src)}/>
        : <span>{src ? "No se pudo mostrar la imagen" : "Sin imagen"}</span>}
      {pending && <ImageUploadStatus/>}
    </div>
    <div>
      <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
        onChange={event=>{const file=event.target.files?.[0];event.target.value="";if(file)onUpload(file);}}/>
      <button type="button" className="secondary" disabled={disabled} onClick={()=>picker.current?.click()}>
        {pending ? "Subiendo imagen…" : src ? "Cambiar imagen" : "Elegir imagen"}
      </button>
      <p>JPG, PNG, WEBP o GIF · Hasta 5 MB. La imagen aparecerá en el sitio al publicar la sección.</p>
      {error && <p className="api-error" role="alert">{error}</p>}
      <details><summary>Usar una dirección de imagen</summary>
        <label className="field"><span>Dirección de imagen</span>
          <input value={src} disabled={disabled} onChange={event=>onChange(event.target.value)}/>
        </label>
      </details>
    </div>
  </div>;
}

function ValueEditor({ value, label, path, locale, onChange, onRemove, sectionId, siteId, images, inCard = false }) {
  if (fieldUnavailable(siteId, sectionId, path)) {
    return <p className="read-only-field">{humanize(label)} · {sectionId === "news" ? "Se administra en Publicaciones" : "Solo lectura"}</p>;
  }
  if (["id", "siteId", "type"].includes(path.at(-1))) return null;
  if (path.at(-1) === "src" && typeof value === "string") {
    const upload = images.state?.key === JSON.stringify(path) ? images.state : null;
    return <SectionImageField src={value} onUpload={file=>images.upload(path,file)}
      onChange={src=>onChange(path,src)} disabled={images.disabled}
      pending={upload?.pending} error={upload?.error}/>;
  }
  if (isLocalized(value)) {
    const text = value[locale] ?? "";
    if (typeof text === "object") {
      return <ValueEditor value={text} label={label} path={[...path, locale]} locale={locale}
        onChange={onChange} onRemove={onRemove} sectionId={sectionId} siteId={siteId} images={images}/>;
    }
    const id = `field-${sectionId}-${path.join("-")}`;
    return <div className="field dynamic-field"><label htmlFor={id}>{humanize(label)} <small>{locale === "es" ? "Español" : "Inglés"} · original</small></label><textarea id={id} lang={locale} rows={text.length > 140 ? 5 : 3} value={text} onChange={event => onChange([...path, locale], event.target.value)}/></div>;
  }
  if (Array.isArray(value)) {
    const consortium = sectionId === "consortium" && path.length === 1 && label === "items";
    return <section className={`field-group collection collection-editor${consortium ? " collection-consortium" : ""}`}>
      <header><b>{consortium ? "Principios del consorcio" : humanize(label)}</b>
        <span>{value.length} {value.length === 1 ? "elemento" : "elementos"}</span>
      </header>
      <ol className="collection-items">
        {value.map((item,index)=>{
          const title = collectionItemTitle(item, locale, index);
          return <li className="collection-card" key={item?.id || index}>
            <div className="collection-card-heading">
              <span className="item-number">{String(index+1).padStart(2,"0")}</span>
              {!consortium && <strong>{title}</strong>}
            </div>
            <ValueEditor value={item} label={consortium ? "Principio" : "Contenido"} path={[...path,index]}
              locale={locale} onChange={onChange} onRemove={onRemove} sectionId={sectionId} siteId={siteId} images={images} inCard/>
            {sectionId !== "insights" && <button type="button" className="remove-item" disabled={images.disabled}
              onClick={()=>onRemove([...path,index])} aria-label={`Eliminar ${title}`} title={`Eliminar ${title}`}><Trash2/></button>}
          </li>;
        })}
      </ol>
    </section>;
  }
  if (value && typeof value === "object") {
    const fields = <div className={label === "image" ? "nested-fields image-fields" : "nested-fields"}>{Object.entries(value).map(([key,nested])=>
      <ValueEditor key={key} value={nested} label={key} path={[...path,key]} locale={locale} onChange={onChange}
        onRemove={onRemove} sectionId={sectionId} siteId={siteId} images={images}/>)}</div>;
    return inCard ? fields : <section className="field-group"><header><b>{label === "image" ? "Imagen" : humanize(label)}</b></header>{fields}</section>;
  }
  if (typeof value === "boolean") {
    return <label className="boolean-field"><input type="checkbox" checked={value} onChange={event=>onChange(path,event.target.checked)}/><span>{humanize(label)}</span></label>;
  }
  if (typeof value === "number") {
    return <label className="field dynamic-field"><span>{humanize(label)}</span><input type="number" value={value} onChange={event=>onChange(path,Number(event.target.value))}/></label>;
  }
  const text = value ?? "";
  return <label className="field dynamic-field"><span>{humanize(label)}</span>{String(text).length > 100 ? <textarea rows="4" value={text} onChange={event=>onChange(path,event.target.value)}/> : <input value={text} onChange={event=>onChange(path,event.target.value)}/>}</label>;
}

function ContentPage({ site, onDirtyChange, goTranslations }) {
  const [selected, setSelected] = useState("hero");
  const [saveState, setSaveState] = useState("idle");
  const [document, setDocument] = useState(null);
  const [editorial, setEditorial] = useState({});
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [draggedSection, setDraggedSection] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [translationOffer, setTranslationOffer] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [localePrompt, setLocalePrompt] = useState(null);
  const [writingLocale, setWritingLocale] = useState(site.id === "global" ? "en" : "es");
  const [notice, setNotice] = useState("");
  const [savePrompt, setSavePrompt] = useState(false);
  const [draftAi, setDraftAi] = useState(null);
  useEffect(() => { getCurrentContent().then(result => { setDocument(result); setEditorial(result.editorial || {}); }).catch(reason => setLoadError(reason.message)); }, [site.id]);
  const locale = writingLocale;
  const sectionIds = document ? (document.content.sectionOrder || Object.keys(document.content.sections)) : [];
  const sections = document ? sectionIds.map(id => { const section=document.content.sections[id]; const customTitle=section?.title?.[locale] || section?.title?.en || section?.title?.es || "Sección sin título"; return [id, ...(sectionLabels[id] || [customTitle, "Sección personalizada"])]; }) : [];
  const readOnly = staticSection(site.id, selected);
  const movableIds = sectionIds.filter(id => !staticSection(site.id, id));
  const selectedIndex = Math.max(0, sections.findIndex(([id]) => id === selected));
  const selectedMeta = sections[selectedIndex] || [selected, selected, "Sección de contenido"];
  const contentLoaded = Boolean(document);
  useEffect(() => { const section=document?.content.sections[selected]; setDraft(section ? structuredClone(section) : null); setWritingLocale(editorial[selected]?.sourceLocale || document?.sourceLocale || (site.id === "global" ? "en" : "es")); setSaveState("idle"); setNotice(""); setTranslationOffer(null); setImageUpload(null); }, [contentLoaded, selected, site.id]);
  const dirty = Boolean(draft && document?.content.sections[selected] && (JSON.stringify(draft) !== JSON.stringify(document.content.sections[selected]) || locale !== (editorial[selected]?.sourceLocale || document.sourceLocale)));
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const working = saveState === "saving" || Boolean(imageUpload?.pending);
  function selectSection(id) { if (working || (id !== selected && dirty && !window.confirm("Hay cambios sin guardar en esta sección. ¿Cambiar sin guardarlos?"))) return; setSelected(id); }
  function chooseLocale(next) {
    if (next === locale) return;
    if (draft && Object.values(draft).some(value => value && typeof value === "object")) setLocalePrompt(next);
    else setWritingLocale(next);
  }
  function updateDraft(path, value) {
    setDraft(current => { const next=structuredClone(current); let cursor=next; path.slice(0,-1).forEach(key=>{cursor=cursor[key]}); cursor[path.at(-1)]=value; return next; });
  }
  async function uploadSectionImage(path, file) {
    if (working) return;
    const key = JSON.stringify(path);
    setImageUpload({ key, pending: true });
    try {
      const { src } = await uploadPublicationImage(file);
      updateDraft(path, src);
      setImageUpload(null);
    } catch (error) {
      setImageUpload({ key, pending: false, error: error.message });
    }
  }
  function removeDraftItem(path) {
    if (working) return;
    setDraft(current => { const next=structuredClone(current); let cursor=next; path.slice(0,-1).forEach(key=>{cursor=cursor[key]}); cursor.splice(path.at(-1),1); return next; });
  }
  function addBlock(type) {
    const localized=Object.fromEntries(localeKeys.map(key=>[key,""]));
    const block=type==="bullets"?{id:`block-${Date.now()}`,type,items:[structuredClone(localized),structuredClone(localized),structuredClone(localized)]}:{id:`block-${Date.now()}`,type,text:localized};
    setDraft(current=>({...current,blocks:[...(current.blocks||[]),block]}));
  }
  async function createNewSection(event) {
    event.preventDefault();
    if (working) return;
    if (dirty && !window.confirm("Hay cambios sin guardar. ¿Crear otra sección sin guardarlos?")) return;
    const name=newSectionName.trim(); if(!name)return;
    const base=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || `seccion-${Date.now()}`;
    const sectionId=`custom-${base}`.slice(0,48);
    const title=Object.fromEntries(localeKeys.map(key=>[key,key===locale?name:""]));
    const section={type:"custom",enabled:true,title,blocks:[]};
    try { const result=await createSection(sectionId,section,locale); setDocument(current=>({...current,content:{...current.content,sections:{...current.content.sections,[sectionId]:section},sectionOrder:result.sectionOrder}})); setEditorial(current=>({...current,[sectionId]:result.metadata})); setSelected(sectionId); setCreating(false); setNewSectionName(""); }
    catch(reason){setLoadError(reason.message)}
  }
  async function dropSection(targetId, fromId = draggedSection) {
    if (!fromId || fromId === targetId || !movableIds.includes(fromId) || !movableIds.includes(targetId)) return;
    const order=[...sectionIds]; const from=order.indexOf(fromId); const to=order.indexOf(targetId); order.splice(from,1); order.splice(to,0,fromId);
    setDocument(current=>({...current,content:{...current.content,sectionOrder:order}})); setDraggedSection(null);
    try{await saveSectionOrder(order)}catch(reason){setLoadError(reason.message);setDocument(current=>({...current,content:{...current.content,sectionOrder:sectionIds}}))}
  }
  async function removeCustomSection() {
    if(working||draft?.type!=="custom"||!window.confirm("¿Eliminar esta sección personalizada?"))return;
    try{const result=await deleteSection(selected);setDocument(current=>{const next=structuredClone(current);delete next.content.sections[selected];next.content.sectionOrder=result.sectionOrder;return next});setSelected(result.sectionOrder[0]||"hero")}
    catch(reason){setLoadError(reason.message)}
  }
  function draftFields(section = draft) {
    const fields = {};
    function visit(value, path = []) {
      if (Array.isArray(value)) return value.forEach((item, index) => visit(item, [...path, index]));
      if (!value || typeof value !== "object") return;
      if (locale in value && (locale === "es" ? "en" : "es") in value) {
        const text = value[locale];
        const name = String(path.at(-1) || "").toLowerCase();
        if (typeof text === "string" && text.trim() && !/^(href|src|url|email|phone|id)$/.test(name)) fields[JSON.stringify([...path, locale])] = text;
        return;
      }
      Object.entries(value).forEach(([key, item]) => visit(item, [...path, key]));
    }
    visit(section);
    return fields;
  }
  function applyDraftFields(section, fields) {
    const next = structuredClone(section);
    Object.entries(fields).forEach(([id, value]) => {
      const path = JSON.parse(id); let cursor = next;
      path.slice(0, -1).forEach(key => { cursor = cursor?.[key]; });
      if (cursor && typeof cursor === "object") cursor[path.at(-1)] = value;
    });
    return next;
  }
  async function requestDraftReview() {
    setSavePrompt(false); setLoadError("");
    const fields = draftFields();
    if (!Object.keys(fields).length) { await persistDraft(draft); return; }
    try { setDraftAi({ ...await startDraftAiJob(selected, fields, locale), original: fields }); }
    catch (reason) { setLoadError(reason.message); }
  }
  useEffect(() => {
    if (!["queued", "running"].includes(draftAi?.status)) return;
    let active = true;
    const timer = setInterval(async () => {
      try { const result = await getFieldAiJob(selected, draftAi.id); if (active) setDraftAi(current => ({ ...current, ...result })); }
      catch (reason) { if (active) { setLoadError(reason.message); setDraftAi(null); } }
    }, 1800);
    return () => { active = false; clearInterval(timer); };
  }, [draftAi?.id, draftAi?.status, selected]);
  async function persistDraft(sectionToSave) {
    if (!draft || working) return;
    setSaveState("saving");
    setLoadError("");
    setNotice("");
    setTranslationOffer(null);
    setDraft(structuredClone(sectionToSave));
    try {
      const result = await saveSection(selected, sectionToSave, locale);
      setDocument(current => ({ ...current, content: { ...current.content, sections: { ...current.content.sections, [selected]: result.section } } }));
      setEditorial(current => ({ ...current, [selected]: result.metadata }));
    } catch (reason) {
      setSaveState("error");
      setLoadError(reason.message);
      return;
    }
    try {
      const translation = await getTranslationSection(selected);
      if (translation.needsReview) setNotice(`Revisa la traducción al ${translation.targetLocale === "es" ? "español" : "inglés"} en Traducciones.`);
      if (translation.missingFields.length) {
        const { sourceLocale, targetLocale, sourceHash } = translation;
        setTranslationOffer({ sectionId: selected, sourceLocale, targetLocale, sourceHash });
      }
    } catch {
      setNotice("Borrador guardado. Puedes consultar el estado de la traducción en Traducciones.");
    } finally {
      setSaveState("idle");
    }
  }
  function save() { if (draft && dirty && !readOnly && !working) setSavePrompt(true); }
  async function confirmTranslation() {
    const offer = translationOffer;
    setTranslationOffer(null);
    setSaveState("saving");
    try {
      await startTranslationJob(offer.sectionId, "translate", undefined, offer.sourceHash, offer.sourceLocale, offer.targetLocale);
      setNotice("Traducción en cola. Abre Traducciones para revisar la propuesta.");
    } catch (error) {
      setTranslationOffer(offer);
      setLoadError(error.message);
    } finally {
      setSaveState("idle");
    }
  }
  async function changeStatus(status) {
    if (dirty || working || (status === "approved" && selectedEditorial.sourceSwitchPending)) return;
    setLoadError("");
    setSaveState("saving");
    try {
      const result = await updateSectionStatus(selected, status);
      setEditorial(current => ({ ...current, [selected]: result.metadata }));
      setSaveState("idle");
    } catch (reason) {
      setLoadError(reason.message);
      setSaveState("error");
    }
  }
  const statusLabels = { draft: "Borrador", review: "En revisión", approved: "Aprobado" };
  const selectedEditorial = editorial[selected] || { status: "approved" };
  const status = selectedEditorial.status;
  const publishingBlocked = status === "review" && selectedEditorial.sourceSwitchPending;
  const currentStep = dirty ? 0 : status === "draft" ? 1 : status === "review" ? 2 : 3;
  const stepMessages = [
    ["Cambios sin guardar", "Guarda el borrador para conservar tus cambios. La versión pública seguirá igual."],
    ["Borrador guardado", "Cuando termines de editar, envía el borrador a revisión."],
    publishingBlocked
      ? ["Traducción pendiente", "Aprueba primero la traducción del nuevo idioma original."]
      : ["Listo para publicar", "Revisa los cambios y aprueba la sección para que aparezcan en el sitio."],
    ["Publicado", "Esta es la versión visible en el sitio."],
  ];
  const previewUrl=`/site-preview/${site.id === "salvador" ? "el-salvador" : site.id}?sitio=${site.id}&lang=${locale}`;
  const fields = Object.entries(draft ?? {}).filter(([key])=>key!=="enabled"&&key!=="type");
  const renderFields = entries => entries.map(([key,value])=>
    <ValueEditor key={`${selected}-${key}`} value={value} label={key} path={[key]} locale={locale} onChange={updateDraft}
      onRemove={removeDraftItem} sectionId={selected} siteId={site.id} images={{state:imageUpload,upload:uploadSectionImage,disabled:working}}/>);
  async function moveSelected(offset) { const index=movableIds.indexOf(selected); const target=movableIds[index+offset]; if (target) await dropSection(target, selected); }
  return <div className="page content-page">
    {savePrompt && <div className="ai-modal-backdrop"><div className="ai-modal save-review-modal" role="dialog" aria-modal="true" aria-labelledby="save-review-title" onKeyDown={event=>{if(event.key==="Escape")setSavePrompt(false);}}><h2 id="save-review-title">Guardar borrador</h2><p>Puedes guardar el borrador directamente o revisar la ortografía antes de guardarlo. Podrás publicarlo después.</p><div><button type="button" className="secondary" onClick={()=>setSavePrompt(false)}>Volver a editar</button><button type="button" className="secondary" onClick={requestDraftReview}><Sparkles/> Revisar ortografía</button><button type="button" className="primary" autoFocus onClick={()=>{setSavePrompt(false);persistDraft(draft);}}>Guardar borrador ahora</button></div></div></div>}
    {draftAi && <div className="ai-modal-backdrop"><div className="ai-modal draft-review-modal" role="dialog" aria-modal="true" aria-labelledby="draft-review-title"><h2 id="draft-review-title">Revisión final de la sección</h2>{["queued","running"].includes(draftAi.status) ? <><div className="field-ai-scene"><div className="field-ai-orbit"><Sparkles/></div><div className="field-ai-scene-copy"><b>Revisando todos los textos</b><span>Te mostraremos los cambios sugeridos</span></div><div className="field-ai-progress"><i/></div></div><p role="status">{draftAi.status === "queued" ? "En cola…" : "Analizando ortografía y redacción…"}</p></> : draftAi.status === "failed" ? <><p className="field-ai-error">No se pudo completar la revisión. Puedes guardar sin IA.</p><div><button type="button" className="secondary" onClick={()=>setDraftAi(null)}>Volver</button><button type="button" className="primary" onClick={()=>{setDraftAi(null);persistDraft(draft);}}>Guardar borrador ahora</button></div></> : <><p>Revisa el resumen y decide si aplicas la propuesta completa antes de guardar.</p><div className="draft-review-summary">{Object.entries(draftAi.result?.fields || {}).filter(([id,value])=>value !== draftAi.original[id]).map(([id,value])=><div key={id}><small>{humanize(String(JSON.parse(id).at(-2)))}</small><p><del>{draftAi.original[id]}</del></p><p>{value}</p></div>)}{!Object.entries(draftAi.result?.fields || {}).some(([id,value])=>value !== draftAi.original[id]) && <p>No se encontraron cambios necesarios.</p>}</div><div><button type="button" className="secondary" onClick={()=>{setDraftAi(null);persistDraft(draft);}}>Conservar original y guardar</button><button type="button" className="primary" onClick={()=>{const reviewed=applyDraftFields(draft,draftAi.result.fields);setDraftAi(null);persistDraft(reviewed);}}>Aplicar revisión y guardar</button></div></>}</div></div>}
    {localePrompt && <div className="ai-modal-backdrop"><div className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="locale-prompt-title" onKeyDown={event => { if(event.key === "Escape") setLocalePrompt(null); }}><h2 id="locale-prompt-title">Cambiar idioma original</h2><p>Conservaremos los textos en español e inglés. La traducción al {localePrompt === "es" ? "inglés" : "español"} deberá revisarse antes de publicar nuevos cambios.</p>{dirty && <p>Los cambios sin guardar seguirán en este borrador; guárdalos antes de salir.</p>}<div><button type="button" className="secondary" autoFocus onClick={()=>setLocalePrompt(null)}>Cancelar</button><button type="button" className="primary" onClick={()=>{setWritingLocale(localePrompt);setLocalePrompt(null);}}>Cambiar a {localePrompt === "es" ? "español" : "inglés"}</button></div></div></div>}
    <div className="editor-head"><div><div><span className="eyebrow">{site.name.toUpperCase()} · {locale === "es" ? "ESPAÑOL" : "INGLÉS"}</span><h1>Editar contenido</h1></div></div><div><a className="secondary preview-link" href={previewUrl} target="_blank" rel="noopener noreferrer">Ver versión publicada</a></div></div>
    <p className="mobile-section-hint">← Desliza para ver más secciones →</p><div className="editor-layout"><aside className="section-list"><div><b>SECCIONES DE LA PÁGINA</b><span>Arrastra o usa ↑ ↓ para reordenar</span></div>{sections.map(([id,title,desc]) => <button draggable={!staticSection(site.id, id)} onDragStart={()=>setDraggedSection(id)} onDragOver={event=>event.preventDefault()} onDrop={()=>dropSection(id)} className={[selected === id ? "active" : "",draggedSection===id?"dragging":""].join(" ")} onClick={() => selectSection(id)} key={id}><GripVertical/><span><b>{title}</b><small>{desc}</small></span><i>{staticSection(site.id, id) ? "Solo lectura" : statusLabels[editorial[id]?.status] || "Aprobado"}</i></button>)}<button className="add-section" onClick={()=>setCreating(true)}><Plus/><span><b>Nueva sección</b><small>Textos, títulos y viñetas</small></span></button>{creating&&<form className="new-section-form" onSubmit={createNewSection}><label>Nombre de la sección<input autoFocus value={newSectionName} onChange={event=>setNewSectionName(event.target.value)} placeholder="Por ejemplo: Preguntas frecuentes"/></label><div><button type="button" onClick={()=>setCreating(false)}>Cancelar</button><button type="submit">Crear</button></div></form>}</aside>
    <form className="editor-form dynamic-editor" onSubmit={event => { event.preventDefault(); save(); }}><div className="form-title"><div><span className="eyebrow">SECCIÓN {String(selectedIndex+1).padStart(2,"0")}</span><h2>{selectedMeta[1]}</h2><p>{selectedMeta[2]}</p></div>{!readOnly && <div className="section-controls"><button type="button" className="secondary reorder-button" disabled={movableIds.indexOf(selected) <= 0} aria-label="Mover sección arriba" onClick={()=>moveSelected(-1)}>↑</button><button type="button" className="secondary reorder-button" disabled={movableIds.indexOf(selected) >= movableIds.length - 1} aria-label="Mover sección abajo" onClick={()=>moveSelected(1)}>↓</button>{draft?.type==="custom"&&<button type="button" className="delete-section" onClick={removeCustomSection}><Trash2/> Eliminar sección</button>}{draft && "enabled" in draft && <label className="toggle"><input type="checkbox" checked={draft.enabled !== false} onChange={event=>updateDraft(["enabled"],event.target.checked)}/><i/><span>Sección visible</span></label>}</div>}</div>
      {loadError && <div className="api-error" role="alert">{loadError}</div>}
      {notice && <div className="translation-message" role="status">{notice} <button type="button" className="secondary" onClick={goTranslations}>Ir a Traducciones</button></div>}
      {!document && !loadError && <div className="api-loading">Recuperando contenido desde la API…</div>}
      {readOnly ? <p className="read-only-field">Solo lectura. Esta sección forma parte del perfil institucional de El Salvador.</p> : <>
      {draft && <div className="editorial-actions editorial-workflow">
        <ol aria-label="Pasos para publicar">
          {["Guardar borrador", "Enviar a revisión", "Aprobar y publicar"].map((step, index)=>
            <li key={step} aria-current={index === currentStep ? "step" : undefined} data-completed={index < currentStep}>
              <span aria-hidden="true">{index < currentStep ? "✓" : index + 1}</span>{step}
            </li>)}
        </ol>
        <div className="editorial-next">
          <div role="status"><strong>{stepMessages[currentStep][0]}</strong><p>{stepMessages[currentStep][1]}</p></div>
          {dirty && <button type="button" className="primary" disabled={working} onClick={save}>Guardar borrador</button>}
          {!dirty && status === "draft" && <button type="button" className="primary" disabled={working} onClick={()=>changeStatus("review")}>Enviar a revisión</button>}
          {!dirty && status === "review" && <>
            <button type="button" className="secondary" disabled={working} onClick={()=>changeStatus("draft")}>Regresar a borrador</button>
            {publishingBlocked ? <button type="button" className="primary" onClick={goTranslations}>Ir a Traducciones</button>
              : <button type="button" className="primary" disabled={working} onClick={()=>changeStatus("approved")}>Aprobar y publicar</button>}
          </>}
        </div>
      </div>}
      {translationOffer && !dirty && <div className="translation-message">
        <span>Hay textos pendientes de traducir.</span>
        <button type="button" className="secondary" disabled={working} onClick={confirmTranslation}>Solicitar traducción</button>
      </div>}
      <div className="source-language language-choice"><Globe2/><div><small>IDIOMA ORIGINAL DE ESTA SECCIÓN</small><div className="language-options" role="group" aria-label="Idioma original de esta sección"><button type="button" className={locale === "es" ? "active" : ""} aria-pressed={locale === "es"} onClick={()=>chooseLocale("es")}>Español</button><button type="button" className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={()=>chooseLocale("en")}>Inglés</button></div><p>Estás redactando en {locale === "es" ? "español" : "inglés"}; revisarás el {locale === "es" ? "inglés" : "español"} en Traducciones.</p></div><ShieldCheck/></div>

      {draft?.type==="custom"&&<div className="block-toolbar"><span>Agregar bloque</span><button type="button" onClick={()=>addBlock("heading")}><Plus/> Subtítulo</button><button type="button" onClick={()=>addBlock("text")}><Plus/> Texto</button><button type="button" onClick={()=>addBlock("bullets")}><Plus/> Viñetas</button></div>}
      {draft && (selected === "consortium"
        ? <div className="consortium-editor">
          <div className="dynamic-fields consortium-editor-title">{renderFields(fields.filter(([key])=>["eyebrow","title"].includes(key)))}</div>
          <div className="dynamic-fields">{renderFields(fields.filter(([key])=>!["eyebrow","title"].includes(key)))}</div>
        </div>
        : <div className="dynamic-fields">{renderFields(fields)}</div>)}
      </>}
    </form></div>
  </div>;
}

function TranslationTree({ value, label, path, source, draft, onEdit }) {
  if (!Object.keys(source.fields).some(id => path.every((part, index) => JSON.parse(id)[index] === part))) return null;
  if (isLocalized(value)) {
    const original = value[source.sourceLocale];
    const leaf = (text, suffix = []) => {
      if (typeof text === "string") {
        const id = JSON.stringify([...path, source.targetLocale, ...suffix]);
        if (!(id in source.fields)) return null;
        return <div className="translation-field" key={id}><label htmlFor={`translation-${id}`}>{humanize(label)}{suffix.length ? ` · ${suffix.map(part => typeof part === "number" ? part + 1 : humanize(part)).join(" › ")}` : ""}</label><div><div className="translation-column"><strong>{source.sourceLocale === "es" ? "Español" : "Inglés"} original</strong><p lang={source.sourceLocale}>{text}</p></div><div className="translation-column"><strong>{source.targetLocale === "es" ? "Español" : "Inglés"} editable</strong><textarea id={`translation-${id}`} aria-label={`${humanize(label)} en ${source.targetLocale === "es" ? "español" : "inglés"}`} lang={source.targetLocale} value={draft[id] || ""} placeholder="Traducción pendiente" onChange={event => onEdit(id, event.target.value)}/></div></div></div>;
      }
      if (Array.isArray(text)) return text.map((item, index) => leaf(item, [...suffix, index]));
      if (text && typeof text === "object") return Object.entries(text).map(([key, item]) => leaf(item, [...suffix, key]));
      return null;
    };
    return leaf(original);
  }
  if (Array.isArray(value)) return <section className="field-group collection"><header><b>{humanize(label)}</b><span>{value.length} elementos</span></header>{value.map((item, index) => <div className="collection-item" key={item?.id || index}><div className="item-number">{String(index + 1).padStart(2, "0")}</div><TranslationTree value={item} label={`${humanize(label)} ${index + 1}`} path={[...path, index]} source={source} draft={draft} onEdit={onEdit}/></div>)}</section>;
  if (value && typeof value === "object") return <section className="field-group"><header><b>{humanize(label)}</b></header><div className="nested-fields">{Object.entries(value).map(([key, item]) => <TranslationTree key={key} value={item} label={key} path={[...path, key]} source={source} draft={draft} onEdit={onEdit}/>)}</div></section>;
  return null;
}

function TranslationsPage({ site, onDirtyChange }) {
  const [document, setDocument] = useState(null);
  const [selected, setSelected] = useState("hero");
  const [source, setSource] = useState(null);
  const [draft, setDraft] = useState({});
  const [jobs, setJobs] = useState({});
  const [decisions, setDecisions] = useState({});
  const [message, setMessage] = useState("");
  useEffect(() => { getCurrentContent().then(setDocument).catch(error => setMessage(error.message)); }, [site.id]);
  useEffect(() => {
    if (!document) return;
    let active = true;
    setSource(null); setJobs({}); setDecisions({}); setMessage("");
    getTranslationSection(selected).then(async result => {
      if (!active) return;
      setSource(result); setDraft(result.translatedFields);
      const latest = {};
      for (const ref of Object.values(result.metadata.translationJobs || {})) latest[ref.task] = ref;
      const restored = await Promise.all(Object.entries(latest).map(async ([task, ref]) => [task, await getTranslationJob(selected, ref.id).catch(() => null)]));
      if (active) setJobs(Object.fromEntries(restored.filter(([, job]) => job)));
    })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [document?.content, selected, site.id]);
  useEffect(() => {
    const pending = Object.entries(jobs).filter(([, job]) => ["queued", "running"].includes(job?.status));
    if (!pending.length) return;
    const timer = setTimeout(async () => {
      try {
        const results = await Promise.all(pending.map(async ([task, job]) => [task, await getTranslationJob(selected, job.id)]));
        setJobs(current => ({ ...current, ...Object.fromEntries(results) }));
      } catch (error) { setMessage(error.message); }
    }, 2200);
    return () => clearTimeout(timer);
  }, [jobs, selected]);
  const changed = source ? Object.keys(source.fields).filter(id => draft[id] !== source.translatedFields[id]) : [];
  useEffect(() => { onDirtyChange(changed.length > 0); return () => onDirtyChange(false); }, [changed.length > 0, onDirtyChange]);
  if (!document) return <div className="page api-loading">{message || "Recuperando traducciones…"}</div>;
  const sectionIds = (document.content.sectionOrder || Object.keys(document.content.sections)).filter(id => !staticSection(site.id, id));
  const locale = source?.sourceLocale || (site.id === "global" ? "en" : "es");
  const selectedSection = document.content.sections[selected];
  const selectedMeta = sectionLabels[selected] || [selectedSection?.title?.[locale] || "Sección sin título", "Sección personalizada"];
  const translationStatusLabels = { translation_pending: "Pendiente", queued: "En cola", running: "Analizando", review: "En revisión", approved: "Aprobada", stale: "Desactualizada", failed: "Error" };
  const ready = source && Object.keys(source.fields).length > 0 && Object.keys(source.fields).every(id => draft[id]?.trim());
  const proofreadIds = source?.needsReview ? Object.keys(source.fields).filter(id => draft[id]?.trim()) : changed;
  const proofreadReady = !proofreadIds.length || jobs.proofread?.status === "succeeded" && !jobs.proofread.stale && proofreadIds.every(id => decisions[id]);
  const busy = Object.values(jobs).some(job => ["queued", "running"].includes(job?.status));
  const fieldName = id => JSON.parse(id).filter(part => part !== source.targetLocale).join(" › ");
  function edit(id, text) { setDraft(current => ({ ...current, [id]: text })); setJobs(current => ({ ...current, proofread: null, review: null })); setDecisions({}); }
  async function start(task) {
    setMessage("");
    try {
      const fields = task === "proofread" ? Object.fromEntries(proofreadIds.map(id => [id, draft[id]])) : task === "review" ? draft : undefined;
      const job = await startTranslationJob(selected, task, fields, source.sourceHash, source.sourceLocale, source.targetLocale);
      setJobs(current => ({ ...current, [task]: job }));
    } catch (error) { setMessage(error.message); }
  }
  async function save(status) {
    setMessage("");
    try {
      const result = await saveTranslation(selected, draft, source.sourceHash, status, jobs.proofread?.id, decisions, source.sourceLocale, source.targetLocale);
      setSource(current => ({ ...current, metadata: result.metadata, translatedFields: draft, needsReview: false, missingFields: [] }));
      setMessage(status === "approved" ? "Traducción incorporada al borrador. Aprueba la sección en Contenido para publicarla." : "Propuesta guardada para revisión.");
    } catch (error) { setMessage(error.message); }
  }
  function decide(id, choice) {
    if (choice === "apply") setDraft(current => ({ ...current, [id]: jobs.proofread.result.fields[id] }));
    setDecisions(current => ({ ...current, [id]: choice }));
  }
  return <div className="page content-page translations-page"><div className="editor-head"><div><div><span className="eyebrow">TRADUCCIONES · {site.name.toUpperCase()}</span><h1>{locale.toUpperCase()} → {source?.targetLocale?.toUpperCase() || (locale === "es" ? "EN" : "ES")}</h1></div></div><span>Una propuesta nunca se publica automáticamente.</span></div>
    {message && <p className="translation-message" role="status">{message}</p>}
    <p className="mobile-section-hint">← Desliza para ver más secciones →</p><div className="editor-layout"><aside className="section-list" aria-label="Secciones de la página"><div><b>SECCIONES DE LA PÁGINA</b><span>Selecciona para comparar idiomas</span></div>{sectionIds.map(id => { const section = document.content.sections[id]; const [title, desc] = sectionLabels[id] || [section?.title?.[locale] || id, "Sección personalizada"]; const state = document.editorial?.[id]?.translations?.[locale === "es" ? "en" : "es"]?.status; return <button type="button" key={id} className={selected === id ? "active" : ""} onClick={() => { if (!changed.length || window.confirm("Hay cambios sin guardar. ¿Cambiar de sección?")) setSelected(id); }}><GripVertical/><span><b>{title}</b><small>{desc}</small></span><i>{translationStatusLabels[state] || "Pendiente"}</i></button>; })}</aside>
      <div className="editor-form dynamic-editor"><div className="form-title"><div><span className="eyebrow">SECCIÓN {String(sectionIds.indexOf(selected) + 1).padStart(2, "0")}</span><h2>{selectedMeta[0]}</h2><p>{selectedMeta[1]}</p></div></div>
        {source && <><div className="source-language"><Languages/><span><small>COMPARACIÓN 1:1</small><b>{source.sourceLocale.toUpperCase()} original | {source.targetLocale.toUpperCase()} editable</b></span><ShieldCheck/></div>
          <div className="translation-tools"><span>Publicación: {source.metadata.status === "approved" ? "Aprobada" : source.metadata.status === "review" ? "En revisión" : "Borrador"} · Traducción: {translationStatusLabels[source.metadata.translations?.[source.targetLocale]?.status] || "Pendiente"}{source.needsReview ? " · Revisar texto existente" : source.missingFields.length ? ` · ${source.missingFields.length} campos faltantes/desactualizados` : " · Completa"}</span>{source.missingFields.length ? <button type="button" className="primary" disabled={busy} onClick={() => start("translate")}>Traducir campos faltantes</button> : source.needsReview ? <button type="button" className="primary" onClick={() => window.document.querySelector(".translation-field textarea")?.focus()}>Revisar traducción existente</button> : <button type="button" className="secondary" disabled title="Todos los campos ya tienen traducción vigente">Traducción al día</button>}<button type="button" className="secondary" disabled={!proofreadIds.length || busy || !ready} title={!proofreadIds.length ? "Edita un texto o revisa una traducción existente" : !ready ? "Completa los campos vacíos primero" : ""} onClick={() => start("proofread")}>Revisar ortografía</button><button type="button" className="secondary" disabled={!ready || busy} title={!ready ? "Completa los campos antes de revisar fidelidad" : ""} onClick={() => start("review")}>Revisar fidelidad con IA</button></div>
          {Object.entries(jobs).map(([task, job]) => job && <div className="translation-job" key={task} role="status"><b>{task === "translate" ? "Traducción" : task === "proofread" ? "Ortografía" : "Revisión"}:</b> {job.status === "queued" ? "En cola" : job.status === "running" ? "Analizando" : job.status === "succeeded" ? "Propuesta lista" : "Falló"}{job.stale && " · El original cambió"}{job.error && ` · ${job.error}`}{task === "translate" && job.status === "succeeded" && !job.stale && <button type="button" onClick={() => { setDraft(current => ({ ...current, ...job.result.fields })); setJobs(current => ({ ...current, translate: null, proofread: null })); setDecisions({}); }}>Usar propuesta</button>}{task === "review" && job.status === "succeeded" && !job.stale && <ul>{job.result.issues.length ? job.result.issues.map((issue, index) => <li key={index}>{fieldName(issue.field)}: {issue.message}</li>) : <li>Sin observaciones automáticas; requiere revisión humana.</li>}</ul>}</div>)}
          {jobs.proofread?.status === "succeeded" && !jobs.proofread.stale && proofreadIds.map(id => <div className="proofread-choice" key={id}><b>{fieldName(id)}</b><p>Actual: {draft[id]}</p><p>Sugerencia: {jobs.proofread.result.fields[id]}</p><button type="button" className={decisions[id] === "apply" ? "primary" : "secondary"} onClick={() => decide(id, "apply")}>Aplicar corrección</button><button type="button" className={decisions[id] === "keep" ? "primary" : "secondary"} onClick={() => decide(id, "keep")}>Conservar texto</button></div>)}
          <div className="dynamic-fields">{Object.entries(source.section).filter(([key]) => !["enabled", "type"].includes(key)).map(([key, value]) => <TranslationTree key={key} value={value} label={key} path={[key]} source={source} draft={draft} onEdit={edit}/>)}</div>
          {!Object.keys(source.fields).length && <p>Esta sección no tiene textos traducibles.</p>}
          <div className="translation-actions"><button type="button" className="secondary" disabled={!changed.length} onClick={() => { setDraft(source.translatedFields); setJobs({}); setDecisions({}); }}>Descartar propuesta</button><button type="button" className="secondary" disabled={!ready || !proofreadReady || busy} onClick={() => save("review")}>Guardar para revisión</button><button type="button" className="primary" disabled={!ready || changed.length > 0 || source.needsReview || source.metadata.translations?.[source.targetLocale]?.status !== "review"} onClick={() => save("approved")}>Aprobar traducción (no publica)</button></div>
          {proofreadIds.length > 0 && !proofreadReady && <p className="translation-hint">Antes de guardar, revisa ortografía y confirma cada sugerencia.</p>}
        </>}
      </div></div>
  </div>;
}

function Placeholder({ title }) {
  const Icon = nav.find(([name]) => name === title)?.[1] || BarChart3;
  return <div className="page placeholder"><div className="placeholder-card"><span><Icon/></span><p className="eyebrow">MÓDULO DEL EDITOR</p><h1>{title}</h1><p>Esta sección está preparada para conectarse con la API y el flujo editorial en la siguiente etapa.</p></div></div>;
}

function RichTextEditor({ initialValue, onChange, invalid }) {
  const editor = useRef(null);
  const initialHtml = useRef(initialValue);
  useLayoutEffect(() => { editor.current.innerHTML = initialHtml.current || ""; }, []);
  function command(name, argument = null) { editor.current?.focus(); window.document.execCommand(name, false, argument); onChange(editor.current?.innerHTML || ""); }
  return <div className="rich-editor"><div className="rich-toolbar" role="toolbar" aria-label="Formato del contenido">
    <select aria-label="Fuente" defaultValue="Arial" onChange={event=>command("fontName",event.target.value)}><option>Arial</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option><option>Courier New</option></select>
    <select aria-label="Tamaño" defaultValue="3" onChange={event=>command("fontSize",event.target.value)}><option value="1">10</option><option value="2">12</option><option value="3">14</option><option value="4">18</option><option value="5">24</option><option value="6">32</option></select>
    <button type="button" title="Negritas" onClick={()=>command("bold")}><b>B</b></button><button type="button" title="Cursiva" onClick={()=>command("italic")}><i>I</i></button><button type="button" title="Subrayado" onClick={()=>command("underline")}><u>U</u></button>
    <button type="button" title="Título" onClick={()=>command("formatBlock","h2")}>H2</button><button type="button" title="Párrafo" onClick={()=>command("formatBlock","p")}>¶</button><button type="button" title="Lista con viñetas" onClick={()=>command("insertUnorderedList")}>• Lista</button><button type="button" title="Lista numerada" onClick={()=>command("insertOrderedList")}>1. Lista</button>
    <button type="button" title="Alinear a la izquierda" onClick={()=>command("justifyLeft")}>≡</button><button type="button" title="Centrar" onClick={()=>command("justifyCenter")}>≡</button><button type="button" title="Añadir enlace" onClick={()=>{const url=window.prompt("Dirección del enlace");if(url)command("createLink",url)}}>🔗</button><button type="button" title="Quitar formato" onClick={()=>command("removeFormat")}>Tx</button>
  </div><div ref={editor} className="rich-editor-area" contentEditable suppressContentEditableWarning
    role="textbox" aria-labelledby="publication-content-label" aria-multiline="true" aria-required="true"
    aria-invalid={invalid || undefined} aria-describedby={invalid ? "publication-content-error" : undefined}
    data-placeholder="Escribe el contenido completo de la publicación…" onInput={event=>onChange(event.currentTarget.innerHTML)}/></div>;
}

const emptyPublication = () => ({ id:"", title:{es:"",en:"",pt:"",fr:""}, category:{es:"Noticias",en:"News",pt:"Notícias",fr:"Actualités"}, image:{src:"",alt:{es:"",en:"",pt:"",fr:""}}, detail:{date:new Date().toLocaleDateString("en-CA"),kind:"news",sourceUrl:"",summary:"",contentHtml:""} });
const escapeHtml = text => String(text || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const legacyPublicationHtml = sections => (sections || []).map(block => `${block.heading?`<h2>${escapeHtml(block.heading)}</h2>`:""}${(block.paragraphs||[]).map(text=>`<p>${escapeHtml(text)}</p>`).join("")}${block.bullets?.length?`<ul>${block.bullets.map(text=>`<li>${escapeHtml(text)}</li>`).join("")}</ul>`:""}`).join("");

function PublicationsPage({ site, onDirtyChange }) {
  const [items,setItems]=useState([]),[draft,setDraft]=useState(null),[original,setOriginal]=useState(null),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const [contentError, setContentError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  useEffect(()=>{getPublications().then(result=>setItems(result.publications)).catch(reason=>setError(reason.message))},[site.id]);
  const dirty=Boolean(draft&&JSON.stringify(draft)!==JSON.stringify(original));
  useEffect(()=>{onDirtyChange(dirty);return()=>onDirtyChange(false)},[dirty,onDirtyChange]);
  function edit(item){const next=structuredClone(item);if(next.inherited){next.originalId=next.id;next.id=`${site.id}-${next.id}`.slice(0,80);delete next.inherited}next.detail||={date:new Date().toLocaleDateString("en-CA"),kind:"news",sourceUrl:"",summary:"",contentHtml:""};next.detail.contentHtml ||= legacyPublicationHtml(next.detail.sections);setDraft(next);setOriginal(structuredClone(next));setMessage("");setError("")}
  function create(){const next=emptyPublication();setDraft(next);setOriginal(structuredClone(next));setMessage("");setError("")}
  function closeEditor() {
    if (busy || (dirty && !window.confirm("Hay cambios sin guardar. ¿Salir del editor?"))) return;
    setDraft(null);
    setOriginal(null);
    setError("");
    setContentError(false);
  }
  function change(path,value){setDraft(current=>{const next=structuredClone(current);let cursor=next;path.slice(0,-1).forEach(key=>cursor=cursor[key]);cursor[path.at(-1)]=value;return next})}
  async function imagePicked(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setBusy(true);
    setUploadingImage(true);
    setError("");
    try {
      const { src } = await uploadPublicationImage(file);
      change(["image","src"], src);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setUploadingImage(false);
      setBusy(false);
    }
  }
  async function submit(event){
    event.preventDefault();
    if (busy) return;
    setError("");
    const content = event.currentTarget.querySelector(".rich-editor-area");
    if (!content.textContent.trim()) {
      setContentError(true);
      content.focus();
      return;
    }
    setContentError(false);
    const id=draft.id||`${site.id}-${draft.title.es.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)}-${Date.now().toString().slice(-5)}`;
    const next = { ...draft, id, detail: { ...draft.detail } };
    if (original?.detail.sections && draft.detail.summary === original.detail.summary
        && draft.detail.contentHtml === legacyPublicationHtml(original.detail.sections)) {
      delete next.detail.contentHtml;
    }
    setBusy(true);try{const result=await savePublication(next);setItems(current=>[result.publication,...current.filter(item=>item.id!==id)]);setDraft(null);setOriginal(null);setMessage("Publicación guardada. Ya forma parte de la plantilla del sitio.")}catch(reason){setError(reason.message)}finally{setBusy(false)}}
  async function remove(item){if(!window.confirm(`¿Eliminar “${item.title.es}”?`))return;setBusy(true);try{await deletePublication(item.id);setItems(current=>current.filter(currentItem=>currentItem.id!==item.id));if(draft?.id===item.id)setDraft(null);setMessage("Publicación eliminada.")}catch(reason){setError(reason.message)}finally{setBusy(false)}}
  if(draft)return <div className="page publications-page"><div className="publication-editor-head"><button className="secondary" disabled={busy} onClick={closeEditor}>← Volver</button><div><span className="eyebrow">PUBLICACIONES · {site.name.toUpperCase()}</span><h1>{draft.id?"Editar publicación":"Nueva publicación"}</h1></div></div>{error&&<div className="api-error" role="alert">{error}</div>}<form className="publication-form" onSubmit={submit}>
    <section className="publication-fields"><div className="form-pair"><label className="field"><span>Tipo de publicación</span><select value={draft.detail.kind} onChange={event=>{const kind=event.target.value;change(["detail","kind"],kind);change(["category"],kind==="news"?{es:"Noticias",en:"News",pt:"Notícias",fr:"Actualités"}:{es:"Artículo",en:"Article",pt:"Artigo",fr:"Article"})}}><option value="news">Noticia</option><option value="article">Artículo</option></select></label><label className="field"><span>Fecha</span><input type="date" required value={draft.detail.date} onChange={event=>change(["detail","date"],event.target.value)}/></label></div>
    <label className="field"><span>Título</span><input required value={draft.title.es} onChange={event=>change(["title","es"],event.target.value)} placeholder="Título de la publicación"/></label><details className="publication-locales"><summary>Títulos y textos alternativos en otros idiomas</summary>
    {[["en", "Inglés"], ["pt", "Portugués"], ["fr", "Francés"]].map(([code, language]) => <div className="form-pair" key={code}>
      <label className="field"><span>Título · {language}</span><input value={draft.title[code] ?? ""} onChange={event=>change(["title",code],event.target.value)}/></label>
      <label className="field"><span>Texto alternativo · {language}</span><input value={draft.image.alt[code] ?? ""} onChange={event=>change(["image","alt",code],event.target.value)}/></label>
    </div>)}</details>
    <label className="field"><span>Resumen breve</span><textarea required rows="4" value={draft.detail.summary} onChange={event=>change(["detail","summary"],event.target.value)} placeholder="Texto que introduce la publicación"/></label><div className="field"><span id="publication-content-label">Contenido</span>
      <RichTextEditor initialValue={draft.detail.contentHtml} invalid={contentError} onChange={value=>{
        setContentError(false);
        change(["detail","contentHtml"],value);
      }}/>
      {contentError && <p id="publication-content-error" className="api-error" role="alert">Completa el contenido de la publicación.</p>}
    </div><label className="field"><span>Enlace de fuente <small>Opcional</small></span><input type="url" value={draft.detail.sourceUrl} onChange={event=>change(["detail","sourceUrl"],event.target.value)} placeholder="https://…"/></label></section>
    <aside className="publication-media"><h2>Imagen principal</h2><label className="image-drop">{draft.image.src?<img src={draft.image.src} alt="Vista previa"/>:<><Newspaper/><b>Selecciona una imagen</b><span>JPG, PNG, WEBP o GIF · máximo 5 MB</span></>}<input type="file" aria-label="Cambiar imagen principal" disabled={busy} accept="image/jpeg,image/png,image/webp,image/gif" onChange={imagePicked}/>{uploadingImage && <ImageUploadStatus/>}</label><label className="field"><span>Texto alternativo</span><input value={draft.image.alt.es} onChange={event=>change(["image","alt","es"],event.target.value)} placeholder="Describe la imagen"/></label><div className="publication-save"><span>{dirty?"Cambios sin guardar":"Sin cambios pendientes"}</span><button className="primary" disabled={busy}>{uploadingImage ? "Subiendo imagen…" : busy ? "Guardando…" : "Guardar publicación"}</button></div></aside>
  </form></div>;
  return <div className="page publications-page"><div className="page-heading"><div><span className="eyebrow">CONTENIDO EDITORIAL</span><h1>Publicaciones</h1><p>Crea noticias y artículos con la misma plantilla del sitio.</p></div><button className="primary" onClick={create}><Plus/> Nueva publicación</button></div>{items.some(item=>item.inherited)&&<div className="translation-message">Estas publicaciones se heredan de Global. Al editar o crear una, {site.name} tendrá su propia colección independiente.</div>}{message&&<div className="translation-message">{message}</div>}{error&&<div className="api-error" role="alert">{error}</div>}<div className="publications-admin-grid">{items.map(item=><article className="publication-admin-card" key={item.id}><div className="publication-admin-image">{item.image?.src?<img src={item.image.src} alt={item.image.alt?.es||item.title.es}/>:<Newspaper/>}</div><div><span className={`publication-kind ${item.detail?.kind||"news"}`}>{item.detail?.kind==="article"?"Artículo":"Noticia"}</span>{item.inherited&&<span className="inherited-publication">Global</span>}<time>{item.detail?.date?new Date(`${item.detail.date}T12:00:00`).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}):"Sin fecha"}</time><h2>{item.title.es}</h2><p>{item.detail?.summary||"Esta publicación usa la plantilla anterior; ábrela para completar su resumen y contenido editable."}</p></div><footer><button className="secondary" onClick={()=>edit(item)}>Editar</button>{!item.inherited&&<button className="delete-publication" disabled={busy} onClick={()=>remove(item)}>Eliminar</button>}</footer></article>)}{!items.length&&<div className="empty-publications"><Newspaper/><h2>Aún no hay publicaciones propias</h2><p>Crea la primera noticia o artículo para {site.name}.</p></div>}</div></div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("Resumen");
  const [open, setOpen] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  useEffect(() => { restoreSession().then(restored => { setUser(restored); setReady(true); }); }, []);
  useEffect(() => { if (!unsaved) return; const warn = event => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [unsaved]);
  function navigate(next) { if (next === active) return true; if (unsaved && !window.confirm("Hay cambios sin guardar. ¿Salir sin guardarlos?")) return false; setUnsaved(false); setActive(next); return true; }
  const site = user ? sites.find(item => item.id === user.siteId) : null;
  const screen = !user ? null : active === "Resumen" ? <Overview goContent={() => navigate("Contenido")} user={user} site={site}/> : active === "Contenido" ? <ContentPage site={site} onDirtyChange={setUnsaved} goTranslations={() => navigate("Traducciones")}/> : active === "Publicaciones" ? <PublicationsPage site={site} onDirtyChange={setUnsaved}/> : active === "Traducciones" ? <TranslationsPage site={site} onDirtyChange={setUnsaved}/> : <Placeholder title={active}/>;
  if (!ready) return <div className="app-loading"><Logo/><span>Conectando con AUDITAXES API…</span></div>;
  if (!user) return <Login onLogin={setUser}/>;
  async function logout(){ if (unsaved && !window.confirm("Hay cambios sin guardar. ¿Cerrar sesión sin guardarlos?")) return; try { await closeApiSession(); } catch { /* La sesión local se borra aunque el servidor no responda. */ } finally { setUser(null); setUnsaved(false); setActive("Resumen"); } }
  return <div className="app-shell"><Sidebar active={active} setActive={navigate} open={open} setOpen={setOpen} user={user} site={site}/><div className="main-shell"><Topbar title={active} openMenu={() => setOpen(true)} logout={logout}/>{screen}</div>{open && <button className="overlay" onClick={() => setOpen(false)} aria-label="Cerrar menú"/>}</div>;
}

createRoot(document.getElementById("root")).render(<App/>);
