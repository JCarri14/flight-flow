import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Minus, Plus, X } from 'lucide-react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { validateStep, earliestDepartureISO, type DepartureMode, type FlightSearchQuery, type ReturnMode, type StayLength, type TravelNeeds } from '../core/flight.model';
import { Eyebrow } from '../components/Shared';
import { localizedValidation, useLanguage } from '../i18n/LanguageContext';

const departureChoices: ReadonlyArray<readonly [DepartureMode, 'week'|'month'|'nextMonth'|'exact']> = [
  ['week','week'],['month','month'],['nextMonth','nextMonth'],['exact','exact'],
];
const extraDepartureChoices: ReadonlyArray<readonly [DepartureMode, 'today'|'tomorrow'|'next3Months'|'next12Months'|'nextYear'|'year']> = [
  ['today','today'],['tomorrow','tomorrow'],['next3Months','next3Months'],
  ['next12Months','next12Months'],['nextYear','nextYear'],['year','year'],
];
const basicNeeds: ReadonlyArray<readonly [keyof TravelNeeds, 'cabinBag'|'checkedBag'|'chooseSeat'|'nonstopOnly']> = [
  ['cabinBag','cabinBag'],['checkedBag','checkedBag'],['seatSelection','chooseSeat'],['nonstopOnly','nonstopOnly'],
];
const extraNeeds: ReadonlyArray<readonly [keyof TravelNeeds, 'flexibleChanges'|'priorityBoarding'|'fastTrack'|'loungeAccess']> = [
  ['flexibleChanges','flexibleChanges'],['priorityBoarding','priorityBoarding'],['fastTrack','fastTrack'],['loungeAccess','loungeAccess'],
];
const stayChoices: Array<[StayLength,'weekend'|'days13'|'days47'|'days814'|'days15']> = [
  ['weekend','weekend'],['1-3','days13'],['4-7','days47'],['8-14','days814'],['15+','days15'],
];
const todayDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};

