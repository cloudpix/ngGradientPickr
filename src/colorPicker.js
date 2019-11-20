'use strict';

import * as $ from 'jquery';
import {bind} from './utils';

// ControlPtConfig

ColorPicker.prototype = {

	show(position, color, listener) {

		this.visible = true;
		this.listener = listener;
		this._element.css('visibility', 'visible');

		this._pickr.ColorPickerSetColor(color);
		this._pickr.css("background-color", color);

		if (this._options.orientation === 'horizontal') {
			this._element.css('left', position.left);
		} else {
			this._element.css('top', position.top);
		}
	},

	hide() {

		if (!this.visible) return;

		this._element.css('visibility', 'hidden');
		this.visible = false;
	},

	getListener() {
		return this.listener;
	},

	colorChanged(hsb, hex, rgb) {
		hex = "#" + hex;
		this.listener.colorChanged(hex);
		this._pickr.css("background-color", hex)
	},

	removeClicked() {
		this.listener.removeClicked();
		this.hide();
	}

};

export function ColorPicker(parentElement, options) {

	this._element = $('<div class="gradientPicker-ptConfig" style="visibility: hidden"></div>');
	parentElement.append(this._element);

	const pickr = $('<div class="color-chooser"></div>');
	this._element.append(pickr);

	const removeButton = $("<div class='gradientPicker-close'></div>");
	this._element.append(removeButton);

	this.colorChanged = bind(this.colorChanged, this);
	this.removeClicked = bind(this.removeClicked, this);

	pickr.ColorPicker({
		onChange: this.colorChanged,
		onShow(cp) {
			$(cp).show();
			return false;
		},
		onHide(cp) {
			$(cp).hide();
			return false;
		}
	});

	this._pickr = pickr;
	this._options = options;
	this.visible = false;

	removeButton.click(this.removeClicked);
}