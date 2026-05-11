# Incident Postmortem: Day 23-02 (CPU Spike)

**Date:** 2026-05-11
**Impact:** High latency for inference requests.

## Timeline
- **T+0s:** `02_cpu_spike.ps1` executed.
- **T+15s:** Grafana Overview dashboard showed "GPU Utilization" spike to near 100% (simulated).
- **T+20s:** P99 Latency increased from 0.2s to 2.5s.
- **T+60s:** Load test (Locust) reported timeouts.

## Root Cause
Resource exhaustion (CPU/GPU) leading to processing delays.

## Action Items
- [ ] Add horizontal pod autoscaling (if on K8s) or more replicas.
- [ ] Implement rate limiting on the API.
