import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'es' | 'en';

const es = {
  about: 'Sobre el concepto', poc: 'POC', demoFoot: 'Demo interactiva · Sin reservas ni pagos reales',
  tagline: 'Una experiencia de compra de vuelos basada en lo que necesitas',
  eyebrowSearch: 'Tu próximo viaje', stepsAria: 'Pasos de búsqueda', route: 'Ruta', dates: 'Fechas', yourTrip: 'Tu viaje',
  whereTitle: '¿A dónde quieres volar?', whereSub: 'Empecemos por lo esencial.', origin: 'Origen', destination: 'Destino',
  airportPlaceholder: 'Ciudad o aeropuerto', destinationPlaceholder: '¿A dónde vamos?', tripType: 'Tipo de viaje',
  roundTrip: 'Ida y vuelta', oneWay: 'Solo ida', whenTitle: '¿Cuándo quieres viajar?', whenSub: 'No necesitas tener decidida una fecha exacta.',
  whenLeave: '¿Cuándo quieres salir?', week: 'Esta semana', month: 'Este mes', nextMonth: 'Próximo mes', year: 'Este año', exact: 'Fecha exacta', today: 'Hoy', tomorrow: 'Mañana', next3Months: 'Próximos 3 meses', next12Months: 'Próximos 12 meses', nextYear: 'Próximo año', moreDates: 'Más fechas', fewerDates: 'Menos fechas', chosenPeriod: 'Seleccionado: {period}',
  departureDate: 'Fecha de salida', whenReturn: '¿Y cuándo vuelves?', duration: 'Duración', flexible: 'Flexible', stay: 'Tiempo de estancia',
  weekend: 'Fin de semana', days13: '1–3 días', days47: '4–7 días', days814: '8–14 días', days15: 'Más de 14 días',
  returnDate: 'Fecha de regreso', returnFlexible: 'Buscaremos combinaciones de regreso económicas dentro del periodo elegido.',
  howTitle: '¿Cómo quieres viajar?', howSub: 'Marca solo lo que necesitas. El resto lo resolvemos internamente.',
  adults: 'Adultos', adultsAge: '12 años o más', children: 'Niños', childrenAge: '2 a 11 años', infants: 'Bebés', infantsAge: 'Menores de 2 años',
  minorsAsk: '¿Viajas con niños o bebés?', minorsHide: 'Ocultar niños y bebés', minorsCount: 'menores', reduce: 'Reducir', add: 'Añadir',
  noNeeds: 'Sin necesidades adicionales',
  whatNeed: '¿Qué necesitas?', cabinBag: 'Maleta de cabina', checkedBag: 'Maleta facturada', chooseSeat: 'Elegir asiento', nonstopOnly: 'Solo vuelos directos', flexibleChanges: 'Cambios flexibles', priorityBoarding: 'Embarque prioritario', fastTrack: 'Fast Track', loungeAccess: 'Acceso a sala VIP', moreNeeds: 'Más preferencias', fewerNeeds: 'Ver menos', extraNeedsTitle: 'Comodidad y flexibilidad', activeExtras: '{count} adicionales seleccionadas',
  backResults: 'Volver a resultados', backShort: 'Volver', back: 'Atrás', continue: 'Continuar', findFlights: 'Ver vuelos',
  wizardNote: 'Sin cuentas, sin tarifas comerciales y sin pasos innecesarios.', simulation: 'Solo una demostración.',
  resultsEyebrow: 'Tus mejores vuelos', resultsTitle: 'Tus mejores vuelos', resultsSub: 'Hasta dos recomendaciones que ya cumplen tus necesidades.',
  edit: 'Editar', selectHeading: 'Elige cómo quieres volar', selectSub: 'El precio ya contempla la combinación de vuelos y servicios de la demo.',
  choice: 'opción destacada', choices: 'opciones destacadas', totalPrices: 'Precios totales', perPerson: '/ persona', offersAria: 'Ofertas recomendadas', cheapest: 'Más barato', balanced: 'Mejor equilibrio',
  outbound: 'IDA', inbound: 'VUELTA', direct: 'Directo', stop: 'escala', stops: 'escalas', totalTrip: 'Total del viaje',
  needsMet: 'Cumple todas tus necesidades seleccionadas', selected: 'Seleccionado', selectOfferA11y: 'seleccionar esta oferta',
  comparison: '¿Cuál te conviene más?', compareDirect: 'Ambas opciones son directas. La recomendada prioriza horarios más cómodos.',
  compareStops: 'La alternativa recomendada evita escalas y reduce el tiempo de viaje.', compareExtra: 'más en esta simulación.', compareSavedOneStop:'La recomendada evita una escala y ahorra {time} de viaje.', compareSavedMultipleStops:'La recomendada evita {stops} escalas y ahorra {time} de viaje.', compareDaytimeRoundTrip:'Ambas son directas. La recomendada evita salidas muy tempranas, tanto en la ida como en la vuelta.', compareDaytimeOneWay:'Ambas son directas. La recomendada evita una salida muy temprana.', compareIncrement:'Cuesta {price} más.',
  selectedOffer: 'seleccionado', selectedHint: 'Puedes finalizar la demo o elegir otra alternativa.', 
  hideAlternatives: 'Ocultar alternativas', showAlternatives: 'Ver todos los vuelos', alternativesNote: 'Esta POC destaca hasta dos ofertas simuladas. Una integración real permitiría explorar más combinaciones sin mostrar familias tarifarias.',
  resultsFooter: 'Precios, horarios, disponibilidad y prestaciones simulados. Ninguna aerolínea ha proporcionado estos resultados.',
  finishDemo: 'Finalizar demo', backToOffers: 'Volver a vuelos',
  selectionCompleteTitle: '¡Vuelo seleccionado!', selectionCompleteSub: 'Has completado el recorrido de búsqueda y selección. En una compra real, continuarías con los datos de pasajeros y el pago.',
  selectionSummary: 'Resumen de la selección', travelerCount: 'Viajeros', tripType: 'Tipo de viaje',
  confirmationEyebrow: 'Fin de la demostración', chosenOffer: 'Oferta elegida', samplePrice: 'Precio ilustrativo',
  notBooking: 'Esto es una demostración.', noBookingDetail: 'No se ha efectuado ninguna reserva, compra, pago o emisión de billetes.', restart: 'Nueva búsqueda',
  moment: 'Un momento', loadingSearch: 'Buscando las mejores combinaciones', loadingSearchSub: 'Estamos comparando las opciones que cumplen tus necesidades.',
  loadingMock: 'Datos y tiempos de espera simulados',
  conceptEyebrow: 'Detrás del concepto', conceptTitle: 'Menos decisiones. Más claridad.',
  conceptIntro: 'FlightFlow es una prueba de concepto sobre cómo reducir la fricción al comprar vuelos. No vende vuelos ni está vinculada a ninguna aerolínea.',
  concept1Title: '01 / Intención antes que fechas', concept1Desc: 'Periodos flexibles y duración del viaje en vez de obligar a empezar con un calendario.',
  concept2Title: '02 / Tarifas resueltas internamente', concept2Desc: 'El motor simulado combina tarifas y servicios sin mostrar familias comerciales al viajero.',
  concept3Title: '03 / Solo recomendaciones útiles', concept3Desc: 'Mostramos el menor precio y, solo cuando mejora realmente la relación precio-tiempo-comodidad, una alternativa equilibrada.',
  concept4Title: '04 / Selección sin pasos comerciales', concept4Desc: 'La demo termina con la selección del vuelo; el siguiente paso real sería pasajeros y pago, sin pantallas intermedias de extras.',
  conceptWarning: 'Todos los vuelos, precios, horarios y condiciones son ficticios. No hay búsquedas externas, recogida de datos personales, reservas ni pagos reales.',
  close: 'Cerrar', returnDemo: 'Volver a la demo',
  servicePersonal: 'Artículo personal', servicePersonalDesc: 'Una pieza pequeña bajo el asiento (dimensiones ilustrativas).',
  serviceCabin: 'Equipaje de cabina', serviceCabinDesc: 'Una pieza de hasta 10 kg en este ejemplo ficticio.',
  serviceChecked: 'Equipaje facturado', serviceCheckedDesc: 'Una pieza de hasta 23 kg en este ejemplo ficticio.',
  serviceSeat: 'Selección de asiento', serviceSeatDesc: 'Derecho simulado a elegir asiento; ninguno está asignado todavía.',
  serviceMeal: 'Menú a bordo', serviceMealDesc: 'Comida estándar incluida en la tarifa simulada.',
  servicePriority: 'Embarque prioritario', servicePriorityDesc: 'Grupo de embarque prioritario en la simulación.',
  serviceChanges: 'Cambios flexibles', serviceChangesDesc: 'Condiciones de modificación más flexibles en la tarifa simulada; no implica reembolso garantizado.',
  serviceFastTrack: 'Fast Track', serviceFastTrackDesc: 'Acceso preferente al control de seguridad en la simulación. Depende del aeropuerto en un viaje real.',
  serviceLounge: 'Acceso a sala VIP', serviceLoungeDesc: 'Acceso simulado; disponibilidad real según aeropuerto y proveedor.',
  serviceCheckIn: 'Check-in anticipado', serviceCheckInDesc: 'Acceso anticipado al check-in en la simulación.',
  serviceAlerts: 'Avisos de vuelo', serviceAlertsDesc: 'Notificaciones operativas incluidas en la oferta simulada.',
  errorOrigin: 'Introduce origen y destino.', errorSame: 'Origen y destino deben ser diferentes.', errorDepart: 'Elige una fecha de salida.',
  errorReturn: 'Elige una fecha de regreso.', errorOrder: 'La vuelta debe ser posterior a la salida.', errorTravellers: 'Revisa el número de viajeros.',
  dateMissing: 'Sin fecha', returnWord: 'vuelta', flexibleReturn: 'regreso flexible', traveller: 'viajero', travellersPlural: 'viajeros',
  originFallback:'Origen', destFallback:'Destino', weekday: 'fin de semana', longStay: 'más de 14 días',
} as const;

