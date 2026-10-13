from pathlib import Path


root = Path(__file__).parents[2]

expected_root_files = {".gitignore", "index.html", "README.md"}
expected_root_directories = {"assets", "src", "tests"}

assert {path.name for path in root.iterdir() if path.is_file()} == expected_root_files
assert {
    path.name for path in root.iterdir() if path.is_dir() and not path.name.startswith(".")
} == expected_root_directories

assert all(path.is_relative_to(root / "assets") for path in root.rglob("*.png"))
assert (root / "src/css/app.css").is_file()
assert (root / "src/js/app.js").is_file()
assert (root / "tests/js/crop-state.test.js").is_file()
assert (root / "tests/js/wizard-state.test.js").is_file()

print("project structure test passed")
