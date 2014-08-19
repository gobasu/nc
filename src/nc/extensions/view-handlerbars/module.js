'use strict';
var Handlebars = require('handlebars');
var fs = require('fs');

var _blocks = {};

Handlebars.layouts = {};
Handlebars.registerHelper({
    extend: function() {
        var context = arguments[arguments.length - 1];
        var options = context.data.root._options;
        var layout;

        if (arguments.length > 1) {
            layout = arguments[0];
        }
        layout = context.hash.layout ? context.hash.layout : layout;
        if (!layout) {
            throw new Error("Extend block requires `layout` attribute");
        }

        //parse blocks
        context.fn(context.data.root);

        //cached partial
        if (Handlebars.layouts[layout]) {
            var result = Handlebars.layouts[layout](context.data.root);
            return result;
        }

        var layoutFilePath = options.layoutDir + "/" + layout + ".hb";
        if (!fs.existsSync(layoutFilePath)) {
            throw new Error("Layout file `" + layoutFilePath + "` does not exists");
        }

        var source = fs.readFileSync(layoutFilePath, 'utf8');
        Handlebars.layouts[layout] = Handlebars.compile(source);
        return Handlebars.layouts[layout](context.data.root);
    },
    block: function() {
        var context = arguments[arguments.length - 1];
        var options = context.data.root._options;
        var result;
        if (arguments.length > 1) {
            var name = arguments[0];
        } else {
            var name = null;
        }

        //create block for template
        if (name) {
            _blocks[options.moduleName] = _blocks[options.moduleName] || {};
            _blocks[options.moduleName][options.templateName] = _blocks[options.moduleName][options.templateName] || {};
            _blocks[options.moduleName][options.templateName][name] = context.fn;
            _blocks[options.moduleName][options.templateName][name].mode = context.hash.mode || 'replace';
            return;
        }

        //use block
        if (!context.hash.define) {
            throw new Error("Layout's block elements must contain `define` attribute in template " + options.templatePath);
        }
        name = context.hash.define;
        result = context.fn(context.data.root);

        if (_blocks[options.moduleName] && _blocks[options.moduleName][options.templateName] &&
            _blocks[options.moduleName][options.templateName][name]) {
            var block = _blocks[options.moduleName][options.templateName][name];
            switch (block.mode) {
                case 'append':
                    result += block(context.data.root);
                    break;
                case 'prepend':
                    result = block(context.data.root) + result;
                    break;
                case 'replace':
                    result = block(context.data.root);
                    break;
                default:
                    throw new Error('Unknown block mode in layout used by template ' + options.templatePath);
                    break;
            }
        }

        return result;
    }

});


