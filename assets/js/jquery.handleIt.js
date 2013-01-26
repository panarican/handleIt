;(function( $ ){

  $.fn.handleIt = function( options ) {  

    // handleIt Settings Defaults
    var settings = $.extend( {
        "json"              : "",               // Required : Accepts a string (url) or object (JSON data) 
        "name"              : "",               // Required : Name of template file your loading
        "path"              : "../templates/",  // Optional: Location of template file
        "container"         : "body",           // Optional: Location where script tag is getting appendedTo
        "callback"          : ""                // Optional: Callback when template finishes rendering html 
    }, options);
      
            
    return this.each(function() { 
      
    // jquery this
    $this = $(this);
                
    // Handlebars Check
    typeof Handlebars != "undefined" || $.error("Handlebars is undefined");
        
    // html5 data attribute check
    !$this.data() || var settings = $(settings, $this.data());     
        
    // Settings Check
    (!!settings.json && !!settings.name) || $.error("json and name options are required");
    
    // load template    
    $.when(this.getTemplate(),this.getData())
       .then(function(source) {
         var template = Handlebars.compile(source);
         $this.html(template(json));
       });
    };
 
    // get template
    this.getTemplate = function() {
      var $template = $('script[data-template="'+settings.name+'"]', settings.container);
 
      if ($template.length) {
        // get template source from a script element
        return $template.html();
      } else {
        // get template source from external file
          var templatePath = settings.path + settings.name + ".handlebars";
        return $.get(templatePath).then(function(data) {
                  // store code into script element, for the future
                  $template = $('<script/>', {
                                  'type': 'text/x-handlebars-template',
                                  'data-template': settings.name
                                }).html(data);
                  $template.appendTo(settings.container);
                }).promise()
                .error( $.error("failed to get template from " + templatePath) );
      }
    };
      
    // get data
    this.getData = function(){
        
       if(typeof settings.json === "object") {
            return settings.json;   
       } else {
           return $.getJSON(settings.json).then(function(data) {
               settings.json = data;
           }).promise()
           .error( $.error("failed to get data from " + settings.json) );
       } 
    };
    });

  };
})( jQuery );