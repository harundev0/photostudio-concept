import json
import sys


metrics = json.load(sys.stdin)

assert metrics["cardBottom"] - metrics["viewportBottom"] <= 18
assert 12 <= metrics["viewportTop"] - metrics["titleBottom"] <= 18
assert metrics["viewportLeft"] - metrics["cardLeft"] == metrics["cardRight"] - metrics["viewportRight"]

print("option one layout contract passed")
