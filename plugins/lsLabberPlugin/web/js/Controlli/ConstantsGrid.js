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
 * GridPanel dei MethodConstant
 */
Lab.ConstantsGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 25,

        sfStore = new Lab.sfDirectStore({
            autoDestroy:    true,
            baseParams: {
                doctrineClass:  'MethodConstant',
                doctrineJoins:  ['MethodConstant.Methods'],
                sort:           'name'
            },
            fields:         ['id', 'name', 'description', 'Methods'],
            pageSize:       pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled:   true,
                sortable:       false
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Nome',
                dataIndex:  'name',
                editor:     new Ext.form.TextField()
            },
            {
                header:     'Descrizione',
                dataIndex:  'description',
                editor:     new Ext.form.TextArea()
            }]
        }),

        buttonsBar = new Ext.Toolbar({
            items: [{
                text:       'Nuovo',
                iconCls:    'icon-small-add',
                tooltip:    'Aggiunge una nuova costante',
                handler:    this.insertRecord,
                scope:      this
            },
            {
                text:       'Elimina',
                iconCls:    'icon-small-minus',
                tooltip:    'Elimina la costante selezionata',
                handler: function (b) {
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare la costante selezionata?', function (b) {
                            if (b === 'yes') {
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
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo:    true,
                displayMsg:     'Costanti da {0} a {1} di {2}',
                pageSize:       pageSize,
                store:          sfStore
            }),
            border:     false,
            colModel:   colModel,
            loadMask:   true,
            store:      sfStore,
            stripeRows: true,
            tbar:       buttonsBar,
            viewConfig: {
                forceFit:   true
            }
        }, config);

        Lab.ConstantsGrid.superclass.constructor.call(this, config);
    },

    insertRecord: function () {
        this.stopEditing();
        var record = new this.store.recordType();
        this.store.insert(0, record);
        this.startEditing(0, 1);
    }
});

Ext.reg('constantsgrid', Lab.ConstantsGrid);
