FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Find and patch detect_wrap_bug only
RUN python - <<'PY'
import importlib, re, sys
m = importlib.import_module("passlib.handlers.bcrypt")
path = m.__file__
text = open(path, "r", encoding="utf-8").read()

pat = re.compile(r'^def\s+detect_wrap_bug\s*\(.*\):\s*\n', re.M)
mdef = pat.search(text)
if not mdef:
    print("detect_wrap_bug not found, skipping patch")
    sys.exit(0)

start = mdef.start()
body_start = mdef.end()
# find end of function (next top-level def/class) or EOF
mnext = re.search(r'^(def |class )', text[body_start:], re.M)
end = body_start + (mnext.start() if mnext else len(text) - body_start)

block = text[start:end]
lines = block.splitlines(True)

# find index after optional leading blank lines and possible docstring
i = 1  # lines[0] is def line
while i < len(lines) and lines[i].strip() == "":
    i += 1

# handle triple-quoted docstring or single-line docstring
if i < len(lines):
    stripped = lines[i].lstrip()
    if stripped.startswith(('"""', "'''")):
        quote = stripped[:3]
        # include docstring lines until closing triple quote found
        i += 1
        while i < len(lines):
            if quote in lines[i]:
                i += 1
                break
            i += 1
    elif stripped.startswith(('"', "'")):
        # single-line docstring
        i += 1

body_lines = lines[i:]

marker = "# __PATCHED_DETECT_WRAP_BUG__\n"
if any(marker.strip() in ln for ln in body_lines):
    print("Already patched, skipping")
    sys.exit(0)

# determine indent of function body
if body_lines:
    m_indent = re.match(r'(\s*)', body_lines[0])
    indent = m_indent.group(1) if m_indent else "    "
else:
    indent = "    "

# re-indent original body under try:
new_body = []
for ln in body_lines:
    if ln.strip() == "":
        # keep blank lines with same indent
        new_body.append(ln)
    else:
        # remove one level of the original indent (if present) then add one extra level
        if ln.startswith(indent):
            content = ln[len(indent):]
        else:
            content = ln.lstrip()
        new_body.append(indent + "    " + content)

# assemble replacement block
replacement = ""
replacement += lines[0]  # def line
# preserve initial blank/docstring lines
replacement += "".join(lines[1:i])
replacement += indent + marker
replacement += indent + "try:\n"
replacement += "".join(new_body)
replacement += "\n" if not replacement.endswith("\n") else ""
replacement += indent + "except Exception as _e:\n"
replacement += indent + "    raise\n"

new_text = text[:start] + replacement + text[end:]
open(path, "w", encoding="utf-8").write(new_text)
print("patched", path)
PY

COPY app/ ./app/
CMD ["python", "-m", "app.main"]