export function SearchWizard(){
  const {draft,setDraft,step,goToStep,previousStep,nextStep,editing,furthestStep,cancelEdit,validationError}=useFlightFlow();
  const {t,language}=useLanguage();
  const reduceMotion=useReducedMotion();
  const [minorsOpen,setMinorsOpen]=useState(()=>draft.children>0||draft.infants>0);
  const [moreNeedsOpen,setMoreNeedsOpen]=useState(false);
  const [moreDatesOpen,setMoreDatesOpen]=useState(false);
  const extraCount=extraNeeds.filter(([key])=>draft.needs[key]).length;
  const isExtraDate=extraDepartureChoices.some(([mode])=>mode===draft.departureMode);
  useEffect(()=>{if(draft.children||draft.infants)setMinorsOpen(true)},[draft.children,draft.infants]);
  const update=<K extends keyof FlightSearchQuery>(key:K,value:FlightSearchQuery[K])=>setDraft({...draft,[key]:value});
  const setNeed=(key:keyof TravelNeeds,checked:boolean)=>setDraft({...draft,needs:{...draft.needs,[key]:checked}});
  const setCount=(key:'adults'|'children'|'infants',direction:number)=>{
    const min=key==='adults'?1:0, total=draft.adults+draft.children+draft.infants;
    const next=Math.max(min,draft[key]+direction);
    if(direction>0&&total>=9)return;
    if(key==='adults'&&next<draft.infants)return;
    if(key==='infants'&&next>draft.adults)return;
    update(key,next);
  };
  const currentError=validateStep(draft,step);
  const count=(key:'adults'|'children'|'infants',label:string,description:string)=>
    <div className="counter-row" key={key}><div><strong>{label}</strong><small>{description}</small></div><div className="counter">
      <button type="button" onClick={()=>setCount(key,-1)} disabled={draft[key]<=(key==='adults'?1:0)||(key==='adults'&&draft.adults<=draft.infants)} aria-label={`${t('reduce')} ${label.toLowerCase()}`}><Minus size={15} aria-hidden="true"/></button>
      <output aria-label={label}>{draft[key]}</output>
      <button type="button" onClick={()=>setCount(key,1)} disabled={draft.adults+draft.children+draft.infants>=9||(key==='infants'&&draft.infants>=draft.adults)} aria-label={`${t('add')} ${label.toLowerCase()}`}><Plus size={15} aria-hidden="true"/></button>
    </div></div>;
  return <div className="search-container">
    <nav className="wizard-progress" aria-label={t('stepsAria')}>
      <div className="wizard-progress-heading">
        <Eyebrow>{t('eyebrowSearch')}</Eyebrow>
        <div className="wizard-progress-tools">
          <span className="wizard-progress-count" aria-live="polite">{step + 1} / 3</span>
          {editing && <button className="wizard-exit" type="button" onClick={cancelEdit} aria-label={t('backResults')} title={t('backResults')}><X size={16} aria-hidden="true"/></button>}
        </div>
      </div>
      <div className="steps" role="group" aria-label={t('stepsAria')}>
        {(['route','dates','yourTrip'] as const).map((key,i)=>{
          const done = editing ? i !== step : i < step;
          return <button key={key} className={`step-chip ${step===i?'active':done?'done':''}`} type="button" onClick={()=>goToStep(i)} disabled={!editing&&i>furthestStep} aria-current={step===i?'step':undefined}>
            <span className="step-track" aria-hidden="true"/>
            <span className="step-name">{done && <Check aria-hidden="true" className="step-check" size={13} strokeWidth={2.2}/>}{t(key)}</span>
          </button>;
        })}
      </div>
    </nav>
    <section className="wizard-card">
    <AnimatePresence mode="wait" initial={false}>
    <motion.div className="wizard-body" key={step}
      initial={reduceMotion ? false : {opacity:0,y:8}}
      animate={{opacity:1,y:0}}
      exit={reduceMotion ? {opacity:1} : {opacity:0,y:-6}}
      transition={{duration:reduceMotion?0:0.19,ease:'easeOut'}}
    >
      {step===0&&<><h1>{t('whereTitle')}</h1><p className="step-description">{t('whereSub')}</p>
        <div className="form-grid two-columns">
          <label className="input-field"><span>{t('origin')}</span><input value={draft.origin} autoComplete="off" list="flightflow-airports" onChange={e=>update('origin',e.target.value)} placeholder={t('airportPlaceholder')}/></label>
          <label className="input-field"><span>{t('destination')}</span><input value={draft.destination} autoComplete="off" list="flightflow-airports" onChange={e=>update('destination',e.target.value)} placeholder={t('destinationPlaceholder')}/></label>
        </div>
        <datalist id="flightflow-airports">{(language==='es'?['Barcelona','Roma','Madrid','París','Londres','Lisboa','Tokio']:['Barcelona','Rome','Madrid','Paris','London','Lisbon','Tokyo']).map(city=><option key={city} value={city}/>)}</datalist>
        <div className="form-section-inline"><span className="label">{t('tripType')}</span><div className="segmented" role="group" aria-label={t('tripType')}>
          <button type="button" className={draft.tripType==='roundTrip'?'chosen':''} onClick={()=>update('tripType','roundTrip')}>{t('roundTrip')}</button>
          <button type="button" className={draft.tripType==='oneWay'?'chosen':''} onClick={()=>update('tripType','oneWay')}>{t('oneWay')}</button>
        </div></div>
      </>}
      {step===1&&<><h1>{t('whenTitle')}</h1><p className="step-description">{t('whenSub')}</p>
        <div className="field-title">{t('whenLeave')}</div><div className="pill-options" role="group" aria-label={t('whenLeave')}>
          {departureChoices.map(([value,key])=><button type="button" key={value} className={draft.departureMode===value?'active':''} aria-pressed={draft.departureMode===value} onClick={()=>update('departureMode',value)}>{t(key)}</button>)}
        </div>
        <AnimatePresence initial={false}>
        {moreDatesOpen&&<motion.div className="expanded-options" id="flightflow-extra-dates" key="dates"
          initial={reduceMotion?false:{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
          exit={reduceMotion?{opacity:1}:{height:0,opacity:0}} transition={{duration:reduceMotion?0:0.21}}>
          <div className="pill-options additional-dates" role="group" aria-label={t('moreDates')}>
            {extraDepartureChoices.map(([value,key])=><button type="button" key={value} className={draft.departureMode===value?'active':''} aria-pressed={draft.departureMode===value} onClick={()=>update('departureMode',value)}>{t(key)}</button>)}
          </div>
        </motion.div>}
        </AnimatePresence>
        <div className="expander-row">
          <button type="button" className="inline-link expander-link" aria-expanded={moreDatesOpen} aria-controls={moreDatesOpen?"flightflow-extra-dates":undefined} onClick={()=>setMoreDatesOpen(v=>!v)}>{t(moreDatesOpen?'fewerDates':'moreDates')} <span aria-hidden="true">{moreDatesOpen?<ChevronUp size={15}/>:<ChevronDown size={15}/>} </span></button>
          {!moreDatesOpen&&isExtraDate&&<span className="expanded-selection" aria-live="polite">{t('chosenPeriod',{period:t(draft.departureMode)})}</span>}
        </div>
        {draft.departureMode==='exact'&&<label className="input-field date-input"><span>{t('departureDate')}</span><input type="date" min={todayDate()} value={draft.departureDate} onChange={e=>update('departureDate',e.target.value)}/></label>}
        {draft.tripType==='roundTrip'&&<div className="return-area"><div className="field-title">{t('whenReturn')}</div><div className="segmented return-modes" role="group" aria-label={t('whenReturn')}>
          {([['duration','duration'],['exact','exact'],['flexible','flexible']] as Array<[ReturnMode,'duration'|'exact'|'flexible']>).map(([value,key])=><button type="button" key={value} className={draft.returnMode===value?'chosen':''} onClick={()=>update('returnMode',value)}>{t(key)}</button>)}
        </div>
          {draft.returnMode==='duration'&&<label className="input-field"><span>{t('stay')}</span><select value={draft.stayLength} onChange={e=>update('stayLength',e.target.value as StayLength)}>{stayChoices.map(([value,key])=><option key={value} value={value}>{t(key)}</option>)}</select></label>}
          {draft.returnMode==='exact'&&<label className="input-field"><span>{t('returnDate')}</span><input type="date" min={earliestDepartureISO(draft)||todayDate()} value={draft.returnDate} onChange={e=>update('returnDate',e.target.value)}/></label>}
          {draft.returnMode==='flexible'&&<p className="soft-note">{t('returnFlexible')}</p>}
        </div>}
      </>}
      {step===2&&<><h1>{t('howTitle')}</h1><p className="step-description">{t('howSub')}</p>
        <div className="passenger-counters">{count('adults',t('adults'),t('adultsAge'))}
          <AnimatePresence initial={false}>{minorsOpen&&<motion.div className="minor-fields" key="minors" initial={reduceMotion?false:{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={reduceMotion?{opacity:1}:{height:0,opacity:0}} transition={{duration:reduceMotion?0:0.2}}>{count('children',t('children'),t('childrenAge'))}{count('infants',t('infants'),t('infantsAge'))}</motion.div>}</AnimatePresence>
          <button type="button" className="inline-link minors-toggle" onClick={()=>setMinorsOpen(x=>!x)} aria-expanded={minorsOpen}>{t(minorsOpen?'minorsHide':'minorsAsk')} <span aria-hidden="true">{minorsOpen?<ChevronUp size={15}/>:<ChevronDown size={15}/>} </span>{!minorsOpen&&draft.children+draft.infants>0&&<span className="count-pill">{draft.children+draft.infants} {t('minorsCount')}</span>}</button>
        </div>
        <div className="needs-section"><div className="field-title">{t('whatNeed')}</div><div className="needs-grid">
          {basicNeeds.map(([key,label])=><label className={`need-option ${draft.needs[key]?'checked':''}`} key={key}><input type="checkbox" checked={draft.needs[key]} onChange={e=>setNeed(key,e.target.checked)}/><span>{t(label)}</span></label>)}
        </div>
        <AnimatePresence initial={false}>
        {moreNeedsOpen&&<motion.div className="expanded-options extra-needs-panel" id="flightflow-extra-needs" key="extra-needs"
          initial={reduceMotion?false:{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
          exit={reduceMotion?{opacity:1}:{height:0,opacity:0}} transition={{duration:reduceMotion?0:0.21}}>
          <div className="field-title extra-needs-title">{t('extraNeedsTitle')}</div>
          <div className="needs-grid">
            {extraNeeds.map(([key,label])=><label className={`need-option ${draft.needs[key]?'checked':''}`} key={key}><input type="checkbox" checked={draft.needs[key]} onChange={e=>setNeed(key,e.target.checked)}/><span>{t(label)}</span></label>)}
          </div>
        </motion.div>}
        </AnimatePresence>
        <div className="expander-row">
          <button type="button" className="inline-link expander-link" aria-expanded={moreNeedsOpen} aria-controls={moreNeedsOpen?"flightflow-extra-needs":undefined} onClick={()=>setMoreNeedsOpen(v=>!v)}>{t(moreNeedsOpen?'fewerNeeds':'moreNeeds')} <span aria-hidden="true">{moreNeedsOpen?<ChevronUp size={15}/>:<ChevronDown size={15}/>} </span></button>
          {extraCount>0&&<span className="expanded-selection" aria-live="polite">{t('activeExtras',{count:extraCount})}</span>}
        </div></div>
      </>}
    </motion.div>
    </AnimatePresence>
    <div className="wizard-foot">
      {validationError&&<p className="form-error" role="alert">{localizedValidation(validationError,t)}</p>}
      <div className="wizard-actions">
        {step>0 ? <button type="button" className="button outline" onClick={previousStep}><ArrowLeft aria-hidden="true" size={16}/>{t('back')}</button>
          : editing ? <button type="button" className="button outline" onClick={cancelEdit}><ArrowLeft aria-hidden="true" size={16}/>{t('backShort')}</button> : null}
        <button type="button" className="button primary main-action" disabled={!!currentError} onClick={()=>void nextStep()}>{step<2?t('continue'):t('findFlights')} <ArrowRight size={16} aria-hidden="true"/></button>
      </div>
    </div>
  </section></div>;
}
