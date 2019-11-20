'use strict';

import * as $ from 'jquery';
import {bind, browserPrefix, positionComparator} from './utils';
import {SliderHandler} from './sliderHandler';
import {ColorPicker} from './colorPicker';

// GradientSelection

const prefix = browserPrefix();

GradientSlider.prototype = {

	docClicked() {
		this.ctrlPtConfig.hide();
	},

	createCtrlPt(ctrlPtSetup) {
		return new SliderHandler(this._handlesContainerElement, ctrlPtSetup, this._options.orientation, this, this.ctrlPtConfig);
	},

	destroyed() {
		$(document).unbind("click", this.docClicked);
	},

	delete() {
		this._element.remove();
	},

	updateOptions(opts) {
		$.extend(this._options, opts);
		this.regenerateControlPoints();
		this.updatePreview();
	},

	updatePreview() {

		const result = [];

		this.controlPoints.sort(positionComparator);

		const grad = this._options.orientation === 'horizontal' ?
			this._canvasContext.createLinearGradient(0, 0, this._canvasContext.canvas.width, 0) :
			this._canvasContext.createLinearGradient(0, 0, 0, this._canvasContext.canvas.height);

		for (let i = 0; i < this.controlPoints.length; ++i) {
			const pt = this.controlPoints[i];
			grad.addColorStop(pt.position, pt.color);
			result.push({
				position: pt.position,
				color: pt.color
			});
		}

		this._canvasContext.fillStyle = grad;
		this._canvasContext.fillRect(0, 0, this._canvasContext.canvas.width, this._canvasContext.canvas.height);

		const styles = this._options.generateStyles ? this._generatePreviewStyles() : null;
		(typeof this._options.change == 'function') && this._options.change(result, styles);
	},

	regenerateControlPoints() {

		if (this.controlPoints) {

			for (let i = 0; i < this.controlPoints.length; ++i) {
				this.removeControlPoint(this.controlPoints[i]);
			}
		}

		this.controlPoints = [];
		this.ctrlPtConfig = new ColorPicker(this._element, this._options);

		for (let i = 0; i < this._options.controlPoints.length; ++i) {

			const ctrlPt = this.createCtrlPt(this._options.controlPoints[i]);
			this.controlPoints.push(ctrlPt);
		}
	},

	removeControlPoint(handler) {

		const idx = this.controlPoints.indexOf(handler);

		if (idx === -1) return;

		this.controlPoints.splice(idx, 1);
		handler._element.remove();
	},

	previewClicked(e) {

		const offset = $(e.target).offset();
		const x = e.pageX - offset.left;
		const y = e.pageY - offset.top;

		const imgData = this._options.orientation === 'horizontal' ?
			this._canvasContext.getImageData(x, 0, 1, 1) :
			this._canvasContext.getImageData(0, y, 1, 1);

		const colorStr = `rgb(${imgData.data[0]},${imgData.data[1]},${imgData.data[2]})`;

		const cp = this.createCtrlPt({
			position: this._options.orientation === 'horizontal'
				? (x / this._canvasContext.canvas.width)
				: (y / this._canvasContext.canvas.height),
			color: colorStr
		});

		this.controlPoints.push(cp);
		this.controlPoints.sort(positionComparator);

		cp.showConfigView();
		e.stopPropagation();
	},

	_generatePreviewStyles() {

		//linear-gradient(top, rgb(217,230,163) 86%, rgb(227,249,159) 9%)
		let str = `${this._options.type}-gradient(${(this._options.type === 'linear') ? (this._options.fillDirection + ', ') : ''}`;
		let first = true;

		for (let i = 0; i < this.controlPoints.length; ++i) {

			const pt = this.controlPoints[i];

			if (!first) {
				str += ', ';
			} else {
				first = false;
			}
			str += `${tinycolor(pt.color).toHexString()} ${(pt.position * 100) | 0}%`;
		}

		str = str + ')';
		const styles = [str, prefix + str];
		return styles;
	}
};

export function GradientSlider(parentElement, options) {

	this._options = options;

	this._element = $(`<div class="gradientPicker-root gradientPicker-${options.orientation}"></div>`);
	parentElement.append(this._element);

	this._element.addClass('gradientPicker-root');
	this._element.addClass(`gradientPicker-${options.orientation}`);

	const canvasElement = $("<canvas class='gradientPicker-preview'></canvas>");
	this._element.append(canvasElement);
	this.canvas = canvasElement[0];
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this._canvasContext = this.canvas.getContext("2d");

	const handlesContainerElement = $("<div class='gradientPicker-ctrlPts'></div>");
	this._element.append(handlesContainerElement);
	this._handlesContainerElement = handlesContainerElement;

	this.updatePreview = bind(this.updatePreview, this);

	this.regenerateControlPoints();

	this.docClicked = bind(this.docClicked, this);
	this.destroyed = bind(this.destroyed, this);
	$(document).bind("click", this.docClicked);
	this._element.bind("destroyed", this.destroyed);
	this.previewClicked = bind(this.previewClicked, this);

	canvasElement.click(bind(this.previewClicked, this));
	handlesContainerElement.click(bind(this.previewClicked, this));

	this.updatePreview();
}