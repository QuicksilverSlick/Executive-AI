/**
 * POST /api/booking/create
 *
 * Body: { service, iso, firstName, lastName, email, phone, company?, aiMaturity?, goal?, hp? }
 * Upserts the GHL contact (with qualification custom fields + tags) and books the
 * appointment directly on the calendar with an explicit host — fully on-brand, no GHL iframe.
 */
import type { APIRoute } from 'astro';
import {
  GHL_BASE, GHL_LOCATION_ID, GHL_HOST_USER_ID, SERVICES, CUSTOM_FIELDS,
  getGhlPit, ghlHeaders, jsonResponse,
} from '../../../lib/booking/config';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add `durationMin` to a CT-offset ISO ("YYYY-MM-DDTHH:MM:SS-05:00"), same day. */
function addMinutesSameOffset(iso: string, durationMin: number): string {
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):\d{2}([+-]\d{2}:\d{2})$/);
  if (!m) return new Date(Date.parse(iso) + durationMin * 60_000).toISOString();
  const [, date, hh, mm, off] = m;
  const total = parseInt(hh) * 60 + parseInt(mm) + durationMin;
  const eh = Math.floor(total / 60), em = total % 60;
  return `${date}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00${off}`;
}

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try { body = await request.json(); } catch { return jsonResponse({ success: false, error: 'Invalid request' }, 400); }

  // Honeypot — silently accept but do nothing for bots.
  if (body.hp) return jsonResponse({ success: true });

  const service = SERVICES[body.service];
  const iso = String(body.iso || '');
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const company = String(body.company || '').trim();

  if (!service) return jsonResponse({ success: false, error: 'Please choose a session type.' }, 400);
  if (!iso || isNaN(Date.parse(iso))) return jsonResponse({ success: false, error: 'Please choose a time.' }, 400);
  if (!firstName) return jsonResponse({ success: false, error: 'Please enter your name.' }, 400);
  if (!EMAIL_RE.test(email)) return jsonResponse({ success: false, error: 'Please enter a valid email.' }, 400);
  if (!phone) return jsonResponse({ success: false, error: 'Please enter a phone number.' }, 400);

  const pit = getGhlPit(locals);
  if (!pit) return jsonResponse({ success: false, error: 'Booking service unavailable' }, 503);

  const customFields: Array<{ id: string; value: string }> = [];
  if (body.aiMaturity) customFields.push({ id: CUSTOM_FIELDS.aiMaturity, value: String(body.aiMaturity) });
  if (body.goal) customFields.push({ id: CUSTOM_FIELDS.primaryGoal, value: String(body.goal) });

  try {
    // 1) Upsert contact
    const upsert = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST', headers: ghlHeaders(pit),
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID, firstName, lastName, email, phone,
        ...(company && { companyName: company }),
        source: 'Website Booking',
        tags: ['website booking', `booked ${service.name.toLowerCase()}`],
        ...(customFields.length && { customFields }),
      }),
    });
    if (!upsert.ok) throw new Error(`upsert ${upsert.status}: ${(await upsert.text()).slice(0, 200)}`);
    const uj: any = await upsert.json();
    const contactId = (uj.contact || uj).id;
    if (!contactId) throw new Error('no contactId');

    // 2) Create the appointment (explicit host; bypass free-slot validation since we own availability)
    const endIso = addMinutesSameOffset(iso, service.durationMin);
    const appt = await fetch(`${GHL_BASE}/calendars/events/appointments`, {
      method: 'POST', headers: ghlHeaders(pit, '2021-04-15'),
      body: JSON.stringify({
        calendarId: service.calendarId, locationId: GHL_LOCATION_ID, contactId,
        startTime: iso, endTime: endIso,
        title: `${service.name} — ${firstName} ${lastName}`.trim(),
        appointmentStatus: 'confirmed', assignedUserId: GHL_HOST_USER_ID,
        ignoreFreeSlotValidation: true, toNotify: true,
      }),
    });
    if (!appt.ok) throw new Error(`appointment ${appt.status}: ${(await appt.text()).slice(0, 200)}`);
    const aj: any = await appt.json();
    const appointmentId = (aj.appointment || aj).id;

    // 3) Paid session → create + send a GHL invoice (Stripe-backed via the connected gateway)
    //    and return its hosted payment URL so the browser redirects to secure checkout.
    let paymentUrl: string | undefined;
    if (service.price > 0) {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const dueStr = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
        const invRes = await fetch(`${GHL_BASE}/invoices/`, {
          method: 'POST', headers: ghlHeaders(pit),
          body: JSON.stringify({
            altId: GHL_LOCATION_ID, altType: 'location', name: service.name, currency: 'USD',
            issueDate: todayStr, dueDate: dueStr, liveMode: true,
            contactDetails: { id: contactId, name: `${firstName} ${lastName}`.trim(), email },
            businessDetails: { name: 'Executive AI Training' },
            items: [{ name: service.name, currency: 'USD', amount: service.price, qty: 1 }],
          }),
        });
        if (invRes.ok) {
          const invoiceId = (await invRes.json())._id;
          if (invoiceId) {
            // "send" makes the invoice payable (and emails the customer a copy).
            await fetch(`${GHL_BASE}/invoices/${invoiceId}/send`, {
              method: 'POST', headers: ghlHeaders(pit),
              body: JSON.stringify({ altId: GHL_LOCATION_ID, altType: 'location', userId: GHL_HOST_USER_ID, action: 'email', liveMode: true }),
            }).catch(() => {});
            paymentUrl = `https://link.marketsimple.pro/invoice/${invoiceId}`;
            // Store the pay link on the contact so the "Unpaid Session Follow-Up" workflow
            // can text it via {{contact.payment_link}}.
            await fetch(`${GHL_BASE}/contacts/${contactId}`, {
              method: 'PUT', headers: ghlHeaders(pit),
              body: JSON.stringify({ customFields: [{ id: CUSTOM_FIELDS.paymentLink, value: paymentUrl }] }),
            }).catch(() => {});
          }
        } else {
          console.error('[booking/create] invoice create failed', invRes.status, (await invRes.text()).slice(0, 200));
        }
      } catch (e) {
        console.error('[booking/create] invoice error', e instanceof Error ? e.message : e);
      }
    }

    return jsonResponse({ success: true, appointmentId, startTime: iso, service: service.key, price: service.price, ...(paymentUrl && { paymentUrl }) });
  } catch (err) {
    console.error('[booking/create]', err instanceof Error ? err.message : err);
    return jsonResponse({ success: false, error: 'We could not complete your booking. Please try again.' }, 502);
  }
};
