"""Generate a seamless graphene honeycomb: three bonds at each carbon vertex."""
from pathlib import Path
from math import sqrt
import re
from urllib.parse import quote
import xml.etree.ElementTree as ET

side = 32
height = sqrt(3) * side
width = 3 * side
vertices, edges = set(), set()
for column in range(-2, 5):
    for row in range(-3, 4):
        cx = column * 1.5 * side
        cy = (row + (column % 2) / 2) * height
        corners = [(round(cx+x, 6), round(cy+y, 6)) for x, y in
                   [(side, 0), (side/2, height/2), (-side/2, height/2),
                    (-side, 0), (-side/2, -height/2), (side/2, -height/2)]]
        vertices.update(corners)
        edges.update(tuple(sorted((corners[i], corners[(i+1) % 6]))) for i in range(6))

# Every interior carbon has three equal-length bonds at 120 degrees.
for vertex in vertices:
    if 0 <= vertex[0] <= width and 0 <= vertex[1] <= height:
        neighbours = [b if a == vertex else a for a, b in edges if vertex in (a, b)]
        assert len(neighbours) == 3
        assert all(abs((x-vertex[0])**2 + (y-vertex[1])**2 - side**2) < 0.001 for x, y in neighbours)

paths = ''.join(f'<path d="M{a[0]:g} {a[1]:g}L{b[0]:g} {b[1]:g}"/>'
                for a, b in sorted(edges)
                if max(a[0], b[0]) >= 0 and min(a[0], b[0]) <= width
                and max(a[1], b[1]) >= 0 and min(a[1], b[1]) <= height)
dots = ''.join(f'<circle cx="{x:g}" cy="{y:g}" r="2"/>' for x, y in sorted(vertices)
               if -2 <= x <= width+2 and -2 <= y <= height+2)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height:.6f}" viewBox="0 0 {width} {height:.6f}">'
       '<title>Graphene honeycomb</title><desc>Regular hexagons with carbon atoms at the vertices.</desc>'
       '<g fill="none" stroke="#91b8ce" stroke-width="0.8" stroke-opacity="0.55">'
       + paths + '</g><g fill="#b5d8e8">' + dots + '</g></svg>')
ET.fromstring(svg)
styles = Path(__file__).resolve().parents[1] / 'src/styles'
(styles / 'graphene-lattice.svg').write_text(svg, encoding='utf-8')
stylesheet = styles / 'platform.css'
css = stylesheet.read_text(encoding='utf-8-sig')
css = re.sub(r'(body::before\{[^}]*background-image:)url\([^)]*\)',
             lambda m: m[1] + 'url("data:image/svg+xml,' + quote(svg, safe='') + '")', css)
css = re.sub(r'(body::before\{[^}]*background-size:)[^;]+',
             lambda m: m[1] + f'{width}px {height:.6f}px', css)
stylesheet.write_text(css, encoding='utf-8')
print('Graphene SVG generated; hexagonal geometry and threefold coordination checked.')
