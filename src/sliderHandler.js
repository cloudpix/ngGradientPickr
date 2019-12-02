/*jslint browser: true */
/*global document */

'use strict';

import {bind, range} from './utils';

class SliderHandler {

	/* https://javascript.info/mouse-drag-and-drop */

	constructor(slider, color, position) {

		this._slider = slider;
		this._isDragging = false;
		this._lastPosition = {};
		this.position = typeof position === 'string' ? position.replace(/%/g, '') / 100 : position;
		this.color = color;

		this._element = document.createElement('div');
		this._element.classList.add('gdpickr-handler');
		this._slider.getHandlesContainerElement().append(this._element);

		this.uploadElementPosition = bind(this.uploadElementPosition, this);
		this._updatePosition = bind(this._updatePosition, this);
		this.onClick = bind(this.onClick, this);
		this.onColorChange = bind(this.onColorChange, this);
		this.onMouseDown = bind(this.onMouseDown, this);
		this.onMouseMove = bind(this.onMouseMove, this);
		this.onMouseUp = bind(this.onMouseUp, this);

		this._element.style.backgroundColor = this.color;
		this._element.style.position = 'absolute';

		this.uploadElementPosition();

		this._element.addEventListener('click', this.onClick);
		this._element.addEventListener('mousemove', this.onMouseMove);
		this._element.addEventListener('mousedown', this.onMouseDown);
		this._element.addEventListener('mouseup', this.onMouseUp);
	}

	uploadElementPosition() {
		this._slider.isHorizontal() ?
			(this._element.style.left = `${(this._slider.getWidth() - this._element.offsetWidth) * (this.position)}px`) :
			(this._element.style.top = `${(this._slider.getHeight() - this._element.offsetHeight) * (this.position)}px`);
	}

	_updatePosition() {

		this.position = this._slider.isHorizontal() ?
			this._element.offsetLeft / (this._slider.getWidth() - this._element.offsetWidth) :
			this._element.offsetTop / (this._slider.getHeight() - this._element.offsetHeight);

		if (this.position < 0 || this.position > 1) {

			console.warn(`Invalid handler position: ${this.position}. Details: ${JSON.stringify({
				rect: this._element.getBoundingClientRect(),
				offset: {
					left: this._element.offsetLeft,
					top: this._element.offsetTop,
					width: this._element.offsetWidth,
					height: this._element.offsetHeight
				},
				slider: {
					width: this._slider.getWidth(),
					height: this._slider.getHeight()
				}
			}, undefined, 2)}`);
		}

		this._slider.draw(this);
	}

	isDragging() {
		return this._isDragging;
	}

	onMouseDown(e) {

		this._isDragging = true;
		this._lastPosition = {
			x: e.pageX,
			y: e.pageY
		};

		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);

		e.stopPropagation();
	}

	onMouseMove(e) {

		if (!this._isDragging) return;

		this._slider.isHorizontal() ?
			this._element.style.left = `${range(this._element.offsetLeft - (this._lastPosition.x - e.pageX), 0, this._slider.getWidth() - this._element.offsetWidth)}px` :
			this._element.style.top = `${range(this._element.offsetTop - (this._lastPosition.y - e.pageY), 0, this._slider.getHeight() - this._element.offsetHeight)}px`;

		this.onMouseDown(e);

		this._updatePosition();

		e.stopPropagation();
		e.preventDefault();
	}

	onMouseUp(e) {

		this._isDragging = false;

		this._slider.draw();

		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onMouseUp);

		e.stopPropagation();
	}

	onClick(e) {

		this._slider.getColorPicker().isVisible() && (this === this._slider.getColorPicker().getHandler()) ?
			this.hideColorPicker() :
			this.showColorPicker();

		e.stopPropagation();
		e.preventDefault();
	}

	showColorPicker() {
		this._slider.getColorPicker().show({
			left: this._element.offsetLeft,
			top: this._element.offsetTop
		}, this.color, this);
	}

	hideColorPicker() {
		this._slider.getColorPicker().hide();
	}

	onColorChange(c) {

		this.color = c;

		this._element.style.backgroundColor = this.color;
		this._slider.draw();
	}

	remove() {
		this._element.removeEventListener('click', this.onClick);
		this._element.removeEventListener('mousemove', this.onMouseMove);
		this._element.removeEventListener('mousedown', this.onMouseDown);
		this._element.removeEventListener('mouseup', this.onMouseUp);
		this._element.remove();
	}

}

export default SliderHandler;
