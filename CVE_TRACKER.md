# CVE tracker

This file records repository-specific mitigation decisions that are not captured by the generated `yarn-audit-known-issues` file.

| CVE | Recorded | Status | Mitigation | Verification | Exit criteria |
| --- | --- | --- | --- | --- | --- |
| CVE-2026-24001 | 2026-03-05 | Mitigated with a transitive override | Keep `resolutions.diff` pinned to `^8.0.3` because current `ts-node`, `mocha`, `mochawesome`, `sinon`, and `tslint` consumers still resolve `diff` transitively. | Run `yarn verify:diff-resolution` and `yarn why diff`. `yarn.lock` must contain only `diff@npm:^8.0.3` resolving to `8.0.3`. | Remove the override only after every remaining consumer accepts a fixed `diff` range natively and this verification step is intentionally updated or removed. |
