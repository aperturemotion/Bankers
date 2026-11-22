import re, sys, base64, urllib.parse, os, hashlib
src = open(sys.argv[1]).read()
out = sys.argv[2]
for m in re.finditer(r'"([^"]+)":\s*"data:([^;,"]+)((?:;[^,;"]+)*),([^"]*)"', src):
    name, mime, params, data = m.groups()
    b = base64.b64decode(data) if ';base64' in params else urllib.parse.unquote(data).encode()
    p = os.path.join(out, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(b)
    print(f"{name}\t{mime}\t{len(b)}\t{hashlib.md5(b).hexdigest()}")
