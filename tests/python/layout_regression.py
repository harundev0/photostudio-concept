import json
from pathlib import Path


fixture = Path(__file__).parent.parent / "fixtures/layout-metrics.json"
with fixture.open(encoding="utf-8") as metrics_file:
    metrics = json.load(metrics_file)

assert metrics["document"] == metrics["viewport"], "page must not overflow"
assert metrics["topbar"]["height"] >= 48, "wide-screen header is undersized"
assert metrics["leftPanel"]["width"] >= 260, "wide-screen file panel is undersized"
assert metrics["rightPanel"]["width"] >= 280, "wide-screen settings panel is undersized"
assert metrics["editorCard"]["height"] >= 580, "editor card leaves excessive dead space"

preview = metrics["preview"]
assert preview["height"] >= 440, "preview is an unreadable panoramic strip"
assert preview["width"] / preview["height"] <= 3.1, "preview aspect ratio is too wide"

print("wide-screen layout contract passed")
