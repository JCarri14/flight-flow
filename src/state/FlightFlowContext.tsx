import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  copyQuery, defaultQuery, validateQuery, validateStep,
  type FlightOffer, type FlightSearchQuery, type RecommendationKind,
} from '../core/flight.model';
import { resolveMockOffers } from '../core/mock-offer-resolver';

const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
export type LoadingKind = 'search' | null;

interface FlowValue {
  query: FlightSearchQuery;
  draft: FlightSearchQuery;
  editing: boolean;
  step: number;
  furthestStep: number;
  offers: FlightOffer[];
  selectedId: RecommendationKind | null;
  selectedOffer: FlightOffer | null;
  hasResults: boolean;
  loading: LoadingKind;
  validationError: string | null;
  setDraft: (query: FlightSearchQuery) => void;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  beginEdit: () => void;
  cancelEdit: () => void;
  selectOffer: (id: RecommendationKind) => void;
  finishDemo: () => void;
  backToResults: () => void;
  restart: () => void;
}

const Context = createContext<FlowValue | null>(null);

export function FlightFlowProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState<FlightSearchQuery>(() => defaultQuery());
  const [draft, setDraftInner] = useState<FlightSearchQuery>(() => defaultQuery());
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [selectedId, setSelectedId] = useState<RecommendationKind | null>(null);
  const [loading, setLoading] = useState<LoadingKind>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedOffer = useMemo(() => offers.find(offer => offer.id === selectedId) ?? null, [offers, selectedId]);
  const setDraft = useCallback((next: FlightSearchQuery) => {
    setDraftInner(copyQuery(next));
    setValidationError(null);
  }, []);

  const goToStep = useCallback((next: number) => {
    if (next < 0 || next > 2 || (!editing && next > furthestStep)) return;
    setValidationError(null);
    setStep(next);
  }, [editing, furthestStep]);

  const previousStep = useCallback(() => {
    setValidationError(null);
    setStep(current => Math.max(0, current - 1));
  }, []);

  const beginEdit = useCallback(() => {
    setDraftInner(copyQuery(query));
    setEditing(true);
    setStep(2);
    setFurthestStep(2);
    setValidationError(null);
    navigate('/');
  }, [query, navigate]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraftInner(copyQuery(query));
    setValidationError(null);
    navigate('/results');
  }, [query, navigate]);

  const nextStep = useCallback(async () => {
    const issue = validateStep(draft, step);
    if (issue) { setValidationError(issue); return; }
    if (step < 2) {
      const next = step + 1;
      setStep(next);
      setFurthestStep(current => Math.max(current, next));
      setValidationError(null);
      return;
    }
    const issueAnywhere = validateQuery(draft);
    if (issueAnywhere) { setValidationError(issueAnywhere); return; }
    if (hasResults && JSON.stringify(query) === JSON.stringify(draft)) {
      setEditing(false);
      setValidationError(null);
      navigate('/results');
      return;
    }
    setLoading('search');
    await pause(editing ? 620 : 850);
    const resolved = resolveMockOffers(draft);
    setOffers(resolved);
    setQuery(copyQuery(draft));
    setHasResults(true);
    setEditing(false);
    setSelectedId(null);
    setValidationError(null);
    setLoading(null);
    navigate('/results');
  }, [draft, step, editing, hasResults, query, navigate]);

  const selectOffer = useCallback((id: RecommendationKind) => {
    setSelectedId(current => current === id ? null : id);
  }, []);
  const finishDemo = useCallback(() => {
    if (!selectedOffer) return;
    navigate('/complete');
  }, [selectedOffer, navigate]);
  const backToResults = useCallback(() => navigate('/results'), [navigate]);
  const restart = useCallback(() => {
    const fresh = defaultQuery();
    setQuery(fresh);
    setDraftInner(copyQuery(fresh));
    setEditing(false);
    setStep(0);
    setFurthestStep(0);
    setHasResults(false);
    setOffers([]);
    setSelectedId(null);
    setValidationError(null);
    setLoading(null);
    navigate('/');
  }, [navigate]);

  const value: FlowValue = {
    query, draft, editing, step, furthestStep, offers, selectedId, selectedOffer,
    hasResults, loading, validationError, setDraft, goToStep, nextStep,
    previousStep, beginEdit, cancelEdit, selectOffer, finishDemo, backToResults, restart,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFlightFlow() {
  const state = useContext(Context);
  if (!state) throw new Error('useFlightFlow must be used within FlightFlowProvider');
  return state;
}
