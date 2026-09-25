import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, Check, ChevronDown, CircleHelp,
  Clock3, FileText, Globe2, GripVertical, Languages, LayoutDashboard, LockKeyhole, LogOut,
  Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Settings, ShieldCheck,
  Sparkles, Trash2, Users, X
} from "lucide-react";
import "./styles.css";
import { createSection, deleteSection, getCurrentContent, login, logout as closeApiSession, restoreSession, saveSection, saveSectionOrder } from "./api";

const DEMO_PASSWORD = "Auditaxes2026";
const demoUsers = [
  { id: "global", name: "Andrea Méndez", initials: "AM", role: "Administradora Global", email: "global@auditaxes.com", password: DEMO_PASSWORD },
  { id: "mexico", name: "Carlos Rivera", initials: "CR", role: "Administrador México", email: "mexico@auditaxes.com", password: DEMO_PASSWORD },
  { id: "salvador", name: "Sofía Hernández", initials: "SH", role: "Administradora El Salvador", email: "salvador@auditaxes.com", password: DEMO_PASSWORD },
];

const sites = [
  { id: "global", short: "GL", name: "AUDITAXES Global", locale: "Inglés", domain: "auditaxes.suitmx.com", status: "Publicado", updated: "Hace 18 min", progress: 100, accent: "blue" },
  { id: "mexico", short: "MX", name: "AUDITAXES México", locale: "Español", domain: "mexico-auditaxes.suitmx.com", status: "Cambios pendientes", updated: "Hace 2 h", progress: 75, accent: "green" },
  { id: "salvador", short: "SV", name: "AUDITAXES El Salvador", locale: "Español", domain: "elsalvador-auditaxes.suitmx.com", status: "Publicado", updated: "Ayer", progress: 100, accent: "cyan" },
];

const activity = [
  { initials: "AM", color: "blue", text: <><b>Andrea Méndez</b> actualizó la portada de México</>, time: "Hace 18 minutos" },
  { initials: "IA", color: "green", text: <><b>Motor de traducción</b> completó 12 campos en portugués</>, time: "Hace 42 minutos" },
  { initials: "CR", color: "sand", text: <><b>Carlos Rivera</b> publicó AUDITAXES Global</>, time: "Hace 2 horas" },
  { initials: "AM", color: "blue", text: <><b>Andrea Méndez</b> aprobó la traducción al francés</>, time: "Ayer, 16:24" },
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
    <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => {setActive(label); setOpen(false)}}><Icon/><span>{label}</span>{label === "Traducciones" && <mark>3</mark>}</button>)}</nav>
    <div className="sidebar-help"><CircleHelp/><div><b>Centro de ayuda</b><span>Guías y soporte</span></div><ArrowRight/></div>
    <div className="user-card"><span>{user.initials}</span><div><b>{user.name}</b><small>{user.role}</small></div><MoreHorizontal/></div>
  </aside>;
}

function Topbar({ title, openMenu, logout }) {
  return <header className="topbar"><button className="menu-button" onClick={openMenu}><Menu/></button><div><span>ADMINISTRACIÓN</span><b>{title}</b></div><div className="top-actions"><label><Search/><input placeholder="Buscar contenido…"/><kbd>⌘ K</kbd></label><button className="icon-button"><Bell/><i/></button><button className="logout" onClick={logout} title="Cerrar sesión"><LogOut/></button></div></header>;
}

