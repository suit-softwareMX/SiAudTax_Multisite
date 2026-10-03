import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, Check, ChevronDown, CircleHelp,
  Clock3, FileText, Globe2, GripVertical, Languages, LayoutDashboard, LockKeyhole, LogOut,
  Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Settings, ShieldCheck,
  Sparkles, Trash2, Users, X
} from "lucide-react";
import "./styles.css";
import { createSection, deleteSection, getCurrentContent, getFieldAiJob, getInferenceHealth, getTranslationJob, getTranslationSection, login, logout as closeApiSession, restoreSession, saveSection, saveSectionOrder, saveTranslation, startFieldAiJob, startTranslationJob, updateSectionStatus } from "./api";

const DEMO_PASSWORD = "Auditaxes2026";
const demoUsers = [
  { id: "global", name: "Andrea Méndez", initials: "AM", role: "Administradora Global", email: "global@auditaxes.com", password: DEMO_PASSWORD },
  { id: "mexico", name: "Carlos Rivera", initials: "CR", role: "Administrador México", email: "mexico@auditaxes.com", password: DEMO_PASSWORD },
  { id: "salvador", name: "Sofía Hernández", initials: "SH", role: "Administradora El Salvador", email: "salvador@auditaxes.com", password: DEMO_PASSWORD },
];

const sites = [
  { id: "global", short: "GL", name: "AUDITAXES Global", locale: "Inglés", domain: "auditaxes.suitmx.com", accent: "blue" },
  { id: "mexico", short: "MX", name: "AUDITAXES México", locale: "Español", domain: "mexico-auditaxes.suitmx.com", accent: "green" },
  { id: "salvador", short: "SV", name: "AUDITAXES El Salvador", locale: "Español", domain: "elsalvador-auditaxes.suitmx.com", accent: "cyan" },
];

function Logo({ light = false }) {
  return <div className={`logo ${light ? "light" : ""}`} aria-label="AUDITAXES"><strong>AUDI</strong><span>TAXES</span><i>◎</i></div>;
}

function LoginLogo() {
  return <img className="login-brand-logo" src="/images/auditaxes-panama-logo-transparent.png" alt="Auditaxes Panamá — Audit, Tax, Consulting, Outsourcing" />;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try { onLogin(await login(email, password)); }
    catch (reason) { setError(reason.message); }
  }

  return <main className="login-shell">
    <section className="login-story">
      <div className="story-top"><LoginLogo /><span>PORTAL EDITORIAL</span></div>
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
          <label>Contraseña<div className="password-field"><input type={show ? "text" : "password"} value={password} onChange={e => {setPassword(e.target.value); setError("")}} placeholder="••••••••••••" autoComplete="current-password" required /><button type="button" onClick={() => setShow(!show)} aria-label="Mostrar contraseña">{show ? <X/> : <LockKeyhole/>}</button></div></label>
          {error && <p className="login-error">{error}</p>}
          <div className="form-row"><label className="check"><input type="checkbox" /> <span>Recordarme</span></label><button type="button" className="link-button">¿Olvidaste tu contraseña?</button></div>
          <button className="primary login-button">Ingresar al editor <ArrowRight /></button>
        </form>
        <div className="demo-note accounts-note"><ShieldCheck/><div><b>Cuentas provisionales</b>{demoUsers.map(user => <button type="button" key={user.id} onClick={() => {setEmail(user.email); setPassword(DEMO_PASSWORD); setError("")}}><span>{user.role}</span><small>{user.email}</small></button>)}<em>Contraseña común: {DEMO_PASSWORD}</em></div></div>
        <footer>¿Necesitas ayuda? <button>Contacta al administrador</button></footer>
      </div>
    </section>
  </main>;
}

const nav = [
  ["Resumen", LayoutDashboard], ["Contenido", FileText], ["Traducciones", Languages],
  ["Configuración", Settings]
];

