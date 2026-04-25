"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const OVERLAY = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
};
const Modal = ({ title, width = 600, onClose, children, footer }) => ((0, jsx_runtime_1.jsx)("div", { style: OVERLAY, onClick: (e) => e.target === e.currentTarget && onClose(), children: (0, jsx_runtime_1.jsxs)("div", { style: {
            background: '#ffffff',
            borderRadius: '12px',
            width,
            maxWidth: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    padding: '18px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }, children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '22px',
                            color: '#94a3b8',
                            lineHeight: 1,
                            padding: '0 4px',
                            fontFamily: 'inherit',
                        }, children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, overflowY: 'auto', padding: '24px' }, children: children }), footer && ((0, jsx_runtime_1.jsx)("div", { style: {
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    flexShrink: 0,
                }, children: footer }))] }) }));
exports.default = Modal;
