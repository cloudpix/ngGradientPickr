'use strict';

import * as $ from 'jquery';
import {bind, browserPrefix, positionComparator} from './utils';
import {SliderHandler} from './sliderHandler';
import {ColorPicker} from './colorPicker';
import * as tinycolor from 'tinycolor2';

const prefix = browserPrefix();

GradientSlider.prototype = {

	onDocumentClick() {
		this.colorPicker && this.colorPicker.hide();
	},

	createHandler(options) {
		return new SliderHandler(this._handlesContainerElement, options, this._options.orientation,
			this, this.colorPicker);
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
		this.updatePreview();
	},

	updatePreview() {

		this.handles.sort(positionComparator);

		const gradient = this._options.orientation === 'horizontal' ?
			this._canvasContext.createLinearGradient(0, 0, this._canvasContext.canvas.width, 0) :
			this._canvasContext.createLinearGradient(0, 0, 0, this._canvasContext.canvas.height);

		const result = this.handles.map(handle => {

			gradient.addColorStop(handle.position, handle.color);

			return {
				position: handle.position,
				color: handle.color
			};
		});

		this._canvasContext.fillStyle = gradient;
		this._canvasContext.fillRect(0, 0, this._canvasContext.canvas.width, this._canvasContext.canvas.height);

		const styles = this._options.generateStyles ? this._generatePreviewStyles() : null;
		(typeof this._options.change === 'function') && this._options.change(result, styles);
	},

	rebuildHandles() {

		this.handles && this.handles.forEach(this.removeHandle);

		this.handles = [];

		this.colorPicker = new ColorPicker(this._element, this._options);

		this._options.colors.forEach(color => this.handles.push(this.createHandler(color)));
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

		const imgData = this._options.orientation === 'horizontal' ?
			this._canvasContext.getImageData(x, 0, 1, 1) :
			this._canvasContext.getImageData(0, y, 1, 1);

		const color = `rgb(${imgData.data[0]},${imgData.data[1]},${imgData.data[2]})`;

		const handler = this.createHandler({
			position: this._options.orientation === 'horizontal' ?
				(x / this._canvasContext.canvas.width) : (y / this._canvasContext.canvas.height),
			color: color
		});

		this.handles.push(handler);
		this.handles.sort(positionComparator);

		handler.showColorPicker();
		e.stopPropagation();
	},

	_generatePreviewStyles() {

		//linear-gradient(top, rgb(217,230,163) 86%, rgb(227,249,159) 9%)
		let str = `${this._options.type}-gradient(${(this._options.type === 'linear') ? (this._options.direction + ', ') : ''}`;
		let first = true;

		this.handles.forEach(handle => {
			if (!first) {
				str += ', ';
			} else {
				first = false;
			}
			str += `${tinycolor(handle.color).toHexString()} ${(handle.position * 100) || 0}%`;
		});

		str = str + ')';
		const styles = [str, prefix + str];
		return styles;
	}
};

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

	this.updatePreview = bind(this.updatePreview, this);

	this.rebuildHandles();

	this.onDocumentClick = bind(this.onDocumentClick, this);
	this.destroyed = bind(this.destroyed, this);
	$(document).bind('click', this.onDocumentClick);
	this._element.bind('destroyed', this.destroyed);
	this.previewClicked = bind(this.previewClicked, this);

	canvasElement.click(bind(this.previewClicked, this));
	handlesContainerElement.click(bind(this.previewClicked, this));

	this.updatePreview();
}
