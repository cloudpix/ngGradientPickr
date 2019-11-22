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
				colors: ['#FFF 0%', '#000 100%'],
				orientation: 'horizontal',
				type: 'linear',
				direction: 'left',
				generateStyles: true,
				change() {
				}
			}, options);

			this.each(function () {
				const element = $(this);
				const slider = new GradientSlider(element, options);
				element.data('gdpickr-sel', slider);
			});
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
				slider && slider.delete();
			});
		}
	};

	$.fn.gradientPickr = function (method, options) {

		if (typeof method === 'string' && method !== 'init') {

			methods[method].call(this, options);

		} else {

			options = method;
			methods.init.call(this, options);
		}
	};

}
