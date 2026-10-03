"use client";
import { startTransition, useEffect, useState } from "react";
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
 const [state,setState]=useState({page:forcedPage??"global" as PageKey,locale:"en" as Locale}); const {page,locale}=state;
 const [contentRevision,setContentRevision]=useState(0);
 useEffect(()=>{startTransition(()=>setState(initialState(forcedPage)))},[forcedPage]);
 useEffect(()=>{
  let active=true;
  const refresh=async()=>{try{const apiOrigin=location.pathname.startsWith("/site-preview")?"":"http://localhost:4100";const response=await fetch(`${apiOrigin}/api/public/content/${page}`,{cache:"no-store"});if(!response.ok)return;const payload=await response.json();if(!active)return;const target=page==="global"?content.global:content.countries[page];Object.assign(target,payload.content);setContentRevision(value=>value+1)}catch{ /* El JSON compilado permanece como respaldo si la API local no está activa. */ }};
  refresh(); window.addEventListener("focus",refresh); return()=>{active=false;window.removeEventListener("focus",refresh)};
 },[page]);
 useEffect(()=>{document.documentElement.lang=locale;const doc=page==="global"?content.global:content.countries[page];document.title=view==="publications"?`${({es:"Publicaciones",en:"Publications",pt:"Publicações",fr:"Publications"}[locale])} | AUDITAXES`:doc.metadata.title[locale];document.querySelector('meta[name="description"]')?.setAttribute("content",doc.metadata.description[locale])},[locale,page,view,contentRevision]);
 const navigate=(nextPage=page,nextLocale=locale,nextView=view)=>{
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  const pages=content.site.sites;
  const ports=Object.fromEntries(pages.map(value=>[value.id,value.developmentPort])) as Record<PageKey,string>;
  const domains=Object.fromEntries(pages.map(value=>[value.id,value.domain])) as Record<PageKey,string>;
  const multiPort=pages.some(value=>value.developmentPort===location.port);
  const productionDomain=Object.values(domains).includes(location.hostname.toLowerCase());
  const targetOrigin=multiPort?`${location.protocol}//${location.hostname}:${ports[nextPage]}`:productionDomain?`https://${domains[nextPage]}`:location.origin;
  const path=`${location.pathname.startsWith("/site-preview")?"/site-preview":""}/${routeSlug[nextPage]}${nextView==="publications"?"/publicaciones":""}`;
  location.assign(`${targetOrigin}${path}?lang=${nextLocale}`);
 };
 const changePage=(nextPage:PageKey)=>navigate(nextPage,content.site.sites.find(item=>item.id===nextPage)!.defaultLocale as Locale,view);
 if(view==="publications")return <main key={`${page}-${contentRevision}`} className="proposal proposal-2 publications-page"><PublicationsPage page={page} locale={locale} onHome={()=>navigate(page,locale,"home")} onPage={changePage} onLocale={next=>navigate(page,next,"publications")}/></main>;
 return <main key={`${page}-${contentRevision}`} className="proposal proposal-2 dynamic-section-order"><Header proposal={2} page={page} locale={locale} onLocale={next=>navigate(page,next,"home")} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>{page==="global"?<GlobalPage proposal={2} locale={locale} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>:<LocalPage site={page} locale={locale} onPage={next=>navigate(next,content.site.sites.find(item=>item.id===next)!.defaultLocale as Locale,"home")}/>}</main>;
}
