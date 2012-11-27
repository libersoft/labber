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

Lab.MethodReportColumnGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'MethodReportColumn',
                doctrineJoins: ['MethodReportColumn.ReportColumn'],
                doctrineWheres: [{
                    field: 'method_id',
                    operator: '=',
                    value: config.methodId
                }]
            },
            fields: ['id', 'ReportColumn.name','report_column_id','method_id','created_at', 'updated_at'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel(
        {
            columns: [
            {
                header: 'Nome',
                dataIndex: 'ReportColumn.name'
            }],
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200,
                editable: false
            }
        }),

        newReportColumn = function (b) 
        {
            var win = new Ext.Window(
            {
                width: 512,
                height: 160,
                bodyStyle: 'background-color:#fff;padding: 10px',
                layout: 'fit',
                modal: true,
                resizable: false,
                items: {
                    xtype: 'form',
                    border: false,
                    buttons: [{
                        text: 'Associa colonne del rapporto',
                        handler: function () {
                            var values = this.ownerCt.ownerCt.ownerCt.items.itemAt(0).form.getFieldValues();
                            Lab.db.create({"doctrineClass":"MethodReportColumn",
                                   "data":{'method_id':config.methodId,
                                           'report_column_id':values['report_column_id']}},
                                   function () {
                                     self.store.reload();
                            });
                        }
                    }],
                    items: [{
                        xtype: 'methodreportcolumncombo',
                        anchor: '-20'
                    }]
                }
            });
            win.show();
        },

        topBar = new Ext.Toolbar(
        {
            items: [{
                text:       'Associa',
                iconCls:    'icon-small-node-insert',
                tooltip: 'Associa una colonna report',
                handler: newReportColumn
            },
            {
                text:       'Disassocia',
                iconCls:    'icon-small-node-delete',
                tooltip: 'Rimuovi l\'associazione fra colonna del rapporto e metodo',
                handler: function (b, e) {                    
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'associazione metodo/colonna del rapporto?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(self.getSelectionModel().selection.record);
                            }
                        });
                    } else {
                        Ext.Msg.show({
                            title: 'Errore',
                            msg: 'Nessuna colonna selezionata',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                }
            },
            '->',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'ReportColumn.name',
                emptyText: 'Filtra per nome'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Colonne da {0} a {1} di {2}',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            title: 'Colonne Rapporto',
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: topBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodReportColumnGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('methodreportcolumngrid', Lab.MethodReportColumnGrid);
