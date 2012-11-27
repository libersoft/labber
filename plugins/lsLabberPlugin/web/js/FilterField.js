/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true
    
*/

/*global
    Ext: true,
    Lab: true
*/

"use strict";

Ext.ns('Lab');

/**
 * Un FilterField.
 *
 * Basta passargli lo 'store' sul quale filtrare per l'attributo 'name'
 */
Lab.FilterField = Ext.extend(Ext.form.TwinTriggerField, {

    constructor: function (config) {

        config = Ext.apply({
            hasSearch: false,
            hideTrigger1: true,
            listeners: {
                specialkey: function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        this.onTrigger2Click();
                    }
                }
            },
            trigger1Class: 'x-form-clear-trigger',
            trigger2Class: 'x-form-search-trigger',
            validateOnBlur: false,
            validationEvent: false,
            width: 180,

            onTrigger1Click: function() {
                if (this.hasSearch) {
                    this.el.dom.value = '';
                    var lastOptions = this.store.lastOptions;
                    delete lastOptions.params.filters[this.name];
                    this.store.reload(lastOptions);
                    this.triggers[0].hide();
                    this.hasSearch = false;
                }
            },

            onTrigger2Click: function () {
                var v = this.getRawValue();
                if (v.length < 1) {
                    this.onTrigger1Click();
                    return;
                }
                var lastOptions = this.store.lastOptions;
                var filter = {
                    field:      this.name,
                    operator:   'REGEXP',
                    value:      v
                };
                if (!lastOptions.params.filters) {
                    lastOptions.params.filters = {};
                }
                lastOptions.params.filters[this.name] = filter;
                lastOptions.params.start = 0;
                this.store.reload(lastOptions);
                this.hasSearch = true;
                this.triggers[0].show();
            }
        }, config);

        Lab.FilterField.superclass.constructor.call(this, config);
    }
});

Ext.reg('filterfield', Lab.FilterField);