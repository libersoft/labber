/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true,
    white: true
*/

/*global
    Ext: true,
    Lab: true
*/

"use strict";

Ext.ns('Lab');

/**
 *  GridPanel in sola lettura per le tabelle limiti.
 */
Lab.LimitsTableGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {
        var pageSize = 25,

        sfStore = new Ext.data.DirectStore({
            autoLoad: {
                params: {
                    start: 0,
                    limit: pageSize
                }
            },
            directFn:   Lab.limits.list,
            fields:     ['id', 'name', 'certified_name', 'limits'],
            remoteSort: true,
            root:       'groups',
            sortInfo: {
                field: 'name'
            }
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns: [{
                header:     'Nome',
                dataIndex:  'name'
            },
            {
                header:     'Nome sul certificato',
                dataIndex:  'certified_name'
            }]
        }),

        filters = new Ext.ux.grid.GridFilters({
            encode:         true,
            menuFilterText: 'Filtri',
            filters: [{
                type:       'string',
                dataIndex:  'name'
            },
            {
                type:       'string',
                dataIndex:  'certified_name'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo:    true,
                pageSize:       pageSize,
                plugins:        [filters],
                store:          sfStore
            }),
            border:     false,
            colModel:   colModel,
            loadMask:   true,
            plugins:    [filters],
            store:      sfStore,
            stripeRows: true,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.LimitsTableGrid.superclass.constructor.call(this, config);

        this.on('rowdblclick', function (grid, rowIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            this.detailWindow(record, e);
        });
    },

    detailWindow: function (record, e) {
        var filters = new Ext.ux.grid.GridFilters({
            local:          true,
            menuFilterText: 'Filtri',
            filters: [{
                type:       'string',
                dataIndex:  'denomination'
            },
            {
                type:       'string',
                dataIndex:  'alias'
            }]
        }),

        win = new Ext.Window({
            title:          'Limiti per "' + record.data.name + '"',
            width:          640,
            height:         480,
            layout:         'fit',
            maximizable:    true,
            modal:          true,
            items: {
                xtype:  'grid',
                border: false,
                columns: [new Ext.grid.RowNumberer(), {
                    header:     'Denominazione',
                    dataIndex:  'denomination'
                },
                {
                    header:     'Alias',
                    dataIndex:  'alias'
                },
                {
                    header:     'Unità di misura',
                    dataIndex:  'unit'
                },
                {
                    header:     'Valore',
                    dataIndex:  'value'
                }],
                plugins:    [filters],
                store: {
                    xtype:  'jsonstore',
                    data:   record.data,
                    fields: ['id', 'denomination', 'alias', 'unit', 'value'],
                    root:   'limits'
                },
                viewConfig: {
                    forceFit: true
                }
            }
        });

        win.show(e.getTarget());
    }
});

Ext.reg('limitstablegrid', Lab.LimitsTableGrid);
