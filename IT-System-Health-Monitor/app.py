from datetime import datetime
import platform
import socket
import time

import psutil
from flask import Flask, jsonify, render_template

app = Flask(__name__)

def gb(value):
    return round(value / (1024 ** 3), 2)

def collect_metrics():
    cpu = psutil.cpu_percent(interval=0.25)
    memory = psutil.virtual_memory()
    disk_path = "C:\\" if platform.system() == "Windows" else "/"
    try:
        disk = psutil.disk_usage(disk_path)
    except OSError:
        disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()
    host = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(host)
    except OSError:
        local_ip = "Unavailable"
    uptime_seconds = max(0, int(time.time() - psutil.boot_time()))
    hours, remainder = divmod(uptime_seconds, 3600)
    warnings = []
    for label, value, warning_at, critical_at in [
        ("CPU", cpu, 70, 85),
        ("Memory", memory.percent, 80, 90),
        ("Disk", disk.percent, 80, 90),
    ]:
        if value >= critical_at:
            warnings.append({"level": "critical", "message": f"{label} usage is very high ({value}%)."})
        elif value >= warning_at:
            warnings.append({"level": "warning", "message": f"{label} usage is elevated ({value}%)."})
    return {
        "timestamp": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z"),
        "hostname": host,
        "local_ip": local_ip,
        "os": f"{platform.system()} {platform.release()}",
        "architecture": platform.machine() or "Unknown",
        "processor": platform.processor() or "Not reported by OS",
        "cpu_percent": cpu,
        "cpu_count": psutil.cpu_count(logical=True) or 0,
        "memory_percent": memory.percent,
        "memory_used_gb": gb(memory.used),
        "memory_total_gb": gb(memory.total),
        "disk_percent": disk.percent,
        "disk_used_gb": gb(disk.used),
        "disk_total_gb": gb(disk.total),
        "bytes_sent_mb": round(net.bytes_sent / (1024 ** 2), 2),
        "bytes_recv_mb": round(net.bytes_recv / (1024 ** 2), 2),
        "uptime": f"{hours}h {remainder // 60}m",
        "warnings": warnings,
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/metrics")
def api_metrics():
    return jsonify(collect_metrics())

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "IT System Health Monitor"})

if __name__ == "__main__":
    # Local-only development server. Do not expose it directly to the public internet.
    app.run(host="127.0.0.1", port=5000, debug=False)
