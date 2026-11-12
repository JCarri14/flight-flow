import { useFlightFlow } from '../state/FlightFlowContext';
import { motion, useReducedMotion } from 'motion/react';
import { CircleCheck, RotateCcw } from 'lucide-react';
import { QueryOverview, useCurrency, Eyebrow, useOfferLabel } from '../components/Shared';
import { useLanguage } from '../i18n/LanguageContext';

export function Confirmation(){
  const {query,selectedOffer,restart}=useFlightFlow(),{t}=useLanguage(),offerLabel=useOfferLabel(),currency=useCurrency();
  const offer=selectedOffer!;
  const reduceMotion=useReducedMotion();
  return <motion.div className="confirmation-container" initial={reduceMotion?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduceMotion?0:0.24}}>
    <div className="confirmation-icon" aria-hidden="true"><CircleCheck size={36} strokeWidth={1.8}/></div><Eyebrow>{t('confirmationEyebrow')}</Eyebrow>
    <h1>{t('confirmationTitle')}</h1><p>{t('confirmationSub')}</p>
    <div className="confirmation-card"><QueryOverview query={query}/><div className="sidebar-divider"/>
      <div className="price-line"><span>{t('chosenOffer')}</span><strong>{offerLabel(offer.id)}</strong></div>
      <div className="price-line"><span>{t('samplePrice')}</span><strong>{currency(offer.totalPrice)}</strong></div>
    </div>
    <div className="simulated-warning"><strong>{t('notBooking')}</strong> {t('noBookingDetail')}</div>
    <button type="button" className="button primary" onClick={restart}><RotateCcw size={16} aria-hidden="true"/> {t('restart')}</button>
  </motion.div>;
}
