import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeftRight, CalendarDays, Check, ChevronDown, ChevronUp,
  Minus, Plus, Search, SlidersHorizontal, UsersRound, X,
} from 'lucide-react';
import {
  copyQuery, earliestDepartureISO, formatDate, passengerSummary,
  type DepartureMode, type FlightSearchQuery, type ReturnMode,
  type StayLength, type TravelNeeds,
} from '../core/flight.model';
import { useFlightFlow } from '../state/FlightFlowContext';
import { localizedValidation, useLanguage } from '../i18n/LanguageContext';
import { Eyebrow } from '../components/Shared';

type Menu = 'departure' | 'return' | 'travellers' | 'needs' | null;
type DepartureKey = 'week' | 'month' | 'nextMonth' | 'exact' | 'today' | 'tomorrow' | 'next3Months' | 'next12Months' | 'nextYear' | 'year';
type NeedKey = 'cabinBag' | 'checkedBag' | 'chooseSeat' | 'nonstopOnly' | 'flexibleChanges' | 'priorityBoarding' | 'fastTrack' | 'loungeAccess';

const mainPeriods: ReadonlyArray<readonly [DepartureMode, DepartureKey]> = [
  ['week', 'week'], ['month', 'month'], ['nextMonth', 'nextMonth'], ['exact', 'exact'],
];
const extraPeriods: ReadonlyArray<readonly [DepartureMode, DepartureKey]> = [
  ['today', 'today'], ['tomorrow', 'tomorrow'], ['next3Months', 'next3Months'],
  ['next12Months', 'next12Months'], ['nextYear', 'nextYear'], ['year', 'year'],
];
const lengths: ReadonlyArray<readonly [StayLength, 'weekend' | 'days13' | 'days47' | 'days814' | 'days1521' | 'anyLength']> = [
  ['weekend', 'weekend'], ['1-3', 'days13'], ['4-7', 'days47'], ['8-14', 'days814'], ['15-21', 'days1521'], ['any', 'anyLength'],
];
const needs: ReadonlyArray<readonly [keyof TravelNeeds, NeedKey]> = [
  ['cabinBag', 'cabinBag'], ['checkedBag', 'checkedBag'], ['seatSelection', 'chooseSeat'],
  ['nonstopOnly', 'nonstopOnly'], ['flexibleChanges', 'flexibleChanges'],
  ['priorityBoarding', 'priorityBoarding'], ['fastTrack', 'fastTrack'], ['loungeAccess', 'loungeAccess'],
];
const dateToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function CompactSearch() {
  const { draft, setDraft, submitSearch, editing, cancelEdit, validationError } = useFlightFlow();
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<Menu>(null);
  const [moreDates, setMoreDates] = useState(false);
  const [moreNeeds, setMoreNeeds] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const update = <K extends keyof FlightSearchQuery>(key: K, value: FlightSearchQuery[K]) =>
    setDraft({ ...draft, [key]: value });
  const updateNeed = (key: keyof TravelNeeds, value: boolean) =>
    setDraft({ ...draft, needs: { ...draft.needs, [key]: value } });
  const toggle = (menu: Exclude<Menu, null>) => setOpen(current => current === menu ? null : menu);
  const changeCounter = (key: 'adults' | 'children' | 'infants', diff: number) => {
    const next = copyQuery(draft);
    const value = next[key] + diff;
    if (value < (key === 'adults' ? 1 : 0)) return;
    if (diff > 0 && next.adults + next.children + next.infants >= 9) return;
    if (key === 'infants' && value > next.adults) return;
    next[key] = value;
    if (next.infants > next.adults) next.infants = next.adults;
    setDraft(next);
  };

  const countNeeds = needs.filter(([key]) => draft.needs[key]).length;
  const outboundText = draft.departureMode === 'exact'
    ? (draft.departureDate ? formatDate(draft.departureDate, language) : t('exact'))
    : t(draft.departureMode);
  const stayKey = lengths.find(([length]) => length === draft.stayLength)?.[1] ?? 'days47';
  const inboundText = draft.returnMode === 'exact'
    ? (draft.returnDate ? formatDate(draft.returnDate, language) : t('exact'))
    : t(stayKey);
  const motionProps = {
    initial: reduceMotion ? false : { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 },
    transition: { duration: reduceMotion ? 0 : 0.16 },
  } as const;
  const airports = language === 'es'
    ? ['Barcelona', 'Madrid', 'Roma', 'París', 'Londres', 'Lisboa', 'Tokio']
    : ['Barcelona', 'Madrid', 'Rome', 'Paris', 'London', 'Lisbon', 'Tokyo'];

  const renderPeriodButtons = (choices: ReadonlyArray<readonly [DepartureMode, DepartureKey]>) =>
    choices.map(([value, key]) => <button type="button" key={value}
      className={`quick-pill ${draft.departureMode === value ? 'is-active' : ''}`}
      aria-pressed={draft.departureMode === value}
      onClick={() => {
        update('departureMode', value);
        if (value !== 'exact') setOpen(null);
      }}>{t(key)}</button>);
  const renderCounter = (key: 'adults' | 'children' | 'infants', label: string, description: string) => (
    <div className="quick-counter" key={key}>
      <div><strong>{label}</strong><small>{description}</small></div>
      <div className="quick-counter-buttons">
        <button type="button" aria-label={`${t('reduce')} ${label.toLowerCase()}`}
          disabled={draft[key] <= (key === 'adults' ? 1 : 0)} onClick={() => changeCounter(key, -1)}><Minus size={15}/></button>
        <output>{draft[key]}</output>
        <button type="button" aria-label={`${t('add')} ${label.toLowerCase()}`}
          disabled={draft.adults + draft.children + draft.infants >= 9 || (key === 'infants' && draft.infants >= draft.adults)}
          onClick={() => changeCounter(key, 1)}><Plus size={15}/></button>
      </div>
    </div>
  );

  return <div className="compact-search" ref={containerRef}>
    <div className="quick-intro">
      <Eyebrow>{t('eyebrowSearch')}</Eyebrow>
      <h1>{t('quickTitle')}</h1>
      <p>{t('quickSubtitle')}</p>
    </div>

    <div className="quick-shell">
      <div className="quick-toolbar">
        <div className="quick-trip-switch" role="group" aria-label={t('tripType')}>
          <button type="button" className={draft.tripType === 'oneWay' ? 'is-active' : ''}
            aria-pressed={draft.tripType === 'oneWay'} onClick={() => update('tripType', 'oneWay')}>{t('oneWay')}</button>
          <button type="button" className={draft.tripType === 'roundTrip' ? 'is-active' : ''}
            aria-pressed={draft.tripType === 'roundTrip'} onClick={() => update('tripType', 'roundTrip')}>{t('roundTrip')}</button>
        </div>
        <div className="quick-needs-anchor">
          <button type="button" className={`quick-filter-trigger ${countNeeds ? 'has-needs' : ''}`}
            aria-expanded={open === 'needs'} aria-controls="quick-needs-menu" onClick={() => toggle('needs')}>
            <SlidersHorizontal size={16} aria-hidden="true"/>{t('quickNeeds')}
            {countNeeds > 0 && <span className="quick-count">{countNeeds}</span>}
            <ChevronDown size={15} aria-hidden="true"/>
          </button>
          <AnimatePresence initial={false}>{open === 'needs' && <motion.div {...motionProps} id="quick-needs-menu" className="quick-popover quick-needs-popover" key="quick-needs">
            <div className="quick-menu-head"><strong>{t('quickOptions')}</strong><button type="button" aria-label={t('quickClose')} onClick={() => setOpen(null)}><X size={17}/></button></div>
            <div className="quick-need-grid">
              {needs.slice(0, 4).map(([key, translation]) => <label className="quick-check" key={key}>
                <input type="checkbox" checked={draft.needs[key]} onChange={e => updateNeed(key, e.target.checked)}/>
                <span>{t(translation)}</span>
              </label>)}
            </div>
            <AnimatePresence initial={false}>{moreNeeds && <motion.div {...motionProps} key="quick-more-needs" className="quick-more-need-fields">
              <div className="quick-popover-section-title">{t('extraNeedsTitle')}</div>
              <div className="quick-need-grid">
                {needs.slice(4).map(([key, translation]) => <label className="quick-check" key={key}>
                  <input type="checkbox" checked={draft.needs[key]} onChange={e => updateNeed(key, e.target.checked)}/>
                  <span>{t(translation)}</span>
                </label>)}
              </div>
            </motion.div>}</AnimatePresence>
            <button type="button" className="quick-menu-expand" onClick={() => setMoreNeeds(value => !value)}>
              {t(moreNeeds ? 'quickFewerNeeds' : 'quickMoreNeeds')} {moreNeeds ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
            </button>
            <p className="quick-menu-note">{t('quickSummary')}</p>
          </motion.div>}</AnimatePresence>
        </div>
      </div>

      <div className={`quick-fields ${draft.tripType === 'roundTrip' ? 'has-return' : 'one-way'}`}>
        <label className="quick-field quick-origin">
          <span className="quick-field-label">{t('origin')}</span>
          <input list="quick-airports" autoComplete="off" value={draft.origin} placeholder={t('airportPlaceholder')}
            onChange={e => update('origin', e.target.value)} />
        </label>
        <button type="button" className="quick-swap" aria-label={t('quickSwap')} title={t('quickSwap')}
          onClick={() => setDraft({ ...draft, origin: draft.destination, destination: draft.origin })}>
          <ArrowLeftRight size={18} aria-hidden="true"/>
        </button>
        <label className="quick-field quick-destination">
          <span className="quick-field-label">{t('destination')}</span>
          <input list="quick-airports" autoComplete="off" value={draft.destination} placeholder={t('destinationPlaceholder')}
            onChange={e => update('destination', e.target.value)} />
        </label>
        <datalist id="quick-airports">{airports.map(name => <option key={name} value={name}/>)}</datalist>
        <div className="quick-field quick-date-field">
          <button type="button" className="quick-select-field" aria-expanded={open === 'departure'} aria-controls="quick-departure-menu"
            onClick={() => toggle('departure')}>
            <span className="quick-field-label">{t('quickDeparture')}</span>
            <span className="quick-field-value"><CalendarDays size={16} aria-hidden="true"/>{outboundText}<ChevronDown size={14} aria-hidden="true"/></span>
          </button>
          <AnimatePresence initial={false}>{open === 'departure' && <motion.div {...motionProps} className="quick-popover quick-date-popover" id="quick-departure-menu" key="quick-departure">
            <div className="quick-menu-head"><strong>{t('whenLeave')}</strong><button type="button" aria-label={t('quickClose')} onClick={() => setOpen(null)}><X size={17}/></button></div>
            <div className="quick-pill-grid">{renderPeriodButtons(mainPeriods)}</div>
            {moreDates && <div className="quick-pill-grid quick-more-periods">{renderPeriodButtons(extraPeriods)}</div>}
            <button type="button" className="quick-menu-expand" onClick={() => setMoreDates(value => !value)}>
              {t(moreDates ? 'quickFewerDates' : 'quickMoreDates')} {moreDates ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
            </button>
            {draft.departureMode === 'exact' && <label className="quick-date-input"><span>{t('departureDate')}</span>
              <input type="date" min={dateToday()} value={draft.departureDate} onChange={e => update('departureDate', e.target.value)}/></label>}
          </motion.div>}</AnimatePresence>
        </div>
        {draft.tripType === 'roundTrip' && <div className="quick-field quick-date-field">
          <button type="button" className="quick-select-field" aria-expanded={open === 'return'} aria-controls="quick-return-menu"
            onClick={() => toggle('return')}>
            <span className="quick-field-label">{t('quickReturn')}</span>
            <span className="quick-field-value"><CalendarDays size={16} aria-hidden="true"/>{inboundText}<ChevronDown size={14} aria-hidden="true"/></span>
          </button>
          <AnimatePresence initial={false}>{open === 'return' && <motion.div {...motionProps} className="quick-popover quick-return-popover" id="quick-return-menu" key="quick-return">
            <div className="quick-menu-head"><strong>{t('whenReturn')}</strong><button type="button" aria-label={t('quickClose')} onClick={() => setOpen(null)}><X size={17}/></button></div>
            <div className="quick-return-tabs" role="group" aria-label={t('whenReturn')}>
              {([['duration', 'duration'], ['exact', 'exact']] as const).map(([value, key]) =>
                <button key={value} type="button" className={draft.returnMode === value ? 'is-active' : ''}
                  onClick={() => update('returnMode', value as ReturnMode)} aria-pressed={draft.returnMode === value}>{t(key)}</button>)}
            </div>
            {draft.returnMode === 'duration' && <label className="quick-date-input"><span>{t('stay')}</span>
              <select value={draft.stayLength} onChange={e => update('stayLength', e.target.value as StayLength)}>
                {lengths.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
              </select></label>}
            {draft.returnMode === 'exact' && <label className="quick-date-input"><span>{t('returnDate')}</span>
              <input type="date" min={earliestDepartureISO(draft) || dateToday()} value={draft.returnDate}
                onChange={e => update('returnDate', e.target.value)}/></label>}
            {draft.returnMode === 'duration' && draft.stayLength === 'any' && <p className="quick-menu-note">{t('anyLengthNote')}</p>}
          </motion.div>}</AnimatePresence>
        </div>}
        <div className="quick-field quick-travellers-field">
          <button type="button" className="quick-select-field" aria-expanded={open === 'travellers'} aria-controls="quick-travellers-menu"
            onClick={() => toggle('travellers')}>
            <span className="quick-field-label">{t('quickTravellers')}</span>
            <span className="quick-field-value"><UsersRound size={16} aria-hidden="true"/>{passengerSummary(draft, language)}<ChevronDown size={14} aria-hidden="true"/></span>
          </button>
          <AnimatePresence initial={false}>{open === 'travellers' && <motion.div {...motionProps} className="quick-popover quick-travellers-popover" id="quick-travellers-menu" key="quick-travellers">
            <div className="quick-menu-head"><strong>{t('quickTravellers')}</strong><button type="button" aria-label={t('quickClose')} onClick={() => setOpen(null)}><X size={17}/></button></div>
            {renderCounter('adults', t('adults'), t('adultsAge'))}
            {renderCounter('children', t('children'), t('childrenAge'))}
            {renderCounter('infants', t('infants'), t('infantsAge'))}
            <p className="quick-menu-note">{t('quickPassengersHint')}</p>
          </motion.div>}</AnimatePresence>
        </div>
        <button type="button" className="button primary quick-search-button" onClick={() => { setOpen(null); void submitSearch(); }}>
          <Search size={17} aria-hidden="true"/><span>{t('quickFind')}</span>
        </button>
      </div>
      {validationError && <p className="form-error quick-validation" role="alert">{localizedValidation(validationError, t)}</p>}
      <div className="quick-bottom">
        <p><Check size={15} aria-hidden="true"/>{t('quickSearchTip')}</p>
        {editing && <button type="button" className="inline-link" onClick={cancelEdit}>{t('backResults')}</button>}
      </div>
    </div>
  </div>;
}
