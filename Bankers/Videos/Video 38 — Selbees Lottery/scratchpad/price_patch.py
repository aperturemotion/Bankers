# rev 4: the ticket price per state (FACTCHECK: Michigan Winfall $1, Massachusetts Cash WinFall $2)
import os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "src", "w3d"))
D = "$"
p = "ticket_art.ts"; s = open(p).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:70], s.count(a))
    s = s.replace(a, b)
rep('c.fillText("' + D + '2.00 EACH", R, y);', 'c.fillText(`' + D + '${o.each}.00 EACH`, R, y);')
rep('c.fillText("' + D + '10.00", R, y);', 'c.fillText(`' + D + '${o.each * 5}.00`, R, y);')
rep('c.fillText("' + D + '10.00", R, 198);', 'c.fillText(`' + D + '${o.each * 5}.00`, R, 198);')
rep('export const drawTicket = (c, w, h, { seed = 1, compact = false, drawLine = "1 DRAW" } = {}) => {',
    '// each: the price of one play - Michigan Winfall ' + D + '1, Massachusetts Cash WinFall ' + D + '2 (FACTCHECK.md)\n'
    'export const drawTicket = (c, w, h, { seed = 1, compact = false, drawLine = "1 DRAW", each = 1 } = {}) => {')
rep('(compact ? landscape : portrait)(c, h / s, r, { drawLine });', '(compact ? landscape : portrait)(c, h / s, r, { drawLine, each });')
open(p, "w").write(s)
p = "st_road_parts.tsx"; s = open(p).read()
rep('drawTicket(c, w, h, { seed: 3 })', 'drawTicket(c, w, h, { seed: 3, each: 2 })')
rep('"ticketMA_v3"', '"ticketMA_v4"')
open(p, "w").write(s)
for f, k in [("st_hook.tsx", "ticket_v3"), ("company_store.tsx", "c2_slipticket_v3"), ("st_test_props.tsx", "stt_ticketface_v3"), ("st_rolldown.tsx", "rd_ticket_v3")]:
    p = f; s = open(p).read()
    rep('"' + k + '"', '"' + k[:-1] + '4"')
    open(p, "w").write(s)
print("patched")
