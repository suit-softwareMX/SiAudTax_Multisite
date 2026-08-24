"use client";
import { useEffect, useState } from "react";
import { GlobalPage, Header, LocalPage, Locale, PageKey, ProposalSelector } from "./components";

export default function Home(){
 const [proposal,setProposal]=useState(1); const [page,setPage]=useState<PageKey>("global"); const [locale,setLocale]=useState<Locale>("es");
 useEffect(()=>{const q=new URLSearchParams(location.search);const p=Number(q.get("propuesta"));const s=q.get("sitio") as PageKey;const l=q.get("lang") as Locale;if([1,2,3].includes(p))setProposal(p);if(["global","mexico","salvador"].includes(s))setPage(s);if(["es","en","pt"].includes(l))setLocale(l)},[]);
 useEffect(()=>{document.documentElement.lang=locale},[locale]);
 const update=(nextProposal=proposal,nextPage=page,nextLocale=locale)=>{
  // Detenemos cualquier desplazamiento animado antes de sustituir una vista alta
  // por otra. Así el navegador no compone el nuevo contenido con coordenadas viejas.
  window.scrollTo({top:0,left:0,behavior:"instant" as ScrollBehavior});
  setProposal(nextProposal);setPage(nextPage);setLocale(nextLocale);
  history.replaceState(null,"",`?propuesta=${nextProposal}&sitio=${nextPage}&lang=${nextLocale}`);
 };
 const viewKey=`${proposal}-${page}-${locale}`;
 return <main className={`proposal proposal-${proposal}`}><ProposalSelector proposal={proposal} locale={locale} onChange={n=>update(n,page,locale)}/><Header proposal={proposal} page={page} locale={locale} onLocale={l=>update(proposal,page,l)} onPage={p=>update(proposal,p,locale)}/>{page==="global"?<GlobalPage key={viewKey} proposal={proposal} locale={locale} onPage={p=>update(proposal,p,locale)}/>:<LocalPage key={viewKey} site={page} locale={locale} onPage={p=>update(proposal,p,locale)}/>}</main>
}
