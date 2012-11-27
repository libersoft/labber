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
 *  GridPanel per Denomination
 */
Lab.DenominationsGrid = Ext.extend(Ext.grid.GridPanel, {

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
                doctrineClass:  'Denomination',
                doctrineJoins:  ['Denomination.Group']
            },
            fields: ['id', 'name', 'unconfirmed', 'cas', 'notes', 'aliases', 'group_id', {
                name: 'Group.name',
                mapping: 'Group ? obj.Group.name : null'
            },
            {
                name: 'aliases_string',
                convert: function (v, record) {
                    var aliases = Ext.decode(record.aliases);

                    if (Ext.isArray(aliases)) {
                        aliases = aliases.join("; ");
                    }

                    return aliases;
                }
            },
            {
                name: 'aliases_array',
                convert: function (v, record) {
                    var aliases = Ext.decode(record.aliases), arrayData = [];

                    if (Ext.isArray(aliases)) {
                        Ext.each(aliases, function (item, index) {
                            arrayData.push([index +1, item]);
                        });
                    }

                    return arrayData;
                }
            }],
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
                header:     'Alias',
                dataIndex:  'aliases_string',
                sortable:   false
            },
            {
                header:     'Gruppo',
                dataIndex:  'Group.name',
                width:      120
            },
            {
                xtype:      'booleancolumn',
                header:     'Confermata?',
                dataIndex:  'unconfirmed',
                width:      80,
                falseText:  'Sì',
                trueText:   'No',
                undefinedText: 'Boh?'
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text:       'Nuova',
            handler:    this.newWindow,
            iconCls:    'icon-small-add',
            scope:      this
        },
        {
            text:       'Modifica alias',
            disabled:   true,
            handler:    this.editAliases,
            iconCls:    'icon-small-edit',
            ref:        'editBtn',
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
                type:       'boolean',
                dataIndex:  'unconfirmed',
                active:     true,
                yesText:    'Da confermare',
                noText:     'Confermate'
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

        Lab.DenominationsGrid.superclass.constructor.call(this, config);

        this.on('rowdblclick', function (grid, rowIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record, e);
        });

        this.getSelectionModel().on('selectionchange', function (sm) {
            actionBar.removeBtn.setDisabled(sm.getCount() < 1);
            actionBar.editBtn.setDisabled(sm.getCount() != 1);
        });
    },

    newWindow: function (b, e) {
        var win = new Lab.DenominationWindow({
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
        var win = new Lab.DenominationWindow({
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
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le denominazioni selezionate?', function (b) {
            if (b === 'yes') {
                this.store.remove(this.getSelectionModel().getSelections());
            }
        }, this);
    },

    editAliases: function (b, e) {
        var record = this.getSelectionModel().getSelected(),

            grid = new Lab.DenominationAliasesGrid({
                data: record.data.aliases_array
            }),

            win = new Ext.Window({
                title: b.text,
                modal: true,
                width: 400,
                height: 300,
                resizable: false,
                layout: 'fit',
                plain: true,
                items: [grid],
                buttons: [{
                    text: 'Salva',
                    scope: this,
                    handler: function () {
                        var aliases = [];
                        Ext.each(grid.store.getRange(), function (r) {
                            aliases.push(r.get('alias'));
                        });
                        record.set('aliases', Ext.encode(aliases));
                        win.close();
                        this.store.reload();
                    }
                }]
            });

        win.show(e.getTarget());
    }
});


Lab.DenominationAliasesGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor : function (config) {
        config = Ext.apply({
            border: false,
            colModel: new Ext.grid.ColumnModel({
                columns: [{
                    header: 'Alias',
                    dataIndex: 'alias',
                    editor: {xtype: 'textfield'}
                }]
            }),
            store: {
                xtype: 'arraystore',
                autoSave: true,
                data: config.data,
                fields: ['id', 'alias'],
                idIndex: 0
            },
            tbar: [{
                text: 'Aggiungi',
                iconCls: 'icon-small-add',
                scope: this,
                handler: function () {
                    var a = new this.store.recordType({
                        alias: ''
                    });
                    this.stopEditing();
                    this.store.insert(0, a);
                    this.startEditing(0, 0);
                }
            }, '->', {
                text: 'Rimuovi',
                iconCls: 'icon-small-remove',
                scope: this,
                handler: function () {
                    var cell = this.getSelectionModel().getSelectedCell();
                    if (cell === null) {
                        return false;
                    }
                    this.store.removeAt(cell[0]);
                }
            }],
            viewConfig: {forceFit: true}
        }, config);

        Lab.DenominationAliasesGrid.superclass.constructor.call(this, config);
    }
});


Lab.DenominationWindow = Ext.extend(Ext.Window, {

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
                            doctrineClass: 'Denomination',
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
                xtype: 'combo',
                fieldLabel: 'Gruppo',
                name: 'group_id',
                typeAhead: true,
                triggerAction: 'all',
                valueField: 'id',
                displayField: 'name',
                store: new Lab.sfDirectStore({
                    autoDestroy: true,
                    baseParams: {
                        doctrineClass: 'DenominationsGroup'
                    },
                    fields: ['id', 'name']
                })
            },
            {
                fieldLabel: 'CAS',
                name: 'cas'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Note',
                name: 'notes'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Da confermare',
                name: 'unconfirmed',
                checked: true
            },
            {
                xtype: 'panel',
                height: 200,
                layout: 'fit',
                items: {
                    xtype: 'listview',
                    emptyText: 'Nessun oggetto collegato',
                    reserveScrollOffset: true,
                    ref: '../../relationsList',
                    store: {
                        xtype: 'directstore',
                        autoLoad: false,
                        directFn: Lab.denomination.getRelations,
                        fields: ['class', 'name'],
                        root: 'data'
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
            title: 'Nuova denominazione',
            modal: true,
            width: 500,
            height: 500,
            resizable: false,
            layout: 'fit',
            plain: true,
            items: form
        }, config);

        Lab.UserWindow.superclass.constructor.call(this, config);

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

Ext.reg('denominationsgrid', Lab.DenominationsGrid);
