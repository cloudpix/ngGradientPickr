/*jslint browser: true */
/*global document */

'use strict';

import '@simonwep/pickr/dist/themes/nano.min.css';

import {bind, preventEventPropagation} from './utils';
import Pickr from '@simonwep/pickr';

class ColorPicker {

	constructor(slider) {

		this._slider = slider;

		this._element = document.createElement('div');
		this._element.classList.add('gdpickr-color-pickr');
		this._element.style.visibility = 'hidden';

		this._slider.getElement().append(this._element);

		const pickrElement = document.createElement('div');
		this._element.append(pickrElement);

		this.onColorChange = bind(this.onColorChange, this);
		this.onCloseClick = bind(this.hide, this);
		this.onRemoveClick = bind(this.onRemoveClick, this);

		this._visible = false;

		this._pickrEventBindings = [];

		this._pickrElement = pickrElement;
		this._pickr = Pickr.create({
			el: this._pickrElement,
			theme: 'nano',
			appClass: 'gdpickr',
			useAsButton: true,
			inline: true,
			defaultRepresentation: 'RGBA',
			components: {
				opacity: true,
				hue: true,
				preview: true,
				interaction: {
					hex: true,
					rgba: true,
					hsva: false,
					input: true,
					clear: true,
					save: true
				}
			},
			strings: {
				save: 'Close',
				clear: 'Remove'
			}
		}).on('init', instance => this._pickrEventBindings = this._registerPreventEvents(instance))
			.on('change', color => this.onColorChange(color.toHEXA().toString()))
			.on('save', () => this.onCloseClick(true))
			.on('clear', () => this.onRemoveClick());
	}

	isVisible() {
		return this._visible;
	}

	show(position, color, sliderHandler) {

		this._visible = true;
		this._handler = sliderHandler;

		this._element.style.visibility = 'visible';

		this._slider.isHorizontal() ?
			this._element.style.left = `${this._slider.isFixedColorPicker() ? 0 : position.left}px` :
			this._element.style.top = `${this._slider.isFixedColorPicker() ? 0 : position.top}px`;

		this._pickr.setColor(color, true);
		this._pickr.show();
	}

	hide(force) {

		if (!this._visible && !force) return;

		this._visible = false;
		this._element.style.visibility = 'hidden';
		this._pickr.hide();
	}

	getHandler() {
		return this._handler;
	}

	onColorChange(color) {
		this._handler.onColorChange(color);
	}

	onRemoveClick() {
		this._slider.removeHandle(this._handler, true);
		this.hide();
	}

	destroy() {
		this._clearEventBindings();
		this._pickr.destroy();
	}

	_registerPreventEvents(pickrInstance) {

		const root = pickrInstance && pickrInstance.getRoot();
		if (!root) return;

		const elements = [];

		root.palette && root.palette.picker && elements.push(root.palette.picker);
		root.palette && root.palette.palette && root.palette.palette.parentElement && elements.push(root.palette.palette.parentElement);
		root.hue && root.hue.picker && elements.push(root.hue.picker);
		root.hue && root.hue.slider && root.hue.slider.parentElement && elements.push(root.hue.slider.parentElement);
		root.opacity && root.opacity.picker && elements.push(root.opacity.picker);
		root.opacity && root.opacity.slider && root.opacity.slider.parentElement && elements.push(root.opacity.slider.parentElement);

		return elements.map(element => {

			const eventBinding = {
				element,
				event: 'click',
				fun: e => preventEventPropagation(e)
			};

			eventBinding.element.addEventListener(eventBinding.event, eventBinding.fun);
			return eventBinding;
		});
	}

	_clearEventBindings() {

		this._pickrEventBindings.forEach(e => e.element.removeEventListener(e.event, e.fun));
		this._pickrEventBindings = [];
	}

}

export default ColorPicker;
