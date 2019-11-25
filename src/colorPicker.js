/*jslint browser: true */
/*global document */

'use strict';

import '@simonwep/pickr/dist/themes/nano.min.css';

import {bind} from './utils';
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
		}).on('change', color => this.onColorChange(color.toHEXA().toString()))
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

		if (this._slider.isHorizontal()) {
			this._element.style.left = `${position.left}px`;
		} else {
			this._element.style.top = `${position.top}px`;
		}

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
		this._pickr.destroy();
	}

}

export default ColorPicker;
