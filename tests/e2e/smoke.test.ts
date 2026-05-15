import { describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { run } from '../../src/index';

describe('sbom-action e2e', () => {
  it('smoke imports', async () => {
    expect(typeof run).toBe('function');
    vi.spyOn(core, 'info').mockImplementation(() => {});
  });
});
