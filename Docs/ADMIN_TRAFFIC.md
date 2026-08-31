# Operational Traffic Monitoring Documentation

## Overview
Basic traffic monitoring captures operational API metrics (request counts, active user count, 4xx/5xx error rates, response latency) via lightweight Express middleware (`trafficLogger`).

## Endpoint
`GET /api/v1/admin/analytics/traffic?range=today|7d|30d`

## Metrics Calculated
- **Total Requests**: Count of operational API requests within selected window.
- **Active Users**: Count of distinct authenticated users sending API requests.
- **4xx & 5xx Errors**: Count of client/server HTTP status errors.
- **Avg Response Latency**: Average server execution time in milliseconds.
- **Traffic Time-Series**: Time-bucketed array for visual bar/line chart rendering.
