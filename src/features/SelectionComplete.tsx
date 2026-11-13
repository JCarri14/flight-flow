import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, CircleCheck, RotateCcw } from 'lucide-react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { useCurrency, useOfferLabel, useLegText } from '../components/Shared';
import { useLanguage } from '../i18n/LanguageContext';
import { formatDate, passengerSummary } from '../core/flight.model';

/** The POC ends here. No passengers, checkout or payment are collected. */
export function SelectionComplete() {
  const { query, selectedOffer, backToResults, restart } = useFlightFlow();
  const { t, language } = useLanguage();
  const currency = useCurrency(), offerLabel = useOfferLabel(), legText = useLegText();
  const reducedMotion = useReducedMotion();
  if (!selectedOffer) return null;

  return <motion.div className="confirmation-container"
    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.24 }}>
    <section className="confirmation-card complete-info-card">
      <header className="complete-header">
        <div className="confirmation-icon" aria-hidden="true"><CircleCheck size={28} strokeWidth={1.9}/></div>
        <div className="complete-header-copy">
          <h1>{t('selectionCompleteTitle')}</h1>
          <p className="complete-description">{t('selectionCompleteSub')}</p>
        </div>
      </header>
      <div className="complete-journey" aria-label={t('selectionSummary')}>
        <div className="complete-journey-top">
          <div>
            <span className="complete-label">{t('completeTrip')}</span>
            <h2>{query.origin} <span aria-hidden="true">→</span> {query.destination}</h2>
            <p>{t(query.tripType === 'roundTrip' ? 'roundTrip' : 'oneWay')} · {passengerSummary(query, language)}</p>
          </div>
          <div className="complete-offer-badges">
            <span className="complete-offer-type">{offerLabel(selectedOffer.id)}</span>
            {selectedOffer.alsoBestBalance && <span className="complete-offer-type">{t('balanced')}</span>}
          </div>
        </div>
        <div className="complete-flights">
          {selectedOffer.legs.map(leg => {
            const detail = legText(leg);
            return <div className="complete-flight" key={leg.label}>
              <div><span className="complete-leg-label">{t(leg.label === 'IDA' ? 'outbound' : 'inbound')}</span>
                <strong>{formatDate(leg.dateISO, language)}</strong></div>
              <div><strong>{leg.departureTime} – {leg.arrivalTime}</strong>
                <span>{detail.stops} · {detail.duration}</span></div>
            </div>;
          })}
        </div>
        <div className="complete-price">
          <span>{t('samplePrice')}</span>
          <strong>{currency(selectedOffer.totalPrice)}</strong>
        </div>
      </div>
      <div className="complete-actions">
        <button type="button" className="button outline" onClick={backToResults}><ArrowLeft size={16} aria-hidden="true"/> {t('backToOffers')}</button>
        <button type="button" className="button primary" onClick={restart}><RotateCcw size={16} aria-hidden="true"/> {t('restart')}</button>
      </div>
      <p className="complete-disclaimer">{t('completeDemoNote')}</p>
    </section>
  </motion.div>;
}
