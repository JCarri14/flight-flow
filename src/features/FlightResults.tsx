import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowDown, ArrowUp, Check, CircleCheck, Pencil, Sparkles, Wallet } from 'lucide-react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { Eyebrow, SearchChips, useCurrency, useOfferLabel, useLegText } from '../components/Shared';
import { dateSummary, passengerSummary, comparablePricePerPerson, type FlightLeg, type FlightOffer } from '../core/flight.model';
import { useLanguage } from '../i18n/LanguageContext';

function durationMinutes(leg: FlightLeg): number {
  const parts = leg.durationLabel.match(/(\d+) h (\d+) min/);
  return parts ? Number(parts[1]) * 60 + Number(parts[2]) : 0;
}

/** Dates and airports are prominent in comparison, not hidden in a tiny all-caps label. */
function displayFlightDate(iso: string, locale: 'es' | 'en'): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB',
    { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  return formatted.charAt(0).toLocaleUpperCase(locale === 'es' ? 'es-ES' : 'en-GB') + formatted.slice(1);
}

/** Only show an IATA code when it is known from a fixed, illustrative mapping. */
function airportShortName(place: string): string {
  const city = place.trim().toLowerCase().replace(/\s*\([^)]*\)\s*$/, '');
  const codes: Record<string, string> = {
    'barcelona': 'BCN', 'madrid': 'MAD', 'roma': 'FCO', 'rome': 'FCO',
    'parís': 'PAR', 'paris': 'PAR', 'londres': 'LON', 'london': 'LON',
    'lisboa': 'LIS', 'lisbon': 'LIS', 'tokio': 'TYO', 'tokyo': 'TYO',
  };
  return codes[city] || place;
}

function FlightRow({ offer, selected, onSelect }: { offer: FlightOffer; selected: boolean; onSelect: () => void }) {
  const { query } = useFlightFlow();
  const { t, language } = useLanguage();
  const reduceMotion=useReducedMotion();
  const offerLabel = useOfferLabel(), legText = useLegText(), currency = useCurrency();
  const balanced = offer.id === 'balanced';
  const perPerson = comparablePricePerPerson(offer, query);
  return <motion.button className={`offer-row ${selected ? 'selected' : ''}`} type="button" onClick={onSelect}
    whileHover={reduceMotion ? undefined : {y:-1}}
    whileTap={reduceMotion ? undefined : {scale:0.997}}
    transition={{duration:0.14}}
    aria-pressed={selected} aria-label={`${offerLabel(offer.id)}, ${currency(offer.totalPrice)}, ${t('selectOfferA11y')}`}>
    <div className="offer-row-main">
      <div className="offer-kind">
        <span className={`offer-label ${balanced ? 'balanced' : ''}`}>{balanced?<Sparkles aria-hidden="true" size={14}/>:<Wallet aria-hidden="true" size={14}/>} {offerLabel(offer.id)}</span>
        {offer.alsoBestBalance && <span className="offer-label balanced"><Sparkles aria-hidden="true" size={14}/> {t('balanced')}</span>}
      </div>
      <div className={`legs ${offer.legs.length === 1 ? 'one-leg' : ''}`}>
        {offer.legs.map(leg => {
          const detail = legText(leg);
          const departing = leg.label === 'IDA';
          const from = airportShortName(departing ? query.origin : query.destination);
          const to = airportShortName(departing ? query.destination : query.origin);
          return <div className="leg" key={leg.label}>
            <span className="leg-heading">{t(departing ? 'outbound' : 'inbound')}</span>
            <strong className="leg-date">{displayFlightDate(leg.dateISO, language)}</strong>
            <strong className="leg-times">{leg.departureTime} – {leg.arrivalTime}</strong>
            <span className="leg-note">{from} → {to} · {detail.stops} · {detail.duration}</span>
          </div>;
        })}
      </div>
      <div className="offer-price">
        <strong>{currency(offer.totalPrice)}</strong>
        <span>{t('totalTrip')}</span>
        {perPerson !== null && <span className="offer-per-person">{currency(perPerson)} {t('perPerson')}</span>}
      </div>
    </div>
    <div className="offer-row-footer">
      <span><Check className="check-mark" aria-hidden="true" size={15} strokeWidth={2.2}/> {t('needsMet')}</span>
      <span className={`offer-selection ${selected ? 'selected' : ''}`}>{selected ? <><CircleCheck aria-hidden="true" size={15}/>{t('selected')}</> : ''}</span>
    </div>
  </motion.button>;
}

