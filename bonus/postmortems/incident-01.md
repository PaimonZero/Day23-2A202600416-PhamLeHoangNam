# Incident Postmortem: Day 23-01 (Service Down)

**Date:** 2026-05-11
**Duration:** 120 seconds
**Impact:** Total service outage for the inference API.

## Timeline
- **T+0s:** User/Chaos script executed `docker stop day23-app`.
- **T+15s:** Prometheus detected the target is down.
- **T+30s:** Alertmanager received `ServiceDown` alert.
- **T+90s:** Slack notification received.
- **T+110s:** Service manually restarted via `docker start day23-app`.
- **T+150s:** Alert resolved in Slack.

## Root Cause
Manual intervention/Chaos testing stopped the container.

## Action Items
- [x] Implement multi-window burn rate alerts to detect potential slow degradation before full outage.
- [ ] Add auto-restart policy to docker-compose.
