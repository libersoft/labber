"use strict";
/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true
    
*/

/*global
    Ext: true,
    Lab: true
*/


Ext.ns('Lab');

/**
 * Griglia dei clienti
 */
Lab.ContactGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 100,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'Contact',
                tableMethod: 'retrieveContacts',              
                metaData: true
            },
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Nome',
                dataIndex: 'name'
            },
            {
                header: 'Alias',
                dataIndex: 'alias'
            },
            {
                header: 'ID',
                dataIndex: 'id'
            },
            {
                header: 'Partita IVA',
                dataIndex: 'piva'
            },
            {
                header: 'Codice Fiscale',
                dataIndex: 'taxid'
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
                name: 'id',
                emptyText: 'Filtra per ID'
            },
            ' ',
            {
                name: 'piva',
                emptyText: 'Filtra per partita IVA'
            }]
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

        Lab.ContactGrid.superclass.constructor.call(this, config);

        // listeners
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    newWindow: function () {
        var self = this,

        win = new Lab.ObjectWindow({
            title: 'Nuovo contatto',
            height: 550,
            doctrineClass: this.store.baseParams.doctrineClass,
            tabItems: [{
                xtype: 'contactform',
                is_locked: false
            }]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                self.store.reload({
                    callback: function (r, options, success) {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id,
                        created = this.getById(createdId);
                        self.editWindow(created);
                    }
                });
            }
        });
    },

    editWindow: function (record) {
        var that = this,

        win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.id + '"',
            doctrineClass: this.store.baseParams.doctrineClass,
            height: 550,
            record: record,
            activeTab: 0,
            tabItems: [{
                xtype: 'contactform',
                is_locked: record.data.is_esatto
            },
            {
                xtype: 'contactaddressgrid',
                parentId: record.id,
                title: 'Indirizzi'
            }]
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

Ext.reg('contactgrid', Lab.ContactGrid);
