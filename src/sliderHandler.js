'use strict';

import * as $ from 'jquery';
import {bind} from './utils';

import 'jquery-ui-dist/jquery-ui';

export function SliderHandler(slider, color, position) {

	this._slider = slider;
	this.position = typeof position === 'string' ? position.replace(/%/g, '') / 100 : position;
	this.color = color;

	this._element = $(`<div class='gdpickr-handler'></div>`);

	this._slider.getHandlesContainerElement().append(this._element);

	this._outerWidth = this._element.outerWidth();
	this._outerHeight = this._element.outerHeight();

	this._element.css('background-color', this.color);

	if (this._slider.isHorizontal()) {

		const left = (this._slider.getHandlesContainerElement().width() - this._element.outerWidth()) * (this.position);
		this._element.css('left', left);

	} else {

		const top = (this._slider.getHandlesContainerElement().height() - this._element.outerHeight()) * (this.position);
		this._element.css('top', top);
	}

	this.drag = bind(this.drag, this);
	this.stop = bind(this.stop, this);
	this.onClick = bind(this.onClick, this);
	this.onColorChange = bind(this.onColorChange, this);

	this._element.draggable({
		axis: this._slider.isHorizontal() ? 'x' : 'y',
		drag: this.drag,
		stop: this.stop,
		containment: this._slider.getHandlesContainerElement()
	});
	this._element.css('position', 'absolute');
	this._element.click(this.onClick);
}

SliderHandler.prototype = {

	drag(e, ui) {

		if (this._slider.isHorizontal()) {

			const left = ui.position.left;
			this.position = (left / (this._slider.getHandlesContainerElement().width() - this._outerWidth));

		} else {

			const top = ui.position.top;
			this.position = (top / (this._slider.getHandlesContainerElement().height() - this._outerHeight));
		}

		this._slider.draw();
	},

	stop(e, ui) {
		this._slider.draw();
		this._slider.getColorPicker().show(this._element.position(), this.color, this);
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
		this._slider.getColorPicker().show(this._element.position(), this.color, this);
	},

	hideColorPicker() {
		this._slider.getColorPicker().hide();
	},

	onColorChange(c) {
		this.color = c;
		this._element.css('background-color', this.color);
		this._slider.draw();
	},

	remove() {
		this._slider.removeHandle(this);
		this._slider.draw();
	}

};