type MessageKey = keyof typeof es;
const en: Record<MessageKey, string> = {
  about: 'About the concept', poc:'POC', demoFoot:'Interactive demo · No real bookings or payments',
  tagline:'A flight booking experience built around what you need',
  eyebrowSearch:'Your next trip',stepsAria:'Search steps',route:'Route',dates:'Dates',yourTrip:'Your trip',
  whereTitle:'Where would you like to fly?',whereSub:'Start with the essentials.',origin:'From',destination:'To',
  airportPlaceholder:'City or airport',destinationPlaceholder:'Where are you going?',tripType:'Trip type',
  roundTrip:'Round trip',oneWay:'One way',whenTitle:'When would you like to travel?',whenSub:'You don’t need to choose an exact date yet.',
  whenLeave:'When do you want to depart?',week:'This week',month:'This month',nextMonth:'Next month',year:'This year',exact:'Exact date',today:'Today',tomorrow:'Tomorrow',next3Months:'Next 3 months',next12Months:'Next 12 months',nextYear:'Next year',moreDates:'More dates',fewerDates:'Fewer dates',chosenPeriod:'Selected: {period}',
  departureDate:'Departure date',whenReturn:'When would you like to return?',duration:'Duration',flexible:'Flexible',stay:'Trip length',
  weekend:'Weekend',days13:'1–3 days',days47:'4–7 days',days814:'8–14 days',days15:'More than 14 days',
  returnDate:'Return date',returnFlexible:'We’ll look for more affordable return combinations within your selected period.',
  howTitle:'How do you want to travel?',howSub:'Choose only what you need. We’ll handle the rest.',
  adults:'Adults',adultsAge:'Ages 12+',children:'Children',childrenAge:'Ages 2–11',infants:'Infants',infantsAge:'Under 2',
  minorsAsk:'Travelling with children or infants?',minorsHide:'Hide children and infants',minorsCount:'minors',reduce:'Decrease',add:'Increase',
  noNeeds:'No additional needs',
  whatNeed:'What do you need?',cabinBag:'Cabin bag',checkedBag:'Checked bag',chooseSeat:'Choose a seat',nonstopOnly:'Nonstop flights only',flexibleChanges:'Flexible changes',priorityBoarding:'Priority boarding',fastTrack:'Fast Track',loungeAccess:'Lounge access',moreNeeds:'More preferences',fewerNeeds:'Show less',extraNeedsTitle:'Comfort and flexibility',activeExtras:'{count} additional selected',
  backResults:'Back to results',backShort:'Return',back:'Back',continue:'Continue',findFlights:'Find flights',
  wizardNote:'No accounts, no fare-family comparisons, no unnecessary steps.',simulation:'Just a demonstration.',
  resultsEyebrow:'Your best flights',resultsTitle:'Your best flights',resultsSub:'Up to two recommendations that already meet your needs.',
  edit:'Edit',selectHeading:'Choose how to fly',selectSub:'The demo price includes the resolved combination of flights and services.',
  choice:'highlighted option', choices:'highlighted options', totalPrices:'Total prices', perPerson:'/ person',offersAria:'Recommended offers',cheapest:'Cheapest',balanced:'Best balance',
  outbound:'OUTBOUND',inbound:'RETURN',direct:'Nonstop',stop:'stop',stops:'stops',totalTrip:'Total trip',
  needsMet:'Meets all your selected needs',selected:'Selected',selectOfferA11y:'select this offer',
  comparison:'Which one works best for you?',compareDirect:'Both options are nonstop. The recommended one has more convenient times.',
  compareStops:'The recommended option avoids connections and shortens the journey.',compareExtra:'more in this simulation.', compareSavedOneStop:'The recommended option avoids a connection and saves {time} of travel.', compareSavedMultipleStops:'The recommended option avoids {stops} connections and saves {time} of travel.', compareDaytimeRoundTrip:'Both are nonstop. The recommended option avoids very early departures on both legs.', compareDaytimeOneWay:'Both are nonstop. The recommended option avoids a very early departure.', compareIncrement:'It costs {price} more.',
  selectedOffer:'selected',selectedHint:'You can finish the demo or select another offer.',
  hideAlternatives:'Hide alternatives',showAlternatives:'See all flights',alternativesNote:'This POC highlights up to two mock offers. A real integration could explore more combinations without displaying fare families.',
  resultsFooter:'Fictitious prices, schedules, availability and benefits. No airline supplied these results.',
  finishDemo: 'Finish demo', backToOffers: 'Back to flights',
  selectionCompleteTitle: 'Flight selected!', selectionCompleteSub: 'You have completed the search and flight selection journey. In a real booking, passenger details and payment would follow.',
  selectionSummary: 'Selection summary', travelerCount: 'Travellers', tripType: 'Trip type',
  confirmationEyebrow: 'End of demonstration', chosenOffer: 'Selected offer', samplePrice: 'Illustrative price',
  notBooking: 'This is a demonstration.', noBookingDetail: 'No flight was booked or purchased; no payment was taken or tickets issued.', restart: 'New search',
  moment:'One moment',loadingSearch:'Finding your best combinations',loadingSearchSub:'Comparing options that meet your requirements.',
  loadingMock:'Mock data and loading times',
  conceptEyebrow:'Behind the concept',conceptTitle:'Fewer decisions. More clarity.',
  conceptIntro:'FlightFlow explores how to reduce friction when booking flights. It does not sell flights and is not affiliated with any airline.',
  concept1Title:'01 / Intent over exact dates',concept1Desc:'Flexible periods and trip length instead of making a calendar the starting point.',
  concept2Title:'02 / Fare complexity handled internally',concept2Desc:'The mock engine combines fares and services without exposing commercial fare families to the traveller.',
  concept3Title:'03 / Only meaningful recommendations',concept3Desc:'The cheapest fare and a better-balanced alternative only when its trade-offs justify a second option.',
  concept4Title:'04 / Selection without upselling',concept4Desc:'The demo ends after selecting a flight; real booking would continue to passengers and payment, with no intermediate extras screens.',
  conceptWarning:'All flights, prices, schedules and conditions are fictitious. There are no external searches, passenger details, reservations or payments.',
  close:'Close',returnDemo:'Back to demo',
  servicePersonal:'Personal item',servicePersonalDesc:'One small bag under the seat (illustrative dimensions).',
  serviceCabin:'Cabin baggage',serviceCabinDesc:'One piece up to 10 kg in this fictional example.',
  serviceChecked:'Checked baggage',serviceCheckedDesc:'One piece up to 23 kg in this fictional example.',
  serviceSeat:'Seat selection',serviceSeatDesc:'Simulated seat choice entitlement; no specific seat is assigned.',
  serviceMeal:'Onboard meal',serviceMealDesc:'Standard meal included in the simulated fare.',
  servicePriority:'Priority boarding',servicePriorityDesc:'Earlier boarding group in this simulation.',
  serviceChanges:'Flexible changes',serviceChangesDesc:'More flexible change conditions in the mock fare; refunds are not guaranteed.',
  serviceFastTrack:'Fast Track',serviceFastTrackDesc:'Simulated priority security access; depends on the airport in real journeys.',
  serviceLounge:'Lounge access',serviceLoungeDesc:'Illustrative lounge access; real availability varies by airport and provider.',
  serviceCheckIn:'Early check-in',serviceCheckInDesc:'Earlier access to check-in in this simulation.',
  serviceAlerts:'Flight notifications',serviceAlertsDesc:'Operational notifications included in the simulated offer.',
  errorOrigin:'Enter both origin and destination.',errorSame:'Origin and destination must be different.',errorDepart:'Choose a departure date.',
  errorReturn:'Choose a return date.',errorOrder:'The return date must be after departure.',errorTravellers:'Check the number of travellers.',
  dateMissing:'No date',returnWord:'return',flexibleReturn:'flexible return',traveller:'traveller',travellersPlural:'travellers',
  originFallback:'Origin',destFallback:'Destination',weekday:'weekend',longStay:'more than 14 days',
};

