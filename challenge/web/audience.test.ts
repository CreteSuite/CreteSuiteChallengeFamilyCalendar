import { describe, expect, it } from 'vitest';
import { describeAudience } from './audience';

const dad = { id: 'dad', name: 'Dad' };
const mom = { id: 'mom', name: 'Mom' };
const son = { id: 'son', name: 'Son' };
const coach = { id: 'coach', name: 'Coach Rivera' };

describe('describeAudience', () => {
  it('lists the current user first as "You", then the other members', () => {
    expect(describeAudience([coach, son], 'son')).toBe('You · Coach Rivera');
    expect(describeAudience([dad, mom, son], 'mom')).toBe('You · Dad · Son');
  });

  it('says "only you" when the current user is the only member', () => {
    expect(describeAudience([son], 'son')).toBe('only you');
  });
});
