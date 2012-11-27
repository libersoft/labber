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
 *  Griglia dei pacchetti
 */
Lab.PacketGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 25,

        self = this,

        sfStore = new Lab.sfDirectStore({
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    // mostra di default i pacchetti attivi
                    filters: {
                        unconfirmed: {
                            field: 'unconfirmed',
                            operator: '=',
                            value: 0
                        }
                    }
                }
            },
            baseParams: { 
                doctrineClass: 'Packet',
                doctrineJoins: ['Packet.Children', 'Packet.Determinations as pd', 'pd.Denomination', 'pd.Matrix', 'pd.Method']
            },
            fields: ['id', 'name', 'law_reference', 'note', 'price', 'report_title', 'Determinations', 'limits_group_id', 'updated_at',
            {
                name: 'children',
                convert: function (v, rec) {
                    var children = '';
                    Ext.each(rec.Children, function (item, index) {
                        children += '<div>'+(index + 1)+'. '+item.name+'</div>';
                    });
                    return children;
                }
            }, 'is_proto', 'unconfirmed'],
            pageSize: pageSize
        }),

        expander = new Ext.ux.grid.RowExpander({
            expandOnDblClick: false,
            tpl: new Ext.XTemplate(
                '<h3>Controlli:</h3>',
                '<tpl for="Determinations">',
                    '<div>{[values.Denomination.name]} / {[values.Matrix ? values.Matrix.name : null]} / {[values.Method.name]}</div>',
                '</tpl>'
            )
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                width: 160,
                sortable: true
            },
            columns: [expander, {
                header: 'Nome',
                dataIndex: 'name',
                renderer: function (value, metadata, record, rowIndex, colIndex, store) {
                    metadata.attr = 'ext:qtip="' + record.data.children + '" ext:qtitle="<h3>Pacchetti inclusi:</h3>"';
                    return value;
                }
            },
            {
                header: 'Riferimento Legislativo',
                dataIndex: 'law_reference'
            },
            {
                header:     'Aggiornato il',
                dataIndex:  'updated_at',
                fixed:      true
            }]
        }),

        topToolbars = new Ext.Panel({
            border: false,
            items: [{
                xtype:  'filteringtoolbar',
                store:  sfStore,
                items: [{
                    xtype: 'combo',
                    name: 'is_proto',
                    emptyText: 'Tipo di pacchetto',
                    mode: 'local',
                    triggerAction: 'all',
                    store: [[0, 'Composto'], [1, 'Semplice']]
                },
                ' ',
                {
                    xtype: 'combo',
                    emptyText: 'Confermati?',
                    name: 'unconfirmed',
                    triggerAction: 'all',
                    store: [[0, 'Confermati'], [1, 'Non confermati']],
                    value: 0
                }]
            },
            {
                xtype:  'toolbar',
                items: [{
                    text: 'Nuovo',
                    iconCls: 'icon-small-add',
                    handler: this.newWindow,
                    scope: this
                },
                {
                    text: 'Elimina',
                    iconCls: 'icon-small-minus',
                    handler: function (b, e) {
                        var selections = self.getSelectionModel().getSelections();
                        if (selections) {
                            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i pacchetti selezionati?', function (b) {
                                if (b === 'yes') {
                                    sfStore.remove(selections);
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
                    name: 'law_reference',
                    emptyText: 'Filtra per Riferimento Legislativo'
                }]
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Visualizzati pacchetti da {0} a {1} di {2}',
                emptyMsg: 'Non ci sono pacchetti da visualizzare',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            cm: colModel,
            ddGroup: 'gridDDGroup',
            enableDragDrop: true,
            loadMask: true,
            plugins: [expander],
            store: sfStore,
            stripeRows: true,
            tbar: topToolbars,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.PacketGrid.superclass.constructor.call(this, config);

        // listeners
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    newWindow: function () {
        var win = new Lab.ObjectWindow({
            title: 'Nuovo pacchetto',
            doctrineClass: this.store.baseParams.doctrineClass,
            store: this.store,
            tabItems: [new Lab.Packet()]
        });

        win.show();

        win.on('close', function (w) {
            if (w.newRecord) {
                this.editWindow(w.newRecord);
            }
        }, this);
    },

    editWindow: function (record) {
        if (record.data.is_proto) {
            var win = new Lab.ObjectWindow({
                title: 'Modifica "' + record.data.name + '"',
                doctrineClass: this.store.baseParams.doctrineClass,
                record: record,
                activeTab: 1,
                tabItems: [new Lab.Packet({
                    recordId: record.id
                }), new Lab.DeterminationProtoGrid({
                    recordId: record.id,
                    recordLocal: 'packet_id'
                })]
            });
        } else {
            var win = new Lab.ObjectWindow({
                title: 'Modifica "' + record.data.name + '"',
                doctrineClass: this.store.baseParams.doctrineClass,
                record: record,
                activeTab: 1,
                tabItems: [new Lab.Packet({
                    recordId: record.id
                }), new Lab.DeterminationGrid({
                    recordId: record.id,
                    recordLocal: 'packet_id',
                    limitsGroupID: record.data.limits_group_id,
                    stateId: 'grigliacontrollipacchetto',
                    stateful: true,
                    inSample: false,
                    unlocked: true
                }), new Lab.PacketTree({
                    record: record
                })]
            });
        }

        win.show();

        win.on('close', function (w) {
            if (w.result) {
                this.store.reload();
            }
        }, this);
    }
});

Ext.reg('packetgrid', Lab.PacketGrid);