export function FlightResults() {
  const { query, offers, selectedId, selectOffer, selectedOffer, beginEdit, finishDemo } = useFlightFlow();
  const { t, language } = useLanguage();
  const reduceMotion=useReducedMotion();
  const offerLabel = useOfferLabel(), currency = useCurrency();
  const [showMore, setShowMore] = useState(false);
  const cheapest = offers.find(o => o.id === 'cheapest');
  const balanced = offers.find(o => o.id === 'balanced');
  const priceDifference = balanced && cheapest ? balanced.totalPrice - cheapest.totalPrice : 0;
  const stopsAvoided = balanced && cheapest ? Math.max(0,
    cheapest.legs.reduce((sum, leg) => sum + leg.stops, 0) - balanced.legs.reduce((sum, leg) => sum + leg.stops, 0),
  ) : 0;
  const minutesSaved = balanced && cheapest ? Math.max(0,
    cheapest.legs.reduce((sum, leg) => sum + durationMinutes(leg), 0)
      - balanced.legs.reduce((sum, leg) => sum + durationMinutes(leg), 0),
  ) : 0;
  const durationLabel = language === 'es'
    ? `${Math.floor(minutesSaved / 60)} h ${minutesSaved % 60} min`
    : `${Math.floor(minutesSaved / 60)}h ${minutesSaved % 60}m`;
  const comparisonText = stopsAvoided > 0
    ? t(stopsAvoided === 1 ? 'compareSavedOneStop' : 'compareSavedMultipleStops', { stops: stopsAvoided, time: durationLabel })
    : t(query.tripType === 'roundTrip' ? 'compareDaytimeRoundTrip' : 'compareDaytimeOneWay');

  return <div className="results-container">
    <header className="results-query-header">
      <div className="results-query-body">
        <Eyebrow>{t('resultsEyebrow')}</Eyebrow>
        <div className="results-query-line">
          <div className="results-query-title">
            <h1>{query.origin} <span className="route-arrow" aria-hidden="true">→</span> {query.destination}</h1>
            <p>{t(query.tripType === 'roundTrip' ? 'roundTrip' : 'oneWay')}
              <span>·</span>{dateSummary(query, language)}
              <span>·</span>{passengerSummary(query, language)}</p>
          </div>
          <button type="button" className="button outline edit-button" onClick={beginEdit}><Pencil aria-hidden="true" size={15}/><span>{t('edit')}</span></button>
        </div>
        <SearchChips query={query}/>
      </div>
    </header>

    <div className="results-list-heading">
      <span>{offers.length} {t(offers.length === 1 ? 'choice' : 'choices')}</span>
      <span>{t('totalPrices')}</span>
    </div>
    <section className="offers-panel" aria-label={t('offersAria')}>
      {offers.map(offer => <FlightRow key={offer.id} offer={offer} selected={selectedId === offer.id} onSelect={() => selectOffer(offer.id)}/>)}
    </section>
    {balanced && cheapest && <section className="insight-bar">
      <Sparkles className="insight-sparkle" aria-hidden="true" size={18}/>
      <div><strong>{t('comparison')}</strong><p>{comparisonText} {t('compareIncrement', { price: currency(priceDifference) })}</p></div>
    </section>}
    <AnimatePresence initial={false}>
    {selectedOffer && <motion.div className="selected-bar" key="selected-offer"
      initial={reduceMotion?false:{opacity:0,y:8}} animate={{opacity:1,y:0}}
      exit={reduceMotion?{opacity:1}:{opacity:0,y:5}}
      transition={{duration:reduceMotion?0:0.2}}>
      <div className="selected-bar-info"><span className="selected-disc" aria-hidden="true"><Check size={17} strokeWidth={2.3}/></span>
        <div><strong>{offerLabel(selectedOffer.id)} {t('selectedOffer')}</strong><span>{t('selectedHint')}</span></div>
      </div>
      <button type="button" className="button primary" onClick={finishDemo}>{t('finishDemo')} <ArrowRight aria-hidden="true" size={16}/></button>
    </motion.div>}
    </AnimatePresence>
    <div className="all-offers">
      <button className="inline-link" type="button" onClick={() => setShowMore(x => !x)} aria-expanded={showMore}>
        {t(showMore ? 'hideAlternatives' : 'showAlternatives')} {showMore?<ArrowUp size={15} aria-hidden="true"/>:<ArrowDown size={15} aria-hidden="true"/>}
      </button>
      {showMore && <div className="more-note">{t('alternativesNote')}</div>}
    </div>
    <p className="page-footnote">{t('resultsFooter')}</p>
  </div>;
}
