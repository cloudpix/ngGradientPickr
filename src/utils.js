/*jslint browser: true */
/*global window */
/*global document */

'use strict';

export function bind(fn, ctx) {
	return !fn ? null : typeof fn.bind === 'function' ? fn.bind(ctx) : () => fn.apply(ctx, arguments);
}

export function positionComparator(l, r) {
	return l.position - r.position;
}

export function browserPrefix() {
	const agent = window.navigator.userAgent;
	return agent.indexOf('WebKit') >= 0 ? '-webkit-' :
		agent.indexOf('Mozilla') >= 0 ? '-moz-' :
			agent.indexOf('Microsoft') >= 0 ? '-ms-' : '';
}

export function getOffset(el) {
	if (!el) return;
	const box = el.getBoundingClientRect();
	return {
		top: box.top + window.pageYOffset - document.documentElement.clientTop,
		left: box.left + window.pageXOffset - document.documentElement.clientLeft
	};
}

export function range(value, min, max) {
	return Math.max(Math.min(max, value), min);
}

export function preventEventPropagation(event) {

	if (!event) return;

	event.preventDefault && event.preventDefault();
	event.stopPropagation && event.stopPropagation();
	event.stopImmediatePropagation && event.stopImmediatePropagation();
}
