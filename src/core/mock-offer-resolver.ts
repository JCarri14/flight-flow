import { type FareFamily, type FlightLeg, type FlightOffer, type FlightSearchQuery, type IncludedService, type StayLength, type TravelNeeds, formatDate } from './flight.model.js';

/** Fictional fare/ancillary combinations inspired by common airline product patterns.
 * No airline inventory, real rules or current pricing is used. Fare names remain INTERNAL.
 * Internals model three families: Light (basic), Comfort (classic), Extra (flex).
 */
interface FareChoice { fare: FareFamily; perPassenger: number }
const ADDONS: ReadonlyArray<{ need: keyof TravelNeeds; service: IncludedService['code']; price: number }> = [
  { need: 'cabinBag', service: 'cabin', price: 22 },
  { need: 'checkedBag', service: 'checked', price: 38 },
  { need: 'seatSelection', service: 'seat', price: 17 },
  { need: 'flexibleChanges', service: 'changes', price: 28 },
  { need: 'priorityBoarding', service: 'priority', price: 18 },
  // These two services are fictional standalone options in every mock itinerary.
  // Real-world availability can vary by departure airport and provider.
  { need: 'fastTrack', service: 'fastTrack', price: 24 },
  { need: 'loungeAccess', service: 'lounge', price: 55 },
];
const FARE_FEE: Record<FareFamily, number> = { basic: 0, classic: 44, flex: 59 };

function hash(text: string): number {
  return [...text].reduce((value, character) => (value * 31 + character.charCodeAt(0)) % 10_007, 7);
}

function fareIncludes(fare: FareFamily): ReadonlySet<IncludedService['code']> {
  if (fare === 'flex') return new Set(['personal', 'cabin', 'checked', 'seat', 'meal', 'priority', 'changes', 'earlyCheckIn', 'alerts']);
  if (fare === 'classic') return new Set(['personal', 'cabin', 'checked', 'meal', 'alerts']);
  return new Set(['personal', 'alerts']);
}

export function resolveFareCombination(base: number, needs: TravelNeeds, availableFamilies: FareFamily[]): FareChoice {
  if (!availableFamilies.length) throw new Error('No fare families available');
  const candidates = availableFamilies.map(fare => {
    const benefits = fareIncludes(fare);
    const extras = ADDONS.reduce((amount, addon) =>
      amount + (needs[addon.need] && !benefits.has(addon.service) ? addon.price : 0), 0);
    return { fare, perPassenger: base + FARE_FEE[fare] + extras };
  });
  candidates.sort((a, b) => a.perPassenger - b.perPassenger || FARE_FEE[a.fare] - FARE_FEE[b.fare]);
  return candidates[0];
}

/** All fare-bundled benefits plus requested standalone ancillaries.
 * This is the final review disclosure, not a new upsell stage.
 */
export function includedServices(fare: FareFamily, needs: TravelNeeds): IncludedService[] {
  const benefits = new Set(fareIncludes(fare));
  for (const addon of ADDONS) {
    if (needs[addon.need]) benefits.add(addon.service);
  }
  const descriptions: Record<IncludedService['code'], [string, string]> = {
    personal: ['Artículo personal', 'Una pieza pequeña bajo el asiento (dimensiones ilustrativas).'],
    cabin: ['Equipaje de cabina', 'Una pieza de hasta 10 kg en este ejemplo ficticio.'],
    checked: ['Equipaje facturado', 'Una pieza de hasta 23 kg en este ejemplo ficticio.'],
    seat: ['Selección de asiento', 'Servicio simulado; no hay asiento asignado.'],
    meal: ['Menú a bordo', 'Comida estándar en la tarifa simulada.'],
    priority: ['Embarque prioritario', 'Grupo prioritario en la tarifa simulada.'],
    changes: ['Cambios flexibles', 'Condiciones de cambio mejoradas; no equivale a reembolso garantizado.'],
    fastTrack: ['Fast Track', 'Acceso preferente al control de seguridad en esta simulación.'],
    lounge: ['Sala VIP', 'Acceso ficticio a sala VIP; disponibilidad real según aeropuerto y proveedor.'],
    earlyCheckIn: ['Check-in anticipado', 'Acceso previo al check-in en la tarifa simulada.'],
    alerts: ['Avisos de vuelo', 'Notificaciones operativas incluidas en la tarifa simulada.'],
  };
  return (Object.keys(descriptions) as IncludedService['code'][]).filter(code => benefits.has(code))
    .map(code => ({ code, title: descriptions[code][0], description: descriptions[code][1] }));
}

