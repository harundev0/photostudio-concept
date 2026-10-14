from html.parser import HTMLParser
from pathlib import Path


class StructureParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.output_parents = []
        self.body_classes = set()
        self.stylesheets = []
        self.scripts = []
        self.ids = set()
        self.id_ancestors = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get("class", "").split())
        if attrs.get("id"):
            self.ids.add(attrs["id"])
            self.id_ancestors[attrs["id"]] = set().union(*self.stack) if self.stack else set()
        if tag == "body":
            self.body_classes = classes
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.stylesheets.append(attrs.get("href"))
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        if "output-row" in classes:
            self.output_parents.append(self.stack[-1] if self.stack else set())
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}:
            self.stack.append(classes)

    def handle_endtag(self, tag):
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}:
            self.stack.pop()


def parse(path):
    parser = StructureParser()
    parser.feed(path.read_text())
    return parser


root = Path(__file__).parents[2]
option_one_path = root / "option-1.html"
option_two_path = root / "option-2.html"
option_one = parse(option_one_path)
option_two = parse(option_two_path)
option_two_html = option_two_path.read_text()

assert "option-one" in option_one.body_classes
assert option_one.output_parents == [{"control-actions"}]
assert option_one.stylesheets == ["src/css/app.css?v=option-wizard"]
assert option_one.scripts[-3:] == [
    "src/js/wizard-state.js?v=option-wizard",
    "src/js/crop-state.js",
    "src/js/app.js?v=option-wizard",
]
assert {"sidebarProgress", "sidebarStepNumber", "sidebarStepName", "backButton"} <= option_one.ids
assert "option-two" in option_two.body_classes
assert option_two.output_parents == []
assert option_two.stylesheets == ["src/css/app.css?v=wizard-divider"]
assert option_two.scripts[-3:] == [
    "src/js/wizard-state.js?v=focus-stepper",
    "src/js/crop-state.js",
    "src/js/app.js?v=focus-stepper",
]
assert option_two_html.index('id="removeImageButton"') < option_two_html.index('class="wizard-progress"')
assert {"wizardStepCount", "nextButton", "topCaptureButton", "generateButton"} <= option_two.ids
assert option_two.id_ancestors["nextButton"] >= {"wizard-rail-actions"}
assert option_two.id_ancestors["topCaptureButton"] >= {"wizard-rail-actions"}
assert option_two.id_ancestors["generateButton"] >= {"wizard-rail-actions"}
assert "Pick Image" in option_two_html
assert "Choose your best view" in option_two_html
assert "Set Start" in option_two_html
assert "Frame the opening shot" in option_two_html
assert "Set Finish" in option_two_html
assert "Define where motion ends" in option_two_html
assert "Create Video" in option_two_html
assert "Review and generate" in option_two_html
assert 'data-index="01"' in option_two_html
assert 'data-index="04"' in option_two_html

css = (root / "src/css/app.css").read_text()
assert ".option-two .steps {\n  position: static;\n  width: 100%;\n  display: flex;" in css
assert ".option-two .steps button::after" in css
assert "transform: scaleX(1);" in css
assert ".option-two .steps button.active {\n  flex-grow: 1.55;" in css
assert "outline: 0;" in css
assert "box-shadow: none;" in css
assert ".option-two .steps button.active::after {\n  height: 3px;" in css
assert ".option-two .steps button:focus-visible {\n  outline: 2px solid #63c6f5;" in css
assert ".option-two .step-marker {\n  display: none;" in css
assert ".option-two .steps button:not(.active) .step-copy b { font-size: 0; }" in css
assert '<span class="crop-title">Pan</span>' in option_two_html
assert 'data-lucide="move-horizontal"' in option_two_html
assert 'class="move-camera"' in option_two_html
assert ".option-two .move-camera" in css
assert ".option-two .title-meta {\n  min-width: 0;\n  min-height: 34px;\n  margin-bottom: 12px;" in css
assert ".option-two .wizard-flow {\n  min-width: 0;\n  padding-top: 12px;\n  border-top: 1px solid #383b40;" in css

print("option layout tests passed")
