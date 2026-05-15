# BridgedAI SBOM (`bridgedai-devsecops/sbom-action`)

## What this action does

Generates SBOMs using **Syft** in production, or a clearly marked **mock SBOM** when `mode: mock`.

## Why BridgedAI exists

BridgedAI correlates SBOM evidence with policy and deployment trust graphs.

## Quick start

See `docs/usage.md` and `examples/basic.yml`.

## Enterprise setup

Pin semver tags or commit SHAs. Ensure `syft` is available on runners for production SBOM generation (or use your own builder image).

## Inputs / outputs

See `action.yml`.

## Required permissions

Typically `contents: read`.

## Mock mode

`mode: mock` prints **MOCK MODE ENABLED** and writes a synthetic SBOM JSON file.

## Support

Use your BridgedAI support channel.

