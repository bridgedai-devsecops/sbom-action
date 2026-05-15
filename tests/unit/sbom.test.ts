import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { run } from '../../src/index';

describe('sbom-action', () => {
  it('mock mode writes mock sbom', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdai-sbom-'));
    const out = path.join(dir, 'sbom.json');
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'getInput').mockImplementation((name: string) => {
      const m: Record<string, string> = {
        subject: dir,
        'subject-type': 'file',
        format: 'spdx-json',
        'output-file': out,
        mode: 'mock',
        'fail-on-error': 'true',
      };
      return m[name] ?? '';
    });

    await run();
    const txt = fs.readFileSync(out, 'utf8');
    expect(txt).toContain('bridgedaiMock');
  });
});
