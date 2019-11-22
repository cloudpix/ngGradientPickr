/*jslint browser: true */
/*global document */

'use strict';

import * as $ from 'jquery';
import {bind} from './utils';

import 'jquery-ui-dist/jquery-ui';

export function SliderHandler(slider, color, position) {

	this._slider = slider;
	this.position = typeof position === 'string' ? position.replace(/%/g, '') / 100 : position;
	this.color = color;

	this._element = document.createElement('div');
	this._element.classList.add('gdpickr-handler');
	this._slider.getHandlesContainerElement().append(this._element);

	this.drag = bind(this.drag, this);
	this.stop = bind(this.stop, this);
	this.onClick = bind(this.onClick, this);
	this.onColorChange = bind(this.onColorChange, this);

	$(this._element).draggable({
		axis: this._slider.isHorizontal() ? 'x' : 'y',
		drag: this.drag,
		stop: this.stop,
		containment: this._slider.getHandlesContainerElement()
	});

	this._element.style.backgroundColor = this.color;
	this._element.style.position = 'absolute';
	this._slider.isHorizontal() ?
		(this._element.style.left = `${(this._slider.getWidth() - this._element.offsetWidth) * (this.position)}px`) :
		(this._element.style.top = `${(this._slider.getHeight() - this._element.offsetHeight) * (this.position)}px`);

	this._element.addEventListener('click', this.onClick);
}

SliderHandler.prototype = {

	drag(e, ui) {

		if (this._slider.isHorizontal()) {

			const left = ui.position.left;
			this.position = (left / (this._slider.getWidth() - this._element.offsetWidth));

		} else {

			const top = ui.position.top;
			this.position = (top / (this._slider.getHeight() - this._element.offsetHeight));
		}

		this._slider.draw();
	},

	stop(e, ui) {

		this._slider.draw();

		this._slider.getColorPicker().show({
			left: this._element.offsetLeft,
			top: this._element.offsetTop
		}, this.color, this);
	},

	onClick(e) {

		if (this._slider.getColorPicker().isVisible() &&
			(this === this._slider.getColorPicker().getHandler())) {
			this.hideColorPicker();
		} else {
			this.showColorPicker();
		}

		e.stopPropagation();
		e.preventDefault();
	},

	showColorPicker() {
		this._slider.getColorPicker().show({
			left: this._element.offsetLeft,
			top: this._element.offsetTop
		}, this.color, this);
	},

	hideColorPicker() {
		this._slider.getColorPicker().hide();
	},

	onColorChange(c) {

		this.color = c;

		this._element.style.backgroundColor = this.color;
		this._slider.draw();
	},

	remove() {
		this._element.removeEventListener('click', this.onClick);
		this._element.remove();
	}

};
