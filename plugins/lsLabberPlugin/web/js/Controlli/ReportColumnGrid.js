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
Lab.ReportColumnGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'ReportColumn'
            },
            fields: ['id', 'name', 'created_at', 'updated_at'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Nome',
                dataIndex: 'name'
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
                tooltip: 'Aggiunge una colonna report',
                handler: function (btn, ev) {
                    var position = sfStore.getCount();
                    self.stopEditing();
                    sfStore.insert(0, new sfStore.recordType());
                    self.startEditing(0, 1);
                }
            },
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina una colonna report',
                handler: function (b, e) {
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare una nuova colonna report?', function (b) {
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
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Colonne Report da {0} a {1} di {2}',
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

        Lab.ReportColumnGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('reportcolumngrid', Lab.ReportColumnGrid);
