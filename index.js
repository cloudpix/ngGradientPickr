import 'angular';
import GradientSlider from 'ngGradientPickr/src/slider';

(function () {
	'use strict';

	angular.module('ngGradientPickr', []);

	angular.module('ngGradientPickr').component('ngGradientPickr', {
		bindings: {
			type: '<',
			orientation: '<',
			direction: '<',
			generateFabricjsColorStops: '<',
			generateStyles: '<',
			fixedColorPicker: '<',
			disabled: '<',
			colorStops: '<',
			onChange: '&'
		},
		template: `<div></div>`,
		controller: NgGradientPickerController,
		controllerAs: 'vm'
	});

	NgGradientPickerController.$inject = ['$element', '$log'];

	function NgGradientPickerController($element, $log) {

		const vm = this;
		const el = $element[0].firstElementChild;

		let gradientSlider = null;

		vm.$onInit = angular.noop;

		vm.$postLink = () => gradientSlider = GradientSlider.create(el, {
			type: vm.type || 'linear',
			orientation: vm.orientation || 'horizontal',
			direction: vm.direction || 'left',
			generateFabricjsColorStops: vm.generateFabricjsColorStops !== undefined ? vm.generateFabricjsColorStops : false,
			generateStyles: vm.generateStyles !== undefined ? vm.generateStyles : false,
			disabled: vm.disabled !== undefined ? vm.disabled : false,
			fixedColorPicker: vm.fixedColorPicker !== undefined ? vm.fixedColorPicker : false,
			stops: vm.colorStops || [],
			change: (instance, stops, fabricjsColorStops, styles) => {
				(vm.onChange !== null) && (typeof vm.onChange === 'function') && vm.onChange({
					instance,
					stops,
					fabricjsColorStops,
					styles,
				});
			},
		});

		vm.$onChanges = changes => {

			if (!changes || !gradientSlider) return;

			if (changes.disabled &&
				changes.disabled.previousValue !== changes.disabled.currentValue) {
				changes.disabled.currentValue ? gradientSlider.disable() : gradientSlider.enable();
			}

			if (changes.colorStops &&
				JSON.stringify(changes.colorStops.previousValue) !== JSON.stringify(changes.colorStops.currentValue)) {
				gradientSlider.updateOptions({stops: changes.colorStops.currentValue});
			}
		};

		vm.$onDestroy = () => {
			gradientSlider && gradientSlider.destroy();
			gradientSlider = null;
		};

	}
})();
