import 'angular';

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

	NgGradientPickerController.$inject = ['$timeout', '$element', '$log'];

	function NgGradientPickerController($timeout, $element, $log) {

		const vm = this;
		const el = $($element[0].firstElementChild)[0];

		vm.$onInit = angular.noop;
		vm.$postLink = angular.noop;
		vm.$onDestroy = angular.noop;

	}
})();