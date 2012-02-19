/**
 *
 * jQuery accessible accordion plugin
 * 
 * Main features:
 * ARIA roles and states 
 * Multiple accordion instances on a page
 * 
 * Call it like so: $('.myelm').accordion();
 * 
 * Author: Aki Karkkainen, www.akikoo.org
 * 
 * CREDITS:
 * https://github.com/filamentgroup/jQuery-Collapsible-Content
 * http://test.cita.illinois.edu/aria/tabpanel/tabpanel2.php
 * 
 * Licensed under the MIT license
 * 
 */


;(function (window, $, undefined) {

	'use strict';

	// Plugin definition	
	$.fn.accordion = function (options) {

		// Extend default options with those provided
		var settings = $.extend({}, $.fn.accordion.defaults, options);

		return this.each(function (i) {

			// Assign the current accordion container to a variable
			var $this = $(this);

			// Merge in the metadata elements (Metadata plugin) for this specific node
			var o = $.metadata ? $.extend({}, settings, $.metadata.get(this)) : settings;

			// Kick it off
			initAccordion($this, o, i);

		});

	};


	function initAccordion($obj, opts, count) {

		var accContainerID		= opts.accContainerClass + (count + 1),	//unique ID for each accordion container
			$tabHeading			= $obj.find('.' + opts.tabHeadingClass),//accordion heading
			$tabPanel			= $obj.find('.' + opts.panelClass),		//accordion panel
			tabHeadingNum		= $tabHeading.length,					//Number of headings in each accordion widget
			tabID				= accContainerID + opts.tabIDprefix,	//unique ID for each accordion heading
			panelID				= accContainerID + opts.panelIDprefix,	//unique ID for each accordion panel
			i;															//counter for assigning unique IDs and ARIA attributes 

		//set unique ID for each accordion container
		$obj.attr({
			'id': accContainerID,
			'aria-multiselectable': true
		});

		//generate an anchor and span inside each header, to track state 
		$tabHeading
			.prepend('<span class="' + opts.statusClass + '"></span>')
			.wrapInner('<a href="#"></a>');

		//Generate IDs and ARIA attributes for tabs and panels
		for (i = 1; i <= tabHeadingNum; i += 1) {

			//For each accordion control, set ID, tabindex and aria attributes
			//Also set presentation role for each accordion heading control
			$tabHeading.find('a').eq(i - 1).attr({
				'id': tabID + i,
				'role': 'tab',
				'aria-selected': 'false',
				'aria-controls': panelID + i,
				'href': '#' + panelID + i,
				'tabindex': '-1'
			}).parent().attr('role', 'presentation');

			//for each individual accordion panel, set ID and aria role attributes, and hide it
			$tabPanel.eq(i - 1).attr({
				'id': panelID + i,
				'aria-labelledby': tabID + i,
				'role': 'tabpanel',
				'aria-hidden': 'true'
			}).hide();

		}

		//set state for the first accordion heading anchor
		$obj.find('.' + opts.tabHeadingClass + ':first').find('> a').attr({
			'tabindex': '0'
		});

		//set collapsed heading class
		$obj.find('.' + opts.tabHeadingClass).addClass(opts.collapsedClass);


		//Generic function to handle panel hiding 
		function collapse(anchor) {
			anchor
				.attr({
					'aria-selected': 'false',
					'tabindex': '0'
				})
				.parent('.' + opts.tabHeadingClass)
				.addClass(opts.collapsedClass)
				.find('.' + opts.statusClass).text(opts.showText);

			//hide previously selected tab panel
			anchor
				.parent('.' + opts.tabHeadingClass)
				.next('.' + opts.panelClass)
				.attr({
					'aria-hidden': true
				})
				.slideUp(100);
		}


		//Generic function to handle panel showing 
		function expand(anchor) {
			anchor
				.attr({
					'aria-selected': 'true',
					'tabindex': '0'
				})
				.parent('.' + opts.tabHeadingClass)
				.removeClass(opts.collapsedClass)
				.find('.' + opts.statusClass).text(opts.hideText);

			//change state of previously selected tab list anchor
			//show newly selected tab panel
			anchor
				.parent('.' + opts.tabHeadingClass)
				.next('.' + opts.panelClass)
				.attr({
					'aria-hidden': false
				})
				.slideDown(100);
		}


		//Generic function to handle focus
		function handleFocus($currentTab, $newTab) {

			//change state of previously selected tab list anchor
			$currentTab.attr({
				'tabindex': '-1'
			});

			$newTab.attr({
				'tabindex': '0'
			}).focus();

		}

		//Attach event listeners		

		//set the click event for each accordion heading link
		$tabHeading.on('click', 'a', function (e) {
				if ($(this).parent().is('.' + opts.collapsedClass)) {
					expand($(this));
				} else {
					collapse($(this));
				}

				//prevent default action
				return false;

		})

		//set keydown events on tab list anchors for navigating tabs
		.on('keydown', 'a', function (e) {

			// Define values for keycodes
			var prev	= opts.rtl ? 39 : 37,	// 37: left arrow
				next	= opts.rtl ? 37 : 39,	// 39: right arrow
				up		= 38,					// 38: up arrow
				down	= 40,					// 40: down arrow
				home	= 36,					// 36: home key
				end		= 35,					// 35: end key				
				$tab	= null;					// current tab anchor

			switch (e.which) {

				case prev:
				case up:
					e.preventDefault();
					if ($(this).parent('.' + opts.tabHeadingClass).prevAll('.' + opts.tabHeadingClass).length !== 0) {
						$tab = $(this).parent('.' + opts.tabHeadingClass).prevAll('.' + opts.tabHeadingClass + ':first').find('> a');
					} else {
						$tab = $obj.find('.' + opts.tabHeadingClass + ':last').find('> a');
					}
					handleFocus($(this), $tab);
				break;

				case next:
				case down:
					e.preventDefault();
					if ($(this).parent('.' + opts.tabHeadingClass).nextAll('.' + opts.tabHeadingClass).length !== 0) {
						$tab = $(this).parent('.' + opts.tabHeadingClass).nextAll('.' + opts.tabHeadingClass + ':first').find('> a');
					} else {
						$tab = $obj.find('.' + opts.tabHeadingClass + ':first').find('> a');
					}
					handleFocus($(this), $tab);
				break;

				case home:
					e.preventDefault();
					$tab = $obj.find('.' + opts.tabHeadingClass + ':first').find('> a');
					handleFocus($(this), $tab);
					break;

				case end:
					e.preventDefault();
					$tab = $obj.find('.' + opts.tabHeadingClass + ':last').find('> a');
					handleFocus($(this), $tab);
					break;

			}
		});
	}


	// Plugin defaults
	$.fn.accordion.defaults = {
		accContainerClass: 'acc',
		tabIDprefix: '-t',
		statusClass: 'accStatus',
		tabHeadingClass: 'accHeading',
		collapsedClass: 'accHeadingCollapsed',
		panelIDprefix: '-p',
		panelClass: 'accPanel',
		selClass: 'selected',
		rtl: $('html').attr('dir') === 'rtl' ? true : false,
		hideText: 'Hide',
		showText: 'Show'
	};

}(window, jQuery));
