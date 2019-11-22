import 'angular';
import {register} from './src/component';

(function () {
	'use strict';

	register();

	angular.module('ngGradientPickr', []);

	angular.module('ngGradientPickr').component('ngGradientPickr', {
		bindings: {
			ngModel: '<',
			ngDisabled: '<',
		},
		template: `<div style="height: 32px; width: 200px; margin: 20px; overflow: visible"></div>`,
		controller: NgGradientPickerController,
		controllerAs: 'vm'
	});

	NgGradientPickerController.$inject = ['$timeout', '$element', '$log'];

	function NgGradientPickerController($timeout, $element, $log) {

		const vm = this;
		const el = $($element[0].firstElementChild)[0];

		vm.$onInit = angular.noop;

		vm.$postLink = () => {

			$(el).gradientPickr({
				change: (stops, styles) => {
					console.log('gradient changed:', stops, styles);
				},
				direction: '45deg',
				colors: ['green 0%', 'orange 100%']
			});
		};

		vm.$onDestroy = angular.noop;

	}
})();
