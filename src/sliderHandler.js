'use strict';

import * as tinycolor from 'tinycolor2';
import * as $ from 'jquery';
import {bind} from './utils';

// ControlPoint

SliderHandler.prototype = {

	drag(e, ui) {
		// convert position to a %
		if (this.orientation === 'horizontal') {
			const left = ui.position.left;
			this.position = (left / (this._parentElement.width() - this.outerWidth));
		} else {
			const top = ui.position.top;
			this.position = (top / (this._parentElement.height() - this.outerHeight));
		}
		this.listener.updatePreview();
	},

	stop(e, ui) {
		this.listener.updatePreview();
		this.configView.show(this._element.position(), this.color, this);
	},

	clicked(e) {
		if (this === this.configView.getListener() && this.configView.visible) {
			// second click
			this.hideConfigView();
		} else {
			this.showConfigView();
		}
		e.stopPropagation();
		e.preventDefault();
	},

	showConfigView() {
		this.configView.show(this._element.position(), this.color, this);
	},

	hideConfigView() {
		this.configView.hide();
	},

	colorChanged(c) {
		this.color = c;
		this._element.css('background-color', this.color);
		this.listener.updatePreview();
	},

	removeClicked() {
		this.listener.removeControlPoint(this);
		this.listener.updatePreview();
	}
};

export function SliderHandler(parentElement, initialState, orientation, listener, ctrlPtConfig) {

	this._element = $("<div class='gradientPicker-ctrlPt'></div>");
	parentElement.append(this._element);
	this._parentElement = parentElement;

	this.configView = ctrlPtConfig;
	this.orientation = orientation;

	if (typeof initialState === 'string') {

		initialState = initialState.split(' ');
		this.position = parseFloat(initialState[1]) / 100;
		this.color = tinycolor(initialState[0]).toHexString();

	} else {

		this.position = initialState.position;
		// rgb object -> hex (we can't assign rgb object as background color)
		this.color = tinycolor(initialState.color).toHexString();
	}

	this.listener = listener;
	this.outerWidth = this._element.outerWidth();
	this.outerHeight = this._element.outerHeight();

	this._element.css('background-color', this.color);
	// then convert back to get rgb from green
	this.color = tinycolor(this._element.css('backgroundColor')).toHexString();

	if (orientation === 'horizontal') {

		const left = (parentElement.width() - this._element.outerWidth()) * (this.position);
		this._element.css('left', left);

	} else {

		const top = (parentElement.height() - this._element.outerHeight()) * (this.position);
		this._element.css('top', top);
	}

	this.drag = bind(this.drag, this);
	this.stop = bind(this.stop, this);
	this.clicked = bind(this.clicked, this);
	this.colorChanged = bind(this.colorChanged, this);

	this._element.draggable({
		axis: (orientation === 'horizontal') ? 'x' : 'y',
		drag: this.drag,
		stop: this.stop,
		containment: parentElement
	});
	this._element.css('position', 'absolute');
	this._element.click(this.clicked);
}
