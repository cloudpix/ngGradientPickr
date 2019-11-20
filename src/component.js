'use strict';

import * as $ from 'jquery';
import {GradientSlider} from "./slider";

export function register() {

	const methods = {

		init(opts) {

			if (opts && opts.orientation === 'vertical' && !opts.fillDirection) {
				opts.fillDirection = 'top';
			}

			opts = $.extend({
				controlPoints: ['#FFF 0%', '#000 100%'],
				orientation: 'horizontal',
				type: 'linear',
				fillDirection: "left",
				generateStyles: true,
				change() {
				}
			}, opts);

			this.each(function () {
				const $this = $(this);
				const gradSel = new GradientSlider($this, opts);
				$this.data("gradientPicker-sel", gradSel);
			});
		},

		update(opts) {
			this.each(function () {
				const $this = $(this);
				const gradSel = $this.data("gradientPicker-sel");
				if (gradSel != null) {
					gradSel.updateOptions(opts);
				}
			});
		},

		delete() {
			this.each(function () {
				const $this = $(this);
				const gradSel = $this.data("gradientPicker-sel");
				if (gradSel != null) {
					gradSel.delete();
				}
			});
		}
	};

	$.fn.gradientPicker = function (method, opts) {

		if (typeof method === 'string' && method !== 'init') {

			methods[method].call(this, opts);

		} else {

			opts = method;
			methods.init.call(this, opts);
		}
	};
}