function Sidebar({ active, setActive, open, setOpen, user, site }) {
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="sidebar-head"><Logo light/><button onClick={() => setOpen(false)}><PanelLeftClose/></button></div>
    <div className="workspace"><span>ESPACIO DE TRABAJO</span><button><i>{site.short}</i><span><b>{site.name}</b><small>{site.locale} · Sitio asignado</small></span><ShieldCheck/></button></div>
    <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => {setActive(label); setOpen(false)}}><Icon/><span>{label}</span></button>)}</nav>
    <div className="sidebar-help"><CircleHelp/><div><b>Centro de ayuda</b><span>Guías y soporte</span></div><ArrowRight/></div>
    <div className="user-card"><span>{user.initials}</span><div><b>{user.name}</b><small>{user.role}</small></div><MoreHorizontal/></div>
  </aside>;
}

function Topbar({ title, openMenu, logout }) {
  return <header className="topbar"><button className="menu-button" aria-label="Abrir menú" onClick={openMenu}><Menu/></button><div><span>ADMINISTRACIÓN</span><b>{title}</b></div><div className="top-actions"><label><Search/><input placeholder="Buscar contenido…"/><kbd>⌘ K</kbd></label><button className="icon-button"><Bell/><i/></button><button className="logout" onClick={logout} title="Cerrar sesión"><LogOut/></button></div></header>;
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
  const translations = site.id === "global" ? 0 : values.filter(item => item.translations?.en?.status === "translation_pending").length;
  const lastApproval = values.map(item => item.approvedAt).filter(Boolean).sort().at(-1);
  const progress = values.length ? Math.round(100 * values.filter(item => item.status === "approved").length / values.length) : 0;
  return <div className="page overview">
    <div className="page-heading"><div><span className="eyebrow">{new Date().toLocaleDateString("es-MX", { dateStyle: "full" }).toUpperCase()}</span><h1>Buenos días, {user.name.split(" ")[0]}.</h1><p>Este es el estado actual de {site.name}.</p></div><button className="primary" onClick={goContent}><Plus/> Nuevo contenido</button></div>
    {error && <p className="api-error">{error}</p>}
    <section className="stats-grid">
      <Stat label="Sitio asignado" value="1" detail={site.domain} icon={Globe2} tone="blue"/>
      <Stat label="Borradores" value={document ? String(drafts) : "…"} detail={`${review} en revisión`} icon={FileText} tone="green"/>
      <Stat label="Traducciones pendientes" value={document ? String(translations) : "…"} detail="Español a inglés" icon={Languages} tone="violet"/>
      <Stat label="Última aprobación" value={lastApproval ? new Date(lastApproval).toLocaleDateString("es-MX") : "—"} detail={site.name} icon={Clock3} tone="sand"/>
    </section>
    <section className="sites-section"><div className="section-heading"><div><h2>Tu sitio</h2><p>Tu cuenta tiene acceso exclusivo a este mercado.</p></div><span className="scope-badge"><LockKeyhole/> Acceso limitado por credencial</span></div><div className="site-grid single-site">
      <article className="site-card" key={site.id}><div className="site-card-top"><span className={`flag ${site.accent}`}>{site.short}</span><button><MoreHorizontal/></button></div><h3>{site.name}</h3><a>{site.domain}</a><div className="meta"><span>Idioma predeterminado del sitio</span><b>{site.locale}</b></div><div className="status-row"><span className={drafts || review ? "pending" : "published"}>{drafts || review ? "Cambios pendientes" : "Sin cambios pendientes"}</span><small>{values.length} secciones</small></div><div className="progress"><i style={{width: `${progress}%`}}/></div><button className="manage" onClick={goContent}>Administrar contenido <ArrowRight/></button></article>
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
const fieldLabels = { eyebrow:"Etiqueta superior", title:"Título", body:"Descripción", intro:"Introducción", label:"Etiqueta", href:"Enlace", src:"Imagen", alt:"Texto alternativo", name:"Nombre", role:"Cargo", email:"Correo electrónico", phone:"Teléfono", address:"Dirección", value:"Valor", suffix:"Sufijo", items:"Elementos", people:"Personas", stats:"Indicadores", steps:"Pasos", links:"Enlaces", social:"Redes sociales" };
const humanize = key => fieldLabels[key] || key.replace(/([A-Z])/g," $1").replace(/^./,letter=>letter.toUpperCase());
const isLocalized = value => value && typeof value === "object" && !Array.isArray(value) && localeKeys.some(key => key in value);

function FieldAi({ sectionId, path, text, value, onChange, sourceLocale }) {
  const [open, setOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState("");
  const [chosenLocale, setChosenLocale] = useState(null);
  const running = ["queued", "running"].includes(job?.status);
  const stale = !!job && text !== origin;
  const targetLocale = job?.task === "translate" ? (chosenLocale === "es" ? "en" : "es") : null;
  async function launch(task, sourceLocale = null, snapshot = text) {
    setError(""); setJob(null); setOrigin(snapshot);
    if (task === "detect_language") { setChosenLocale(null); }
    else setChosenLocale(sourceLocale);
    try { setJob({ ...await startFieldAiJob(sectionId, path, snapshot, task, sourceLocale), task }); }
    catch (reason) { setError(reason.message); }
  }
  function choose(action) {
    setOpen(true); setPendingAction(null);
    launch(action, action === "detect_language" ? null : sourceLocale);
  }
  useEffect(() => {
    if (!running) return;
    let active = true;
    const timer = setInterval(async () => {
      try {
        const result = await getFieldAiJob(sectionId, job.id);
        if (active) setJob(result);
      } catch (reason) { if (active) { setError(reason.message); setJob(null); } }
    }, 1800);
    return () => { active = false; clearInterval(timer); };
  }, [job?.id, job?.status, sectionId]);
  useEffect(() => {
    if (job?.status !== "succeeded" || job.task !== "detect_language" || !pendingAction || stale) return;
    if (job.result.locale !== "unknown") { const action = pendingAction; setPendingAction(null); launch(action, job.result.locale, origin); }
  }, [job?.status, job?.task, job?.result?.locale, pendingAction, stale]);
  const proposal = job?.result?.fields?.field;
  const status = job?.status === "queued" ? "En cola" : job?.status === "running" ? "Analizando" : job?.status === "failed" ? "No se pudo analizar" : job?.status === "succeeded" ? "Propuesta lista" : "";
  const actionName = job?.task === "translate" ? "Traduciendo" : job?.task === "proofread" ? "Puliendo el texto" : "Leyendo el idioma";
  return <div className="field-ai">
    <button type="button" className="field-ai-trigger" aria-expanded={open} onClick={() => setOpen(!open)}><Sparkles/> Ayuda con IA</button>
    {open && <div className={`field-ai-panel${running ? " is-running" : ""}${job?.status === "succeeded" ? " is-ready" : ""}`}>
      <div className="field-ai-menu"><button type="button" disabled={running || !text.trim()} onClick={() => choose("proofread")}>Revisar ortografía</button><button type="button" disabled={running || !text.trim()} onClick={() => choose("detect_language")}>Detectar idioma</button><button type="button" disabled={running || !text.trim()} onClick={() => choose("translate")}>Traducir</button></div>
      {running && <div className="field-ai-scene" aria-hidden="true"><div className="field-ai-orbit"><Sparkles/></div><div className="field-ai-scene-copy"><b>{actionName}</b><span>{job.status === "queued" ? "Esperando turno en la cola" : "Preparando una propuesta para que tú decidas"}</span></div><div className="field-ai-progress"><i/></div></div>}
      {status && <p className="field-ai-status" role="status">{status}{running ? "…" : ""}{job?.status === "failed" ? job.error === "model_unavailable" ? " · Ollama no responde. Revisa el servicio e intenta de nuevo." : " · Intenta de nuevo" : ""}</p>}
      {error && <p className="field-ai-error" role="alert">{error}</p>}
      {stale && <p className="field-ai-error" role="status">El texto cambió. Vuelve a ejecutar la acción para usar una propuesta actual.</p>}
      {job?.status === "succeeded" && job.task === "detect_language" && !stale && (job.result.locale === "unknown" ? <div className="field-ai-choose"><p>No estoy seguro del idioma. Elige el idioma del texto:</p><button type="button" onClick={() => pendingAction ? (setPendingAction(null), launch(pendingAction, "es", origin)) : setChosenLocale("es")}>Español</button><button type="button" onClick={() => pendingAction ? (setPendingAction(null), launch(pendingAction, "en", origin)) : setChosenLocale("en")}>Inglés</button></div> : <p className="field-ai-language">Idioma detectado: <b>{job.result.locale === "es" ? "Español" : "Inglés"}</b></p>)}
      {proposal && !stale && <div className="field-ai-compare"><div><small>ORIGINAL · {chosenLocale?.toUpperCase()}</small><p>{origin}</p></div><div><small>{job.task === "translate" ? `TRADUCCIÓN · ${targetLocale?.toUpperCase()}` : "CORRECCIÓN PROPUESTA"}</small><p className="field-ai-typing" key={job.id}>{proposal}</p>{job.task === "translate" && value[targetLocale] && <small>Reemplazará el borrador actual en {targetLocale?.toUpperCase()}: {value[targetLocale]}</small>}</div><div className="field-ai-decisions"><button type="button" className="secondary" onClick={() => setJob(null)}>Descartar</button><button type="button" className="primary" onClick={() => { if (job.task === "translate") { onChange([...path.slice(0,-1), chosenLocale], origin); onChange([...path.slice(0,-1), targetLocale], proposal); } else onChange(path, proposal); setJob(null); setOpen(false); }}>Aplicar al borrador</button></div></div>}
    </div>}
  </div>;
}

function ValueEditor({ value, label, path, locale, onChange, onRemove, sectionId }) {
  if (isLocalized(value)) {
    const text = value[locale] || "";
    const id = `field-${sectionId}-${path.join("-")}`;
    const aiEligible = sectionId === "hero" && ["eyebrow", "title", "body", "action.label"].includes(path.join("."));
    return <div className="field dynamic-field"><label htmlFor={id}>{humanize(label)} <small>{locale === "es" ? "Español" : "Inglés"} · original</small></label><textarea id={id} lang={locale} rows={text.length > 140 ? 5 : 3} value={text} onChange={event => onChange([...path, locale], event.target.value)}/>{aiEligible && <FieldAi sectionId={sectionId} path={[...path, locale]} text={text} value={value} onChange={onChange} sourceLocale={locale}/>}</div>;
  }
  if (Array.isArray(value)) {
    return <section className="field-group collection"><header><b>{humanize(label)}</b><span>{value.length} elementos</span></header>{value.map((item,index)=><div className="collection-item" key={item?.id || index}><div className="item-number">{String(index+1).padStart(2,"0")}{item?.id && <small>{item.id}</small>}<button type="button" className="remove-item" onClick={()=>onRemove([...path,index])} title="Eliminar elemento"><Trash2/></button></div><ValueEditor value={item} label={`${humanize(label)} ${index+1}`} path={[...path,index]} locale={locale} onChange={onChange} onRemove={onRemove} sectionId={sectionId}/></div>)}</section>;
  }
  if (value && typeof value === "object") {
    return <section className="field-group"><header><b>{humanize(label)}</b></header><div className="nested-fields">{Object.entries(value).map(([key,nested])=><ValueEditor key={key} value={nested} label={key} path={[...path,key]} locale={locale} onChange={onChange} onRemove={onRemove} sectionId={sectionId}/>)}</div></section>;
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
  const [translatePrompt, setTranslatePrompt] = useState(null);
  const [localePrompt, setLocalePrompt] = useState(null);
  const [writingLocale, setWritingLocale] = useState(site.id === "global" ? "en" : "es");
  const [notice, setNotice] = useState("");
  useEffect(() => { getCurrentContent().then(result => { setDocument(result); setEditorial(result.editorial || {}); }).catch(reason => setLoadError(reason.message)); }, [site.id]);
  const locale = writingLocale;
  const sectionIds = document ? (document.content.sectionOrder || Object.keys(document.content.sections)) : [];
  const sections = document ? sectionIds.map(id => { const section=document.content.sections[id]; const customTitle=section?.title?.[locale] || id; return [id, ...(sectionLabels[id] || [customTitle, "Sección personalizada"])]; }) : [];
  const selectedIndex = Math.max(0, sections.findIndex(([id]) => id === selected));
  const selectedMeta = sections[selectedIndex] || [selected, selected, "Sección de contenido"];
  const contentLoaded = Boolean(document);
  useEffect(() => { const section=document?.content.sections[selected]; setDraft(section ? structuredClone(section) : null); setWritingLocale(editorial[selected]?.sourceLocale || document?.sourceLocale || (site.id === "global" ? "en" : "es")); setSaveState("idle"); setNotice(""); }, [contentLoaded, selected, site.id]);
  const dirty = Boolean(draft && document?.content.sections[selected] && (JSON.stringify(draft) !== JSON.stringify(document.content.sections[selected]) || locale !== (editorial[selected]?.sourceLocale || document.sourceLocale)));
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  function selectSection(id) { if (id !== selected && dirty && !window.confirm("Hay cambios sin guardar en esta sección. ¿Cambiar sin guardarlos?")) return; setSelected(id); }
  function chooseLocale(next) {
    if (next === locale) return;
    if (draft && Object.values(draft).some(value => value && typeof value === "object")) setLocalePrompt(next);
    else setWritingLocale(next);
  }
  function updateDraft(path, value) {
    setDraft(current => { const next=structuredClone(current); let cursor=next; path.slice(0,-1).forEach(key=>{cursor=cursor[key]}); cursor[path.at(-1)]=value; return next; });
  }
  function removeDraftItem(path) {
    setDraft(current => { const next=structuredClone(current); let cursor=next; path.slice(0,-1).forEach(key=>{cursor=cursor[key]}); cursor.splice(path.at(-1),1); return next; });
  }
  function addBlock(type) {
    const localized=Object.fromEntries(localeKeys.map(key=>[key,""]));
    const block=type==="bullets"?{id:`block-${Date.now()}`,type,items:[structuredClone(localized),structuredClone(localized),structuredClone(localized)]}:{id:`block-${Date.now()}`,type,text:localized};
    setDraft(current=>({...current,blocks:[...(current.blocks||[]),block]}));
  }
  async function createNewSection(event) {
    event.preventDefault();
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
    if(!fromId||fromId===targetId)return;
    const order=[...sectionIds]; const from=order.indexOf(fromId); const to=order.indexOf(targetId); order.splice(from,1); order.splice(to,0,fromId);
    setDocument(current=>({...current,content:{...current.content,sectionOrder:order}})); setDraggedSection(null);
    try{await saveSectionOrder(order)}catch(reason){setLoadError(reason.message);setDocument(current=>({...current,content:{...current.content,sectionOrder:sectionIds}}))}
  }
  async function removeCustomSection() {
    if(draft?.type!=="custom"||!window.confirm("¿Eliminar esta sección personalizada?"))return;
    try{const result=await deleteSection(selected);setDocument(current=>{const next=structuredClone(current);delete next.content.sections[selected];next.content.sectionOrder=result.sectionOrder;return next});setSelected(result.sectionOrder[0]||"hero")}
    catch(reason){setLoadError(reason.message)}
  }
  async function save() {
    if (!draft || saveState === "saving") return;
    setSaveState("saving"); setLoadError("");
    try {
      const result = await saveSection(selected, draft, locale);
      setDocument(current => ({ ...current, content: { ...current.content, sections: { ...current.content.sections, [selected]: structuredClone(draft) } } }));
      setEditorial(current => ({ ...current, [selected]: result.metadata }));
      setSaveState("saved"); setTimeout(() => setSaveState("idle"), 2600);
    } catch (reason) { setSaveState("error"); setLoadError(reason.message); return; }
    try {
      const translation = await getTranslationSection(selected);
      if (translation.needsReview) setNotice(`Los textos en ${translation.targetLocale === "es" ? "español" : "inglés"} se conservaron y requieren revisión en Traducciones.`);
      if (translation.missingFields.length) {
        const health = await getInferenceHealth().catch(() => null);
        setTranslatePrompt({ sectionId: selected, title: selectedMeta[1], sourceLocale: translation.sourceLocale, targetLocale: translation.targetLocale, sourceHash: translation.sourceHash,
          count: translation.missingFields.length, model: health?.models?.translate?.active || "No disponible", fallback: health?.models?.translate?.using_fallback });
      }
    } catch (reason) { setLoadError(`Borrador guardado; no se pudo comprobar la traducción: ${reason.message}`); }
  }
  async function confirmTranslation() {
    const prompt = translatePrompt;
    setTranslatePrompt(null);
    try { await startTranslationJob(prompt.sectionId, "translate", undefined, prompt.sourceHash, prompt.sourceLocale, prompt.targetLocale); setNotice("Traducción en cola. Abre Traducciones para revisar la propuesta."); }
    catch (error) { setLoadError(error.message); }
  }
  async function changeStatus(status) {
    setLoadError("");
    if (dirty) { setLoadError("Guarda los cambios antes de cambiar el estado"); return; }
    if (status === "approved" && selectedEditorial.sourceSwitchPending) { setLoadError("Aprueba primero la traducción del nuevo idioma original en Traducciones"); return; }
    try { const result = await updateSectionStatus(selected, status); setEditorial(current => ({ ...current, [selected]: result.metadata })); setSaveState("saved"); }
    catch (reason) { setLoadError(reason.message); setSaveState("error"); }
  }
  const statusLabels = { draft: "Borrador", review: "En revisión", approved: "Aprobado" };
  const selectedEditorial = editorial[selected] || { status: "approved" };
  const previewUrl=`/site-preview/${site.id === "salvador" ? "el-salvador" : site.id}?sitio=${site.id}&lang=${locale}`;
  async function moveSelected(offset) { const index=sectionIds.indexOf(selected); const target=sectionIds[index+offset]; if (target) await dropSection(target, selected); }
  return <div className="page content-page">
    {localePrompt && <div className="ai-modal-backdrop"><div className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="locale-prompt-title" onKeyDown={event => { if(event.key === "Escape") setLocalePrompt(null); }}><h2 id="locale-prompt-title">Cambiar idioma original</h2><p>Conservaremos los textos en español e inglés. La traducción al {localePrompt === "es" ? "inglés" : "español"} deberá revisarse antes de publicar nuevos cambios.</p>{dirty && <p>Los cambios sin guardar seguirán en este borrador; guárdalos antes de salir.</p>}<div><button type="button" className="secondary" autoFocus onClick={()=>setLocalePrompt(null)}>Cancelar</button><button type="button" className="primary" onClick={()=>{setWritingLocale(localePrompt);setLocalePrompt(null);}}>Cambiar a {localePrompt === "es" ? "español" : "inglés"}</button></div></div></div>}
    {translatePrompt && <div className="ai-modal-backdrop"><div className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="translate-prompt-title" onKeyDown={event => { if (event.key === "Escape") setTranslatePrompt(null); }}><h2 id="translate-prompt-title">¿Traducir esta sección?</h2><p><b>{translatePrompt.title}</b>: {translatePrompt.count} campos de {translatePrompt.sourceLocale.toUpperCase()} a {translatePrompt.targetLocale.toUpperCase()}.</p><p>Modelo: {translatePrompt.model}{translatePrompt.fallback ? " (alternativo)" : ""}. La traducción quedará pendiente de revisión y no se publicará.</p><div><button type="button" className="secondary" autoFocus onClick={()=>setTranslatePrompt(null)}>Solo guardar borrador</button><button type="button" className="primary" onClick={confirmTranslation}>Traducir sección</button></div></div></div>}
    <div className="editor-head"><div><div><span className="eyebrow">{site.name.toUpperCase()} · {locale === "es" ? "ESPAÑOL" : "INGLÉS"}</span><h1>Editar contenido</h1></div></div><div><span className="draft-dot">{saveState === "saving" ? "Guardando…" : saveState === "error" ? "No se guardó" : dirty ? "Cambios sin guardar" : "Conectado al sitio"}</span><a className="secondary preview-link" href={previewUrl} target="_blank" rel="noopener noreferrer">Vista previa en {locale === "es" ? "español" : "inglés"}</a><button className="primary" onClick={save} disabled={!draft || saveState === "saving"}>{saveState === "saved" ? <Check/> : null}{saveState === "saving" ? "Guardando…" : saveState === "saved" ? "Cambios guardados" : "Guardar borrador"}</button></div></div>
    <p className="mobile-section-hint">← Desliza para ver más secciones →</p><div className="editor-layout"><aside className="section-list"><div><b>SECCIONES DE LA PÁGINA</b><span>Arrastra o usa ↑ ↓ para reordenar</span></div>{sections.map(([id,title,desc]) => <button draggable onDragStart={()=>setDraggedSection(id)} onDragOver={event=>event.preventDefault()} onDrop={()=>dropSection(id)} className={[selected === id ? "active" : "",draggedSection===id?"dragging":""].join(" ")} onClick={() => selectSection(id)} key={id}><GripVertical/><span><b>{title}</b><small>{desc}</small></span><i>{statusLabels[editorial[id]?.status] || "Aprobado"}</i></button>)}<button className="add-section" onClick={()=>setCreating(true)}><Plus/><span><b>Nueva sección</b><small>Textos, títulos y viñetas</small></span></button>{creating&&<form className="new-section-form" onSubmit={createNewSection}><label>Nombre de la sección<input autoFocus value={newSectionName} onChange={event=>setNewSectionName(event.target.value)} placeholder="Por ejemplo: Preguntas frecuentes"/></label><div><button type="button" onClick={()=>setCreating(false)}>Cancelar</button><button type="submit">Crear</button></div></form>}</aside>
    <form className="editor-form dynamic-editor" onSubmit={event => { event.preventDefault(); save(); }}><div className="form-title"><div><span className="eyebrow">SECCIÓN {String(selectedIndex+1).padStart(2,"0")}</span><h2>{selectedMeta[1]}</h2><p>{selectedMeta[2]}</p></div><div className="section-controls"><button type="button" className="secondary reorder-button" disabled={selectedIndex===0} aria-label="Mover sección arriba" onClick={()=>moveSelected(-1)}>↑</button><button type="button" className="secondary reorder-button" disabled={selectedIndex===sectionIds.length-1} aria-label="Mover sección abajo" onClick={()=>moveSelected(1)}>↓</button>{draft?.type==="custom"&&<button type="button" className="delete-section" onClick={removeCustomSection}><Trash2/> Eliminar sección</button>}{draft && "enabled" in draft && <label className="toggle"><input type="checkbox" checked={draft.enabled !== false} onChange={event=>updateDraft(["enabled"],event.target.checked)}/><i/><span>Sección visible</span></label>}</div></div>
      {loadError && <div className="api-error" role="alert">{loadError}</div>}
      {notice && <div className="translation-message" role="status">{notice} <button type="button" className="secondary" onClick={goTranslations}>Ir a Traducciones</button></div>}
      {!document && !loadError && <div className="api-loading">Recuperando contenido desde la API…</div>}
      <div className="source-language language-choice"><Globe2/><div><small>IDIOMA ORIGINAL DE ESTA SECCIÓN</small><div className="language-options" role="group" aria-label="Idioma original de esta sección"><button type="button" className={locale === "es" ? "active" : ""} aria-pressed={locale === "es"} onClick={()=>chooseLocale("es")}>Español</button><button type="button" className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={()=>chooseLocale("en")}>Inglés</button></div><p>Estás redactando en {locale === "es" ? "español" : "inglés"}; revisarás el {locale === "es" ? "inglés" : "español"} en Traducciones.</p></div><ShieldCheck/></div>
      <div className="editorial-actions"><span>Contenido guardado: {statusLabels[selectedEditorial.status] || "Aprobado"}{dirty ? " · Cambios locales sin guardar" : ""}{selectedEditorial.updatedAt ? ` · Último cambio: ${new Date(selectedEditorial.updatedAt).toLocaleString("es-MX")} (${selectedEditorial.updatedBy || "sin usuario"})` : ""}</span>{selectedEditorial.status === "draft" && <button type="button" className="secondary" onClick={() => changeStatus("review")}>Enviar a revisión</button>}{selectedEditorial.status === "review" && <><button type="button" className="secondary" onClick={() => changeStatus("draft")}>Regresar a borrador</button><button type="button" className="primary" onClick={() => changeStatus("approved")}>Aprobar sección y publicar</button></>}</div>
      {draft?.type==="custom"&&<div className="block-toolbar"><span>Agregar bloque</span><button type="button" onClick={()=>addBlock("heading")}><Plus/> Subtítulo</button><button type="button" onClick={()=>addBlock("text")}><Plus/> Texto</button><button type="button" onClick={()=>addBlock("bullets")}><Plus/> Viñetas</button></div>}
      {draft && <div className="dynamic-fields">{Object.entries(draft).filter(([key])=>key!=="enabled"&&key!=="type").map(([key,value])=><ValueEditor key={`${selected}-${key}`} value={value} label={key} path={[key]} locale={locale} onChange={updateDraft} onRemove={removeDraftItem} sectionId={selected}/>)}</div>}
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
  const sectionIds = document.content.sectionOrder || Object.keys(document.content.sections);
  const locale = source?.sourceLocale || (site.id === "global" ? "en" : "es");
  const selectedSection = document.content.sections[selected];
  const selectedMeta = sectionLabels[selected] || [selectedSection?.title?.[locale] || selected, "Sección personalizada"];
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

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("Resumen");
  const [open, setOpen] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  useEffect(() => { restoreSession().then(restored => { setUser(restored); setReady(true); }); }, []);
  useEffect(() => { if (!unsaved) return; const warn = event => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [unsaved]);
  function navigate(next) { if (next !== active && unsaved && !window.confirm("Hay cambios sin guardar. ¿Salir sin guardarlos?")) return; setUnsaved(false); setActive(next); }
  const site = user ? sites.find(item => item.id === user.siteId) : null;
  const screen = !user ? null : active === "Resumen" ? <Overview goContent={() => navigate("Contenido")} user={user} site={site}/> : active === "Contenido" ? <ContentPage site={site} onDirtyChange={setUnsaved} goTranslations={() => navigate("Traducciones")}/> : active === "Traducciones" ? <TranslationsPage site={site} onDirtyChange={setUnsaved}/> : <Placeholder title={active}/>;
  if (!ready) return <div className="app-loading"><Logo/><span>Conectando con AUDITAXES API…</span></div>;
  if (!user) return <Login onLogin={setUser}/>;
  async function logout(){ if (unsaved && !window.confirm("Hay cambios sin guardar. ¿Cerrar sesión sin guardarlos?")) return; await closeApiSession(); setUser(null); setActive("Resumen"); }
  return <div className="app-shell"><Sidebar active={active} setActive={navigate} open={open} setOpen={setOpen} user={user} site={site}/><div className="main-shell"><Topbar title={active} openMenu={() => setOpen(true)} logout={logout}/>{screen}</div>{open && <button className="overlay" onClick={() => setOpen(false)} aria-label="Cerrar menú"/>}</div>;
}

createRoot(document.getElementById("root")).render(<App/>);
