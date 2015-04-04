app.compose(function() {
    "use strict";

    app.set('dispatcher', function() {
        var handlers = [];
        var is = app.get('is');
        var cmdController = app.controller('cmdController');

        return {
            dispatch: function(rawInput) {
                var input = rawInput.trim();
                var handler = this.findHandler(input);

                if(handler != null) {

                    if(app.debugMode) {
                        this.invokeHandler(input, handler);
                    } else {
                        try {
                            this.invokeHandler(input, handler);
                        } catch (e) {
                            this.displayCommandError(input, "Error: " + e);
                        }
                    }
                }
                else {
                    this.displayCommandError(input, "Unsupported expression: " + input.trim());
                }
            },
            commands: function(catalog) {
                for(var key in catalog) {
                    if(catalog.hasOwnProperty(key)) {
                        this.command(key, catalog[key]);
                    }
                }
            },
            command: function(cmd, handler) {
                var h = this.createHandler(cmd, handler);
                if(h == null){
                    console.warn('unexpected set of arguments: ', Array.prototype.splice.call(arguments));
                    return;
                }

                if(!is.aFunction(h.canHandle)) {
                    console.warn('handler is missing "canHandle" function. registration denied.');
                    return;
                }

                if(!is.aFunction(h.handle)) {
                    console.warn('handler is missing "handle" function. registration denied.');
                    return;
                }

                handlers.push(h);
            },
            createHandler: function(cmd, handler) {
                if(is.plainObject(cmd)) {
                    return cmd;
                }

                if(is.string(cmd)) {
                    return { canHandle: function (input) { return input === cmd; }, handle: handler };
                }

                return null;
            },
            findHandler: function (input) {
                var i= 0;
                for(i;i<handlers.length; i++) {
                    if(handlers[i].canHandle(input)) {
                        return handlers[i];
                    }
                }
            },
            invokeHandler: function (input, handler) {
                var cmdResult = handler.handle(input);
                if(cmdResult != null) {
                    var r = new app.models.DisplayResult(input, cmdResult);
                    cmdController.display(r);
                }
            },
            displayCommandError: function (input, message) {
                var error = new app.models.ErrorResult(message);
                cmdController.display(new app.models.DisplayResult(input, error));
            }
        };
    });
});
