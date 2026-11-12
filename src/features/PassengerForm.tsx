import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { copyPassengerDetails, validatePassengerDetails, type PassengerDetails, type PassengerIdentity } from '../core/booking.model';
import { useCurrency, Eyebrow, QueryOverview, useOfferLabel } from '../components/Shared';
import { localizedValidation, useLanguage } from '../i18n/LanguageContext';

export function PassengerForm(){
  const navigate=useNavigate();
  const {query,selectedOffer,passengers,setPassengers,goPayment}=useFlightFlow();
  const {t}=useLanguage(),offerLabel=useOfferLabel(),currency=useCurrency();
  const [tried,setTried]=useState(false),[extraOpen,setExtraOpen]=useState<Record<string,boolean>>({});
  const offer=selectedOffer!,error=validatePassengerDetails(passengers);
  const changePassenger=(id:string,key:keyof PassengerIdentity,value:string|boolean)=>{
    const next:PassengerDetails=copyPassengerDetails(passengers);
    const item=next.passengers.find(p=>p.id===id);
    if(!item)return;
    if(key==='assistanceRequested'&&typeof value==='boolean')item.assistanceRequested=value;
    if((key==='firstName'||key==='lastName'||key==='secondSurname'||key==='birthDate')&&typeof value==='string')item[key]=value;
    setPassengers(next);
  };
  const changeContact=(key:'email'|'phone',value:string)=>setPassengers({...passengers,contact:{...passengers.contact,[key]:value}});
  return <div className="checkout-container">
    <div className="page-title"><div><Eyebrow>{t('passengersEyebrow')}</Eyebrow><h1>{t('whoTravels')}</h1><p>{t('passengerIntro')}</p></div><span className="counter-badge">{passengers.passengers.length} {t(passengers.passengers.length===1?'passenger':'passengers')}</span></div>
    <div className="checkout-layout"><section className="form-card">
      {passengers.passengers.map((person,i)=><div className="person-section" key={person.id}>
        <div className="section-top"><h2>{t('passenger')} {i+1}</h2><span className="type-label">{t(person.type==='adult'?'adult':person.type==='child'?'child':'infant')}</span></div>
        <div className="form-grid two-columns">
          <label className="input-field"><span>{t('givenName')} *</span><input autoComplete="off" value={person.firstName} onChange={e=>changePassenger(person.id,'firstName',e.target.value)} placeholder={t('givenName')}/></label>
          <label className="input-field"><span>{t('firstSurname')} *</span><input autoComplete="off" value={person.lastName} onChange={e=>changePassenger(person.id,'lastName',e.target.value)} placeholder={t('firstSurname')}/></label>
          {person.type!=='adult'&&<label className="input-field"><span>{t('birthDate')} *</span><input type="date" value={person.birthDate} onChange={e=>changePassenger(person.id,'birthDate',e.target.value)}/></label>}
        </div>
        <p className="form-hint">{t('passengerHint')}</p>
        <button type="button" className="inline-link optional-toggle" aria-expanded={!!extraOpen[person.id]} onClick={()=>setExtraOpen(prev=>({...prev,[person.id]:!prev[person.id]}))}>{t('extraPassengerInfo')} {extraOpen[person.id]?<ChevronUp aria-hidden="true" size={15}/>:<ChevronDown aria-hidden="true" size={15}/>}</button>
        {extraOpen[person.id]&&<div className="optional-passenger-details">
          <label className="input-field"><span>{t('secondSurname')}</span><input autoComplete="off" value={person.secondSurname} onChange={e=>changePassenger(person.id,'secondSurname',e.target.value)} placeholder={t('secondSurname')}/></label>
          {person.type==='adult'&&<label className="input-field"><span>{t('birthOptional')}</span><input type="date" value={person.birthDate} onChange={e=>changePassenger(person.id,'birthDate',e.target.value)}/></label>}
          <label className="need-option"><input type="checkbox" checked={person.assistanceRequested} onChange={e=>changePassenger(person.id,'assistanceRequested',e.target.checked)}/><span>{t('assistance')}</span></label>
          {person.assistanceRequested&&<p className="form-hint">{t('assistanceHint')}</p>}
        </div>}
      </div>)}
      <div className="contact-section"><div className="section-top"><h2>{t('contact')}</h2><span className="type-label">{t('onceBooking')}</span></div>
        <div className="form-grid two-columns">
          <label className="input-field"><span>{t('email')} *</span><input type="email" autoComplete="email" value={passengers.contact.email} onChange={e=>changeContact('email',e.target.value)} placeholder="name@example.com"/></label>
          <label className="input-field"><span>{t('phone')} *</span><input type="tel" autoComplete="tel" value={passengers.contact.phone} onChange={e=>changeContact('phone',e.target.value)} placeholder="+34 600 000 000"/></label>
        </div><p className="form-hint">{t('privacyHint')}</p>
      </div>
      {tried&&error&&<div className="form-error" role="alert">{localizedValidation(error,t)}</div>}
      <div className="checkout-actions"><button type="button" className="button outline" onClick={()=>navigate('/results')}><ArrowLeft size={16} aria-hidden="true"/>{t('returnFlights')}</button><button type="button" className="button primary" onClick={()=>{setTried(true);if(!error)goPayment()}}>{t('continuePayment')} <ArrowRight size={16} aria-hidden="true"/></button></div>
    </section>
    <aside className="sidebar-card"><span className="eyebrow">{t('sidebarTrip')}</span><QueryOverview query={query}/><div className="sidebar-divider"/><strong>{offerLabel(offer.id)}</strong><p className="muted small">{t('resolvedAutomatically')}</p><div className="sidebar-divider"/><div className="price-line"><span>{t('mockTotal')}</span><strong>{currency(offer.totalPrice)}</strong></div></aside>
    </div>
  </div>;
}
