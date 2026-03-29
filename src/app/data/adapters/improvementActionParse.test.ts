import { describe, it, expect } from 'vitest';
import { parseImprovementActionCards } from './improvementActionParse';

describe('parseImprovementActionCards', () => {
  it('parses sample from production CSV pattern', () => {
    const text =
      '主图调整：重设首图视觉焦点→提主图点击率→+1.5pp→看CTR；详情图优化：强化首屏利益点与实拍对比→提转化率→+1.2pp→看支付转化';
    const cards = parseImprovementActionCards(text);
    expect(cards.length).toBe(2);
    expect(cards[0].title).toContain('主图');
    expect(cards[0].expectedMetric).toContain('重设首图');
    expect(cards[0].targetLift).toContain('1.5');
    expect(cards[0].validationNote).toMatch(/CTR|看/);
    expect(cards[1].title).toContain('详情');
    expect(cards[1].targetLift).toContain('1.2');
  });

  it('handles single chunk without lift token', () => {
    const cards = parseImprovementActionCards('优化标题与卖点展示');
    expect(cards.length).toBe(1);
    expect(cards[0].title.length).toBeGreaterThan(0);
  });

  it('handles arrow chain without colon', () => {
    const cards = parseImprovementActionCards('步骤A→步骤B→+2pp→看转化');
    expect(cards.length).toBe(1);
    expect(cards[0].title).toBe('步骤A');
    expect(cards[0].targetLift).toContain('2');
  });

  it('returns empty for empty input', () => {
    expect(parseImprovementActionCards('')).toEqual([]);
    expect(parseImprovementActionCards(undefined)).toEqual([]);
  });
});
