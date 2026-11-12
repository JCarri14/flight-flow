import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
export function AboutConcept({onClose}:{onClose:()=>void}){
  const {t}=useLanguage();
  const reduceMotion=useReducedMotion();
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;closeRef.current?.focus();const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>{window.removeEventListener('keydown',close);previous?.focus()}},[onClose]);
  return <motion.div className="about-backdrop" initial={reduceMotion?false:{opacity:0}} animate={{opacity:1}} transition={{duration:reduceMotion?0:0.17}} onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <motion.section className="about-dialog" initial={reduceMotion?false:{opacity:0,y:10,scale:0.99}} animate={{opacity:1,y:0,scale:1}} transition={{duration:reduceMotion?0:0.2}} role="dialog" aria-modal="true" aria-label={t('about')}>
      <div className="about-head"><span className="eyebrow">{t('conceptEyebrow')}</span><button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label={t('close')}><X size={18} aria-hidden="true"/></button></div>
      <h2>{t('conceptTitle')}</h2><p>{t('conceptIntro')}</p>
      <div className="concept-grid">{([1,2,3,4] as const).map(i=><div key={i}><b>{t(`concept${i}Title`)}</b><p>{t(`concept${i}Desc`)}</p></div>)}</div>
      <div className="about-warning">{t('conceptWarning')}</div>
      <button className="button primary full" onClick={onClose}>{t('returnDemo')}</button>
    </motion.section>
  </motion.div>;
}
