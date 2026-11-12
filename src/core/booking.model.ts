import { FlightSearchQuery } from './flight.model.js';

export type PassengerType = 'adult' | 'child' | 'infant';

export interface PassengerIdentity {
  id: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  secondSurname: string;
  assistanceRequested: boolean;
  /** Solo se pide en esta demo a niños y bebés, para completar su información. */
  birthDate: string;
}

export interface BookingContact {
  email: string;
  phone: string;
}

export interface PassengerDetails {
  passengers: PassengerIdentity[];
  contact: BookingContact;
}

export function createPassengerDetails(query: FlightSearchQuery): PassengerDetails {
  const types: Array<[PassengerType, number]> = [
    ['adult', query.adults], ['child', query.children], ['infant', query.infants],
  ];
  return {
    passengers: types.flatMap(([type, count]) => Array.from({ length: count }, (_, index) => ({
      id: `${type}-${index + 1}`, type, firstName: '', lastName: '', secondSurname: '', assistanceRequested: false, birthDate: '',
    }))),
    contact: { email: '', phone: '' },
  };
}

export function copyPassengerDetails(details: PassengerDetails): PassengerDetails {
  return {
    passengers: details.passengers.map((passenger) => ({ ...passenger })),
    contact: { ...details.contact },
  };
}

export function validatePassengerDetails(details: PassengerDetails): string | null {
  if (!details.passengers.length) return 'Debe haber al menos un pasajero.';
  for (const [index, passenger] of details.passengers.entries()) {
    if (!passenger.firstName.trim() || !passenger.lastName.trim()) {
      return `Completa el nombre y el primer apellido del pasajero ${index + 1}.`;
    }
    if (passenger.type !== 'adult') {
      if (!passenger.birthDate) return `Indica la fecha de nacimiento del pasajero ${index + 1}.`;
      const birth = new Date(`${passenger.birthDate}T12:00:00`);
      if (Number.isNaN(birth.getTime()) || birth > new Date()) return `Revisa la fecha de nacimiento del pasajero ${index + 1}.`;
    }
  }
  const email = details.contact.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Introduce un correo electrónico válido.';
  const phoneDigits = details.contact.phone.replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) return 'Introduce un teléfono válido con prefijo si corresponde.';
  return null;
}
