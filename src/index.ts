import { createHash } from 'crypto';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import { fail, getOptionalInput, getRequiredInput } from './lib/action-core';
import { getBooleanInput } from './lib/inputs';
import { setOutputs } from './lib/outputs';
import { appendJobSummary } from './lib/summary';
import { ConfigurationError } from './lib/errors';
import { parseEnum } from './lib/validation';

async function execFileStdout(cmd: string, args: readonly string[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    cp.execFile(cmd, [...args], { maxBuffer: 50 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      resolve(String(stdout ?? ''));
    });
  });
}

function countPackagesFromSbom(jsonText: string, format: 'spdx-json' | 'cyclonedx-json'): number {
  try {
    const obj = JSON.parse(jsonText) as Record<string, unknown>;
    if (format === 'cyclonedx-json') {
      const comps = obj.components;
      return Array.isArray(comps) ? comps.length : 0;
    }
    const pkgs = obj.packages;
    return Array.isArray(pkgs) ? pkgs.length : 0;
  } catch {
    return 0;
  }
}

export async function run(): Promise<void> {
  const subject = getRequiredInput('subject');
  const subjectType = parseEnum('subject-type', getRequiredInput('subject-type'), ['oci', 'file', 'npm', 'binary'] as const);
  const format = parseEnum('format', getRequiredInput('format'), ['spdx-json', 'cyclonedx-json'] as const);
  const outputFile = path.resolve(getRequiredInput('output-file'));
  const mode = parseEnum('mode', getOptionalInput('mode') || 'production', ['production', 'mock'] as const);
  const failOnError = getBooleanInput('fail-on-error', true);

  if (mode === 'mock') {
    core.info('MOCK MODE ENABLED');
    const mockDoc = {
      bridgedaiMock: true,
      note: 'MOCK SBOM — not suitable for production assurance',
      subject,
      subjectType,
      format,
      packages: [{ name: 'mock-package', version: '0.0.0' }],
    };
    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    const text = `${JSON.stringify(mockDoc, null, 2)}\n`;
    await fs.promises.writeFile(outputFile, text, { encoding: 'utf8', mode: 0o644 });
    const digest = createHash('sha256').update(text, 'utf8').digest('hex');
    setOutputs({
      'sbom-file': outputFile,
      'sbom-digest': digest,
      'package-count': String(1),
      format,
    });
    await appendJobSummary('## BridgedAI SBOM\n\n**MOCK SBOM** generated for tests.\n');
    return;
  }

  const syftFormat = format === 'spdx-json' ? 'spdx-json' : 'cyclonedx-json';
  let target = subject;
  if (subjectType === 'oci') {
    target = subject;
  } else {
    target = path.resolve(subject);
    if (!fs.existsSync(target)) {
      throw new ConfigurationError(`Subject not found: ${target}`);
    }
  }

  try {
    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    const stdout = await execFileStdout('syft', ['scan', target, '-o', syftFormat]);
    await fs.promises.writeFile(outputFile, stdout, { encoding: 'utf8', mode: 0o644 });
    const digest = createHash('sha256').update(stdout, 'utf8').digest('hex');
    const count = countPackagesFromSbom(stdout, format);
    setOutputs({
      'sbom-file': outputFile,
      'sbom-digest': digest,
      'package-count': String(count),
      format,
    });
    await appendJobSummary(`## BridgedAI SBOM\n\n- **file**: \`${outputFile}\`\n- **digest**: \`${digest}\`\n`);
  } catch (e) {
    if (!failOnError) {
      core.warning(`SBOM generation failed (fail-on-error=false): ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    throw new ConfigurationError(`SBOM generation failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (process.env.VITEST !== 'true') {
  void run().catch((err) => {
    fail(err instanceof Error ? err : new Error(String(err)));
  });
}
