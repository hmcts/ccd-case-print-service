# CCD-7877 Hardcoded Credentials

## Objective

Remove the tracked private key and externalise runtime credentials while preserving safe local development.

## Acceptance criteria

- No private key is tracked.
- Runtime credentials use environment or managed-secret injection.
- Local HTTPS uses ignored, locally managed certificate files.
- No live credential rotation is performed by this change.

## Validation

- Shell and Compose-related checks passed; the service lint command completed.
- Full Docker runtime validation remains outstanding.

## Scope and findings

Remediation status: the tracked key has now been removed from this branch. Local HTTPS paths are externalised; no live credential rotation was performed.

- `src/main/resources/localhost-ssl/localhost.key` is a tracked PEM RSA private key, added in history on 2017-09-20 for development HTTPS.
- The tracked key has been removed. The service remains HTTP and does not provide standalone HTTPS; TLS must terminate at the gateway or ingress.
- Existing mappings include `IDAM_PRINT_SERVICE_KEY` and `APPINSIGHTS_INSTRUMENTATIONKEY`.
- `config/default.yaml` and `config/mocha.yaml` contain dummy/test secret values; these are not confirmed live credentials.
- History shows secret-volume and Vault/Azure migration work, but not rotation of the private key.

## Validity and deployment

- Current validity: **not confirmed**; no live authentication or secret-store access was available.
- Deployment/runtime: repository evidence only; Helm/Terraform and secret-backed patterns exist, but live pods and cloud secret stores were not accessible.
- Rotation: **not confirmed** for the key or reported credentials.

## Recommendations

Treat the key and reported credentials as compromised. Revoke/rotate, remove the key from source and history, and use runtime-mounted secrets or managed TLS. Reuse `IDAM_PRINT_SERVICE_KEY` and `APPINSIGHTS_INSTRUMENTATIONKEY`. Verify live secret-store references, deployments, CI/CD variables, and rotation records before closure.

## Local operation

The service remains HTTP; its current server implementation does not provide standalone HTTPS. If TLS is required, terminate it at the appropriate gateway or ingress. When using the CCD Docker stack, run `ccd-docker/bin/setup-local-secrets.sh` for the shared local environment.
