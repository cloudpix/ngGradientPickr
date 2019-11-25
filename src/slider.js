/*jslint browser: true */
/*global document */

'use strict';

import {bind, browserPrefix, getOffset, positionComparator} from './utils';
import SliderHandler from './sliderHandler';
import ColorPicker from './colorPicker';

const prefix = browserPrefix();

class GradientSlider {

	constructor(parentElement, options) {

		this._options = options;

		this._element = document.createElement('div');
		this._element.classList.add('gdpickr-root');
		this._element.classList.add(`gdpickr-${options.orientation}`);
		parentElement.append(this._element);

		this._canvas = document.createElement('canvas');
		this._canvas.classList.add('gdpickr-slider');
		this._canvas.width = this._element.clientWidth;
		this._canvas.height = this._element.clientHeight;
		this._element.append(this._canvas);

		this._canvasContext = this._canvas.getContext('2d');

		this._handlesContainerElement = document.createElement('div');
		this._handlesContainerElement.classList.add('gdpickr-handles');
		this._element.append(this._handlesContainerElement);

		this._rebuild();

		this.onDocumentClick = bind(this.onDocumentClick, this);
		document.addEventListener('click', this.onDocumentClick);

		this.onClick = bind(this.onClick, this);
		this._canvas.addEventListener('click', this.onClick);
		this._handlesContainerElement.addEventListener('click', this.onClick);

		this.draw = bind(this.draw, this);
		this.draw();
	}

	getElement() {
		return this._element;
	}

	getHandlesContainerElement() {
		return this._handlesContainerElement;
	}

	getWidth() {
		return this.getHandlesContainerElement().getBoundingClientRect().width;
	}

	getHeight() {
		return this.getHandlesContainerElement().getBoundingClientRect().height;
	}

	getOptions() {
		return this._options;
	}

	getColorPicker() {
		return this._colorPicker;
	}

	onDocumentClick() {
		this._colorPicker && this._colorPicker.hide();
	}

	createHandler(color, position) {
		return new SliderHandler(this, color, position);
	}

	destroy() {

		this._colorPicker && this._colorPicker.destroy();
		this._removeHandles();

		this._canvas && this._canvas.removeEventListener('click', this.onClick);
		this._handlesContainerElement && this._handlesContainerElement.removeEventListener('click', this.onClick);

		document.removeEventListener('click', this.onDocumentClick);

		this._element.parentElement.removeChild(this._element);
	}

	updateOptions(options) {

		Object.assign(this._options, options);

		this._rebuild();
		this.draw();
	}

	draw() {

		this.handles.sort(positionComparator);

		const gradient = this.isHorizontal() ?
			this._canvasContext.createLinearGradient(0, 0, this._canvasContext.canvas.width, 0) :
			this._canvasContext.createLinearGradient(0, 0, 0, this._canvasContext.canvas.height);

		const stops = this.handles.map(handle => {
			gradient.addColorStop(handle.position, handle.color);
			return {
				position: handle.position,
				color: handle.color
			};
		});

		this._canvasContext.fillStyle = gradient;
		this._canvasContext.fillRect(0, 0, this._canvasContext.canvas.width, this._canvasContext.canvas.height);

		(typeof this._options.change === 'function') && this._options.change(stops, this._options.generateStyles ? this._generateStyles() : null);
	}

	_removeHandles() {
		this.handles && this.handles.forEach(this.removeHandle);
		this.handles = [];
	}

	_rebuild() {

		this._removeHandles();

		this._colorPicker && this._colorPicker.destroy();
		this._colorPicker = new ColorPicker(this);

		this._options.stops.forEach(stop => this.handles.push(this.createHandler(stop.color, stop.position)));
	}

	removeHandle(handler, reDraw) {

		const idx = this.handles.indexOf(handler);

		if (idx === -1) return;

		this.handles.splice(idx, 1);
		handler.remove();

		reDraw && this.draw();
	}

	onClick(e) {

		const offset = getOffset(e.target);
		const x = e.pageX - offset.left;
		const y = e.pageY - offset.top;

		const rgba = this.isHorizontal() ? this._canvasContext.getImageData(x, 0, 1, 1) :
			this._canvasContext.getImageData(0, y, 1, 1);

		const color = `rgba(${rgba.data[0]},${rgba.data[1]},${rgba.data[2]},${rgba.data[3]})`;

		const handler = this.createHandler(color, this.isHorizontal() ?
			(x / this._canvasContext.canvas.width) : (y / this._canvasContext.canvas.height));

		this.handles.push(handler);
		this.handles.sort(positionComparator);

		handler.showColorPicker();

		e.stopPropagation();
	}

	_generateStyles() {
		const style = `${this._options.type}-gradient(${(this._options.type === 'linear') ? (this._options.direction + ', ') : ''}${this.handles.map(handle => `${handle.color} ${(handle.position * 100) || 0}%`).join(', ')})`;
		return prefix.length ? [style, `${prefix}${style}`] : style;
	}

	isHorizontal() {
		return this._options && this._options.orientation === 'horizontal';
	}

}

export default GradientSlider;
