// a do-nothing DOM for evaluating station modules in node (camera maths only)
const any = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === "width" || k === "height" ? 64 : any()), apply: () => any(), construct: () => any(), set: () => true });
globalThis.document = { createElement: () => ({ width: 64, height: 64, getContext: () => any(), style: {} }), fonts: { ready: new Promise(() => {}) } };
globalThis.Image = function () { return { set src(v) {}, addEventListener() {} }; };
