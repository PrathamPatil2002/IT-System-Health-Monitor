# IT System Health Monitor

A local Flask web dashboard that displays system resource usage and basic device details. Portfolio project for IT Engineer, IT Support Engineer, Technical Support Engineer, and Application Support Engineer roles.

## Features
- CPU, RAM, and disk utilization
- Threshold-based warnings for high resource use
- Hostname, local IP, OS, architecture, processor, and uptime
- Cumulative network bytes sent and received
- Responsive dark dashboard that refreshes every five seconds
- JSON metrics endpoint (`/api/metrics`) and service health endpoint (`/health`)

## Dashboard preview
![Dashboard preview](screenshots/dashboard-preview.png)

The included image is a design preview with illustrative sample values. Run the app to view real metrics from your computer.

## Requirements
Python 3.10 or later and pip.

## Run on Windows PowerShell
```powershell
cd IT-System-Health-Monitor
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```
If activation is blocked, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that PowerShell session. Alternatively run `.venv\Scripts\python.exe -m pip install -r requirements.txt` and `.venv\Scripts\python.exe app.py`.

## Run on macOS / Linux
```bash
cd IT-System-Health-Monitor
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```
Open <http://127.0.0.1:5000>.

## Endpoints
- `/` dashboard
- `/api/metrics` current metrics as JSON
- `/health` service health response

## How it works
Flask serves the page and JSON API. `psutil` reads system resource and network-counter data from the computer running the app. The browser polls the API every five seconds.

## Troubleshooting
- If port 5000 is occupied, change `port=5000` in `app.py`.
- On some systems, disk paths differ; the app uses `C:\\` on Windows and `/` on Unix-like systems.
- The hostname-based local IP is best-effort and may not reflect the active interface on multi-adapter devices.

## Security and limitations
The Flask server binds to `127.0.0.1` for local use. Do not expose the development server directly to the public internet. Metrics stay on the local computer. Network traffic values are cumulative totals, not bandwidth speed. Thresholds are basic indicators, not enterprise monitoring.

## Resume bullets
- Developed a Flask-based dashboard to monitor CPU, memory, disk utilization, and network statistics.
- Integrated Python system metrics and threshold-based warnings to support basic IT diagnostics.
- Built a responsive dashboard and JSON API for monitoring device health and investigating resource issues.