function Stat({ label, value, detail, icon: Icon, tone }) {
  return <article className="stat"><div className={`stat-icon ${tone}`}><Icon/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function Overview({ goContent, user, site }) {
  const pending = site.status !== "Publicado";
  return <div className="page overview">
    <div className="page-heading"><div><span className="eyebrow">JUEVES, 24 DE SEPTIEMBRE</span><h1>Buenos días, {user.name.split(" ")[0]}.</h1><p>Este es el estado actual de {site.name}.</p></div><button className="primary" onClick={goContent}><Plus/> Nuevo contenido</button></div>
    <section className="stats-grid">
      <Stat label="Sitio asignado" value="1" detail={site.domain} icon={Globe2} tone="blue"/>
      <Stat label="Contenido publicado" value={pending ? "88%" : "100%"} detail={pending ? "Cambios en borrador" : "Contenido al día"} icon={FileText} tone="green"/>
      <Stat label="Traducciones" value={pending ? "3" : "0"} detail={pending ? "Pendientes de revisión" : "Todos los idiomas al día"} icon={Languages} tone="violet"/>
      <Stat label="Última publicación" value={site.updated.replace("Hace ", "")} detail={site.name} icon={Clock3} tone="sand"/>
    </section>
    <section className="sites-section"><div className="section-heading"><div><h2>Tu sitio</h2><p>Tu cuenta tiene acceso exclusivo a este mercado.</p></div><span className="scope-badge"><LockKeyhole/> Acceso limitado por credencial</span></div><div className="site-grid single-site">
      <article className="site-card" key={site.id}><div className="site-card-top"><span className={`flag ${site.accent}`}>{site.short}</span><button><MoreHorizontal/></button></div><h3>{site.name}</h3><a>{site.domain}</a><div className="meta"><span>Idioma fuente</span><b>{site.locale}</b></div><div className="status-row"><span className={site.status === "Publicado" ? "published" : "pending"}>{site.status === "Publicado" && <Check/>}{site.status}</span><small>{site.updated}</small></div><div className="progress"><i style={{width: `${site.progress}%`}}/></div><button className="manage" onClick={goContent}>Administrar contenido <ArrowRight/></button></article>
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

function ValueEditor({ value, label, path, locale, onChange, onRemove }) {
  if (isLocalized(value)) {
    const text = value[locale] || "";
    return <label className="field dynamic-field"><span>{humanize(label)} <small>Idioma fuente</small></span><textarea rows={text.length > 140 ? 5 : 3} value={text} onChange={event => onChange([...path, locale], event.target.value)}/></label>;
  }
  if (Array.isArray(value)) {
    return <section className="field-group collection"><header><b>{humanize(label)}</b><span>{value.length} elementos</span></header>{value.map((item,index)=><div className="collection-item" key={item?.id || index}><div className="item-number">{String(index+1).padStart(2,"0")}{item?.id && <small>{item.id}</small>}<button type="button" className="remove-item" onClick={()=>onRemove([...path,index])} title="Eliminar elemento"><Trash2/></button></div><ValueEditor value={item} label={`${humanize(label)} ${index+1}`} path={[...path,index]} locale={locale} onChange={onChange} onRemove={onRemove}/></div>)}</section>;
  }
  if (value && typeof value === "object") {
    return <section className="field-group"><header><b>{humanize(label)}</b></header><div className="nested-fields">{Object.entries(value).map(([key,nested])=><ValueEditor key={key} value={nested} label={key} path={[...path,key]} locale={locale} onChange={onChange} onRemove={onRemove}/>)}</div></section>;
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

function ContentPage({ site }) {
  const [selected, setSelected] = useState("hero");
  const [saveState, setSaveState] = useState("idle");
  const [document, setDocument] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [draggedSection, setDraggedSection] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  useEffect(() => { getCurrentContent().then(setDocument).catch(reason => setLoadError(reason.message)); }, [site.id]);
  const locale = document?.sourceLocale || (site.id === "global" ? "en" : "es");
  const sectionIds = document ? (document.content.sectionOrder || Object.keys(document.content.sections)) : [];
  const sections = document ? sectionIds.map(id => { const section=document.content.sections[id]; const customTitle=section?.title?.[locale] || id; return [id, ...(sectionLabels[id] || [customTitle, "Sección personalizada"])]; }) : [];
  const selectedIndex = Math.max(0, sections.findIndex(([id]) => id === selected));
  const selectedMeta = sections[selectedIndex] || [selected, selected, "Sección de contenido"];
  const contentLoaded = Boolean(document);
  useEffect(() => { const section=document?.content.sections[selected]; setDraft(section ? structuredClone(section) : null); setSaveState("idle"); }, [contentLoaded, selected, site.id]);
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
    const name=newSectionName.trim(); if(!name)return;
    const base=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || `seccion-${Date.now()}`;
    const sectionId=`custom-${base}`.slice(0,48);
    const title=Object.fromEntries(localeKeys.map(key=>[key,key===locale?name:""]));
    const section={type:"custom",enabled:true,title,blocks:[]};
    try { const result=await createSection(sectionId,section); setDocument(current=>({...current,content:{...current.content,sections:{...current.content.sections,[sectionId]:section},sectionOrder:result.sectionOrder}})); setSelected(sectionId); setCreating(false); setNewSectionName(""); }
    catch(reason){setLoadError(reason.message)}
  }
  async function dropSection(targetId) {
    if(!draggedSection||draggedSection===targetId)return;
    const order=[...sectionIds]; const from=order.indexOf(draggedSection); const to=order.indexOf(targetId); order.splice(from,1); order.splice(to,0,draggedSection);
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
      await saveSection(selected, draft);
      setDocument(current => ({ ...current, content: { ...current.content, sections: { ...current.content.sections, [selected]: structuredClone(draft) } } }));
      setSaveState("saved"); setTimeout(() => setSaveState("idle"), 2600);
    } catch (reason) { setSaveState("error"); setLoadError(reason.message); }
  }
  const previewPorts={global:4321,mexico:4322,salvador:4323};
  const previewUrl=`http://localhost:${previewPorts[site.id]}/?sitio=${site.id}&lang=${locale}`;
  return <div className="page content-page">
    <div className="editor-head"><div><button className="back"><ArrowLeft/></button><div><span className="eyebrow">{site.name.toUpperCase()} · {site.locale.toUpperCase()}</span><h1>Editar contenido</h1></div></div><div><span className="draft-dot">{saveState === "saving" ? "Guardando…" : saveState === "error" ? "No se guardó" : "Conectado al sitio"}</span><a className="secondary preview-link" href={previewUrl} target="_blank" rel="noopener noreferrer">Vista previa</a><button className="primary" onClick={save} disabled={!draft || saveState === "saving"}>{saveState === "saved" ? <Check/> : null}{saveState === "saving" ? "Guardando…" : saveState === "saved" ? "Cambios guardados" : "Guardar cambios"}</button></div></div>
    <div className="editor-layout"><aside className="section-list"><div><b>SECCIONES DE LA PÁGINA</b><span>Arrastra para cambiar el orden</span></div>{sections.map(([id,title,desc], index) => <button draggable onDragStart={()=>setDraggedSection(id)} onDragOver={event=>event.preventDefault()} onDrop={()=>dropSection(id)} className={[selected === id ? "active" : "",draggedSection===id?"dragging":""].join(" ")} onClick={() => setSelected(id)} key={id}><GripVertical/><span><b>{title}</b><small>{desc}</small></span><i>{String(index+1).padStart(2,"0")}</i></button>)}<button className="add-section" onClick={()=>setCreating(true)}><Plus/><span><b>Nueva sección</b><small>Textos, títulos y viñetas</small></span></button>{creating&&<form className="new-section-form" onSubmit={createNewSection}><label>Nombre de la sección<input autoFocus value={newSectionName} onChange={event=>setNewSectionName(event.target.value)} placeholder="Por ejemplo: Preguntas frecuentes"/></label><div><button type="button" onClick={()=>setCreating(false)}>Cancelar</button><button type="submit">Crear</button></div></form>}</aside>
    <form className="editor-form dynamic-editor" onSubmit={event => { event.preventDefault(); save(); }}><div className="form-title"><div><span className="eyebrow">SECCIÓN {String(selectedIndex+1).padStart(2,"0")}</span><h2>{selectedMeta[1]}</h2><p>{selectedMeta[2]}</p></div><div className="section-controls">{draft?.type==="custom"&&<button type="button" className="delete-section" onClick={removeCustomSection}><Trash2/> Eliminar sección</button>}{draft && "enabled" in draft && <label className="toggle"><input type="checkbox" checked={draft.enabled !== false} onChange={event=>updateDraft(["enabled"],event.target.checked)}/><i/><span>Sección visible</span></label>}</div></div>
      {loadError && <div className="api-error">{loadError}. Comprueba que la API esté ejecutándose en el puerto 4100.</div>}
      {!document && !loadError && <div className="api-loading">Recuperando contenido desde la API…</div>}
      <div className="source-language"><Globe2/><span><small>IDIOMA FUENTE</small><b>{site.locale}{site.id === "mexico" ? " (México)" : site.id === "salvador" ? " (El Salvador)" : " (Global)"}</b></span><ShieldCheck/></div>
      {draft?.type==="custom"&&<div className="block-toolbar"><span>Agregar bloque</span><button type="button" onClick={()=>addBlock("heading")}><Plus/> Subtítulo</button><button type="button" onClick={()=>addBlock("text")}><Plus/> Texto</button><button type="button" onClick={()=>addBlock("bullets")}><Plus/> Viñetas</button></div>}
      {draft && <div className="dynamic-fields">{Object.entries(draft).filter(([key])=>key!=="enabled"&&key!=="type").map(([key,value])=><ValueEditor key={`${selected}-${key}`} value={value} label={key} path={[key]} locale={locale} onChange={updateDraft} onRemove={removeDraftItem}/>)}</div>}
    </form></div>
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
  useEffect(() => { restoreSession().then(restored => { setUser(restored); setReady(true); }); }, []);
  const site = user ? sites.find(item => item.id === user.siteId) : null;
  const screen = useMemo(() => !user ? null : active === "Resumen" ? <Overview goContent={() => setActive("Contenido")} user={user} site={site}/> : active === "Contenido" ? <ContentPage site={site}/> : <Placeholder title={active}/>, [active, user, site]);
  if (!ready) return <div className="app-loading"><Logo/><span>Conectando con AUDITAXES API…</span></div>;
  if (!user) return <Login onLogin={setUser}/>;
  async function logout(){ await closeApiSession(); setUser(null); setActive("Resumen"); }
  return <div className="app-shell"><Sidebar active={active} setActive={setActive} open={open} setOpen={setOpen} user={user} site={site}/><div className="main-shell"><Topbar title={active} openMenu={() => setOpen(true)} logout={logout}/>{screen}</div>{open && <button className="overlay" onClick={() => setOpen(false)} aria-label="Cerrar menú"/>}</div>;
}

createRoot(document.getElementById("root")).render(<App/>);
