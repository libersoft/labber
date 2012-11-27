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
 * Gestione dei parametri
 */
Lab.FieldTypesGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {
        var pageSize = 50,

        sfStore = new Lab.sfDirectStore({
            autoDestroy: true,
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize
                }
            },
            baseParams: {
                doctrineClass:  'FieldType'
            },
            fields: ['id', 'name', 'description'],
            pageSize: pageSize,
            sortInfo: {
                field: 'name'
            }
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable:   true,
                width:      255
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Nome',
                dataIndex:  'name'
            },
            {
                header:     'Descrizione',
                dataIndex:  'description'
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text:       'Nuovo',
            handler:    this.newWindow,
            iconCls:    'icon-small-add',
            scope:      this
        },
        '->',
        {
            text:       'Elimina',
            disabled:   true,
            handler:    this.deleteRecords,
            iconCls:    'icon-small-remove',
            ref:        'removeBtn',
            scope:      this
        }]),

        filters = new Ext.ux.grid.GridFilters({
            encode:         true,
            menuFilterText: 'Filtri',
            filters: [{
                type:       'string',
                dataIndex:  'name'
            },
            {
                type:       'string',
                dataIndex:  'description'
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
            tbar:       actionBar,
            viewConfig: {
                forceFit:   true
            }
        }, config);

        Lab.FieldTypesGrid.superclass.constructor.call(this, config);

        this.on('rowdblclick', function (grid, rowIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record, e);
        });

        this.getSelectionModel().on('selectionchange', function (sm) {
            actionBar.removeBtn.setDisabled(sm.getCount() < 1);
        });
    },

    newWindow: function (b, e) {
        var win = new Lab.FieldTypeWindow({
            listeners: {
                close: function (w) {
                    if (w.result) {
                        this.store.reload();
                    }
                },
                scope: this
            }
        });

        win.show(e.getTarget());
    },

    editWindow: function (record, e) {
        var win = new Lab.FieldTypeWindow({
            title:  'Modifica "' + record.data.name + '"',
            record: record,
            listeners: {
                close: function (w) {
                    if (w.result) {
                        this.store.reload();
                    }
                },
                scope: this
            }
        });

        win.show(e.getTarget());
    },

    deleteRecords: function () {
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i parametri selezionati?', function (b) {
            if (b === 'yes') {
                this.store.remove(this.getSelectionModel().getSelections());
            }
        }, this);
    }
});



Lab.FieldTypeWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {

        var form = new Ext.FormPanel({
            border: false,
            monitorValid: true,
            padding: 10,
            buttons: [{
                text: 'OK',
                formBind: true,
                iconCls: 'icon-small-ok',
                scope: this,
                handler: function () {
                    var values = form.getForm().getFieldValues(true),   // dirtyOnly
                        data = {
                            doctrineClass: 'FieldType',
                            data: values
                        },
                        callback = function (r) {
                            if (r.success) {
                                this.result = r;
                                this.close();
                            }
                        };

                    if (values.id) {
                        Lab.db.update(data, callback, this);
                    } else {
                        Lab.db.create(data, callback, this);
                    }
                }
            }],
            defaults: {
                xtype: 'textfield',
                anchor: '-20'
            },
            items: [{
                xtype: 'hidden',
                name: 'id',
                isDirty: function () {return true;} // always dirty
            },
            {
                fieldLabel: '<b>Nome</b>',
                name: 'name',
                allowBlank: false
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Descrizione',
                name: 'description'
            },
            {
                xtype: 'panel',
                height: 300,
                layout: 'fit',
                items: {
                    xtype: 'listview',
                    emptyText: 'Nessun oggetto collegato',
                    reserveScrollOffset: true,
                    ref: '../../relationsList',
                    store: {
                        xtype: 'directstore',
                        autoLoad: false,
                        directFn: Lab.fieldType.getRelations,
                        fields: ['class', 'name'],
                        root: 'data',
                        sortInfo: {field: 'name'}
                    },
                    columns: [{
                        header: 'Tipo',
                        dataIndex: 'class',
                        width: 0.2
                    },
                    {
                        header: 'Nome',
                        dataIndex: 'name'
                    }]
                }
            }]
        });

        config = Ext.apply({
            title: 'Nuovo parametro',
            modal: true,
            width: 500,
            height: 500,
            resizable: false,
            layout: 'fit',
            plain: true,
            items: form
        }, config);

        Lab.FieldTypeWindow.superclass.constructor.call(this, config);

        if (this.record) {
            form.getForm().loadRecord(this.record);

            this.relationsList.store.load({
                params: {
                    id: this.record.id
                }
            });
        }
    }
});

Ext.reg('fieldtypesgrid', Lab.FieldTypesGrid);
