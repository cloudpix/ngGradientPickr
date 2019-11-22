/*jslint browser: true */
/*global window */

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
