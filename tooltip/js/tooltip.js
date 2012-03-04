/**
 *
 * jQuery accessible tooltip plugin
 * 
 * Main features:
 * Keyboard focus support
 * ARIA roles and states 
 * RTL support
 * supports both title attributes and inline content
 * 
 * Call it like so: $('.myelm').tooltip();
 * 
 * Author: Aki Karkkainen, www.akikoo.org
 * https://github.com/akikoo/Accessible-Patterns
 * 
 * Based on Scott Jehl's tooltip plugin, from the book 
 * Designing with Progressive Enhancement
 * 
 * CREDITS: 
 * http://filamentgroup.com/dwpe/
 * http://webaim.org/temp/tooltip.htm
 * http://test.cita.illinois.edu/aria/tooltip/tooltip1.php
 * http://hanshillen.github.com/jqtest/#goto_tooltip
 * http://dev.aol.com/dhtml_style_guide
 * 
 * Licensed under the MIT license
 * 
 */


;(function (window, $, undefined) {

	"use strict";

	// Plugin definition
	$.fn.tooltip = function (options) {

		// Extend our default options with those provided
		var settings = $.extend({}, $.fn.tooltip.defaults, options);

		return this.each(function () {

			// Assign the current tip element to a variable
			var $this = $(this);

			// Merge in the metadata elements (Metadata plugin) for this specific node
			var o = $.metadata ? $.extend({}, settings, $.metadata.get(this)) : settings;

			// Kick it off
			initTooltip($this, o);

		});
	};


	function initTooltip($obj, opts) {

		if ($obj.is('[title], [href^=#]')) {

			//generate a unique ID for the tooltip
			var ttID = 'tooltip-' + Math.round(Math.random() * 10000),

				//create tooltip container
				tooltip = $('<div class="' + opts.tipContainerClass + '" role="tooltip" id="' + ttID + '"></div>'),

				//Get the current tooltip position and width, for keyboard access
				tipCoordinates = $obj.position(),
				tipWidth = $obj.width();

			//populate tooltip with content, depending on source
			//if local anchor, grab referenced content
			//in that case, title attribute (if present) is ignored because we want to use inline content on the page instead
			if ($obj.is('[href^=#]') && $obj.attr('href').length > 1) {
				tooltip.append($($obj.attr('href')));
			} else if ($obj.is('[title]')) { //if title attr is present, use that
				tooltip.text($obj.attr('title'));
			}

			//apply attrs and events to tooltipped element
			$obj
				.removeAttr('title')				//remove redundant title attr
				.attr('aria-describedby', ttID);	//associate tooltip with element for screenreaders

			//events
			$(opts.wrapper).on({

				click: function (e) {
					if ($(e.target).is($obj)) {
						e.preventDefault();
					}
				},

				mouseover: function (e) {

					if ($(e.target).is($obj)) {
						var top = e.pageY - tooltip.outerHeight(),
							left = opts.rtl ? e.pageX - tooltip.outerWidth() : e.pageX + opts.pageXOffsetMouse;
						tooltip
						.appendTo('body')
						.removeClass(opts.hiddenClass)
						.attr('aria-hidden', false)
						.css({
							top: top,
							left: left
						});
					}
				},

				focusin: function (e) {

					if ($(e.target).is($obj)) {
						var top = tipCoordinates.top - tooltip.outerHeight() - opts.pageYOffsetKeyboard,
							left = opts.rtl ? tipCoordinates.left - tooltip.outerWidth() - opts.pageXOffsetKeyboard : tipCoordinates.left + tipWidth + opts.pageXOffsetKeyboard;
						tooltip
						.appendTo('body')
						.removeClass(opts.hiddenClass)
						.attr('aria-hidden', false)
						.css({
							top: top,
							left: left
						});
					}
				},

				mousemove: function (e) {

					if ($(e.target).is($obj)) {
						var top = e.pageY - tooltip.outerHeight(),
							left = opts.rtl ? e.pageX - tooltip.outerWidth() - opts.pageXOffsetMouse : e.pageX + opts.pageXOffsetMouse;
						tooltip
						.css({
							top: top,
							left: left
						});
					}
				},

				mouseout: function (e) {

					if ($(e.target).is($obj)) {
						tooltip.addClass(opts.hiddenClass).attr('aria-hidden', true);
					}
				},

				focusout: function (e) {

					if ($(e.target).is($obj)) {
						tooltip.addClass(opts.hiddenClass).attr('aria-hidden', true);
					}
				},

				//close tooltip on esc key press
				keydown: function (e) {

					var esc	= 27;	// 27: esc key

					if ($(e.target).is($obj)) {
						switch (e.which) {
							case esc:
								tooltip.addClass(opts.hiddenClass).attr('aria-hidden', true);
							break;
						}
					}
				}
			}, '.' + opts.tipClass); //filter the descendants of the elements that trigger the event

			//if the title attribute is in input element, 
			//find an associated label and set its describedby attr as well
			if ($obj.is('input')) {
				$('label[for="' + $obj.attr('id') + '"]').attr('aria-describedby', ttID);
			}

			//append the tooltip to the page with hidden class applied
			tooltip
				.addClass(opts.hiddenClass)
				.attr('aria-hidden', true)
				.appendTo('body');
		}
	}

	// Plugin defaults
	$.fn.tooltip.defaults = {
		wrapper				: '.content',	//parent element where the event handlers are bound
		tipClass			: 'tip',		//element that triggers tooltip; also a selector to filter the descendants of the elements that trigger the events
		tipContainerClass	: 'tooltip',	//element where the tooltip content is written
		hiddenClass			: 'tooltipHidden', 
		rtl					: $('html').attr('dir') === 'rtl' ? true : false,
		pageXOffsetMouse	: 20,	//vertical offset for mouse
		pageYOffsetMouse	: 35,	//horizontal offset for mouse
		pageXOffsetKeyboard : 10,	//vertical offset for keyboard
		pageYOffsetKeyboard : 5		//horizontal offset for keyboard
	};

}(window, jQuery));