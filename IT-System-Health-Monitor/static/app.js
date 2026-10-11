
const $ = (id) => document.getElementById(id);

function formatBytes(mb) {
    if (!Number.isFinite(Number(mb))) return "-- MB";
    return `${Number(mb).toFixed(2)} MB`;
}

function formatUptime(value) {
    if (typeof value === "string") return value;

    const seconds = Number(value) || 0;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value ?? "--";
}

function updateCard(valueId, barId, stateId, value, detail, suffix = "%") {
    setText(valueId, `${Number(value).toFixed(1)}${suffix}`);

    const bar = $(barId);
    if (bar) {
        bar.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
        bar.classList.toggle("warning", value >= 70 && value < 85);
        bar.classList.toggle("danger", value >= 85);
    }

    setText(stateId, detail);
}

async function loadMetrics() {
    try {
        const response = await fetch("/api/metrics", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Metrics request failed: HTTP ${response.status}`);
        }

        const data = await response.json();

        // Resource cards: match the actual API field names.
        updateCard(
            "cpuValue", "cpuBar", "cpuState",
            data.cpu_percent,
            `${data.cpu_count ?? "--"} logical cores`
        );

        updateCard(
            "ramValue", "ramBar", "ramState",
            data.memory_percent,
            `${data.memory_used_gb} / ${data.memory_total_gb} GB`
        );

        updateCard(
            "diskValue", "diskBar", "diskState",
            data.disk_percent,
            `${data.disk_used_gb} / ${data.disk_total_gb} GB`
        );

        // System information.
        setText("hostname", data.hostname);
        setText("localIp", data.local_ip);
        setText("os", data.os);
        setText("osVersion", data.os_version);
        setText("architecture", data.architecture);
        setText("processor", data.processor);
        setText("uptime", formatUptime(data.uptime_seconds ?? data.uptime));

        // Network counters returned by this API are already in MB.
        setText("sent", formatBytes(data.bytes_sent_mb));
        setText("received", formatBytes(data.bytes_recv_mb));

        // Health status.
        const warnings = Array.isArray(data.warnings) ? data.warnings : [];
        const status = $("overallStatus");

        if (status) {
            status.textContent = warnings.length ? "Warning" : "Healthy";
            status.style.color = warnings.length ? "#ffbf69" : "#78e2b5";
            status.style.borderColor = warnings.length ? "#ad793a" : "#2f8a68";
        }

        const alerts = $("alerts");
        if (alerts) {
            alerts.replaceChildren();

            const messages = warnings.length
                ? warnings.map(item =>
                    typeof item === "string" ? item : item.message
                )
                : ["No resource threshold warnings detected."];

            messages.forEach(message => {
                const item = document.createElement("li");
                item.textContent = message || "System warning";
                item.className = warnings.length ? "alert-warning" : "alert-ok";
                alerts.appendChild(item);
            });
        }

        setText("lastUpdated", `Last updated: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error("Failed to load system metrics:", error);
        setText("overallStatus", "Connection error");
        setText("lastUpdated", error.message);
    }
}

loadMetrics();
setInterval(loadMetrics, 5000);