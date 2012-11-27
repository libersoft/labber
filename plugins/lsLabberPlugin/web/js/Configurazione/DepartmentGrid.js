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
 * Griglia dei laboratori
 */
Lab.DepartmentGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass:  'Unit',
                metaData:       true,
                sort:           'name'
            },
            pageSize:   pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                editor:         new Ext.form.TextField(),
                menuDisabled:   true,
                sortable:       true,
                width:          200
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Nome',
                dataIndex:  'name'
            },
            {
                header:     'Abbreviazione',
                dataIndex:  'code'
            }]
        });

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
            tbar: [{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                tooltip: 'Aggiunge un nuovo laboratorio',
                handler: function () {
                    self.stopEditing();
                    sfStore.insert(0, new sfStore.recordType());
                    self.startEditing(0, 1);
                }
            },
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina il laboratorio selezionato',
                handler: function (b) {
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare il laboratorio selezionato?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(self.getSelectionModel().selection.record);
                            }
                        });
                    }
                }
            }],
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.DepartmentGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('departmentgrid', Lab.DepartmentGrid);
