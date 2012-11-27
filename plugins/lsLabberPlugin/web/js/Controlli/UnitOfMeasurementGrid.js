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
 * 
 */
Lab.UnitOfMeasurementGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'UnitOfMeasurement'
            },
            fields: ['id', 'name', 'symbol', 'created_at', 'updated_at'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Nome',
                dataIndex: 'name'
            },
            {
                header: 'Simbolo',
                dataIndex: 'symbol'
            }],
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200,
                editor: new Ext.form.TextField()
            }
        }),

        buttonsBar = new Ext.Toolbar({
            items: [{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                tooltip: 'Aggiunge una nuova unità di misura',
                handler: function (btn, ev) {
                    var position = sfStore.getCount();
                    self.stopEditing();
                    sfStore.insert(position, new sfStore.recordType());
                    self.startEditing(position, 1);
                }
            },
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina l\'unità di misura selezionata',
                handler: function (b, e) {
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'unità di misura selezionata?', function (b) {
                            if (b === 'yes') {
                                // FIXME: 'k is undefined'?
                                sfStore.remove(self.getSelectionModel().selection.record);
                            }
                        });
                    }
                }
            },
            '->',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'name',
                emptyText: 'Filtra per nome'
            },
            ' ',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'symbol',
                emptyText: 'Filtra per simbolo'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: buttonsBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.UnitOfMeasurementGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('unitofmeasurementgrid', Lab.UnitOfMeasurementGrid);