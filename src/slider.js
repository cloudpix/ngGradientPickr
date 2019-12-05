/*jslint browser: true */
/*global document */

'use strict';

import {bind, browserPrefix, getOffset, positionComparator, range} from './utils';
import SliderHandler from './sliderHandler';
import ColorPicker from './colorPicker';
import './assets/style.css';

const prefix = browserPrefix();

class GradientSlider {

	constructor(parentElement, options) {

		if (!parentElement) throw new Error('parentElement is mandatory.');

		this._buildOptions(options);

		this._rootElement = document.createElement('div');
		this._rootElement.classList.add('gdpickr-root');
		this._rootElement.classList.add(`gdpickr-${options.orientation}`);
		parentElement.append(this._rootElement);

		this._element = document.createElement('div');
		this._element.classList.add('gdpickr-slider-holder');
		this._rootElement.append(this._element);

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
		this.onMouseDown = bind(this.onMouseDown, this);
		this.onMouseUp = bind(this.onMouseUp, this);
		this.onMouseMove = bind(this.onMouseMove, this);

		this._canvas.addEventListener('click', this.onClick);
		this._handlesContainerElement.addEventListener('click', this.onClick);

		this.isDisabled() && this.disable();

		this.draw = bind(this.draw, this);

		this._init = bind(this._init, this);
		this._init();
	}

	_init() {

		if (!this._element.clientWidth) return requestAnimationFrame(this._init);

		this._canvas.width = this._element.clientWidth;
		this._canvas.height = this._element.clientHeight;

		this._handles.forEach(h => h.uploadElementPosition());

		this.draw();
	}

	_buildOptions(options) {

		//try to parse FabricJS colorStops.
		const stops = options && options.stops ?
			Array.isArray(options.stops) ? options.stops :
				Object.entries(options.stops).map(stop => ({
					position: `${stop[0] * 100}%`,
					color: stop[1]
				})) : null;

		this._options = Object.assign({}, {
			type: 'linear',
			orientation: 'horizontal',
			direction: 'left',
			generateFabricjsColorStops: false,
			generateStyles: false,
			disabled: false,
			fixedColorPicker: false,
			stops: [{
				color: 'rgba(255,255,255,1)',
				position: '0%'
			}, {
				color: 'rgba(0,0,0,1)',
				position: '100%'
			}],
			change: (instance, stops, fabricjsColorStops, styles) => {
			},
		}, options, {stops});
	}

	getRootElement() {
		return this._rootElement;
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

		this._rootElement.parentElement.removeChild(this._rootElement);
	}

	updateOptions(options) {

		this._buildOptions(Object.assign(this._options, options));

		this._rebuild();
		this.draw();
	}

	draw(handler) {

		//re-add handler if it was necessary.
		handler && !this._handles.includes(handler) && this._handles.push(handler);

		//draw grid.
		const canvasWidth = this._canvasContext.canvas.width,
			canvasHeight = this._canvasContext.canvas.height;

		let step = 0;
		for (let x = 0; x <= canvasWidth; x += 5) {
			for (let y = 0; y <= canvasHeight; y += 5) {

				this._canvasContext.fillStyle = step % 2 !== 0 ? '#CECECE' : '#FFFFFF';
				this._canvasContext.fillRect(x, y, 5, 5);

				step++;
			}
		}

		//draw gradients.
		this._handles.sort(positionComparator);

		const gradient = this.isHorizontal() ?
			this._canvasContext.createLinearGradient(0, 0, canvasWidth, 0) :
			this._canvasContext.createLinearGradient(0, 0, 0, canvasHeight);

		const stops = this._handles.map(handle => {
			(handle.color + '').trim().length && gradient.addColorStop(range(handle.position || 0, 0, 1), handle.color);
			return {
				position: `${handle.position * 100}%`,
				color: handle.color
			};
		});

		this._canvasContext.fillStyle = gradient;
		this._canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

		(typeof this._options.change === 'function') && this._options.change(this, stops,
			this._options.generateFabricjsColorStops ? this._generateFabricjsColorStops() : null,
			this._options.generateStyles ? this._generateStyles() : null);
	}

	_removeHandles() {
		this._handles && this._handles.forEach(handler => this.removeHandle(handler));
		this._handles = [];
	}

	_rebuild() {

		this._removeHandles();

		this._colorPicker && this._colorPicker.destroy();
		this._colorPicker = new ColorPicker(this);

		this._options.stops.forEach(stop => this._handles.push(this.createHandler(stop.color, stop.position)));
	}

	removeHandle(handler, reDraw) {

		const idx = this._handles.indexOf(handler);

		if (idx === -1) return;

		this._handles.splice(idx, 1);
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

		this._handles.push(handler);
		this._handles.sort(positionComparator);

		handler.showColorPicker();

		e.stopPropagation();
	}

	_generateStyles() {
		const style = `${this._options.type}-gradient(${(this._options.type === 'linear') ? (this._options.direction + ', ') : ''}${this._handles.map(handle => `${handle.color} ${(handle.position * 100) || 0}%`).join(', ')})`;
		return prefix.length ? [style, `${prefix}${style}`] : style;
	}

	_generateFabricjsColorStops() {
		const stops = {};
		this._handles.forEach(stop => stops[stop.position] = stop.color);
		return stops;
	}

	isHorizontal() {
		return this._options && this._options.orientation === 'horizontal';
	}

	isFixedColorPicker() {
		return this._options && this._options.fixedColorPicker;
	}

	enable() {
		this._options.disabled = false;
		this._element.classList.remove('disabled');
	}

	disable() {
		this._options.disabled = true;
		this._element.classList.add('disabled');
	}

	isDisabled() {
		return this._options.disabled;
	}

}

GradientSlider.create = (element, options) => new GradientSlider(element, options);

export default GradientSlider;
