import type { ReactNode } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { formatDate, type FlightLeg, type FlightSearchQuery, type RecommendationKind } from '../core/flight.model';
import { useLanguage } from '../i18n/LanguageContext';

export function Eyebrow({children}:{children:ReactNode}){return <span className="eyebrow">{children}</span>}
export function useOfferLabel(){const {t}=useLanguage();return (id:RecommendationKind)=>t(id==='cheapest'?'cheapest':'balanced')}
export function useLegText(){
  const {t,language}=useLanguage();
  return (leg:FlightLeg)=>({
    heading:`${t(leg.label==='IDA'?'outbound':'inbound')} · ${formatDate(leg.dateISO,language).toLocaleUpperCase(language==='es'?'es-ES':'en-GB')}`,
    duration:language==='es'?leg.durationLabel:leg.durationLabel.replace(' h ','h ').replace(' min','m'),
    stops:leg.stops===0?t('direct'):`${leg.stops} ${t(leg.stops===1?'stop':'stops')}`,
  });
}
export function SearchChips({query}:{query:FlightSearchQuery}) {
  const {t}=useLanguage();
  const items = [
    ['cabinBag','cabinBag'],['checkedBag','checkedBag'],['seatSelection','chooseSeat'],['nonstopOnly','nonstopOnly'],
    ['flexibleChanges','flexibleChanges'],['priorityBoarding','priorityBoarding'],['fastTrack','fastTrack'],['loungeAccess','loungeAccess'],
  ] as const;
  const active=items.filter(([key])=>query.needs[key]);
  return <div className="chip-list">{active.length===0?<span className="chip">{t('noNeeds')}</span>:active.map(([key,label])=><span className="chip" key={key}><Check size={12} aria-hidden="true" className="chip-check"/> {t(label)}</span>)}</div>;
}
export const currency=(amount:number,locale:'es'|'en'='es')=>new Intl.NumberFormat(locale==='es'?'es-ES':'en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(amount);
export function useCurrency(){const {language}=useLanguage();return (amount:number)=>currency(amount,language);}
export function StatusLoading(){
  const {t}=useLanguage();
  return <div className="loading-view" role="status" aria-live="polite"><div className="loading-disc"><LoaderCircle className="loading-icon" aria-hidden="true" size={35} strokeWidth={1.7}/></div>
    <Eyebrow>{t('moment')}</Eyebrow><h1>{t('loadingSearch')}</h1>
    <p>{t('loadingSearchSub')}</p><div className="loading-progress"><div/></div><span className="muted small">{t('loadingMock')}</span></div>;
}