function dateOnly(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function plusDays(date: Date, days: number): Date { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
function exampleDepartureUnconstrained(query: FlightSearchQuery): Date {
  if (query.departureMode === 'exact' && query.departureDate) return new Date(`${query.departureDate}T12:00:00`);
  const today = new Date(); today.setHours(12, 0, 0, 0);
  if (query.departureMode === 'today') return today;
  if (query.departureMode === 'tomorrow') return plusDays(today, 1);
  if (query.departureMode === 'week') {
    // Keep the illustrative departure inside the current Monday–Sunday week.
    const daysUntilSunday = 6 - ((today.getDay() + 6) % 7);
    return plusDays(today, Math.min(2, daysUntilSunday));
  }
  if (query.departureMode === 'next3Months') return plusDays(today, 40);
  if (query.departureMode === 'next12Months') return plusDays(today, 120);
  if (query.departureMode === 'nextYear') return new Date(today.getFullYear() + 1, 0, 15, 12);
  if (query.departureMode === 'month') {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12);
    return plusDays(today, Math.min(7, Math.max(0, Math.floor((lastDay.getTime() - today.getTime()) / 86_400_000))));
  }
  if (query.departureMode === 'nextMonth') return new Date(today.getFullYear(), today.getMonth() + 1, 10, 12);
  const yearEnd = new Date(today.getFullYear(), 11, 30, 12);
  return plusDays(today, Math.min(30, Math.max(0, Math.floor((yearEnd.getTime() - today.getTime()) / 86_400_000))));
}
function exampleDeparture(query: FlightSearchQuery): Date {
  const calculated = exampleDepartureUnconstrained(query);
  // When the traveller fixes a return date but keeps departure flexible,
  // choose an illustrative outbound date that still precedes the return.
  if (query.tripType === 'roundTrip' && query.returnMode === 'exact' && query.returnDate) {
    const latest = plusDays(new Date(`${query.returnDate}T12:00:00`), -1);
    if (calculated > latest) return latest;
  }
  return calculated;
}
function exampleReturn(query: FlightSearchQuery, departure: Date): Date {
  if (query.returnMode === 'exact' && query.returnDate) return new Date(`${query.returnDate}T12:00:00`);
  // 'any' has an explicitly disclosed limit of 30 days. We use a 6-day example
  // in this static POC; a real search would evaluate many outbound/return pairs.
  const lengths: Record<StayLength, number> = { weekend: 2, '1-3': 3, '4-7': 5, '8-14': 10, '15-21': 18, any: 6 };
  return plusDays(departure, lengths[query.stayLength]);
}

type Itinerary = 'connection' | 'earlyDirect' | 'daytimeDirect';
interface ItineraryDefinition {
  itinerary: Itinerary;
  /** Difference from the fictional base fare per fully priced adult. */
  surcharge: number;
  /** Explicit heuristic for time and disruption, expressed in illustrative euro-equivalent points. */
  inconvenience: number;
  legs: FlightLeg[];
}
function buildItinerary(query: FlightSearchQuery, itinerary: Itinerary, surcharge: number): ItineraryDefinition {
  const departure = exampleDeparture(query), returning = exampleReturn(query, departure);
  const isReturn = query.tripType === 'roundTrip';
  const connection = itinerary === 'connection', early = itinerary === 'earlyDirect';
  const outboundISO = dateOnly(departure), inboundISO = dateOnly(returning);
  const outbound: FlightLeg = {
    label: 'IDA', dateISO: outboundISO, dateLabel: formatDate(outboundISO),
    departureTime: connection ? '06:40' : early ? '06:10' : '09:30',
    arrivalTime: connection ? '11:15' : early ? '08:00' : '11:20',
    durationLabel: connection ? '4 h 35 min' : '1 h 50 min', stops: connection ? 1 : 0,
  };
  const inbound: FlightLeg = {
    label: 'VUELTA', dateISO: inboundISO, dateLabel: formatDate(inboundISO),
    departureTime: connection ? '17:30' : early ? '06:30' : '17:45',
    arrivalTime: connection ? '21:45' : early ? '08:25' : '19:40',
    durationLabel: connection ? '4 h 15 min' : '1 h 55 min', stops: connection ? 1 : 0,
  };
  // 0.13 points per extra minute plus a stop/disruption penalty. For direct flights,
  // very early departures are penalized, but the penalty is not presented as a user preference.
  const inconvenience = connection
    ? (isReturn ? 2 : 1) * 24 + (isReturn ? 305 : 165) * 0.13 + 9
    : early ? (isReturn ? 41 : 16) : 0;
  return { itinerary, surcharge, inconvenience, legs: isReturn ? [outbound, inbound] : [outbound] };
}
interface Candidate {
  definition: ItineraryDefinition;
  fare: FareChoice;
  totalPrice: number;
  /** Lower scores are better; one point roughly represents one fictitious euro of generalized cost per adult. */
  score: number;
}
function candidate(definition: ItineraryDefinition, base: number, query: FlightSearchQuery, available: FareFamily[]): Candidate {
  const fare = resolveFareCombination(base + definition.surcharge, query.needs, available);
  const equivalents = query.adults + query.children * 0.72 + query.infants * 0.15;
  return {
    definition, fare,
    totalPrice: Math.round(fare.perPassenger * equivalents),
    score: fare.perPassenger + definition.inconvenience,
  };
}
function toOffer(c: Candidate, query: FlightSearchQuery, id: FlightOffer['id'], alsoBestBalance = false): FlightOffer {
  return {
    id, label: id === 'cheapest' ? 'Más barato' : 'Mejor equilibrio',
    totalPrice: c.totalPrice, legs: c.definition.legs,
    summary: c.definition.itinerary === 'connection' ? 'Menor precio · 1 escala' : c.definition.itinerary === 'earlyDirect' ? 'Directo · Salidas tempranas' : 'Directo · Horarios diurnos',
    includedServices: includedServices(c.fare.fare, query.needs), internalFare: c.fare.fare, alsoBestBalance,
  };
}

/**
 * Returns one or two meaningful recommendations, rather than always inventing a
 * more expensive "best" option. All candidates satisfy the user's strict needs.
 *
 * A purely illustrative generalized-cost heuristic compares total price per
 * adult-equivalent with stops, journey time and very early departures.
 * If the cheapest is already optimal (or the gain is marginal), it receives both
 * badges and no artificial second recommendation is shown.
 */
export function resolveMockOffers(query: FlightSearchQuery): FlightOffer[] {
  const seed = hash(`${query.origin.toLowerCase()}|${query.destination.toLowerCase()}`);
  const routeVariation = seed % 19;
  const tripBase = query.tripType === 'roundTrip' ? 108 : 58;
  const base = tripBase + routeVariation;
  const directSurcharge = query.tripType === 'roundTrip' ? 48 : 30;
  const daytimePremium = 8 + (seed % 7) * 10;
  const available: FareFamily[] = seed % 3 === 0 ? ['basic', 'flex'] : ['basic', 'classic', 'flex'];
  const itineraries: ItineraryDefinition[] = [
    buildItinerary(query, 'connection', 0),
    buildItinerary(query, 'earlyDirect', directSurcharge),
    buildItinerary(query, 'daytimeDirect', directSurcharge + daytimePremium),
  ].filter(def => !query.needs.nonstopOnly || def.itinerary !== 'connection');
  const candidates = itineraries.map(def => candidate(def, base, query, available));
  const byPrice = [...candidates].sort((a, b) => a.totalPrice - b.totalPrice || a.score - b.score);
  const byScore = [...candidates].sort((a, b) => a.score - b.score || a.totalPrice - b.totalPrice);
  const lowest = byPrice[0];
  const optimal = byScore[0];
  // Avoid an alternative whose score improvement is not meaningful for this POC.
  const hasDifferentBest = optimal !== lowest && lowest.score - optimal.score >= 5;
  return hasDifferentBest
    ? [toOffer(lowest, query, 'cheapest'), toOffer(optimal, query, 'balanced')]
    : [toOffer(lowest, query, 'cheapest', true)];
}
