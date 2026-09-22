"use client";
import { startTransition, useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage } from "./components";
import { content, isLocale, isPageKey, type Locale, type PageKey } from "./content";

function initialState(){
  const query=new URLSearchParams(window.location.search);
  const host=location.hostname.toLowerCase();
  const route=content.site.sites.find(config=>config.domain===host||config.developmentPort===location.port);
  const routedPage=(route?.id??content.site.defaultSite) as PageKey;
  const requestedPage=query.get("sitio")??routedPage;
  const page=isPageKey(requestedPage)?requestedPage:content.site.defaultSite as PageKey;
  const site=content.site.sites.find(item=>item.id===page)!;
  const requestedLocale=query.get("lang");
  return {page,locale:requestedLocale&&isLocale(requestedLocale)&&site.locales.includes(requestedLocale)?requestedLocale as Locale:site.defaultLocale as Locale};
}

export default function Home(){
 const [state,setState]=useState({page:"global" as PageKey,locale:"en" as Locale}); const {page,locale}=state;
 useEffect(()=>{startTransition(()=>setState(initialState()))},[]);
 useEffect(()=>{document.documentElement.lang=locale;const doc=page==="global"?content.global:content.countries[page];document.title=doc.metadata.title[locale];document.querySelector('meta[name="description"]')?.setAttribute("content",doc.metadata.description[locale])},[locale,page]);
 const update=(nextPage=page,nextLocale=locale)=>{
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  const pages=content.site.sites;
  const ports=Object.fromEntries(pages.map(value=>[value.id,value.developmentPort])) as Record<PageKey,string>;
  const domains=Object.fromEntries(pages.map(value=>[value.id,value.domain])) as Record<PageKey,string>;
  const multiPort=pages.some(value=>value.developmentPort===location.port);
  const productionDomain=Object.values(domains).includes(location.hostname.toLowerCase());
  const targetOrigin=multiPort?`${location.protocol}//${location.hostname}:${ports[nextPage]}`:productionDomain?`https://${domains[nextPage]}`:location.origin;
  const targetUrl=`${targetOrigin}/?sitio=${nextPage}&lang=${nextLocale}`;
  if(targetOrigin!==location.origin){location.assign(targetUrl);return}
  setState({page:nextPage,locale:nextLocale});
  history.replaceState(null,"",targetUrl);
 };
 const changePage=(nextPage:PageKey)=>update(nextPage,content.site.sites.find(item=>item.id===nextPage)!.defaultLocale as Locale);
 return <main className="proposal proposal-2"><Header proposal={2} page={page} locale={locale} onLocale={l=>update(page,l)} onPage={changePage}/>{page==="global"?<GlobalPage proposal={2} locale={locale} onPage={changePage}/>:<LocalPage site={page} locale={locale} onPage={changePage}/>}</main>
}
