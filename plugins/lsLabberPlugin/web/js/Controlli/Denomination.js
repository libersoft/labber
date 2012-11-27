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

Lab.Denomination = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        // create reusable renderer
        Ext.util.Format.comboRenderer = function (combo) {
            return function (value) {
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : combo.valueNotFoundText;
            }
        }

        // create the combo instance
        var groupCombo = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender:true,
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                baseParams: {
                    doctrineClass: 'DenominationsGroup'
                },
                fields: ['id', 'name']
            }),
            valueField: 'id',
            displayField: 'name'
        }),

        pageSize = 50,

        sfStore = new Lab.sfDirectStore({
            autoDestroy:    true,
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    // Al primo load mostra le Denomination "confermate"
                    filters: {
                        unconfirmed: {
                            field:      'unconfirmed',
                            operator:   '=',
                            value:      0
                        }
                    }
                }
            },
            baseParams: {
                doctrineClass:  'Denomination',
                doctrineJoins:  ['Denomination.Methods']
            },
            fields:         ['short_name', 'name', 'Methods', 'notes', 'price', 'unconfirmed', 'group_id', 'cas'],
            pageSize:       pageSize
        }),

        unconfirmedColumn = new Ext.grid.CheckColumn({
            header:     'Da confermare',
            dataIndex:  'unconfirmed',
            width:      75
        }),

        columns = [new Ext.grid.RowNumberer(), {
            header:     'Abbreviazione',
            dataIndex:  'short_name',
            width:      120
        },
        {
            header:     'Nome',
            dataIndex:  'name'
        },
        {
            header:     'Gruppo',
            dataIndex:  'group_id',
            editor:     groupCombo,
            renderer:   Ext.util.Format.comboRenderer(groupCombo)
        },
        {
            header:     'Note',
            dataIndex:  'notes',
            editor:     new Ext.form.TextArea()
        },
        {
            header:     'Prezzo',
            dataIndex:  'price',
            editor:     new Ext.form.NumberField({
                allowNegative:      false,
                decimalSeparator:   ','
            }),
            width:      100
        }, unconfirmedColumn,
        {
            header:     'CAS',
            dataIndex:  'cas',
            width:      150,
            editor:     new Ext.form.TextField()
        }],

        buttonsBar = new Ext.Toolbar({
            items: [{
                text:       'Nuovo',
                tooltip:    'Aggiunge una nuova denominazione',
                iconCls:    'icon-small-add',
                handler:    this.newRecord,
                scope:      this
            },
            {
                text:       'Elimina',
                tooltip:    'Elimina la denominazione selezionata',
                iconCls:    'icon-small-minus',
                handler:    this.deleteRecord,
                scope:      this
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
                name: 'short_name',
                emptyText: 'Filtra per abbreviazione'
            }]
        }),

        filteringBar = new Lab.FilteringToolbar({
            store:  sfStore,
            items: [{
                xtype:          'combo',
                emptyText:      'Confermati?',
                name:           'unconfirmed',
                triggerAction:  'all',
                store:          [[0, 'Confermati'], [1, 'Non confermati']],
                value:          0
            }]
        }),

        topToolbar = new Ext.Panel({
            border: false,
            items: [filteringBar, buttonsBar]
        });

        // Colonna "Metodi associati" per i compilatori di controlli
        if (Lab.CONFIG.user.permissions.indexOf('controlli') != -1) {
            columns.push({
                header:     'Metodi associati',
                dataIndex:  'Methods',
                editable:   false,
                sortable:   false,
                xtype:      'templatecolumn',
                tpl:        '<span style="white-space: normal;"><tpl for="Methods">{[xindex != 1 ? ", " : ""]}{name}</tpl></span>'
            });
        }

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    editor:         new Ext.form.TextField(),
                    menuDisabled:   true,
                    sortable:       true,
                    width:          200
                },
                columns: columns
            }),
            loadMask: true,
            plugins:    [unconfirmedColumn],
            store: sfStore,
            stripeRows: true,
            tbar:       topToolbar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.Denomination.superclass.constructor.call(this, config);
    },

    newRecord: function () {
        var r =  new this.store.recordType({});
        this.stopEditing();
        this.store.insert(0, r);
        this.startEditing(0, 1);
    },

    deleteRecord: function () {
        var sel = this.getSelectionModel().selection;
        if (sel) {
            Ext.Msg.confirm('Attenzione!', 'Eliminare la denominazione selezionata?', function (b) {
                if (b === 'yes') {
                    this.store.remove(sel.record);
                }
            }, this);
        }
    }
});

Ext.reg('denomination', Lab.Denomination);
