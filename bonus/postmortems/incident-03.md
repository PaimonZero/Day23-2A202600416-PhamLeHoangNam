# Incident Postmortem: Day 23-03 (Telemetry Loss)

**Date:** 2026-05-11
**Impact:** Total loss of traces and logs visibility.

## Timeline
- **T+0s:** `03_network_fail.ps1` executed.
- **T+30s:** Jaeger reported "No Data" for new traces.
- **T+45s:** Prometheus showed `otel-collector` target as down.

## Root Cause
Observability pipeline failure (OTel Collector).

## Action Items
- [ ] Add self-monitoring alerts for the OTel Collector.
- [ ] Implement local buffer for traces in the app.
