"use client";
import { startTransition, useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage, Locale, PageKey } from "./components";

function initialState(){
  const query=new URLSearchParams(window.location.search);
  const page=query.get("sitio") as PageKey;
  const locale=query.get("lang") as Locale;
  return {page:["global","mexico","salvador"].includes(page)?page:"global" as PageKey,locale:["es","en","pt","fr"].includes(locale)?locale:"es" as Locale};
}

export default function Home(){
 const [state,setState]=useState({page:"global" as PageKey,locale:"es" as Locale}); const {page,locale}=state;
 useEffect(()=>{startTransition(()=>setState(initialState()))},[]);
 useEffect(()=>{document.documentElement.lang=locale},[locale]);
 const update=(nextPage=page,nextLocale=locale)=>{setState({page:nextPage,locale:nextLocale});history.replaceState(null,"",`?sitio=${nextPage}&lang=${nextLocale}`);scrollTo({top:0,behavior:"smooth"})};
 return <main className="proposal proposal-2"><Header proposal={2} page={page} locale={locale} onLocale={l=>update(page,l)} onPage={p=>update(p,locale)}/>{page==="global"?<GlobalPage proposal={2} locale={locale} onPage={p=>update(p,locale)}/>:<LocalPage site={page} locale={locale==="fr"?"en":locale} onPage={p=>update(p,locale)}/>}</main>
}
