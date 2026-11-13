import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultQuery, validateQuery, dateSummary, comparablePricePerPerson } from '../.core-build/flight.model.js';
import { resolveMockOffers } from '../.core-build/mock-offer-resolver.js';

test('default query is valid and shows meaningful recommendations', () => {
  const q = defaultQuery();
  assert.equal(validateQuery(q), null);
  const offers = resolveMockOffers(q);
  assert.ok(offers.length >= 1 && offers.length <= 2);
  assert.equal(offers[0].id, 'cheapest');
  if (offers.length === 2) {
    assert.equal(offers[1].id, 'balanced');
    assert.ok(offers[0].totalPrice < offers[1].totalPrice);
  } else {
    assert.equal(offers[0].alsoBestBalance, true);
  }
  assert.equal(offers[0].legs.length, 1);
});

test('selected needs always exist in final offer services', () => {
  const q = defaultQuery();
  q.needs = { cabinBag: true, checkedBag: true, seatSelection: true, nonstopOnly: true };
  const offers = resolveMockOffers(q);
  for (const offer of offers) {
    assert.deepEqual(offer.legs.map(l => l.stops), Array(q.tripType === 'roundTrip' ? 2 : 1).fill(0));
    const items = offer.includedServices.map(s => s.code);
    for (const needed of ['personal','cabin','checked','seat']) assert.ok(items.includes(needed), `${needed} missing`);
  }
});

test('optional extras may be included by resolved fare even when unrequested', () => {
  const q = defaultQuery();
  q.needs.cabinBag = false;
  q.needs.checkedBag = false;
  const offers = resolveMockOffers(q);
  for (const o of offers) assert.ok(o.includedServices.some(s => s.code === 'personal'));
});

test('one way returns just one leg, with passenger-adjusted total', () => {
  const q = defaultQuery();
  q.tripType = 'oneWay';
  const single = resolveMockOffers(q)[0];
  q.adults=2;
  const duo = resolveMockOffers(q)[0];
  assert.equal(single.legs.length,1);
  assert.equal(duo.legs.length,1);
  assert.ok(duo.totalPrice > single.totalPrice);
});

test('validation detects bad dates and identical airports', () => {
  const q = defaultQuery();
  q.destination = q.origin;
  assert.match(validateQuery(q), /diferentes/);
  q.destination = 'Roma';
  q.tripType='roundTrip'; q.departureMode='exact'; q.departureDate='2026-12-17'; q.returnMode='exact'; q.returnDate='2026-12-16';
  assert.match(validateQuery(q), /posterior/);
});

test('editing a query does not mutate the original by reference', () => {
  const q = defaultQuery();
  const original = structuredClone(q);
  const changes = structuredClone(q);changes.needs.checkedBag=true;
  assert.deepEqual(q, original);
  assert.notDeepEqual(q, changes);
  assert.ok(dateSummary(q));
});

test('fare resolver compares bundled benefits against standalone ancillaries', async () => {
  const { resolveFareCombination, includedServices } = await import('../.core-build/mock-offer-resolver.js');
  const wantsEverything = { cabinBag: true, checkedBag: true, seatSelection: true, nonstopOnly: false };
  // Light + all extras costs more than Comfort + seat in the fictional model.
  assert.equal(resolveFareCombination(100, wantsEverything, ['basic','classic']).fare, 'classic');
  assert.equal(resolveFareCombination(100, wantsEverything, ['basic','classic','flex']).fare, 'flex');
  // If Comfort is sold out, the resolver must compare the remaining valid options.
  const fallback = resolveFareCombination(100, wantsEverything, ['basic','flex']);
  assert.ok(['basic','flex'].includes(fallback.fare));
  assert.deepEqual(includedServices('flex', wantsEverything).some(s => s.code === 'priority'), true);
  assert.deepEqual(includedServices('classic', wantsEverything).some(s => s.code === 'meal'), true);
  assert.deepEqual(includedServices('basic', { cabinBag: false, checkedBag: false, seatSelection: false, nonstopOnly: false }).some(s => s.code === 'checked'), false);
});

test('English trip summary uses consistent translated copy', () => {
  const q = defaultQuery();
  assert.match(dateSummary(q, 'en'), /This month/);
  assert.match(dateSummary(q, 'es'), /Este mes/);
});

