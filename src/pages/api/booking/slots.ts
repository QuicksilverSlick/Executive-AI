/**
 * GET /api/booking/slots?service=<key>&date=YYYY-MM-DD
 *
 * Returns available CT time slots for a service on a date. Slots are generated from
 * BUSINESS_HOURS (Mon–Fri) and de-conflicted against existing GHL appointments, since
 * GHL free-slots returns nothing until a host/availability is configured in the UI.
 */
import type { APIRoute } from 'astro';
import {
  GHL_BASE, GHL_LOCATION_ID, BUSINESS_HOURS, SLOT_INTERVAL_MIN, MIN_NOTICE_MIN,
  SERVICES, getGhlPit, ctIso, ghlHeaders, jsonResponse,
} from '../../../lib/booking/config';

export const prerender = false;

function label12(hour: number, minute: number): string {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const serviceKey = url.searchParams.get('service') || '';
  const date = url.searchParams.get('date') || '';
  const service = SERVICES[serviceKey];

  if (!service) return jsonResponse({ success: false, error: 'Unknown service' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return jsonResponse({ success: false, error: 'Invalid date' }, 400);

  const pit = getGhlPit(locals);
  if (!pit) return jsonResponse({ success: false, error: 'Booking service unavailable' }, 503);

  // Weekday check (Mon–Fri) using the calendar date.
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  if (dow === 0 || dow === 6) return jsonResponse({ success: true, service: serviceKey, date, slots: [] });

  const { startHour, endHour } = BUSINESS_HOURS;
  const dur = service.durationMin;
  const dayStartMs = Date.parse(ctIso(date, startHour, 0));
  const dayEndMs = Date.parse(ctIso(date, endHour, 0));
  const nowMs = Date.now();
  const minMs = nowMs + MIN_NOTICE_MIN * 60_000;

  // Fetch existing appointments for this calendar/day to avoid double-booking (best-effort).
  let busy: Array<{ s: number; e: number }> = [];
  try {
    const evUrl = `${GHL_BASE}/calendars/events?locationId=${GHL_LOCATION_ID}&calendarId=${service.calendarId}&startTime=${dayStartMs}&endTime=${dayEndMs}`;
    const r = await fetch(evUrl, { headers: ghlHeaders(pit, '2021-04-15') });
    if (r.ok) {
      const j: any = await r.json();
      busy = (j.events || []).map((e: any) => ({ s: Date.parse(e.startTime), e: Date.parse(e.endTime) }))
        .filter((x: any) => !isNaN(x.s) && !isNaN(x.e));
    }
  } catch { /* best-effort */ }

  const slots: Array<{ time: string; label: string; iso: string }> = [];
  for (let mins = startHour * 60; mins + dur <= endHour * 60; mins += SLOT_INTERVAL_MIN) {
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    const iso = ctIso(date, hour, minute);
    const startMs = Date.parse(iso);
    const endMs = startMs + dur * 60_000;
    if (startMs < minMs) continue; // too soon / in the past
    const conflict = busy.some((b) => startMs < b.e && endMs > b.s);
    if (conflict) continue;
    slots.push({ time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, label: label12(hour, minute), iso });
  }

  return jsonResponse({ success: true, service: serviceKey, date, timezone: 'America/Chicago', slots });
};
