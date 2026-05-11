# Day 23 Lab Reflection

**Student:** Pham Le Hoang Nam
**Submission date:** 2026-05-11
**Lab repo URL:** [github](https://github.com/PaimonZero/Day23-2A202600416-PhamLeHoangNam)

---

## 1. Hardware + setup output

Paste output of `python3 00-setup/verify-docker.py`:

```
Docker:        OK  (28.4.0)
Compose v2:    OK  (2.39.2-desktop.1)
RAM available: 7.62 GB (OK)
Ports free:    BOUND: [9090, 9093, 3000, 3100, 16686, 4317, 4318, 8888]
Report written: I:\VinUni\codeSample\Lab23\Day23-2A202600416-PhamLeHoangNam\00-setup\setup-report.json
```

---

## 2. Track 02 — Dashboards & Alerts

### 6 essential panels (screenshot)

Drop `submission/screenshots/dashboard-overview.png`.

### Burn-rate panel

Drop `submission/screenshots/slo-burn-rate.png`.

### Alert fire + resolve

| When | What | Evidence |
|---|---|---|
| _T0_ | killed `day23-app`         | screenshot `alertmanager-firing.png` |
| _T0+90s_ | `ServiceDown` fired   | screenshot `slack-firing.png` |
| _T1_ | restored app              | — |
| _T1+60s_ | alert resolved        | screenshot `slack-resolved.png` |

### One thing surprised me about Prometheus / Grafana

Tôi khá bất ngờ về khả năng của PromQL trong việc tính toán "burn rate" thông qua tỉ lệ lỗi giữa các cửa sổ thời gian khác nhau (5m vs 1h). Việc này giúp giảm bớt "alert fatigue" rất hiệu quả so với việc chỉ cảnh báo dựa trên ngưỡng tĩnh đơn thuần. Ngoài ra, việc Grafana tự động load dashboard từ file JSON thông qua provisioning giúp việc quản lý hạ tầng dưới dạng code (Dashboard-as-Code) trở nên rất mượt mà.

---

## 3. Track 03 — Tracing & Logs

### One trace screenshot from Jaeger

Drop `submission/screenshots/jaeger-trace.png` showing `embed-text → vector-search → generate-tokens` spans.

### Log line correlated to trace

Paste the log line and the trace_id it links to:

```json
{"model": "llama3-mock", "input_tokens": 4, "output_tokens": 54, "quality": 0.82, "duration_seconds": 0.1542, "trace_id": "80a2471d980d1ff4d278f343ab048c26", "event": "prediction served", "level": "info", "timestamp": "2026-05-11T05:44:02.345272Z"}
```
**Trace ID:** `80a2471d980d1ff4d278f343ab048c26`

### Tail-sampling math

Chính sách tail-sampling hiện tại cấu hình `probabilistic: 1%` cho healthy traces và giữ lại 100% error traces.
Giả sử dịch vụ sản xuất 100 traces/giây, trong đó 5% là lỗi (5 traces/s):
- Số trace lỗi được giữ lại: 5 traces/s.
- Số trace healthy được giữ lại: (100 - 5) * 1% = 0.95 traces/s.
- Tổng cộng: ~5.95 traces/s được gửi về Jaeger. Tỉ lệ lưu trữ tổng thể là ~6%.

---

## 4. Track 04 — Drift Detection

### PSI scores

Paste `04-drift-detection/reports/drift-summary.json`:

```json
{
  "prompt_length": {
    "psi": 3.461,
    "kl": 1.7982,
    "ks_stat": 0.702,
    "ks_pvalue": 0.0,
    "drift": "yes"
  },
  "embedding_norm": {
    "psi": 0.0187,
    "kl": 0.0324,
    "ks_stat": 0.052,
    "ks_pvalue": 0.133853,
    "drift": "no"
  },
  "response_length": {
    "psi": 0.0162,
    "kl": 0.0178,
    "ks_stat": 0.056,
    "ks_pvalue": 0.086899,
    "drift": "no"
  },
  "response_quality": {
    "psi": 8.8486,
    "kl": 13.5011,
    "ks_stat": 0.941,
    "ks_pvalue": 0.0,
    "drift": "yes"
  }
}
```

### Which test fits which feature?

- `prompt_length`: Dùng **PSI** vì đây là metric dạng phân phối số lượng, PSI giúp nhận biết sự thay đổi ổn định của quần thể dữ liệu đầu vào.
- `embedding_norm`: Dùng **KL Divergence** để đo độ lệch giữa hai phân phối xác suất của embeddings, giúp phát hiện sự thay đổi nhỏ trong không gian vector.
- `response_length`: Dùng **KS Test** vì đây là kiểm định phi tham số, phù hợp để so sánh xem hai mẫu dữ liệu có cùng phân phối hay không mà không cần giả định về hình dạng phân phối.
- `response_quality`: Dùng **PSI** kết hợp với theo dõi định kỳ, vì chất lượng phản hồi là metric quan trọng nhất (AI quality), PSI > 0.2 cho thấy sự sụt giảm chất lượng nghiêm trọng cần can thiệp ngay.

---

## 5. Track 05 — Cross-Day Integration

### Which prior-day metric was hardest to expose? Why?

Metric từ Day 19 (Qdrant vector store) là khó expose nhất vì Qdrant không tự động expose tất cả các metrics chi tiết về collection performance theo dạng Prometheus mà cần thông qua một sidecar hoặc custom scraper để chuyển đổi dữ liệu từ API của nó sang định dạng metric. Trong lab này, tôi đã sử dụng một stub scraper mô phỏng lại các metrics này để hiển thị trên cross-day dashboard.

---

## 6. The single change that mattered most

Việc triển khai **Tail-sampling** trên OpenTelemetry Collector là thay đổi quan trọng nhất. Trong các hệ thống AI thực tế với lưu lượng lớn, việc lưu trữ 100% các traces (đặc biệt là các request thành công và nhanh) sẽ gây tốn kém tài nguyên lưu trữ và làm chậm việc truy vấn khi có sự cố. Bằng cách cấu hình policy chỉ giữ lại 1% request thành công nhưng giữ 100% request lỗi và request chậm (>2s), chúng ta vẫn đảm bảo khả năng debug "failure mode" mà tiết kiệm được hơn 90% chi phí hạ tầng observability.

Thứ hai, việc sử dụng **Multi-window Multi-burn-rate alerts** giúp hệ thống cảnh báo thông minh hơn. Nó cho phép phân biệt giữa một "spike" ngắn hạn (vốn không tiêu tốn nhiều error budget) và một lỗi hệ thống kéo dài (đe dọa trực tiếp đến SLO 99.5%). Điều này giúp team on-call không bị làm phiền bởi những cảnh báo ảo, từ đó tập trung vào những vấn đề thực sự nghiêm trọng.
