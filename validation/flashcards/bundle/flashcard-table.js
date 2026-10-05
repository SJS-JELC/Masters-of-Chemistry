import { useEffect as e, useLayoutEffect as t, useRef as n, useState as r } from "react";
import { jsx as i, jsxs as a } from "react/jsx-runtime";
//#region src/ui/DiagramViewport.tsx
function o({ children: e, label: t }) {
	let [n, o] = r(!1);
	return /* @__PURE__ */ a("div", {
		className: `diagram-viewport ${n ? "diagram-detail" : "diagram-fit"}`,
		children: [
			/* @__PURE__ */ a("div", {
				className: "diagram-view-controls",
				role: "group",
				"aria-label": `${t} view`,
				children: [/* @__PURE__ */ i("button", {
					type: "button",
					"aria-pressed": !n,
					onClick: () => o(!1),
					children: "Fit whole diagram"
				}), /* @__PURE__ */ i("button", {
					type: "button",
					"aria-pressed": n,
					onClick: () => o(!0),
					children: "Zoom for detail"
				})]
			}),
			/* @__PURE__ */ i("p", {
				className: "support-note",
				children: n ? "Detail view: swipe or scroll inside the diagram. Keyboard: focus the diagram and use arrow keys." : "Whole diagram shown. Choose Zoom for detail to inspect labels and use larger controls."
			}),
			/* @__PURE__ */ i("div", {
				className: "diagram-scroll",
				tabIndex: 0,
				role: "region",
				"aria-label": `${t}; ${n ? "scroll for detail" : "whole diagram"}`,
				onKeyDown: (e) => {
					if (e.target !== e.currentTarget || !n) return;
					let t = {
						ArrowLeft: [-80, 0],
						ArrowRight: [80, 0],
						ArrowUp: [0, -80],
						ArrowDown: [0, 80]
					}[e.key];
					t && (e.preventDefault(), e.currentTarget.scrollLeft += t[0], e.currentTarget.scrollTop += t[1]);
				},
				children: e
			})
		]
	});
}
//#endregion
//#region src/ui/Content.tsx
function s(e) {
	if (!e.startsWith("data:image/svg+xml")) return !0;
	try {
		let t = decodeURIComponent(e.slice(e.indexOf(",") + 1)).match(/viewBox=["']([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)["']/);
		return !t || Number(t[3]) > 350 || Number(t[4]) > 260;
	} catch {
		return !0;
	}
}
function c({ blocks: e }) {
	return /* @__PURE__ */ i("div", {
		className: "content",
		children: e.map((e, t) => {
			switch (e.kind) {
				case "text": return /* @__PURE__ */ i("p", { children: e.text }, t);
				case "formula": return /* @__PURE__ */ i("p", {
					className: "formula",
					children: e.text
				}, t);
				case "image": return s(e.src) ? /* @__PURE__ */ i(o, {
					label: e.alt,
					children: /* @__PURE__ */ i("img", {
						className: "content-image",
						src: e.src,
						alt: e.alt
					})
				}, t) : /* @__PURE__ */ i("img", {
					className: "content-image",
					src: e.src,
					alt: e.alt
				}, t);
				case "table": return /* @__PURE__ */ i("div", {
					className: "table-scroll",
					children: /* @__PURE__ */ a("table", { children: [/* @__PURE__ */ i("thead", { children: /* @__PURE__ */ i("tr", { children: e.headers.map((e, t) => /* @__PURE__ */ i("th", {
						scope: "col",
						children: e
					}, t)) }) }), /* @__PURE__ */ i("tbody", { children: e.rows.map((e, t) => /* @__PURE__ */ i("tr", { children: e.map((e, t) => /* @__PURE__ */ i("td", { children: e }, t)) }, t)) })] })
				}, t);
			}
		})
	});
}
//#endregion
//#region src/recall/FlashcardTable.tsx
var l = "button, a, input, select, textarea, summary";
function u({ count: e, label: t, side: n }) {
	let r = Math.min(e, 10), o = n === "deck" ? 4 : e > 10 ? Math.min(4, 2 + Math.log2(e / 10)) : 2;
	return /* @__PURE__ */ a("div", {
		className: `fc-stack fc-stack-${n}`,
		"data-count": e,
		children: [/* @__PURE__ */ a("div", {
			className: "fc-stack-cards",
			"data-destination": n,
			"aria-hidden": "true",
			children: [Array.from({ length: r }, (e, t) => /* @__PURE__ */ i("span", {
				className: "fc-layer",
				style: {
					"--rise": `${-t * o}px`,
					"--shift": `${n === "deck" ? (r - t - 1) * 2 : 0}px`,
					"--angle": `${n === "deck" ? 0 : t * 7 % 5 - 2}deg`
				},
				children: t === r - 1 && /* @__PURE__ */ i("span", {
					className: "fc-stack-symbol",
					children: n === "got" ? "✓" : n === "again" ? "↻" : "✦"
				})
			}, t)), !e && /* @__PURE__ */ i("span", {
				className: "fc-empty-mark",
				children: n === "got" ? "✓" : n === "again" ? "↻" : "✦"
			})]
		}), /* @__PURE__ */ a("p", { children: [/* @__PURE__ */ i("span", { children: t }), /* @__PURE__ */ i("strong", { children: e })] })]
	});
}
function d(e) {
	return /* @__PURE__ */ i(f, { ...e }, e.deckId);
}
function f({ cards: o }) {
	let [s, d] = r(o), [f, p] = r([]), [m, h] = r(!1), [g, _] = r(!1), [v, y] = r(null), [b, x] = r(0), [S, C] = r(""), w = n(null), T = n(null), E = n(null), D = n(!1), O = n(null), k = n(null), A = n(!1), j = s[f.length], M = f.filter((e) => e.side === "again"), N = f.length - M.length;
	e(() => () => {
		O.current && clearTimeout(O.current);
	}, []), t(() => {
		let e = T.current, t = w.current?.querySelector("[data-destination=\"deck\"]");
		if (e && t) {
			let n = e.parentElement.getBoundingClientRect(), r = t.getBoundingClientRect();
			e.style.setProperty("--deal-x", `${r.x + r.width / 2 - n.x - n.width / 2}px`), e.style.setProperty("--deal-y", `${r.y + r.height / 2 - n.y - n.height / 2}px`), e.style.setProperty("--deal-scale", String(r.width / n.width));
		}
		E.current?.focus({ preventScroll: !0 });
	}, [f.length, s]);
	function P() {
		!D.current && j && (_(!0), h((e) => !e));
	}
	function F(e) {
		if (!j || !g || D.current) return;
		D.current = !0;
		let t = T.current.getBoundingClientRect(), n = w.current.querySelector(`[data-destination="${e}"]`).getBoundingClientRect(), r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		x(0), y({
			x: n.x + n.width / 2 - (t.x + t.width / 2),
			y: n.y + n.height / 2 - (t.y + t.height / 2),
			scale: n.width / t.width,
			side: e
		}), O.current = setTimeout(() => {
			p((t) => [...t, {
				card: j,
				side: e
			}]), h(!1), _(!1), y(null), C(`Card ${f.length + 1} moved to ${e === "got" ? "Got it" : "Practise again"}. ${s.length - f.length - 1} remaining.`), D.current = !1;
		}, r ? 0 : 340);
	}
	function I() {
		!D.current && f.length && (p((e) => e.slice(0, -1)), h(!0), _(!0), C("Last card restored. Answer revealed."));
	}
	function L(e) {
		D.current || (d([...e]), p([]), h(!1), _(!1), C(`New pass. ${e.length} cards.`));
	}
	function R(e) {
		A.current = !1, g && !D.current && e.isPrimary && e.button === 0 && !e.target.closest(l) && (k.current = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			dx: 0
		}, e.currentTarget.setPointerCapture(e.pointerId));
	}
	function z(e) {
		let t = k.current;
		if (!t || t.id !== e.pointerId) return;
		let n = e.clientX - t.x, r = e.clientY - t.y;
		if (Math.abs(r) > Math.max(12, Math.abs(n))) {
			k.current = null, A.current = !0, x(0);
			return;
		}
		t.dx = n, Math.abs(n) > 8 && (A.current = !0), x(n);
	}
	function B(e) {
		let t = k.current;
		if (k.current = null, x(0), !t || t.id !== e.pointerId || e.type === "pointercancel") return;
		let n = Math.min(100, e.currentTarget.clientWidth * .22);
		Math.abs(t.dx) >= n && F(t.dx < 0 ? "again" : "got");
	}
	return /* @__PURE__ */ a("section", {
		className: "fc-table",
		ref: w,
		"aria-label": "Flashcard table",
		onKeyDown: (e) => {
			e.target instanceof HTMLElement && e.target.closest("input, textarea, select, a, summary") || (["ArrowLeft", "ArrowRight"].includes(e.key) ? (e.preventDefault(), e.repeat || F(e.key === "ArrowLeft" ? "again" : "got")) : e.code === "Space" && !e.target.closest("button") && (e.preventDefault(), e.repeat || P()));
		},
		children: [
			/* @__PURE__ */ a("div", {
				className: "fc-round-meta",
				children: [/* @__PURE__ */ i("span", { children: f.length === s.length && s.length ? "Pass complete" : "Your own pace" }), /* @__PURE__ */ a("span", { children: [
					f.length,
					" / ",
					s.length,
					" sorted"
				] })]
			}),
			/* @__PURE__ */ i("div", {
				className: "fc-progress",
				"aria-hidden": "true",
				children: /* @__PURE__ */ i("span", { style: { width: `${s.length ? f.length / s.length * 100 : 0}%` } })
			}),
			/* @__PURE__ */ a("div", {
				className: "fc-arena",
				children: [
					/* @__PURE__ */ i(u, {
						count: M.length,
						label: "Practise again",
						side: "again"
					}),
					/* @__PURE__ */ i("div", {
						className: "fc-reading",
						children: j ? /* @__PURE__ */ i("div", {
							className: `fc-mover${v ? " fc-flying" : ""}`,
							ref: T,
							style: v ? {
								transform: `translate(${v.x}px, ${v.y}px) scale(${v.scale}) rotate(${v.side === "got" ? 3 : -3}deg)`,
								opacity: .35
							} : void 0,
							children: /* @__PURE__ */ a("article", {
								className: `fc-card${m ? " fc-revealed" : ""}${g ? " fc-sortable" : ""}${b ? " fc-dragging" : ""}`,
								ref: E,
								tabIndex: 0,
								"aria-label": `Card ${f.length + 1}, ${m ? "answer" : "question"}`,
								style: {
									"--drag": `${b}px`,
									"--tilt": `${b / 24}deg`
								},
								onPointerDown: R,
								onPointerMove: z,
								onPointerUp: B,
								onPointerCancel: B,
								onDragStart: (e) => e.preventDefault(),
								onClick: (e) => {
									!A.current && !e.target.closest(l) && P();
								},
								children: [/* @__PURE__ */ a("div", {
									className: "fc-face fc-front",
									"aria-hidden": m,
									inert: m,
									children: [
										/* @__PURE__ */ a("div", {
											className: "fc-card-meta",
											children: [/* @__PURE__ */ i("span", { children: "THE QUESTION" }), /* @__PURE__ */ i("span", { children: String(f.length + 1).padStart(2, "0") })]
										}),
										/* @__PURE__ */ i(c, { blocks: j.prompt }),
										/* @__PURE__ */ i("span", {
											className: "fc-card-hint",
											children: "Think of your answer · tap to turn"
										})
									]
								}), /* @__PURE__ */ a("div", {
									className: "fc-face fc-back",
									"aria-hidden": !m,
									inert: !m,
									children: [
										/* @__PURE__ */ a("div", {
											className: "fc-card-meta",
											children: [/* @__PURE__ */ i("span", { children: "THE ANSWER" }), /* @__PURE__ */ i("span", { children: String(f.length + 1).padStart(2, "0") })]
										}),
										/* @__PURE__ */ i(c, { blocks: j.answer }),
										/* @__PURE__ */ i("span", {
											className: "fc-card-hint",
											children: "How did you do? Choose a pile."
										})
									]
								})]
							})
						}, j.id) : /* @__PURE__ */ a("article", {
							className: "fc-complete",
							ref: E,
							tabIndex: -1,
							children: [
								/* @__PURE__ */ i("span", {
									className: "fc-complete-symbol",
									"aria-hidden": "true",
									children: s.length ? "✓" : "✦"
								}),
								/* @__PURE__ */ i("h2", { children: s.length ? "A little more remembered." : "No cards in this deck" }),
								/* @__PURE__ */ i("p", { children: s.length ? `${N} got it · ${M.length} to practise again` : "Choose a deck to start practising." }),
								M.length > 0 && /* @__PURE__ */ i("button", {
									className: "fc-primary",
									onClick: () => L(M.map((e) => e.card)),
									children: "Practise missed cards"
								}),
								o.length > 0 && /* @__PURE__ */ i("button", {
									onClick: () => L(o),
									children: "Restart deck"
								})
							]
						})
					}),
					/* @__PURE__ */ i(u, {
						count: N,
						label: "Got it",
						side: "got"
					}),
					/* @__PURE__ */ a("div", {
						className: "fc-controls",
						children: [j && /* @__PURE__ */ a("div", {
							className: "fc-actions",
							children: [
								/* @__PURE__ */ a("button", {
									className: "fc-again",
									disabled: !g || !!v,
									onClick: () => F("again"),
									children: [/* @__PURE__ */ i("span", {
										"aria-hidden": "true",
										children: "←"
									}), " Practise again"]
								}),
								/* @__PURE__ */ a("button", {
									className: "fc-flip",
									disabled: !!v,
									onClick: P,
									children: [m ? "Show question" : "Reveal answer", /* @__PURE__ */ i("span", {
										"aria-hidden": "true",
										children: "↻"
									})]
								}),
								/* @__PURE__ */ a("button", {
									className: "fc-got",
									disabled: !g || !!v,
									onClick: () => F("got"),
									children: ["Got it ", /* @__PURE__ */ i("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						}), /* @__PURE__ */ i("p", {
							className: "fc-instructions",
							children: j ? g ? "Swipe or use ← → to sort" : "Recall first. Space or tap to reveal." : "Every pass is a fresh start."
						})]
					}),
					/* @__PURE__ */ i(u, {
						count: s.length - f.length,
						label: "Cards remaining",
						side: "deck"
					})
				]
			}),
			/* @__PURE__ */ a("footer", {
				className: "fc-table-footer",
				children: [/* @__PURE__ */ i("span", { children: "Self-marked practice" }), /* @__PURE__ */ i("button", {
					disabled: !f.length || !!v,
					onClick: I,
					children: "↶ Undo last card"
				})]
			}),
			/* @__PURE__ */ i("p", {
				className: "fc-sr",
				role: "status",
				"aria-live": "polite",
				children: S
			})
		]
	});
}
//#endregion
export { d as FlashcardTable };
