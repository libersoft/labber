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
 *  Griglia che elenca gli utenti del sistema
 */
Lab.SampleTypeGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var pageSize = 50,

        self = this,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'SampleType'
                //doctrineJoins: ['Order.Customer'],
            },
            fields: [{
                name: 'id'
            },
            {
                name: 'name'
            },
            {
                name: 'description'
            },
            {
                name: 'notes'
            },
            {
                name: 'created_at',
                type: 'date',
                dateFormat: 'Y-m-d H:i:s'
            }],
            pageSize: pageSize
        }),


        colModel = new Ext.grid.ColumnModel({
           
            defaults: {
                width: 160,
                sortable: true
            },
            columns: [{
                header: 'Nome',
                dataIndex: 'name'
       
            },
            {
                header: 'Descrizione',
                dataIndex: 'description'

            }]
        }),

        newWindow = function () {
            var win = new Lab.ObjectWindow({
                title: 'Nuovo prodotto',
                doctrineClass: 'SampleType',
                iconCls: 'icon-sampleType',
                width: 600,
                height: 400,
                minWidth: 300,
                minHeight: 200,
                tabItems: [new Lab.SampleType({recordId: 'new'})],
                listeners: {
                    objectsaved: function () {
                        Ext.Msg.show({
                            title:'Prodotto creato',
                            msg: 'Il prodotto è stato creato con successo.',
                            buttons: Ext.Msg.OK,
                            fn: function () {self.store.reload()}, 
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
            });
            win.show();
        },

        editWindow = function (record) {
            var win = new Lab.ObjectWindow({
                title: 'Modifica "' + record.data.name + '"',
                iconCls: 'icon-sampleType',
                width: 600,
                height: 400,
                minWidth: 300,
                minHeight: 200,
                doctrineClass: 'SampleType',
                record: record,
                tabItems: [new Lab.SampleType({recordId: record.id}),new Lab.MatrixSampleType({recordId: record.id})],
                listeners: {
                    objectsaved: function () {
                        Ext.Msg.show({
                            title:'Prodotto modificato',
                            msg: 'Il prodotto è stato modificato con successo.',
                            buttons: Ext.Msg.OK,
                            fn: function () {self.store.reload()}, 
                            icon: Ext.MessageBox.INFO 
                        });
                    }
                }
                });
            win.show();
        },

        topToolbar = new Ext.Toolbar({
            items: [{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                handler: newWindow
            },
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                handler: function (b, e) {
                    Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i prodotti selezionati?', function (b) {
                        if (b === 'yes') {
                            sfStore.remove(self.getSelectionModel().selection.record);
                        }
                    });
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
                displayMsg: 'Visualizzati prodotti da {0} a {1} di {2}',
                emptyMsg: 'Non ci sono prodotti da visualizzare',
                pageSize: pageSize,
                //plugins: [filters],
                store: sfStore
            }),
            border: false,
            cm: colModel,
            listeners: {
                rowdblclick: function (grid, rowIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                    editWindow(record);
//                    var orderId = record.get('id');
//                    openOrderWindow(orderId, e.getTarget());
                }
            },
            loadMask: true,
//            stateId: 'accettazionegrigliaordini',
//            stateful: true,
            store: sfStore,
            //plugins: [filters],
            stripeRows: true,
            tbar: topToolbar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.SampleTypeGrid.superclass.constructor.call(this, config);

    }
});

Ext.reg('sampleTypeGrid', Lab.SampleTypeGrid);
