import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { blankMolecule, core, moleculeEngine } from "file:///C:/Users/jelc/St%20John's%20School%20Leatherhead/Chemistry%20-%20Staff%20Resources/32.%20Masters%20of%20Chemistry/apps/Masters-of-Chemistry/src/chemistry/molecule/engine.ts";
const colours = {
    C: 'currentColor',
    H: 'currentColor',
    O: '#ff7676',
    N: '#82a8ff',
    Cl: '#72dc94',
    F: '#72dc94',
};
function label(graph, id, skeletal) {
    const a = graph.atoms.find((a) => a.id === id);
    const h = core.hydrogens(graph, a);
    return ((skeletal && a.element === 'C' ? '' : a.element) +
        (a.element !== 'C' || !skeletal ? (h > 0 ? 'H' + (h > 1 ? h : '') : '') : '') +
        (a.charge ? (a.charge > 0 ? '+' : '−') : ''));
}
/** Source coordinates were scaled to thumbnails. Expand geometry for label spacing without mutating saved chemistry. */
function depictionGraph(graph) {
    const lengths = graph.bonds
        .map((b) => {
        const a = graph.atoms.find((a) => a.id === b.a), c = graph.atoms.find((a) => a.id === b.b);
        return Math.hypot(a.x - c.x, a.y - c.y);
    })
        .filter((n) => n > 0)
        .sort((a, b) => a - b);
    const xs = graph.atoms.map((a) => a.x), ys = graph.atoms.map((a) => a.y), minX = Math.min(0, ...xs), maxX = Math.max(0, ...xs), minY = Math.min(0, ...ys), maxY = Math.max(0, ...ys);
    const scale = Math.min(65 / (lengths[Math.floor(lengths.length / 2)] ?? 65), 580 / Math.max(1, maxX - minX), 350 / Math.max(1, maxY - minY));
    return {
        ...graph,
        atoms: graph.atoms.map((a) => ({
            ...a,
            x: (a.x - (minX + maxX) / 2) * scale,
            y: (a.y - (minY + maxY) / 2) * scale,
        })),
    };
}
function Bonds({ graph }) {
    return (_jsx(_Fragment, { children: graph.bonds.map((b) => {
            const a = graph.atoms.find((a) => a.id === b.a), c = graph.atoms.find((a) => a.id === b.b);
            const d = Math.hypot(c.x - a.x, c.y - a.y) || 1, ox = (-(c.y - a.y) / d) * 4, oy = ((c.x - a.x) / d) * 4;
            return (_jsx("g", { stroke: "currentColor", strokeWidth: "2.5", children: Array.from({ length: b.order }, (_, i) => {
                    const n = i - (b.order - 1) / 2;
                    return (_jsx("line", { x1: a.x + ox * n, y1: a.y + oy * n, x2: c.x + ox * n, y2: c.y + oy * n }, i));
                }) }, `${b.a}-${b.b}`));
        }) }));
}
export function MoleculePreview({ graph: source, label: description = 'Saved molecular structure', }) {
    const graph = depictionGraph(source);
    const xs = graph.atoms.map((a) => a.x), ys = graph.atoms.map((a) => a.y), x = Math.min(0, ...xs) - 30, y = Math.min(0, ...ys) - 24, w = Math.max(0, ...xs) - x + 30, h = Math.max(0, ...ys) - y + 24;
    return (_jsxs("svg", { className: "molecule-preview", viewBox: `${x} ${y} ${w} ${h}`, role: "img", "aria-label": description, children: [_jsx(Bonds, { graph: graph }), graph.atoms.map((a) => {
                const text = label(graph, a.id, false), width = Math.max(12, text.length * 10);
                return (_jsxs("g", { children: [_jsx("rect", { x: a.x - width / 2, y: a.y - 10, width: width, height: 20, rx: 3, fill: "var(--surface, #151a35)" }), _jsx("text", { x: a.x, y: a.y + 5, textAnchor: "middle", fill: colours[a.element], fontSize: "15", fontWeight: "700", children: text })] }, a.id));
            })] }));
}
export function MoleculeEditor({ value = blankMolecule(), onChange, readOnly, label: description = 'Molecular drawing', }) {
    const [element, setElement] = useState('C'), [order, setOrder] = useState(1), [selected, setSelected] = useState(null), [target, setTarget] = useState(''), [angle, setAngle] = useState('0'), [skeletal, setSkeletal] = useState(false), [drag, setDrag] = useState(null), [error, setError] = useState('');
    const [viewport, setViewport] = useState({ x: -320, y: -220, w: 640, h: 440 });
    const gesture = useRef(null), svg = useRef(null);
    const atom = value.graph.atoms.find((a) => a.id === selected), valid = core.validate(value.graph);
    const displayed = readOnly
        ? depictionGraph(value.graph)
        : drag
            ? {
                ...value.graph,
                atoms: value.graph.atoms.map((a) => (a.id === drag.id ? { ...a, ...drag.point } : a)),
            }
            : value.graph;
    const send = (cmd) => {
        if (readOnly)
            return;
        try {
            onChange(moleculeEngine.apply(value, cmd));
            setError('');
        }
        catch (e) {
            setError(String(e));
        }
    };
    const point = (e) => {
        const matrix = svg.current?.getScreenCTM();
        if (!matrix)
            return { x: 0, y: 0 };
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
        return { x: Math.round(p.x), y: Math.round(p.y) };
    };
    const add = () => {
        const theta = (Number(angle) * Math.PI) / 180, base = atom ?? { x: 0, y: 0 };
        send({
            kind: 'add',
            element,
            order,
            point: {
                x: base.x + (atom ? 65 * Math.cos(theta) : 0),
                y: base.y + (atom ? 65 * Math.sin(theta) : 0),
            },
            ...(atom ? { parent: atom.id } : {}),
        });
    };
    const zoom = (factor) => setViewport((v) => ({
        x: v.x + (v.w * (1 - factor)) / 2,
        y: v.y + (v.h * (1 - factor)) / 2,
        w: Math.max(160, Math.min(2560, v.w * factor)),
        h: Math.max(110, Math.min(1760, v.h * factor)),
    }));
    const fit = () => {
        const xs = displayed.atoms.map((a) => a.x), ys = displayed.atoms.map((a) => a.y), minX = Math.min(0, ...xs), maxX = Math.max(0, ...xs), minY = Math.min(0, ...ys), maxY = Math.max(0, ...ys), w = Math.max(300, maxX - minX + 90, ((maxY - minY + 70) * 640) / 440), h = (w * 440) / 640;
        setViewport({ x: (minX + maxX - w) / 2, y: (minY + maxY - h) / 2, w, h });
    };
    return (_jsxs("section", { className: "molecule-editor", "aria-label": description, children: [_jsx("p", { children: "Carbon has four bonds, oxygen two and nitrogen three in neutral structures. Unshown hydrogens complete valence. Choose an atom, then extend or connect it. Rings require closing a bond." }), _jsxs("div", { className: "molecule-tools", children: [_jsxs("label", { children: ["New element", _jsx("select", { "aria-label": "New element", disabled: readOnly, value: element, onChange: (e) => setElement(e.target.value), children: Object.keys(colours).map((e) => (_jsx("option", { children: e }, e))) })] }), _jsxs("label", { children: ["Bond order", _jsx("select", { "aria-label": "Bond order", disabled: readOnly, value: order, onChange: (e) => setOrder(Number(e.target.value)), children: [1, 2, 3].map((n) => (_jsx("option", { value: n, children: ['Single', 'Double', 'Triple'][n - 1] }, n))) })] }), _jsxs("label", { children: ["Direction", _jsx("select", { "aria-label": "Extension direction", disabled: readOnly, value: angle, onChange: (e) => setAngle(e.target.value), children: [0, 60, 120, 180, 240, 300].map((n) => (_jsxs("option", { value: n, children: [n, "\u00B0"] }, n))) })] }), _jsx("button", { disabled: readOnly, onClick: add, children: atom ? 'Extend selected atom' : 'Add atom' }), _jsx("button", { disabled: readOnly || !value.history.length, onClick: () => {
                            gesture.current = null;
                            setDrag(null);
                            send({ kind: 'undo' });
                        }, children: "Undo" }), _jsx("button", { disabled: readOnly || !value.graph.atoms.length, onClick: () => {
                            gesture.current = null;
                            setDrag(null);
                            send({ kind: 'clear' });
                            setSelected(null);
                        }, children: "Clear" }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: skeletal, onChange: (e) => setSkeletal(e.target.checked) }), "Skeletal view"] })] }), _jsxs("div", { className: "molecule-tools molecule-view-tools", "aria-label": "Molecule view controls", children: [_jsx("button", { onClick: fit, children: "Fit molecule" }), _jsx("button", { onClick: () => zoom(0.8), children: "Zoom in" }), _jsx("button", { onClick: () => zoom(1.25), children: "Zoom out" }), ['left', 'right', 'up', 'down'].map((d) => (_jsx("button", { "aria-label": `Pan ${d}`, onClick: () => setViewport((v) => ({
                            ...v,
                            x: v.x + (d === 'left' ? -v.w / 4 : d === 'right' ? v.w / 4 : 0),
                            y: v.y + (d === 'up' ? -v.h / 4 : d === 'down' ? v.h / 4 : 0),
                        })), children: d === 'left' ? '←' : d === 'right' ? '→' : d === 'up' ? '↑' : '↓' }, d)))] }), _jsxs("svg", { ref: svg, className: "molecule-workspace", viewBox: `${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`, role: "group", "aria-label": `${description}. Click empty space to place an atom; select atoms with Tab. Arrow keys move the selected atom.`, onPointerDown: (e) => {
                    if (e.target === e.currentTarget && !readOnly) {
                        send({ kind: 'add', element, order, point: point(e) });
                        setSelected(null);
                    }
                }, children: [_jsx(Bonds, { graph: displayed }), displayed.atoms.map((a) => (_jsxs("g", { role: "button", tabIndex: 0, "aria-label": `Atom ${a.id}, ${label(displayed, a.id, false)}, select or move`, "aria-pressed": selected === a.id, className: "molecule-atom", onFocus: () => setSelected(a.id), onClick: () => setSelected(a.id), onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelected(a.id);
                            }
                            if (readOnly)
                                return;
                            if (e.key === 'Delete' || e.key === 'Backspace') {
                                e.preventDefault();
                                send({ kind: 'delete-atom', id: a.id });
                                setSelected(null);
                            }
                            const d = {
                                ArrowLeft: [-10, 0],
                                ArrowRight: [10, 0],
                                ArrowUp: [0, -10],
                                ArrowDown: [0, 10],
                            }[e.key];
                            if (d) {
                                e.preventDefault();
                                send({ kind: 'move', id: a.id, point: { x: a.x + d[0], y: a.y + d[1] } });
                            }
                        }, onPointerDown: (e) => {
                            e.stopPropagation();
                            setSelected(a.id);
                            if (readOnly)
                                return;
                            e.currentTarget.setPointerCapture(e.pointerId);
                            gesture.current = { id: a.id, start: point(e), origin: a, moved: false };
                        }, onPointerMove: (e) => {
                            const g = gesture.current;
                            if (!g || g.id !== a.id)
                                return;
                            const p = point(e), dx = p.x - g.start.x, dy = p.y - g.start.y;
                            if (Math.hypot(dx, dy) > 3)
                                g.moved = true;
                            if (g.moved)
                                setDrag({ id: a.id, point: { x: g.origin.x + dx, y: g.origin.y + dy } });
                        }, onPointerUp: (e) => {
                            const g = gesture.current;
                            if (g?.id === a.id && g.moved) {
                                const p = point(e);
                                send({
                                    kind: 'move',
                                    id: a.id,
                                    point: { x: g.origin.x + p.x - g.start.x, y: g.origin.y + p.y - g.start.y },
                                });
                            }
                            gesture.current = null;
                            setDrag(null);
                        }, onPointerCancel: () => {
                            gesture.current = null;
                            setDrag(null);
                        }, children: [_jsx("circle", { cx: a.x, cy: a.y, r: 22, fill: "transparent", stroke: valid.atoms?.includes(a.id)
                                    ? '#ff7676'
                                    : selected === a.id
                                        ? '#55f6ff'
                                        : 'transparent', strokeWidth: 2 }), label(displayed, a.id, skeletal) && (_jsx("rect", { x: a.x - Math.max(12, label(displayed, a.id, skeletal).length * 11) / 2, y: a.y - 10, width: Math.max(12, label(displayed, a.id, skeletal).length * 11), height: 22, rx: 3, fill: "var(--surface, #151a35)", pointerEvents: "none" })), _jsx("text", { x: a.x, y: a.y + 6, textAnchor: "middle", fill: colours[a.element], fontSize: "18", fontWeight: "700", pointerEvents: "none", children: label(displayed, a.id, skeletal) }), skeletal && a.element === 'C' && (_jsx("circle", { cx: a.x, cy: a.y, r: 3, fill: "currentColor", pointerEvents: "none" }))] }, a.id))), !displayed.atoms.length && (_jsx("text", { x: 0, y: 0, textAnchor: "middle", fill: "currentColor", fontSize: 18, pointerEvents: "none", children: "Add an atom to begin" }))] }), _jsxs("div", { className: "molecule-inspector", children: [_jsxs("label", { children: ["Selected atom", _jsxs("select", { "aria-label": "Selected atom", value: atom?.id ?? '', onChange: (e) => setSelected(e.target.value ? Number(e.target.value) : null), children: [_jsx("option", { value: "", children: "None / detached new atom" }), value.graph.atoms.map((a) => (_jsxs("option", { value: a.id, children: [a.id, ": ", label(value.graph, a.id, false)] }, a.id)))] })] }), atom && (_jsxs(_Fragment, { children: [_jsxs("button", { disabled: readOnly, onClick: () => send({ kind: 'element', id: atom.id, element }), children: ["Change selected to ", element] }), _jsx("button", { disabled: readOnly, onClick: () => {
                                    send({ kind: 'delete-atom', id: atom.id });
                                    setSelected(null);
                                }, children: "Delete atom" }), _jsxs("label", { children: ["Charge", _jsx("select", { "aria-label": "Atom charge", disabled: readOnly, value: atom.charge ?? 0, onChange: (e) => send({
                                            kind: 'charge',
                                            id: atom.id,
                                            charge: Number(e.target.value),
                                        }), children: [-1, 0, 1].map((n) => (_jsx("option", { value: n, children: n === 0 ? 'Neutral' : n === 1 ? '+1' : '−1' }, n))) })] }), _jsxs("label", { children: ["Hydrogens", _jsxs("select", { "aria-label": "Attached hydrogen count", disabled: readOnly, value: atom.h ?? 'auto', onChange: (e) => send({
                                            kind: 'hydrogens',
                                            id: atom.id,
                                            h: e.target.value === 'auto'
                                                ? 'auto'
                                                : Number(e.target.value),
                                        }), children: [_jsx("option", { value: "auto", children: "Automatic" }), [0, 1, 2, 3, 4].map((n) => (_jsx("option", { children: n }, n)))] })] }), _jsxs("label", { children: ["Connect to atom", _jsxs("select", { "aria-label": "Bond target", disabled: readOnly, value: target, onChange: (e) => setTarget(e.target.value), children: [_jsx("option", { value: "", children: "Choose atom" }), value.graph.atoms
                                                .filter((a) => a.id !== atom.id)
                                                .map((a) => (_jsxs("option", { value: a.id, children: [a.id, ": ", a.element] }, a.id)))] })] }), _jsx("button", { disabled: readOnly ||
                                    !target ||
                                    !value.graph.atoms.some((a) => a.id === Number(target) && a.id !== atom.id), onClick: () => send({ kind: 'bond', a: atom.id, b: Number(target), order }), children: "Set / close bond" }), _jsx("button", { disabled: readOnly ||
                                    !value.graph.bonds.some((b) => (b.a === atom.id && b.b === Number(target)) ||
                                        (b.b === atom.id && b.a === Number(target))), onClick: () => send({ kind: 'delete-bond', a: atom.id, b: Number(target) }), children: "Delete bond" })] }))] }), _jsx("p", { role: "status", children: error ||
                    (valid.kind === 'valid' ? `Formula: ${core.formula(value.graph)}` : valid.message) }), readOnly && _jsx("p", { children: "Review only. This structure cannot be changed." })] }));
}
