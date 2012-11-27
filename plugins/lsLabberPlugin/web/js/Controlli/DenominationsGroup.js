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
 *  GridPanel per DenominationsGroup
 */
Lab.DenominationsGroupsGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {
        var pageSize = 50,

        sfStore = new Lab.sfDirectStore({
            autoDestroy:    true,
            autoSave:       false,
            baseParams: {
                doctrineClass:  'DenominationsGroup'
            },
            fields:         ['id', 'name'],
            pageSize:       pageSize,
            sortInfo: {
                field: 'name'
            }
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Nome',
                dataIndex:  'name',
                editor:     new Ext.form.TextField(),
                sortable:   true
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text:       'Nuovo',
            tooltip:    'Aggiunge un nuovo gruppo di denominazioni',
            iconCls:    'icon-small-add',
            handler:    this.newRecord,
            scope:      this
        },
        {
            text:       'Elimina',
            tooltip:    'Elimina il gruppo di denominazioni selezionato',
            iconCls:    'icon-small-minus',
            handler:    this.deleteRecord,
            scope:      this
        },
        '->',
        {
            xtype:      'filterfield',
            name:       'name',
            emptyText:  'Filtra per nome',
            store:      sfStore
        }]);

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
            tbar:       actionBar,
            viewConfig: {
                forceFit:   true
            }
        }, config);

        Lab.DenominationsGroupsGrid.superclass.constructor.call(this, config);

        this.on('afteredit', function (e) {
            if (e.record.phantom) {
                Lab.db.create({
                    doctrineClass: 'DenominationsGroup',
                    data: {
                        name: e.value
                    }
                }, function () {
                    e.record.commit();
                    e.grid.store.reload();
                });
            } else {
                Lab.db.update({
                    doctrineClass: 'DenominationsGroup',
                    data: {
                        id: e.record.id,
                        name: e.value
                    }
                }, function () {
                    e.record.commit();
                });
            }
        });
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
            Ext.Msg.confirm('Attenzione!', 'Eliminare il gruppo di denominazioni selezionato?', function (b) {
                if (b === 'yes') {
                    this.store.remove(sel.record);
                    this.store.save();
                }
            }, this);
        }
    }
});

Ext.reg('denominationsgroupsgrid', Lab.DenominationsGroupsGrid);
