import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, CircleCheck, RotateCcw } from 'lucide-react';
import { useFlightFlow } from '../state/FlightFlowContext';
import { Eyebrow, useCurrency, useOfferLabel } from '../components/Shared';
import { useLanguage } from '../i18n/LanguageContext';
import { dateSummary, passengerSummary } from '../core/flight.model';

/** The POC ends here. No passengers, checkout or payment are collected. */
export function SelectionComplete() {
  const { query, selectedOffer, backToResults, restart } = useFlightFlow();
  const { t, language } = useLanguage();
  const currency = useCurrency(), offerLabel = useOfferLabel();
  const reducedMotion = useReducedMotion();
  if (!selectedOffer) return null;

  return <motion.div className="confirmation-container"
    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.24 }}>
    <div className="confirmation-card complete-info-card">
      <div className="confirmation-icon" aria-hidden="true"><CircleCheck size={36} strokeWidth={1.8}/></div>
      <Eyebrow>{t('confirmationEyebrow')}</Eyebrow>
      <h1>{t('selectionCompleteTitle')}</h1>
      <p className="complete-description">{t('selectionCompleteSub')}</p>
      <div className="complete-summary" aria-label={t('selectionSummary')}>
        <div className="price-line"><span>{t('route')}</span><strong>{query.origin} → {query.destination}</strong></div>
        <div className="price-line"><span>{t('tripType')}</span><strong>{t(query.tripType === 'roundTrip' ? 'roundTrip' : 'oneWay')}</strong></div>
        <div className="price-line"><span>{t('dates')}</span><strong>{dateSummary(query, language)}</strong></div>
        <div className="price-line"><span>{t('travelerCount')}</span><strong>{passengerSummary(query, language)}</strong></div>
        <div className="price-line"><span>{t('chosenOffer')}</span><strong>{offerLabel(selectedOffer.id)}</strong></div>
        <div className="price-line"><span>{t('samplePrice')}</span><strong>{currency(selectedOffer.totalPrice)}</strong></div>
      </div>
      <div className="simulated-warning"><strong>{t('notBooking')}</strong> {t('noBookingDetail')}</div>
      <div className="complete-actions">
        <button type="button" className="button outline" onClick={backToResults}><ArrowLeft size={16} aria-hidden="true"/> {t('backToOffers')}</button>
        <button type="button" className="button primary" onClick={restart}><RotateCcw size={16} aria-hidden="true"/> {t('restart')}</button>
      </div>
    </div>
  </motion.div>;
}
