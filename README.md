# BridgedAI SBOM (`bridgedai-devsecops/sbom-action`)

## What this action does

Generates **SPDX JSON** SBOMs by default (`format: spdx-json`) using **Syft** in production, or a clearly marked **mock SBOM** when `mode: mock`. CycloneDX (`cyclonedx-json`) remains optional.

## Why BridgedAI exists

BridgedAI correlates SBOM evidence with policy and deployment trust graphs.

## Quick start

See `docs/usage.md` and `examples/basic.yml`.

## Enterprise setup

Pin semver tags or commit SHAs. In **production** mode the action installs [Syft](https://github.com/anchore/syft) automatically when it is not on `PATH` (pin with `syft-version`, or set `syft-path` / `install-syft: false` to manage Syft yourself).

## Inputs / outputs

See `action.yml`.

## Required permissions

Typically `contents: read`.

## Mock mode

`mode: mock` prints **MOCK MODE ENABLED** and writes a synthetic SBOM JSON file.

## Support

Use your BridgedAI support channel.

