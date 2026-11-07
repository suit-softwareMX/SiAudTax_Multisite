"use client";
import { useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage, PublicationsPage } from "./components";
import { content, isLocale, isPageKey, type Locale, type PageKey } from "./content";

type View = "home" | "publications";
const routeSlug:Record<PageKey,string>={global:"global",mexico:"mexico",salvador:"el-salvador"};

function pageFromPath():PageKey|undefined{
  const parts=location.pathname.split("/").filter(Boolean);
  const segment=parts[0]==="site-preview"?parts[1]:parts[0];
  return segment==="el-salvador"?"salvador":isPageKey(segment)?segment:undefined;
}

function initialState(forcedPage?:PageKey){
  const query=new URLSearchParams(window.location.search);
  const host=location.hostname.toLowerCase();
  const route=content.site.sites.find(config=>config.domain===host||config.developmentPort===location.port);
  const routedPage=forcedPage??pageFromPath()??(route?.id??content.site.defaultSite) as PageKey;
  const requestedPage=query.get("sitio")??routedPage;
  const page=isPageKey(requestedPage)?requestedPage:content.site.defaultSite as PageKey;
  const site=content.site.sites.find(item=>item.id===page)!;
  const requestedLocale=query.get("lang");
  return {page,locale:requestedLocale&&isLocale(requestedLocale)&&site.locales.includes(requestedLocale)?requestedLocale as Locale:site.defaultLocale as Locale};
}

export default function SiteShell({forcedPage,view="home"}:{forcedPage?:PageKey,view?:View}){
 const [state,setState]=useState<ReturnType<typeof initialState> | null>(null);
 const {page,locale}=state??{page:forcedPage??"global",locale:"en"} as const;
 const [contentRevision,setContentRevision]=useState(0);
 const [readyPage,setReadyPage]=useState<PageKey | null>(null);
 const ready=Boolean(state && readyPage===page);
 const initialized=Boolean(state);
 useEffect(()=>{setState(initialState(forcedPage))},[forcedPage]);
 useEffect(()=>{
  if(!initialized)return;
  let active=true;
  let controller:AbortController | undefined;
  const refresh=async()=>{
   controller?.abort();
   const request=new AbortController();
   controller=request;
   const timeout=window.setTimeout(()=>request.abort(),3500);
   try {
    const response=await fetch(`/api/public/content/${page}`,{cache:"no-store",signal:request.signal});
    if(!response.ok)return;
    const {content:published,publicationDetails}=await response.json();
    if(!active || request!==controller)return;
    const target=page==="global"?content.global:content.countries[page];
    Object.assign(target,published,{publicationDetails});
    setContentRevision(value=>value+1);
   } catch { /* Se conserva el contenido disponible si la API no responde. */ }
   finally {
    window.clearTimeout(timeout);
    if(active && request===controller)setReadyPage(page);
   }
  };
  refresh(); window.addEventListener("focus",refresh); return()=>{active=false;controller?.abort();window.removeEventListener("focus",refresh)};
 },[page,initialized]);
 useEffect(()=>{
  if(ready && location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"instant"});
 },[page,ready]);
 useEffect(()=>{document.documentElement.lang=locale;const doc=page==="global"?content.global:content.countries[page];document.title=view==="publications"?`${({es:"Publicaciones",en:"Publications",pt:"Publicações",fr:"Publications"}[locale])} | AUDITAXES`:doc.metadata.title[locale];document.querySelector('meta[name="description"]')?.setAttribute("content",doc.metadata.description[locale])},[locale,page,view,contentRevision]);
 const navigate=(nextPage=page,nextLocale=locale,nextView=view,section?:string)=>{
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  const pages=content.site.sites;
  const ports=Object.fromEntries(pages.map(value=>[value.id,value.developmentPort])) as Record<PageKey,string>;
  const domains=Object.fromEntries(pages.map(value=>[value.id,value.domain])) as Record<PageKey,string>;
  const multiPort=pages.some(value=>value.developmentPort===location.port);
  const productionDomain=Object.values(domains).includes(location.hostname.toLowerCase());
  const targetOrigin=multiPort?`${location.protocol}//${location.hostname}:${ports[nextPage]}`:productionDomain?`https://${domains[nextPage]}`:location.origin;
  const path=`${location.pathname.startsWith("/site-preview")?"/site-preview":""}/${routeSlug[nextPage]}${nextView==="publications"?"/publicaciones":""}`;
  const query=new URLSearchParams({lang:nextLocale});
  const article=new URLSearchParams(location.search).get("publicacion");
  if(article && nextPage===page && nextView==="publications")query.set("publicacion",article);
  location.assign(`${targetOrigin}${path}?${query}${section ? `#${section}` : ""}`);
 };
 const changePage=(nextPage:PageKey)=>navigate(nextPage,content.site.sites.find(item=>item.id===nextPage)!.defaultLocale as Locale,view);
 const contentClass=ready?"site-content-ready":"site-content-pending";
 const loadingLabel={es:"Cargando contenido…",en:"Loading content…",pt:"Carregando conteúdo…",fr:"Chargement du contenu…"}[locale];
 return <>
  {!ready && <div className="site-loading" role="status">{loadingLabel}</div>}
  <noscript><style>{".site-content-pending{visibility:visible}.site-loading{display:none}"}</style></noscript>
  <main key={`${page}-${ready}`} className={`proposal proposal-2 ${view==="publications"?"publications-page":"dynamic-section-order"} ${contentClass}`}>
   {view==="publications"
    ? <PublicationsPage page={page} locale={locale} onHome={section=>navigate(page,locale,"home",section)} onPage={changePage} onLocale={next=>navigate(page,next,"publications")}/>
    : <>
      <Header proposal={2} page={page} locale={locale} onLocale={next=>navigate(page,next,"home")} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>
      {page==="global"?<GlobalPage proposal={2} locale={locale} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>:<LocalPage site={page} locale={locale} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>}
    </>}
  </main>
 </>;
}
