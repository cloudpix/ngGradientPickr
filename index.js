import * as $ from 'jquery';
import 'angular';
import GradientSlider from 'ngGradientPickr/src/slider';

(function () {
	'use strict';

	angular.module('ngGradientPickr', []);

	angular.module('ngGradientPickr').component('ngGradientPickr', {
		bindings: {
			ngModel: '<',
			ngDisabled: '<',
		},
		template: `<div></div>`,
		controller: NgGradientPickerController,
		controllerAs: 'vm'
	});

	NgGradientPickerController.$inject = ['$element', '$log'];

	function NgGradientPickerController($element, $log) {

		const vm = this;
		const el = $($element[0].firstElementChild)[0];

		let gradientSlider = null;

		vm.$onInit = angular.noop;

		vm.$postLink = () => gradientSlider = GradientSlider.create(el, {
			type: 'linear',
			orientation: 'horizontal',
			direction: '45deg',
			generateStyles: true,
			stops: [{
				color: 'rgba(255,255,255,1)',
				position: '0%'
			}, {
				color: 'rgba(0,0,0,1)',
				position: '100%'
			}],
			change: (stops, styles) => $log.debug('Colors:', stops, styles),
		});

		vm.$onDestroy = () => {
			gradientSlider && gradientSlider.destroy();
			gradientSlider = null;
		};

	}
})();
