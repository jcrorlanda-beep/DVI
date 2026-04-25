"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = nextId;
exports.lineItemId = lineItemId;
exports.paymentId = paymentId;
function nextId(prefix, existing) {
    const max = existing.reduce((m, id) => {
        const n = parseInt(id.replace(`${prefix}-`, ''), 10);
        return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}
function lineItemId() {
    return `li-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
function paymentId() {
    return `pay-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
