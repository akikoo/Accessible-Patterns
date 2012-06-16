/**
 *
 * jQuery accessible tabs plugin
 * 
 * Main features:
 * Keyboard support with arrow keys
 * ARIA roles and states 
 * RTL support
 * Multiple tab instances on a page
 * 
 * Call it like so: $('.myelm').tabs();
 * 
 * Author: Aki Karkkainen, www.akikoo.org
 * https://github.com/akikoo/Accessible-Patterns
 * 
 * CREDITS:
 * http://www.alistapart.com/articles/aria-and-progressive-enhancement/
 * https://github.com/filamentgroup/Accessible-jQuery-Tabs
 * http://test.cita.illinois.edu/aria/tabpanel/tabpanel1.php
 * http://hanshillen.github.com/jqtest/#goto_tabs
 * http://dev.aol.com/dhtml_style_guide
 * 
 * Licensed under the MIT license
 * 
 */


;(function (window, $, undefined) {

    'use strict';

    // Plugin definition	
    $.fn.tabs = function (options) {

        // Extend default options with those provided
        var settings = $.extend({}, $.fn.tabs.defaults, options);

        return this.each(function (i) {

            // Assign the current tab container to a variable
            var $this = $(this),

                // Merge in the metadata elements (Metadata plugin) for this specific node
                o = $.metadata ? $.extend({}, settings, $.metadata.get(this)) : settings;

            // Kick it off
            initTabs($this, o, i);

        });

    };


    function initTabs($obj, opts, count) {

        var tabContainerID      = opts.tabContainerClass + (count + 1), //unique ID for each tab container
            $tabList            = $obj.find('.' + opts.tabListClass),   //tab list
            $tabAnchor          = $tabList.find('li > a'),              //tab list anchor			
            tabPanel            = $obj.find('.' + opts.panelClass),     //tab panel
            tabPanelNum         = tabPanel.length,                      //Number of panels in each tab widget
            tabID               = tabContainerID + opts.tabIDprefix,    //unique ID for each tab
            panelID             = tabContainerID + opts.panelIDprefix,  //unique ID for each panel
            i;                                                          //counter for assigning unique IDs and ARIA attributes

        //set unique ID for each tab container
        $obj.attr({
            'id': tabContainerID,
            'aria-multiselectable': false
        });

        //set ARIA role attribute to the tab list
        $tabList.attr({
            'role': 'tablist'
        });

        //Generate IDs and ARIA attributes for tabs and panels
        for (i = 1; i <= tabPanelNum; i += 1) {

            //For each tab control, set ID, tabindex and aria attributes
            //Also set presentation role for each tab control parent (list item)
            $tabAnchor.eq(i - 1).attr({
                'id': tabID + i,
                'role': 'tab',
                'aria-selected': 'false',
                'aria-controls': panelID + i,
                'href': '#' + panelID + i,
                'tabindex': '-1'
            }).parent().attr('role', 'presentation');

            //for each individual tab panel, set ID and aria role attributes, and hide it
            tabPanel.eq(i - 1).attr({
                'id': panelID + i,
                'aria-labelledby': tabID + i,
                'role': 'tabpanel',
                'aria-hidden': 'true'
            }).hide();

        }

        //set state for the first tab list anchor
        $tabList.find('li:first').addClass(opts.selClass).find('> a').attr({
            'aria-selected': 'true',
            'tabindex': '0'
        });

        //show the first tabPanel
        $obj.find('.' + opts.panelClass + ':first').attr({
            'aria-hidden': 'false'
        }).show();


        //Generic function to handle tab change 
        function selectTab($tab) {

            //hide previously selected tab panel
            $obj.find('.' + opts.panelClass + ':visible').attr({
                'aria-hidden': 'true'
            }).hide();

            //show newly selected tab panel
            $obj.find('.' + opts.panelClass).eq($tab.parent().index()).attr({
                'aria-hidden': 'false'
            }).show();

            //change state of previously selected tab list anchor
            $tabList.find(' > .' + opts.selClass).removeClass(opts.selClass).find('> a').attr({
                'aria-selected': 'false',
                'tabindex': '-1'
            });

            //set state of newly selected tab list anchor
            $tab.attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).parent().addClass(opts.selClass);

            //focus in the newly selected tab list anchor
            $tab.focus();
        }


        //Attach event listeners
        $tabList.on({

            //set the click event for each tab link		
            click: function (e) {

                //Switch tabs
                selectTab($(this));

                //prevent default action
                e.preventDefault();

            },

            //set keydown events on tab list anchors for navigating tabs
            keydown: function (e) {

                // Define values for keycodes
                var prev    = opts.rtl ? 39 : 37,   // 37: left arrow
                    next    = opts.rtl ? 37 : 39,   // 39: right arrow
                    up      = 38,                   // 38: up arrow
                    down    = 40,                   // 40: down arrow
                    home    = 36,                   // 36: home key
                    end     = 35,                   // 35: end key
                    $tab    = null;                 // current tab anchor

                switch (e.which) {

                case prev:
                case up:
                    e.preventDefault();
                    if ($(this).parent().prev().length !== 0) {
                        $tab = $(this).parent().prev().find('> a');
                    } else {
                        $tab = $tabList.find('li:last > a');
                    }
                    //Switch tabs
                    selectTab($tab);
                    break;

                case next:
                case down:
                    e.preventDefault();
                    if ($(this).parent().next().length !== 0) {
                        $tab = $(this).parent().next().find('> a');
                    } else {
                        $tab = $tabList.find('li:first > a');
                    }
                    //Switch tabs
                    selectTab($tab);
                    break;

                case home:
                    e.preventDefault();
                    $tab = $tabList.find('li:first > a');
                    //Switch tabs
                    selectTab($tab);
                    break;

                case end:
                    $tab = $tabList.find('li:last > a');
                    //Switch tabs
                    selectTab($tab);
                    break;
                }
            }
        }, 'li > a');
    }


    // Plugin defaults
    $.fn.tabs.defaults = {
        tabContainerClass   : 'tabs',
        tabIDprefix         : '-t',
        tabListClass        : 'tabList',
        panelIDprefix       : '-p',
        panelClass          : 'tabPanel',
        selClass            : 'selected',
        rtl                 : $('html').attr('dir') === 'rtl' ? true : false
    };

}(window, jQuery));