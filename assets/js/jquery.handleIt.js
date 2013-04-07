/*
 * jQuery handleIt v0.9
 * http://www.panarican.com
 *
 * Copyright 2013 - Efrain Lugo
 * Free to use under the GPLv2 license.
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Contributing author: Efrain Lugo (@panarican)
 */
(function ($) {
    $.fn.handleIt = function (options) {
        // settings defaults
        var settings = $.extend({
            "json": null, // Required : Accepts a string (url) or object (JSON data) 
            "name": null, // Required : Name of template file your loading
            "path": "/assets/templates/", // Optional : Location of template file
            "container": "body", // Optional : Location where script tag is getting appendedTo
            "refresh": null, // Optional : Refreshes data into html (accepts an integer > 500 miliseconds)
            "callback": function () {} // Optional : Callback function when template finishes rendering html
        }, options);
        // plugin methods
        var plugin = {
            getTemplate: function (settings, index) {
                var $template = $('script[data-template="' + settings.name + '"]', settings.container);
                if ($template.length) {
                    // template
                    return $template.html();
                } else {
                    // get template source from external file
                    var templatePath = settings.path + settings.name + ".handlebars";
                    return $.get(templatePath, function (data) {
                        // store code into script element, for the future
                        var $template = $('<script/>', {
                            'type': 'text/x-handlebars-template',
                            'data-template': settings.name
                        }).html(data);
                        // append template to container
                        $template.appendTo(settings.container);
                    })
                }
            },
            getData: function (settings, index) {
                return (typeof settings.json === "object") ? settings.json : $.getJSON(settings.json);
            },
            setTemplate: function ($this, settings, index) {
                // wait for getTemplate and getData then set the global vars
                $.when(plugin.getTemplate(settings, index), plugin.getData(settings, index))
                    .then(function (template, data) {
                    // Template and Data vars
                    var theTemplate = (typeof template === "object") ? template[0] : template,
                        theData = data[0];
                    // Check Template and Data 
                    if (typeof theTemplate != "string") {
                        $.error("Oh no... your template " + settings.name + " didn't work!");
                    } else if (typeof theData != "object" && data[1] != "success") {
                        $.error("Oh no... your data " + settings.json + " didn't work!");
                    } else {
                        var template = Handlebars.compile(theTemplate);
                        $this.html(template(theData));
                        // check for callback then run if function
                        typeof settings.callback != "function" || settings.callback();
                    }
                });
            },
            errorChecks: function (settings) {
                // Handlebars Check
                typeof Handlebars != "undefined" || $.error("Handlebars is undefined");
                // Required Data Check
                !! settings.json && !! settings.name || $.error("json and name options are required");
            }
        }
        return this.each(function (index, value) {
            // this vars
            var $this = $(this),
                thisSettings = settings,
                thisData = $this.data(),
                thisSettings = $.extend(thisSettings, thisData);
            // store data on this element
            $this.data(thisSettings);
            // user error checking
            plugin.errorChecks($this.data());
            // setTemplate
            plugin.setTemplate($this, $this.data(), index);
            // check integer value
            if (typeof $this.data().refresh === "number" && $this.data().refresh > 499) {
                setInterval(function () {
                    plugin.setTemplate($this, $this.data(), index);
                }, $this.data().refresh);
            }
        });
    };
})(jQuery);