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
Lab.AnalyticalTechnique = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'AnalyticalTechnique'
            },
            fields: ['id', 'name', 'code', 'description', 'created_at', 'updated_at'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Nome',
                dataIndex: 'name'
            },
            {
                header: 'Codice',
                dataIndex: 'code',
                width: 120
                
            },
            {
                header: 'Descrizione',
                dataIndex: 'description',
                editor: new Ext.form.TextArea()
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
                tooltip: 'Aggiunge una nuova tecnica analitica',
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
                tooltip: 'Elimina la tecnica analitica selezionata',
                handler: function (b, e) {
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare la tecnica analitica selezionata?', function (b) {
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
                name: 'code',
                emptyText: 'Filtra per codice'
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

        Lab.AnalyticalTechnique.superclass.constructor.call(this, config);
    }
});

Ext.reg('analyticalTechnique', Lab.AnalyticalTechnique);
