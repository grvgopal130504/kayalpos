// Unit test (no database) for the IST CreateTime helper used by the live TCZ checkout.
//   node test/tczCreateTime.unit.mjs
// Run it under several server time zones to prove the result does not depend on them:
//   TZ=UTC node test/tczCreateTime.unit.mjs
//   TZ=America/New_York node test/tczCreateTime.unit.mjs
//   TZ=Asia/Kolkata node test/tczCreateTime.unit.mjs
import assert from 'node:assert/strict';
import { istTimeOfDay, TCZ_TIME_ZONE } from '../src/modules/sale/tczBilling.service.js';

let passed = 0; const failures = [];
const test = (name, fn) => { try { fn(); passed += 1; console.log(`  ok   ${name}`); } catch (e) { failures.push(name); console.log(`  FAIL ${name}\n       ${e.message}`); } };

const HHMMSSmmm = (d) => d.toISOString().slice(11, 23); // the Date carries the wall-clock time in its UTC fields
const OFFSET_MS = 5.5 * 3600 * 1000;                    // independent oracle: IST is exactly UTC+05:30, no DST
const istDate = (iso) => new Date(Date.parse(iso) + OFFSET_MS).toISOString().slice(0, 10);

console.log(`\nTCZ CreateTime (IST) helper — process TZ=${process.env.TZ ?? '(unset)'} / ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

test('zone is Asia/Kolkata', () => assert.equal(TCZ_TIME_ZONE, 'Asia/Kolkata'));

// [UTC instant, expected IST time of day, expected IST calendar date, why it matters]
const CASES = [
  ['2026-10-27T06:20:42.689Z', '11:50:42.689', '2026-10-27', 'ordinary daytime sale (the local test row)'],
  ['2026-10-27T18:29:59.999Z', '23:59:59.999', '2026-10-27', 'last millisecond of the IST day'],
  ['2026-10-27T18:30:00.000Z', '00:00:00.000', '2026-10-28', 'IST MIDNIGHT: UTC date is still 27th, IST date is already 28th'],
  ['2026-10-27T18:30:00.001Z', '00:00:00.001', '2026-10-28', 'first millisecond after IST midnight'],
  ['2026-10-27T23:59:59.999Z', '05:29:59.999', '2026-10-28', 'last millisecond of the UTC day'],
  ['2026-10-28T00:00:00.000Z', '05:30:00.000', '2026-10-28', 'UTC MIDNIGHT'],
  ['2026-10-27T05:29:59.999Z', '10:59:59.999', '2026-10-27', 'just before 11:00 IST'],
  ['2026-12-31T18:29:59.999Z', '23:59:59.999', '2026-12-31', 'YEAR END: last millisecond of 2026 IST'],
  ['2026-12-31T18:30:00.000Z', '00:00:00.000', '2027-01-01', 'YEAR BOUNDARY: new year starts at 18:30 UTC on 31 Dec'],
  ['2026-12-31T23:59:59.999Z', '05:29:59.999', '2027-01-01', 'UTC year end is already 2027 in IST'],
  ['2027-01-01T00:00:00.000Z', '05:30:00.000', '2027-01-01', 'UTC new year'],
  ['2028-02-28T18:30:00.000Z', '00:00:00.000', '2028-02-29', 'LEAP DAY starts (2028 is a leap year)'],
  ['2028-02-29T18:29:59.999Z', '23:59:59.999', '2028-02-29', 'last millisecond of the leap day'],
  ['2028-02-29T18:30:00.000Z', '00:00:00.000', '2028-03-01', 'LEAP DAY ends -> 1 March'],
  ['2027-02-28T18:30:00.000Z', '00:00:00.000', '2027-03-01', 'non-leap year: 28 Feb -> 1 Mar'],
  ['2026-01-31T18:30:00.000Z', '00:00:00.000', '2026-02-01', 'month boundary'],
  ['1970-01-01T00:00:00.000Z', '05:30:00.000', '1970-01-01', 'epoch'],
  ['2026-03-08T07:00:00.000Z', '12:30:00.000', '2026-03-08', 'US DST start day: IST must not move'],
  ['2026-11-01T06:00:00.000Z', '11:30:00.000', '2026-11-01', 'US DST end day: IST must not move'],
];
for (const [iso, time, date, why] of CASES) {
  test(`${iso} -> ${time} IST (${date})  [${why}]`, () => {
    const d = new Date(iso);
    const r = istTimeOfDay(d);
    assert.equal(HHMMSSmmm(r), time);
    assert.equal(istDate(iso), date, 'oracle IST date');
    // the Date handed to Prisma must sit on 1970-01-01 so only the time of day is stored
    assert.equal(r.toISOString().slice(0, 10), '1970-01-01');
    // never the 24:00 quirk
    assert.ok(!HHMMSSmmm(r).startsWith('24'));
    // the original instant is not mutated
    assert.equal(d.toISOString(), iso);
  });
}

test('UTC-versus-IST regression: the result is NOT the UTC time of day (5h30 apart) and NOT the input itself', () => {
  const d = new Date('2026-10-27T06:20:42.689Z');
  const utcTod = d.toISOString().slice(11, 23);
  assert.equal(utcTod, '06:20:42.689');
  assert.notEqual(HHMMSSmmm(istTimeOfDay(d)), utcTod);
  assert.equal(((istTimeOfDay(d).getTime() - Date.UTC(1970, 0, 1, 6, 20, 42, 689)) / 60000), 330);
});

test('every minute-of-day boundary around IST midnight (18:25..18:35 UTC, every 30 s)', () => {
  const base = Date.parse('2026-10-27T18:25:00.000Z');
  for (let i = 0; i <= 20; i += 1) {
    const ms = base + i * 30000;
    assert.equal(HHMMSSmmm(istTimeOfDay(new Date(ms))), new Date(ms + OFFSET_MS).toISOString().slice(11, 23));
  }
});

test('20,000 random instants 1970..2100 agree with the fixed +05:30 oracle; time of day always 0 <= t < 24h', () => {
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const lo = Date.UTC(1970, 0, 1); const hi = Date.UTC(2100, 0, 1);
  for (let i = 0; i < 20000; i += 1) {
    const ms = Math.floor(lo + rnd() * (hi - lo));
    const r = istTimeOfDay(new Date(ms));
    assert.equal(r.getTime(), (ms + OFFSET_MS) % 86400000, `instant ${new Date(ms).toISOString()}`);
    assert.ok(r.getTime() >= 0 && r.getTime() < 86400000);
  }
});

test('invalid Date is rejected, not silently stored', () => assert.throws(() => istTimeOfDay(new Date('nope')), TypeError));

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
