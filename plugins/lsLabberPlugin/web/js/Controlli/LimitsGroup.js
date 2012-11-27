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
 *  GridPanel per LimitsGroup
 */
Lab.LimitsGroupsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {
        var pageSize = 50,

        sfStore = new Lab.sfDirectStore({
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    // mostra di default le tabelle confermate
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
                doctrineClass:  'LimitsGroup',
                metaData:       true,
                sort:           'name'
            },
            pageSize:   pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled:   true,
                sortable:       true
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Nome',
                dataIndex:  'name'
            },
            {
                header:     'Nome sul certificato',
                dataIndex:  'certified_name'
            },
            {
                header:     'Data di creazione',
                dataIndex:  'created_at',
                fixed:      true,
                width:      150
            },
            {
                xtype: 'actioncolumn',
                fixed: true,
                width: 50,
                items: [{
                    icon: Lab.CONFIG.root_dir + '/images/icons/wall--plus.png',
                    tooltip: 'Copia (senza i valori)',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex);
                        Lab.limits.copy({
                            group_id: record.id
                        }, function (result) {
                            if (result.success) {
                                grid.store.reload();
                            }
                        });
                    }
                }]
            }]
        }),

        topToolbars = new Ext.Panel({
            border: false,
            items: [{
                xtype: 'filteringtoolbar',
                store: sfStore,
                items: [{
                    xtype: 'combo',
                    emptyText: 'Confermati?',
                    name: 'unconfirmed',
                    triggerAction: 'all',
                    store: [[0, 'Confermati'], [1, 'Non confermati']],
                    value: 0
                }]
            },
            {
                xtype: 'toolbar',
                items: [{
                    text: 'Nuova',
                    handler: this.newWindow,
                    iconCls: 'icon-small-add',
                    scope: this
                },
                {
                    text: 'Elimina',
                    handler: this.deleteRecords,
                    iconCls: 'icon-small-remove',
                    scope: this
                },
                '->',
                {
                    xtype: 'filterfield',
                    name: 'name',
                    emptyText: 'Filtra per nome',
                    store: sfStore
                }]
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo:    true,
                pageSize:       pageSize,
                store:          sfStore
            }),
            border:     false,
            colModel:   colModel,
            loadMask:   true,
            store:      sfStore,
            stripeRows: true,
            tbar:       topToolbars,
            viewConfig: {
                forceFit:   true
            }
        }, config);

        Lab.LimitsGroupsGrid.superclass.constructor.call(this, config);

        // Apre la finestra per la modifica del record al doppio clic
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    newWindow: function () {
        var win = new Lab.ObjectWindow({
            title:          'Nuova tabella limiti',
            width:          640,
            height:         480,
            doctrineClass:  this.store.baseParams.doctrineClass,
            store:          this.store,
            tabItems: [{
                xtype:  'limitsgroupform'
            }]
        });

        win.show();

        win.on('close', function (w) {
            if (w.newRecord) {
                this.editWindow(w.newRecord);
                this.store.reload();
            }
        }, this);
    },

    editWindow: function (record) {
        var that = this,

        win = new Lab.ObjectWindow({
            title:          'Modifica "' + record.data.name + '"',
            width:          640,
            height:         480,
            activeTab:      1,
            doctrineClass:  this.store.baseParams.doctrineClass,
            record:         record,
            tabItems: [{
                xtype:  'limitsgroupform'
            },
            {
                xtype:      'limitsgrid',
                title:      'Limiti',
                iconCls:    'icon-limit',
                groupID:    record.id
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
        if (this.getSelectionModel().hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le tabelle limiti selezionate?', function (b) {
                if (b === 'yes') {
                    this.store.remove(this.getSelectionModel().getSelections());
                }
            }, this);
        }
    }
});



Lab.LimitsGroupForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            title:      'Dati',
            iconCls:    'icon-small-clipboard-text',
            labelWidth: 125,
            padding:    10,
            defaults: {
                xtype: 'textfield',
                anchor: '-20'
            },
            items: [{
                xtype:      'hidden',
                name:       'id'
            },
            {
                fieldLabel: 'Nome',
                name:       'name',
                allowBlank: false
            },
            {
                fieldLabel: 'Nome sul certificato',
                name:       'certified_name'
            },
            {
                xtype:      'checkbox',
                fieldLabel: 'Da confermare',
                name:       'unconfirmed',
                checked:    true
            }]
        }, config);

        Lab.LimitsGroupForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('limitsgroupsgrid', Lab.LimitsGroupsGrid);
Ext.reg('limitsgroupform',  Lab.LimitsGroupForm);
