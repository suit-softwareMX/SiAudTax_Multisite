"use client";
import { useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage, Locale, NetworkBackground, PageKey, ProposalSelector } from "./components";

export default function Home(){
 const [proposal,setProposal]=useState(1); const [page,setPage]=useState<PageKey>("global"); const [locale,setLocale]=useState<Locale>("es");
 useEffect(()=>{
  const q=new URLSearchParams(location.search);const p=Number(q.get("propuesta"));const l=q.get("lang") as Locale;
  const host=location.hostname.toLowerCase();const port=location.port;
  const routedPage:PageKey=host==="mexico-auditaxes.suitmx.com"||port==="4322"?"mexico":host==="elsalvador-auditaxes.suitmx.com"||port==="4323"?"salvador":"global";
  const s=(q.get("sitio")??routedPage) as PageKey;
  if([1,2,3].includes(p))setProposal(p);if(["global","mexico","salvador"].includes(s))setPage(s);if(["es","en","pt"].includes(l))setLocale(l)
 },[]);
 useEffect(()=>{document.documentElement.lang=locale},[locale]);
 const update=(nextProposal=proposal,nextPage=page,nextLocale=locale)=>{
  // Detenemos cualquier desplazamiento animado antes de sustituir una vista alta
  // por otra. Así el navegador no compone el nuevo contenido con coordenadas viejas.
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  const ports:Record<PageKey,string>={global:"4321",mexico:"4322",salvador:"4323"};
  const domains:Record<PageKey,string>={global:"auditaxes.suitmx.com",mexico:"mexico-auditaxes.suitmx.com",salvador:"elsalvador-auditaxes.suitmx.com"};
  const multiPort=["4321","4322","4323"].includes(location.port);
  const productionDomain=Object.values(domains).includes(location.hostname.toLowerCase());
  const targetOrigin=multiPort?`${location.protocol}//${location.hostname}:${ports[nextPage]}`:productionDomain?`https://${domains[nextPage]}`:location.origin;
  const targetUrl=`${targetOrigin}/?propuesta=${nextProposal}&sitio=${nextPage}&lang=${nextLocale}`;
  if(targetOrigin!==location.origin){location.assign(targetUrl);return}
  setProposal(nextProposal);setPage(nextPage);setLocale(nextLocale);
  history.replaceState(null,"",targetUrl);
 };
 const viewKey=`${proposal}-${page}-${locale}`;
 return <main className={`proposal proposal-${proposal}`}><NetworkBackground/><ProposalSelector proposal={proposal} locale={locale} onChange={n=>update(n,page,locale)}/><Header proposal={proposal} page={page} locale={locale} onLocale={l=>update(proposal,page,l)} onPage={p=>update(proposal,p,locale)}/>{page==="global"?<GlobalPage key={viewKey} proposal={proposal} locale={locale} onPage={p=>update(proposal,p,locale)}/>:<LocalPage key={viewKey} site={page} locale={locale} onPage={p=>update(proposal,p,locale)}/>}</main>
}