test('a meaningful cheaper + better-balanced pair differs in actual flight utility', () => {
  const q = defaultQuery();
  q.needs.nonstopOnly = false;
  q.tripType = 'roundTrip';
  q.destination = 'Roma';
  const results = resolveMockOffers(q);
  assert.equal(results.length, 2);
  const [cheap, balanced] = results;
  assert.ok(balanced.totalPrice > cheap.totalPrice);
  const totalStops = (offer) => offer.legs.reduce((sum, leg) => sum + leg.stops, 0);
  assert.ok(totalStops(balanced) < totalStops(cheap), 'balanced option avoids connections');
  assert.notDeepEqual(balanced.legs.map(l => l.departureTime), cheap.legs.map(l => l.departureTime));
});

test('no artificial second card if cheapest is also the best balance', () => {
  const q = defaultQuery();
  q.destination = 'Roma';
  q.needs.nonstopOnly = true;
  const results = resolveMockOffers(q);
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'cheapest');
  assert.equal(results[0].alsoBestBalance, true);
  assert.ok(results[0].legs.every(l => l.stops === 0));
});

test('per-person pricing only appears for identical adult fares', () => {
  const q = defaultQuery();
  q.adults = 2;
  const offer = resolveMockOffers(q)[0];
  assert.equal(comparablePricePerPerson(offer, q), offer.totalPrice / 2);
  assert.equal(comparablePricePerPerson(offer, q) * 2, offer.totalPrice);

  q.children = 1;
  assert.equal(comparablePricePerPerson(resolveMockOffers(q)[0], q), null);
  q.children = 0; q.infants = 1;
  assert.equal(comparablePricePerPerson(resolveMockOffers(q)[0], q), null);
  q.infants = 0; q.adults = 1;
  assert.equal(comparablePricePerPerson(resolveMockOffers(q)[0], q), null);
});

test('all itinerary configurations obey nonstop-only as a hard constraint', () => {
  for (const destination of ['Roma', 'Madrid', 'París', 'Lisboa', 'Londres']) {
    for (const tripType of ['oneWay', 'roundTrip']) {
      const q = defaultQuery(); q.destination = destination; q.tripType = tripType; q.needs.nonstopOnly = true;
      const offers = resolveMockOffers(q);
      assert.ok(offers.length === 1 || offers.length === 2);
      for (const offer of offers) assert.ok(offer.legs.every(leg => leg.stops === 0));
    }
  }
});

test('optional comfort needs are priced and included in every recommended offer', () => {
  const baseline = defaultQuery();
  const extended = structuredClone(baseline);
  extended.needs.flexibleChanges = true;
  extended.needs.priorityBoarding = true;
  extended.needs.fastTrack = true;
  extended.needs.loungeAccess = true;
  const baseOffer = resolveMockOffers(baseline)[0];
  const offers = resolveMockOffers(extended);
  assert.ok(offers[0].totalPrice > baseOffer.totalPrice);
  for (const offer of offers) {
    const included = offer.includedServices.map(service => service.code);
    for (const code of ['changes', 'priority', 'fastTrack', 'lounge']) {
      assert.ok(included.includes(code), `${code} must be included in ${offer.id}`);
    }
  }
});

test('fare resolver compares premium benefits against the price of add-ons', async () => {
  const { resolveFareCombination } = await import('../.core-build/mock-offer-resolver.js');
  const q = defaultQuery();
  q.needs.checkedBag = true;
  q.needs.seatSelection = true;
  q.needs.flexibleChanges = true;
  q.needs.priorityBoarding = true;
  assert.equal(resolveFareCombination(100, q.needs, ['basic', 'classic', 'flex']).fare, 'flex');
  const minimal = defaultQuery();
  minimal.needs.fastTrack = true;
  minimal.needs.loungeAccess = true;
  assert.equal(resolveFareCombination(100, minimal.needs, ['basic']).perPassenger, 100 + 22 + 24 + 55);
});

test('additional departure modes are translated and produce dates in intended windows', () => {
  const q = defaultQuery();
  const now = new Date(); now.setHours(12,0,0,0);
  const dayDiff = date => Math.round((new Date(`${date}T12:00:00`).getTime() - now.getTime()) / 86400000);
  for (const [mode, min, max] of [
    ['today',0,0],['tomorrow',1,1],['next3Months',0,93],['next12Months',0,367]
  ]) {
    q.departureMode = mode;
    const leg = resolveMockOffers(q)[0].legs[0];
    assert.ok(dayDiff(leg.dateISO)>=min && dayDiff(leg.dateISO)<=max, `${mode}: ${leg.dateISO}`);
    assert.notEqual(dateSummary(q,'es'),dateSummary(q,'en'),`${mode} is translated`);
  }
  q.departureMode='nextYear';
  const leg = resolveMockOffers(q)[0].legs[0];
  assert.equal(Number(leg.dateISO.slice(0,4)), now.getFullYear()+1);
  assert.match(dateSummary(q,'es'), /Próximo año/);
  assert.match(dateSummary(q,'en'), /Next year/);
});