interface LanguageValue { language: Language; setLanguage: (language: Language) => void; t:(key: MessageKey, vars?: Record<string, string | number>) => string }
const LanguageCtx = createContext<LanguageValue | null>(null);
export function LanguageProvider({children}:{children:ReactNode}) {
  const [language,setLanguage]=useState<Language>('es');
  useEffect(()=>{
    document.documentElement.lang=language;
    document.title=language==='es'?'FlightFlow · Demo de selección de vuelos':'FlightFlow · Flight selection demo';
    const description=document.querySelector('meta[name=description]');
    if(description)description.setAttribute('content',language==='es'?'FlightFlow: una POC de búsqueda y selección de vuelos basada en necesidades.':'FlightFlow: an intent-first flight search and selection concept.');
  },[language]);
  const value=useMemo<LanguageValue>(()=>({language,setLanguage,t:(key,vars)=>{
    const template=(language==='es'?es:en)[key];
    return Object.entries(vars??{}).reduce((text,[name,val])=>text.replaceAll(`{${name}}`,String(val)),template);
  }}),[language]);
  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
export function useLanguage():LanguageValue {
  const context=useContext(LanguageCtx);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
export function localizedValidation(message:string|null, t:LanguageValue['t']):string|null {
  if(!message)return null;
  const literal:Record<string,MessageKey>={
    'Introduce origen y destino.':'errorOrigin',
    'Origen y destino deben ser diferentes.':'errorSame',
    'Elige una fecha de salida.':'errorDepart',
    'Elige una fecha de regreso.':'errorReturn',
    'La vuelta debe ser posterior a la salida.':'errorOrder',
    'Revisa el número de viajeros.':'errorTravellers',
  };
  if(literal[message])return t(literal[message]);
  return message;
}
