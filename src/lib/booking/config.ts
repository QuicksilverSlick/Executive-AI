/**
 * Booking config — custom GHL/MarketSimple booking flow for Executive AI Training.
 *
 * The site's own API routes (src/pages/api/booking/*) use this to generate slots
 * and write the contact + appointment directly to GHL, so the booking UX stays
 * fully on-brand (no GHL iframe). The agency PIT is read from the GHL_PIT secret.
 *
 * Availability is generated from BUSINESS_HOURS (the GHL free-slots endpoint returns
 * nothing until a host/availability is wired in GHL), and appointments are created
 * with an explicit assignedUserId + ignoreFreeSlotValidation.
 */

export const GHL_BASE = 'https://services.leadconnectorhq.com';
export const GHL_LOCATION_ID = 'j4vaC7dWTbtRCFQPsdWf';
export const GHL_HOST_USER_ID = 'p7zkUlPde7OI64duQxIT';
export const BUSINESS_TZ = 'America/Chicago';
export const BUSINESS_HOURS = { startHour: 7, endHour: 21 }; // 7am–9pm CT
export const SLOT_INTERVAL_MIN = 30;
export const MIN_NOTICE_MIN = 120;   // don't offer slots < 2h out
export const BOOKING_WINDOW_DAYS = 21;

export interface ServiceDef {
  key: string; calendarId: string; name: string; durationMin: number; price: number;
}

export const SERVICES: Record<string, ServiceDef> = {
  discovery:  { key: 'discovery',  calendarId: 'jHGYCOshffkjUXlbGkbL', name: 'Discovery Call',                 durationMin: 15, price: 0 },
  assessment: { key: 'assessment', calendarId: 'ISHn4KmHuBtE1JW0PjoQ', name: 'AI Readiness Assessment',        durationMin: 30, price: 997 },
  consulting: { key: 'consulting', calendarId: 'rTcVbI0jPtG5R06QLJKW', name: 'Consulting Session',             durationMin: 60, price: 297 },
  tech:       { key: 'tech',       calendarId: 'xCr5m6GKb1xFZKyYYdI7', name: 'Technical Support',              durationMin: 60, price: 197 },
  automation: { key: 'automation', calendarId: 'iSSwgFctK3fZ2HEY9OqO', name: 'Business Automation Consulting', durationMin: 60, price: 497 },
};

/** Contact custom fields (ids from the subaccount). */
export const CUSTOM_FIELDS = {
  aiMaturity:  'iFH4xHkulNVGvQ4qchW0',
  primaryGoal: 'Ag2FEMYy5BQ301y3rJdv',
  companySize: '0KjEAodqYKCjnTRl53OW',
  role:        'oefnMt3y83g0EnSWi0sk',
  industry:    'GnrmYk50xXT27cDMxrwK',
  timeline:    'lZdctQgzUM6fbvYTukV5',
  paymentLink: '1ZVtR3O8aSCZv2tGbEzS', // fieldKey contact.payment_link — used by the Unpaid-Sweep workflow SMS
};

export function getGhlPit(locals: any): string | undefined {
  return (
    locals?.runtime?.env?.GHL_PIT ||
    (typeof process !== 'undefined' ? process.env?.GHL_PIT : undefined) ||
    (import.meta as any).env?.GHL_PIT
  );
}

/** UTC offset string (e.g. "-05:00") for America/Chicago on a given date (DST-aware). */
export function ctOffset(date: Date): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TZ, timeZoneName: 'longOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || 'GMT-05:00';
  const m = name.match(/GMT([+-])(\d{2}):?(\d{2})/);
  return m ? `${m[1]}${m[2]}:${m[3]}` : '-05:00';
}

/** Build an ISO timestamp for a CT wall-clock time on `dateStr` (YYYY-MM-DD). */
export function ctIso(dateStr: string, hour: number, minute: number): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  // Offset for that calendar day (use noon to avoid DST-boundary ambiguity).
  const offset = ctOffset(new Date(`${dateStr}T12:00:00Z`));
  return `${dateStr}T${hh}:${mm}:00${offset}`;
}

export const ghlHeaders = (pit: string, version = '2021-07-28') => ({
  Authorization: `Bearer ${pit}`,
  Version: version,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