test('exact return cannot precede the first departure in a flexible window', async () => {
  const { earliestDepartureISO } = await import('../.core-build/flight.model.js');
  const q = defaultQuery();
  q.tripType='roundTrip';q.departureMode='nextYear';q.returnMode='exact';
  const today = new Date();
  q.returnDate=`${today.getFullYear()}-12-30`;
  assert.match(validateQuery(q), /posterior/);
  q.returnDate=`${today.getFullYear()+1}-01-03`;
  assert.equal(validateQuery(q),null);
  assert.equal(earliestDepartureISO(q).slice(0,4),String(today.getFullYear()+1));
  const offer = resolveMockOffers(q)[0];
  assert.ok(offer.legs[0].dateISO < offer.legs[1].dateISO);
});

test('collapsed additional needs remain in copied queries after editing', () => {
  const q=defaultQuery();
  q.needs.fastTrack=true;q.needs.loungeAccess=true;
  const cloned=structuredClone(q);
  cloned.needs.priorityBoarding=true;
  assert.equal(q.needs.priorityBoarding,false);
  assert.equal(cloned.needs.fastTrack,true);
  assert.equal(cloned.needs.loungeAccess,true);
});

test('the selected offer can be used as a read-only end-of-demo summary', () => {
  const query = defaultQuery();
  const offers = resolveMockOffers(query);
  const selection = offers[0];
  assert.ok(selection);
  assert.ok(selection.totalPrice > 0);
  assert.ok(selection.legs.length === (query.tripType === 'roundTrip' ? 2 : 1));
  assert.ok(selection.includedServices.length > 0);
  assert.equal(query.origin.trim().length > 0, true);
});

test('round trip return has just duration or exact date behavior', () => {
  const q = defaultQuery();
  q.tripType = 'roundTrip';
  q.departureMode = 'exact';
  q.departureDate = '2027-03-04';
  q.returnMode = 'duration';
  q.stayLength = '4-7';
  const durationOffer = resolveMockOffers(q)[0];
  assert.equal(durationOffer.legs.length, 2);
  assert.equal(durationOffer.legs[0].dateISO, '2027-03-04');
  assert.equal(durationOffer.legs[1].dateISO, '2027-03-09');
  assert.match(dateSummary(q, 'es'), /4–7 días/);
  q.returnMode = 'exact';
  q.returnDate = '2027-03-16';
  const exactOffer = resolveMockOffers(q)[0];
  assert.equal(exactOffer.legs[1].dateISO, '2027-03-16');
  assert.match(dateSummary(q, 'en'), /return 16 Mar/);
});

test('no-preference duration is explicitly bounded by 30 days', () => {
  const q = defaultQuery();
  q.tripType = 'roundTrip';
  q.departureMode = 'exact';
  q.departureDate = '2027-04-02';
  q.stayLength = 'any';
  const offer = resolveMockOffers(q)[0];
  const from = new Date(offer.legs[0].dateISO + 'T12:00:00');
  const to = new Date(offer.legs[1].dateISO + 'T12:00:00');
  const days = Math.round((to.getTime() - from.getTime()) / 86400000);
  assert.ok(days >= 1 && days <= 30);
  assert.match(dateSummary(q, 'es'), /hasta 30 días/);
  assert.match(dateSummary(q, 'en'), /up to 30 days/);
});

test('15-21 day duration produces a return within the selected range', () => {
  const q = defaultQuery();
  q.tripType = 'roundTrip';
  q.departureMode = 'exact';
  q.departureDate = '2027-01-09';
  q.stayLength = '15-21';
  const offer = resolveMockOffers(q)[0];
  const days = (new Date(offer.legs[1].dateISO+'T12:00:00') - new Date(offer.legs[0].dateISO+'T12:00:00')) / 86400000;
  assert.ok(days >= 15 && days <= 21);
});

test('selection screen can use actual itinerary dates, not the search window', () => {
  const q = defaultQuery();
  q.departureMode = 'month';
  const offer = resolveMockOffers(q)[0];
  assert.ok(/^\d{4}-\d\d-\d\d$/.test(offer.legs[0].dateISO));
  assert.equal(dateSummary(q, 'es'), 'Este mes');
  assert.notEqual(offer.legs[0].dateISO, dateSummary(q, 'es'));
  assert.match(offer.legs[0].departureTime, /^\d\d:\d\d$/);
});
