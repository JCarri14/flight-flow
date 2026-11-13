export type TripType = 'roundTrip' | 'oneWay';
export type DepartureMode = 'today' | 'tomorrow' | 'week' | 'month' | 'nextMonth' | 'year' | 'next3Months' | 'next12Months' | 'nextYear' | 'exact';
export type ReturnMode = 'duration' | 'exact';
export type StayLength = 'weekend' | '1-3' | '4-7' | '8-14' | '15-21' | 'any';
export type RecommendationKind = 'cheapest' | 'balanced';
export type FareFamily = 'basic' | 'classic' | 'flex';

export interface TravelNeeds {
  cabinBag: boolean;
  checkedBag: boolean;
  seatSelection: boolean;
  nonstopOnly: boolean;
  flexibleChanges: boolean;
  priorityBoarding: boolean;
  fastTrack: boolean;
  loungeAccess: boolean;
}

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  tripType: TripType;
  departureMode: DepartureMode;
  departureDate: string;
  returnMode: ReturnMode;
  returnDate: string;
  stayLength: StayLength;
  adults: number;
  children: number;
  infants: number;
  needs: TravelNeeds;
}

export interface FlightLeg {
  label: 'IDA' | 'VUELTA';
  dateLabel: string;
  dateISO: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  stops: number;
}

export interface IncludedService {
  code: "personal" | "cabin" | "checked" | "seat" | "meal" | "priority" | "changes" | "fastTrack" | "lounge" | "earlyCheckIn" | "alerts";
  title: string;
  description: string;
}

export interface FlightOffer {
  id: RecommendationKind;
  label: string;
  totalPrice: number;
  legs: FlightLeg[];
  summary: string;
  includedServices: IncludedService[];
  /** Identificador técnico: nunca se muestra en las cards. */
  internalFare: FareFamily;
  /** When only one result is highlighted, the cheapest also wins the quality/price score. */
  alsoBestBalance?: boolean;
}

export const NEED_LABELS: ReadonlyArray<{ key: keyof TravelNeeds; label: string }> = [
  { key: 'cabinBag', label: 'Maleta de cabina' },
  { key: 'checkedBag', label: 'Maleta facturada' },
  { key: 'seatSelection', label: 'Elegir asiento' },
  { key: 'nonstopOnly', label: 'Solo vuelos directos' },
  { key: 'flexibleChanges', label: 'Cambios flexibles' },
  { key: 'priorityBoarding', label: 'Embarque prioritario' },
  { key: 'fastTrack', label: 'Fast Track' },
  { key: 'loungeAccess', label: 'Acceso a sala VIP' },
];

export function defaultQuery(): FlightSearchQuery {
  return {
    origin: 'Barcelona',
    destination: 'Madrid',
    tripType: 'oneWay',
    departureMode: 'month',
    departureDate: '',
    returnMode: 'duration',
    returnDate: '',
    stayLength: '4-7',
    adults: 1,
    children: 0,
    infants: 0,
    needs: { cabinBag: true, checkedBag: false, seatSelection: false, nonstopOnly: false, flexibleChanges: false, priorityBoarding: false, fastTrack: false, loungeAccess: false },
  };
}

export function copyQuery(query: FlightSearchQuery): FlightSearchQuery {
  return { ...query, needs: { ...query.needs } };
}

/** Earliest valid departure in the selected window; used to keep exact returns coherent. */
export function earliestDepartureISO(query: FlightSearchQuery, now: Date = new Date()): string {
  if (query.departureMode === 'exact') return query.departureDate;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (query.departureMode === 'tomorrow') start.setDate(start.getDate() + 1);
  if (query.departureMode === 'nextMonth') { start.setMonth(start.getMonth() + 1, 1); }
  if (query.departureMode === 'nextYear') { start.setFullYear(start.getFullYear() + 1, 0, 1); }
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
}

export function validateStep(query: FlightSearchQuery, step: number): string | null {
  if (step === 0) {
    if (!query.origin.trim() || !query.destination.trim()) return 'Introduce origen y destino.';
    if (query.origin.trim().toLowerCase() === query.destination.trim().toLowerCase()) return 'Origen y destino deben ser diferentes.';
  }
  if (step === 1) {
    if (query.departureMode === 'exact' && !query.departureDate) return 'Elige una fecha de salida.';
    if (query.tripType === 'roundTrip' && query.returnMode === 'exact') {
      if (!query.returnDate) return 'Elige una fecha de regreso.';
      if (query.returnDate <= earliestDepartureISO(query)) return 'La vuelta debe ser posterior a la salida.';
    }
  }
  if (step === 2) {
    const total = query.adults + query.children + query.infants;
    if (query.adults < 1 || total > 9 || query.infants > query.adults) return 'Revisa el número de viajeros.';
  }
  return null;
}

export function validateQuery(query: FlightSearchQuery): string | null {
  return validateStep(query, 0) ?? validateStep(query, 1) ?? validateStep(query, 2);
}

export function formatDate(isoDate: string, locale: 'es' | 'en' = 'es'): string {
  if (!isoDate) return locale === 'es' ? 'Sin fecha' : 'No date';
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' }).format(d);
}

export function dateSummary(query: FlightSearchQuery, locale: 'es' | 'en' = 'es'): string {
  const es = locale === 'es';
  const departures: Record<Exclude<DepartureMode, 'exact'>, string> = es ? {
    today: 'Hoy', tomorrow: 'Mañana', week: 'Esta semana', month: 'Este mes', nextMonth: 'Próximo mes', year: 'Este año', next3Months: 'Próximos 3 meses', next12Months: 'Próximos 12 meses', nextYear: 'Próximo año',
  } : {
    today: 'Today', tomorrow: 'Tomorrow', week: 'This week', month: 'This month', nextMonth: 'Next month', year: 'This year', next3Months: 'Next 3 months', next12Months: 'Next 12 months', nextYear: 'Next year',
  };
  const outbound = query.departureMode === 'exact' ? formatDate(query.departureDate, locale) : departures[query.departureMode];
  if (query.tripType === 'oneWay') return outbound;
  if (query.returnMode === 'exact') return `${outbound} · ${es ? 'vuelta' : 'return'} ${formatDate(query.returnDate, locale)}`;
  const lengths: Record<StayLength, string> = es ? {
    weekend: 'fin de semana', '1-3': '1–3 días', '4-7': '4–7 días', '8-14': '8–14 días', '15-21': '15–21 días', any: 'hasta 30 días',
  } : {
    weekend: 'weekend', '1-3': '1–3 days', '4-7': '4–7 days', '8-14': '8–14 days', '15-21': '15–21 days', any: 'up to 30 days',
  };
  return `${outbound} · ${lengths[query.stayLength]}`;
}

export function passengerSummary(query: FlightSearchQuery, locale: 'es' | 'en' = 'es'): string {
  const total = query.adults + query.children + query.infants;
  return `${total} ${locale === 'es' ? (total === 1 ? 'viajero' : 'viajeros') : (total === 1 ? 'traveller' : 'travellers')}`;
}

/** Show a meaningful per-person fare only when every passenger has the same adult fare.
 * For groups containing children or infants, the group total stays primary and no
 * misleading average is presented.
 */
export function comparablePricePerPerson(offer: FlightOffer, query: FlightSearchQuery): number | null {
  if (query.adults <= 1 || query.children > 0 || query.infants > 0) return null;
  return offer.totalPrice / query.adults;
}
