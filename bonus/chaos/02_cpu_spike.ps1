# Chaos Test 2: CPU Spike
Write-Host "Simulating CPU spike in day23-app..."
docker exec day23-app python3 -c "import time; [time.sleep(0) for _ in range(10**7)]"
