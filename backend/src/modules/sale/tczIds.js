// API ids for TCZ bills. The database keys are Linesales.DocEntry (bigint) and
// LinesaleItemDetails (DocEntry, LineId); the API keeps handing the frontend plain strings:
//   bill id = "<DocEntry>"        line id = "<DocEntry>-<LineId>"
export const billIdOf = (docEntry) => String(docEntry);
export const lineIdOf = (docEntry, lineId) => `${docEntry}-${lineId}`;

/** "123" -> 123n, anything else -> null (so a bad id is a clean "not found"). */
export function parseBillId(id) {
  return typeof id === 'string' && /^\d{1,18}$/.test(id) ? BigInt(id) : null;
}

/** "123-4" -> { docEntry: 123n, lineId: 4 }, anything else -> null. */
export function parseLineId(id) {
  const m = typeof id === 'string' ? /^(\d{1,18})-(\d{1,9})$/.exec(id) : null;
  return m ? { docEntry: BigInt(m[1]), lineId: Number(m[2]) } : null;
}
