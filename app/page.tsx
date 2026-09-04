"use client";
import { startTransition, useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage, Locale, PageKey } from "./components";

function initialState(){
  const query=new URLSearchParams(window.location.search);
  const host=location.hostname.toLowerCase();
  const routedPage:PageKey=host==="mexico-auditaxes.suitmx.com"||location.port==="4322"?"mexico":host==="elsalvador-auditaxes.suitmx.com"||location.port==="4323"?"salvador":"global";
  const page=(query.get("sitio")??routedPage) as PageKey;
  const locale=query.get("lang") as Locale;
  return {page:["global","mexico","salvador"].includes(page)?page:"global" as PageKey,locale:["es","en","pt","fr"].includes(locale)?locale:"es" as Locale};
}

export default function Home(){
 const [state,setState]=useState({page:"global" as PageKey,locale:"es" as Locale}); const {page,locale}=state;
 useEffect(()=>{startTransition(()=>setState(initialState()))},[]);
 useEffect(()=>{document.documentElement.lang=locale},[locale]);
 const update=(nextPage=page,nextLocale=locale)=>{
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  const ports:Record<PageKey,string>={global:"4321",mexico:"4322",salvador:"4323"};
  const domains:Record<PageKey,string>={global:"auditaxes.suitmx.com",mexico:"mexico-auditaxes.suitmx.com",salvador:"elsalvador-auditaxes.suitmx.com"};
  const multiPort=["4321","4322","4323"].includes(location.port);
  const productionDomain=Object.values(domains).includes(location.hostname.toLowerCase());
  const targetOrigin=multiPort?`${location.protocol}//${location.hostname}:${ports[nextPage]}`:productionDomain?`https://${domains[nextPage]}`:location.origin;
  const targetUrl=`${targetOrigin}/?sitio=${nextPage}&lang=${nextLocale}`;
  if(targetOrigin!==location.origin){location.assign(targetUrl);return}
  setState({page:nextPage,locale:nextLocale});
  history.replaceState(null,"",targetUrl);
 };
 return <main className="proposal proposal-2"><Header proposal={2} page={page} locale={locale} onLocale={l=>update(page,l)} onPage={p=>update(p,locale)}/>{page==="global"?<GlobalPage proposal={2} locale={locale} onPage={p=>update(p,locale)}/>:<LocalPage site={page} locale={locale==="fr"?"en":locale} onPage={p=>update(p,locale)}/>}</main>
}
