import type { IncludedService } from '../core/flight.model';
import {
  Armchair, Bell, BriefcaseBusiness, CalendarClock,
  Clock3, Coffee, FastForward, Luggage, Ticket,
  UtensilsCrossed, type LucideIcon,
} from 'lucide-react';

const serviceIcons: Record<IncludedService['code'], LucideIcon> = {
  personal: BriefcaseBusiness,
  cabin: Luggage,
  checked: Luggage,
  seat: Armchair,
  meal: UtensilsCrossed,
  priority: FastForward,
  changes: CalendarClock,
  fastTrack: Clock3,
  lounge: Coffee,
  earlyCheckIn: Ticket,
  alerts: Bell,
};

/** Decorative service pictograms; the service name remains the accessible label. */
export function ServiceIcon({ code }: { code: IncludedService['code'] }) {
  const Icon = serviceIcons[code];
  return <Icon aria-hidden="true" size={18} strokeWidth={1.8} />;
}

