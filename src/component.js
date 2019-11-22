'use strict';

import * as $ from 'jquery';
import {GradientSlider} from './slider';
import './assets/style.css';

export function register() {

	const methods = {

		init(options) {

			if (options && options.orientation === 'vertical' && !options.direction) {
				options.direction = 'top';
			}

			options = $.extend({
				type: 'linear',
				orientation: 'horizontal',
				direction: 'left',
				generateStyles: true,
				stops: [{
					color: 'rgba(255,255,255,1)',
					position: '0%'
				}, {
					color: 'rgba(0,0,0,1)',
					position: '100%'
				}],
				change(stops, styles) {
				}
			}, options);

			this.each(function () {
				const element = $(this);
				const slider = new GradientSlider(element, options);
				element.data('gdpickr-sel', slider);
			});

			return this;
		},

		update(options) {
			this.each(function () {
				const element = $(this);
				const slider = element.data('gdpickr-sel');
				slider && slider.updateOptions(options);
			});
		},

		delete() {
			this.each(function () {
				const element = $(this);
				const slider = element.data('gdpickr-sel');
				slider && slider.destroy();
			});
		}
	};

	$.fn.gradientPickr = function (method, options) {

		if (typeof method === 'string' && method !== 'init') {

			return methods[method].call(this, options);

		} else {

			options = method;
			return methods.init.call(this, options);
		}
	};

}
