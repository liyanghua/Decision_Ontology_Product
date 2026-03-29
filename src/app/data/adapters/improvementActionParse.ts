const emptyCard = (): ImprovementActionCardVM => ({
  title: '',
  expectedMetric: '',
  targetLift: '',
  validationNote: '',
});

export interface ImprovementActionCardVM {
  title: string;
  expectedMetric: string;
  targetLift: string;
  validationNote: string;
}

function hasLiftToken(s: string): boolean {
  return /pp|％|%/i.test(s) && /[\d+\-.]/.test(s);
}

function parseOneChunk(chunk: string): ImprovementActionCardVM {
  const trimmed = chunk.trim();
  if (!trimmed) return emptyCard();

  let title = '';
  let body = trimmed;
  const colon = trimmed.indexOf('：');
  if (colon !== -1) {
    title = trimmed.slice(0, colon).trim();
    body = trimmed.slice(colon + 1).trim();
  }

  let segs = body.split(/→|->/).map((s) => s.trim()).filter(Boolean);

  if (segs.length === 0) {
    return {
      title: title || trimmed,
      expectedMetric: '',
      targetLift: '',
      validationNote: '',
    };
  }

  if (!title && colon === -1 && segs.length > 1) {
    title = segs[0];
    segs = segs.slice(1);
  }

  let liftIdx = -1;
  for (let i = 0; i < segs.length; i++) {
    if (hasLiftToken(segs[i])) {
      liftIdx = i;
      break;
    }
  }

  if (liftIdx === -1) {
    const last = segs[segs.length - 1];
    if (segs.length >= 2 && (/^看|^观测|^验证|^关注/.test(last) || last.length <= 12)) {
      return {
        title: title || segs[0] || '改进动作',
        expectedMetric: segs.slice(0, -1).join(' → '),
        targetLift: '',
        validationNote: last,
      };
    }
    return {
      title: title || segs.join(' → '),
      expectedMetric: title ? segs.join(' → ') : '',
      targetLift: '',
      validationNote: '',
    };
  }

  const targetLift = segs[liftIdx];
  const expectedMetric = segs.slice(0, liftIdx).join(' → ');
  const validationNote = segs.slice(liftIdx + 1).join(' → ');

  return {
    title: title || '改进动作',
    expectedMetric,
    targetLift,
    validationNote,
  };
}

/** Parse improvement_suggestions text into structured action cards (frontend demo). */
export function parseImprovementActionCards(text: string | undefined): ImprovementActionCardVM[] {
  if (text == null || String(text).trim() === '') return [];
  const chunks = String(text)
    .split(/[；;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return chunks.map(parseOneChunk);
}
