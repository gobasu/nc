'use strict';
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var _blocks = {};

Handlebars.layouts = {};
Handlebars.registerHelper({
    extend: function() {
        var context = arguments[arguments.length - 1];
        var meta = context.data.root.__meta__;
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
        if (Handlebars.layouts[meta.theme + layout]) {
            return Handlebars.layouts[meta.theme + layout](context.data.root);
        }

        var layoutFilePath = path.join(meta.dir.theme, layout + ".html");
        if (!fs.existsSync(layoutFilePath)) {
            throw new Error("Layout file `" + layoutFilePath + "` does not exists");
        }

        var source = fs.readFileSync(layoutFilePath, 'utf8');
        Handlebars.layouts[meta.theme + layout] = Handlebars.compile(source);
        return Handlebars.layouts[meta.theme + layout](context.data.root);
    },
    block: function() {
        var context = arguments[arguments.length - 1];
        var meta = context.data.root.__meta__;
        var name = null;
        if (arguments.length > 1) {
            name = arguments[0];
        }

        //create block for template
        if (name) {
            _blocks[meta.theme] = _blocks[meta.theme] || {};
            _blocks[meta.theme][meta.name] = _blocks[meta.theme][meta.name] || {};
            _blocks[meta.theme][meta.name][name] = context.fn;
            _blocks[meta.theme][meta.name][name].mode = context.hash.mode || 'replace';
            return;
        }

        //use block
        if (!context.hash.define) {
            throw new Error("Layout's block elements must contain `define` attribute in template " + options.templatePath);
        }
        name = context.hash.define;
        var result;

        result = context.fn(context.data.root);

        if (_blocks[meta.theme] && _blocks[meta.theme][meta.name] && _blocks[meta.theme][meta.name][name]) {
            var block = _blocks[meta.theme][meta.name][name];
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
                    throw new Error('Unknown block mode `' + block.mode + '` used in layout by template ' + meta.file);
                    break;
            }
        }
        return result;
    }

});


module.exports = Handlebars;