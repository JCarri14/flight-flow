import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Info, ListChecks, Search } from 'lucide-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useFlightFlow } from './state/FlightFlowContext';
import { useLanguage } from './i18n/LanguageContext';
import { SearchWizard } from './features/SearchWizard';
import { CompactSearch } from './features/CompactSearch';
import { FlightResults } from './features/FlightResults';
import { SelectionComplete } from './features/SelectionComplete';
import { AboutConcept } from './components/AboutConcept';
import { StatusLoading } from './components/Shared';

export function App(){
  const {loading,hasResults,selectedOffer,searchMode,setSearchMode}=useFlightFlow();
  const {language,setLanguage,t}=useLanguage();
  const [aboutOpen,setAboutOpen]=useState(false);
  const location=useLocation();
  const reduceMotion=useReducedMotion();
  return <>
    <header className="site-header"><div className="site-header-inner">
      <div className="brand"><span className="brand-mark" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={2.2}/></span><span>FlightFlow<span className="brand-dot">.</span></span></div>
      <div className="header-actions">
        <span className="header-demo">{t('poc')}</span>
        <div className="language-switch" role="group" aria-label="Language / Idioma">
          <button type="button" className={language==='es'?'active':''} onClick={()=>setLanguage('es')} aria-pressed={language==='es'} lang="es">ES</button>
          <button type="button" className={language==='en'?'active':''} onClick={()=>setLanguage('en')} aria-pressed={language==='en'} lang="en">EN</button>
        </div>
        <button type="button" className="about-button" aria-label={t('about')} onClick={()=>setAboutOpen(true)}><span className="about-full">{t('about')} <ArrowUpRight aria-hidden="true" size={14}/></span><span className="about-short" aria-hidden="true"><Info size={19}/></span></button>
      </div>
    </div></header>
    <main className={location.pathname==='/' ? `app-main wizard-main ${searchMode==='compact'?'quick-main':''}` : 'app-main'}>
      {location.pathname==='/' && !loading && <div className="search-mode-switch" role="group" aria-label={t('quickModeA11y')}>
        <button type="button" className={searchMode==='guided'?'mode-choice active':'mode-choice'} aria-pressed={searchMode==='guided'} onClick={()=>setSearchMode('guided')}><ListChecks size={16} aria-hidden="true"/>{t('guidedSearch')}</button>
        <button type="button" className={searchMode==='compact'?'mode-choice active':'mode-choice'} aria-pressed={searchMode==='compact'} onClick={()=>setSearchMode('compact')}><Search size={16} aria-hidden="true"/>{t('quickSearch')}</button>
      </div>}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={loading ? `loading-${loading}` : location.pathname}
          className="route-transition"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.19, ease: 'easeOut' }}
        >
          {loading?<StatusLoading/>:<Routes location={location}>
            <Route path="/" element={searchMode==='compact'?<CompactSearch/>:<SearchWizard/>}/>
            <Route path="/results" element={hasResults?<FlightResults/>:<Navigate to="/" replace/>}/>
            <Route path="/complete" element={selectedOffer?<SelectionComplete/>:<Navigate to={hasResults?'/results':'/'} replace/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>}
        </motion.div>
      </AnimatePresence>
    </main>
    <footer className="site-footer"><div><strong>FlightFlow</strong> <span>— {t('tagline')}</span></div><span>{t('demoFoot')}</span></footer>
    {aboutOpen&&<AboutConcept onClose={()=>setAboutOpen(false)}/>}
  </>;
}
