/*jslint browser: true */
/*global document */

'use strict';

import * as $ from 'jquery';
import {bind, browserPrefix, positionComparator} from './utils';
import {SliderHandler} from './sliderHandler';
import {ColorPicker} from './colorPicker';

const prefix = browserPrefix();

export function GradientSlider(parentElement, options) {

	this._options = options;

	this._element = $(`<div class="gdpickr-root gdpickr-${options.orientation}"></div>`);
	parentElement.append(this._element);

	this._element.addClass('gdpickr-root');
	this._element.addClass(`gdpickr-${options.orientation}`);

	const canvasElement = $(`<canvas class="gdpickr-preview"></canvas>`);
	this._element.append(canvasElement);
	this.canvas = canvasElement[0];
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this._canvasContext = this.canvas.getContext('2d');

	const handlesContainerElement = $(`<div class="gdpickr-handles"></div>`);
	this._element.append(handlesContainerElement);
	this._handlesContainerElement = handlesContainerElement;

	this.draw = bind(this.draw, this);

	this.rebuildHandles();

	this.onDocumentClick = bind(this.onDocumentClick, this);
	this.destroyed = bind(this.destroyed, this);
	$(document).bind('click', this.onDocumentClick);
	this._element.bind('destroyed', this.destroyed);
	this.previewClicked = bind(this.previewClicked, this);

	canvasElement.click(bind(this.previewClicked, this));
	handlesContainerElement.click(bind(this.previewClicked, this));

	this.draw();
}

GradientSlider.prototype = {

	getElement() {
		return this._element;
	},

	getHandlesContainerElement() {
		return this._handlesContainerElement;
	},

	getOptions() {
		return this._options;
	},

	getColorPicker() {
		return this.colorPicker;
	},

	onDocumentClick() {
		this.colorPicker && this.colorPicker.hide();
	},

	createHandler(color, position) {
		return new SliderHandler(this, color, position);
	},

	destroyed() {
		$(document).unbind('click', this.onDocumentClick);
	},

	delete() {
		this._element.remove();
	},

	updateOptions(options) {

		$.extend(this._options, options);

		this.rebuildHandles();
		this.draw();
	},

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

		const styles = this._options.generateStyles ? this._generateStyles() : null;
		(typeof this._options.change === 'function') && this._options.change(stops, styles);
	},

	rebuildHandles() {

		this.handles && this.handles.forEach(this.removeHandle);

		this.handles = [];

		this.colorPicker = new ColorPicker(this);

		this._options.stops.forEach(stop => this.handles.push(this.createHandler(stop.color, stop.position)));
	},

	removeHandle(handler) {

		const idx = this.handles.indexOf(handler);

		if (idx === -1) return;

		this.handles.splice(idx, 1);
		handler._element.remove();
	},

	previewClicked(e) {

		const offset = $(e.target).offset();
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
	},

	_generateStyles() {
		const style = `${this._options.type}-gradient(${(this._options.type === 'linear') ? (this._options.direction + ', ') : ''}${this.handles.map(handle => `${handle.color} ${(handle.position * 100) || 0}%`).join(', ')})`;
		return prefix.length ? [style, `${prefix}${style}`] : style;
	},

	isHorizontal() {
		return this._options && this._options.orientation === 'horizontal';
	}

};
