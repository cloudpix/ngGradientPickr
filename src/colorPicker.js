/*jslint browser: true */
/*global document */

'use strict';

import '@simonwep/pickr/dist/themes/nano.min.css';

import {bind, preventEventPropagation} from './utils';
import Pickr from '@simonwep/pickr';

class ColorPicker {

	constructor(slider) {

		this._slider = slider;
		this._visible = 'hidden';
		this._pickrEventBindings = [];

		this._element = document.createElement('div');
		this._element.classList.add('gdpickr-color-pickr');
		this._element.style.display = 'none';
		this._element.classList.add(this._slider.isFixedColorPicker() ? 'fixed' : 'float');

		this._slider.getRootElement().append(this._element);

		const pickrElement = document.createElement('div');
		this._pickrElement = pickrElement;
		this._element.append(pickrElement);

		this.onColorChange = bind(this.onColorChange, this);
		this.onCloseClick = bind(this.hide, this);
		this.onRemoveClick = bind(this.onRemoveClick, this);

		this._initPickr = bind(this._initPickr, this);
		this._initPickr();
	}

	_initPickr() {

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
		}).on('show', () => {

			this._visible = 'visible';
			this._element.style.display = null;

		}).on('hide', () => {

			this._visible = 'hidden';
			this._element.style.display = 'none';

		}).on('change', (color, instance) => {

			const dolly = color.clone();

			if (isNaN(dolly.h)) {
				dolly.h = instance.getSelectedColor().h;
			}
			if (isNaN(dolly.s)) {
				dolly.s = instance.getSelectedColor().s;
			}
			if (isNaN(dolly.v)) {
				dolly.v = instance.getSelectedColor().v;
			}
			if (isNaN(dolly.a)) {
				dolly.a = instance.getSelectedColor().a;
			}

			instance.setHSVA(dolly.h, dolly.s, dolly.v, dolly.a, true);
			instance.applyColor(true);

			this.onColorChange(instance.getColor().toRGBA().toString());

		}).on('save', color => {

			this.onCloseClick();

		}).on('clear', () => this.onRemoveClick());

		this._pickrEventBindings = this._registerPreventEvents(this._pickr);
	}

	isVisible() {
		return this._visible === 'visible';
	}

	show(position, color, sliderHandler) {

		this._visible = 'changing';
		this._handler = sliderHandler;

		this._slider.isHorizontal() ?
			this._element.style.left = `${this._slider.isFixedColorPicker() ? 0 : position.left}px` :
			this._element.style.top = `${this._slider.isFixedColorPicker() ? 0 : position.top}px`;

		if (!this.getColors().find(c => c === color)) {

			this._pickr.setColor(color, true);
			this._pickr.applyColor(true);
		}

		this._pickr.show();
	}

	hide() {

		if (this._visible === 'changing') return;

		this._visible = 'changing';
		this._pickr.hide();
	}

	getHandler() {
		return this._handler;
	}

	onColorChange(color) {
		this._handler && this._handler.onColorChange(color);
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
		root.interaction && root.interaction.options && root.interaction.options.forEach(el => elements.push(el));

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

	getColors() {
		const color = this._pickr && this._pickr.getColor();
		return !color ? [] : [
			color.toHSVA().toString(0),
			color.toHSLA().toString(0),
			color.toRGBA().toString(0),
			color.toHEXA().toString(0),
			color.toCMYK().toString(0),
		];
	}

}

export default ColorPicker;
