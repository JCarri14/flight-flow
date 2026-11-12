import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard } from 'lucide-react';
import { ServiceIcon } from '../components/Icons';
import { useState } from 'react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { QueryOverview, useCurrency, Eyebrow, useOfferLabel, useLegText, useServiceText } from '../components/Shared';
import { useLanguage } from '../i18n/LanguageContext';

export function PaymentReview(){
  const navigate=useNavigate();
  const {query,passengers,selectedOffer,simulatePayment}=useFlightFlow();
  const {t}=useLanguage(),offerLabel=useOfferLabel(),legText=useLegText(),serviceText=useServiceText(),currency=useCurrency();
  const [ack,setAck]=useState(false),offer=selectedOffer!;
  return <div className="checkout-container">
    <div className="page-title"><div><Eyebrow>{t('paymentEyebrow')}</Eyebrow><h1>{t('reviewTitle')}</h1><p>{t('reviewSub')}</p></div><span className="demo-tag">{t('mockPayment')}</span></div>
    <div className="checkout-layout"><section className="form-card review-card">
      <div className="section-top"><h2>{t('flight')}</h2><span className="type-label">{offerLabel(offer.id)}</span></div>
      <QueryOverview query={query}/>
      <div className="review-legs">{offer.legs.map(leg=>{const detail=legText(leg);return <div className="review-leg" key={leg.label}><span className="leg-heading">{detail.heading}</span><strong>{leg.departureTime} – {leg.arrivalTime}</strong><span className="muted small">{detail.stops} · {detail.duration}</span></div>})}</div>
      <div className="review-divider"/>
      <div className="section-top"><h2>{t('includedTitle')}</h2><span className="type-label">{t('noUpsell')}</span></div>
      <p className="body-note">{t('includedDescription')}</p>
      <ul className="included-list">{offer.includedServices.map(service=>{const content=serviceText(service.code);return <li key={service.code}><span className="included-check"><ServiceIcon code={service.code}/></span><div><strong>{content.title}</strong><small>{content.description}</small></div><span className="included-badge">{t('included')}</span></li>})}</ul>
      {query.needs.nonstopOnly&&<div className="nonstop-note"><Check size={15} aria-hidden="true"/> {t('nonstopApplied')}</div>}
      <div className="review-divider"/>
      <div className="section-top"><h2>{t('passengerContact')}</h2><span className="type-label">{passengers.passengers.length} {t('travellers')}</span></div>
      <div className="passenger-review">{passengers.passengers.map(p=><div key={p.id}>{p.firstName} {p.lastName} {p.secondSurname} <span>· {t(p.type==='adult'?'adult':p.type==='child'?'child':'infant')}</span></div>)}</div>
      <div className="small muted">{t('contactLabel')} {passengers.contact.email} · {passengers.contact.phone}</div>
      <div className="review-divider"/>
      <div className="total-card"><div><span>{t('totalPrice')}</span><small>{t('totalPriceSub')}</small></div><strong>{currency(offer.totalPrice)}</strong></div>
      <p className="form-hint">{t('rulesInfo')}</p>
      <div className="fake-payment"><div><strong>{t('demoPayment')}</strong><p>{t('demoPaymentInfo')}</p></div><CreditCard className="simulation-symbol" aria-hidden="true" size={28} strokeWidth={1.6}/></div>
      <label className="ack-label"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/><span>{t('ack')}</span></label>
      <div className="checkout-actions"><button type="button" className="button outline" onClick={()=>navigate('/passengers')}><ArrowLeft size={16} aria-hidden="true"/>{t('back')}</button><button type="button" className="button primary" disabled={!ack} onClick={()=>void simulatePayment()}>{t('simulatePayment')} <ArrowRight aria-hidden="true" size={16}/></button></div>
    </section>
    <aside className="sidebar-card"><span className="eyebrow">{t('orderSummary')}</span><strong className="sidebar-heading">{t('noSurprise')}</strong><p className="muted small">{t('summaryCheckout')}</p><div className="sidebar-divider"/><div className="price-line"><span>{t('sampleTotal')}</span><strong>{currency(offer.totalPrice)}</strong></div><p className="sidebar-tip">{t('bundleNote')}</p></aside>
    </div>
  </div>;
}
