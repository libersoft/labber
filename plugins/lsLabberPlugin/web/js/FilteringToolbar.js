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
 * Una toolbar per dei Field che filtrano uno Store
 *
 * Il field.name dev'essere l'attributo da filtrare
 */
Lab.FilteringToolbar = Ext.extend(Ext.Toolbar, {

    constructor: function (config) {

        config = Ext.apply({
            defaults: {
                applyState: function (state) {
                    if (state) {
                        this.setValue(state.value);

                        var filters = {};
                        filters[this.name] = {
                            field:      this.name,
                            operator:   '=',
                            value:      state.value
                        };
                        config.store.load({
                            params: {
                                filters: filters
                            }
                        });
                    }
                },
                getState: function () {
                    var value = this.getValue();
                    return {
                        value: value
                    };
                },
                listeners: {
                    select: function (field) {
                        var lastOptions = (config.store.lastOptions) ? config.store.lastOptions : {
                            params: {}
                        },

                        filter = {
                            field:      field.name,
                            operator:   '=',
                            value:      field.getValue()
                        };

                        if (!lastOptions.params.filters) {
                            lastOptions.params.filters = {};
                        }
                        lastOptions.params.filters[field.name] = filter;
                        lastOptions.params.start = 0;

                        config.store.reload(lastOptions);
                    },
                    check: function (field, checked) {
                        
                        var lastOptions = (config.store.lastOptions) ? config.store.lastOptions : {
                            params: {}
                        },

                        filter = {
                            field:      field.name,
                            operator:   '=',
                            value:      field.getValue()
                        };
                        
                        if (!lastOptions.params) lastOptions = {
                            params:{}
                        };
                        if (!lastOptions.params.filters) {
                            lastOptions.params.filters = {};
                        }
                        if(checked){
                            lastOptions.params.filters[field.name] = filter;
                        }
                        else{
                            delete lastOptions.params.filters[field.name];
                        }
                        lastOptions.params.start = 0;

                        config.store.reload(lastOptions);
                    },
                    cleared: function (field) {
                        var lastOptions = config.store.lastOptions;
                        delete lastOptions.params.filters[field.name];
                        config.store.reload(lastOptions);
                    }
                }
            }
        }, config);

        Lab.FilteringToolbar.superclass.constructor.call(this, config);

        this.addSeparator();
        this.add({
            text:       this.buttonText !== undefined ? this.buttonText : 'Mostra tutti',
            hidden:     this.hideButton,
            iconCls:    'icon-small-broom',
            handler: function () {
                Ext.each(this.items.items, function (item) {
                    if (Ext.isFunction(item.setValue)) {
                        item.setValue();
                    }
                });
                var lastOptions = this.store.lastOptions;
                if (lastOptions === null) {
                    lastOptions = {
                        params: {}
                    }
                } else {
                    delete lastOptions.params.filters;
                }
                this.store.reload(lastOptions);
            },
            scope: this
        });
    }
});

Ext.reg('filteringtoolbar', Lab.FilteringToolbar);