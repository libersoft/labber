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
 * Griglia degli indirizzi dei clienti
 */
Lab.ContactAddressGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 100,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'ContactAddress',
                tableMethod: 'retrieveAddresses',
                tableMethodParam: config.parentId,
                metaData: true
            },
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), 
            {
                header: 'ID',
                dataIndex: 'contact_id'
            },
            {
                header: 'Nome',
                dataIndex: 'name'
            },
            {
                header: 'Alias',
                dataIndex: 'alias'
            },
            {
                header: 'RdP',
                dataIndex: 'is_rdp'
            },
            {
                header: 'Fatt',
                dataIndex: 'is_invoice'
            }
            ],
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200
            }
        }),

        filterBar = new Ext.Toolbar({
            defaults: {
                xtype: 'filterfield',
                store: sfStore
            },
            items: [
            {
                name: 'name',
                emptyText: 'Filtra per nome'
            },
            ' ',
            {
                name: 'contact_id',
                emptyText: 'Filtra per ID'
            },
            ]
        }, sfStore),

        actionBar = new Ext.Toolbar([{
            text: 'Nuovo',
            handler: this.newWindow,
            iconCls: 'icon-small-add',
            scope: this
        },
        {
            text: 'Elimina',
            handler: this.deleteRecords,
            iconCls: 'icon-small-remove',
            scope: this
        }
        ]);

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
            tbar: [ filterBar, actionBar ],
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.ContactAddressGrid.superclass.constructor.call(this, config);

        // listeners
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    newWindow: function () {
        var that = this,

        win = new Lab.ObjectWindow({
            title: 'Nuovo indirizzo',
            doctrineClass: this.store.baseParams.doctrineClass,
            tabItems: [new Lab.ContactAddressForm({
                parentId: this.parentId
            })]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                that.store.reload({
                    callback: function (r, options, success) {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id;
                        var created = this.getById(createdId);
                    }
                });
            }
        });
    },

    editWindow: function (record) {
        var that = this,

        win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.name ? record.data.name : record.data.id + '"',
            doctrineClass: this.store.baseParams.doctrineClass,
            record: record,
            activeTab: 0,
            tabItems: [ new Lab.ContactAddressForm({
                parentId: this.parentId
            })
            ]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                that.store.reload();
            }
        });
    },

    deleteRecords: function () {
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare gli oggetti selezionati?', function (b) {
            if (b === 'yes') {
                if (this.getSelectionModel().selections) {
                    this.store.remove(this.getSelectionModel().getSelections());
                }
            }
        }, this);
    }
});

Ext.reg('contactaddressgrid', Lab.ContactAddressGrid);
