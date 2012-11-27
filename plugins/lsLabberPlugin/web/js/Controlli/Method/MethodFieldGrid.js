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

Lab.MethodFieldGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'MethodField',
                doctrineJoins: ['MethodField.FieldType'],
                doctrineWheres: [{
                    field: 'method_id',
                    operator: '=',
                    value: config.methodId
                }],
                sort: 'FieldType.name'
            },
            fields: ['method_id', 'field_type_id', 'FieldType.name'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [{
                header: 'Nome',
                dataIndex: 'FieldType.name',
                menuDisabled: true,
                sortable: false
            }]
        }),

        topBar = new Ext.Toolbar({
            items: [{
                text: 'Associa',
                iconCls: 'icon-small-node-insert',
                tooltip: 'Associa un parametro',
                handler: this.link,
                scope: this
            },
            {
                text: 'Disassocia',
                iconCls: 'icon-small-node-delete',
                tooltip: 'Rimuovi l\'associazione fra parametro e metodo',
                handler: this.unlink,
                scope: this
            },
            '->',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'FieldType.name',
                emptyText: 'Filtra per nome'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Parametri da {0} a {1} di {2}',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            title: 'Parametri',
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: topBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodFieldGrid.superclass.constructor.call(this, config);
    },

    link: function (b, e) {
        var win = new Ext.Window({
            width: 512,
            height: 128,
            bodyStyle: 'background-color:#fff',
            layout: 'fit',
            modal: true,
            padding: 10,
            resizable: false,
            items: {
                xtype: 'form',
                border: false,
                monitorValid: true,
                ref: 'form',
                buttons: [{
                    text: 'Associa',
                    formBind: true,
                    handler: function (b) {
                        var form = b.ownerCt.ownerCt.getForm();

                        Lab.db.create({
                            doctrineClass: 'MethodField',
                            data: form.getValues()
                        }, function () {
                            Lab.flash.msg('Successo', 'Parametro associato correttamente');
                            this.store.reload();
                        }, this);
                    },
                    scope: this
                }],
                items: [{
                    xtype: 'hidden',
                    name: 'method_id',
                    value: this.methodId
                },
                {
                    xtype: 'methodfieldtypecombo',
                    allowBlank: false,
                    anchor: '-20',
                    hiddenName: 'field_type_id',
                    minChars: 2,
                    ref: 'fieldtype'
                }]
            }
        });

        win.show(e.getTarget(), function () {
            this.form.fieldtype.focus(false, 100);
        });
    },

    unlink: function () {
        if (this.selModel.hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'associazione metodo/parametro?', function (b) {
                if (b === 'yes') {
                    Ext.each(this.selModel.getSelections(), function (record) {
                        Lab.db.destroy({
                            doctrineClass: 'MethodField',
                            data: [record.data.method_id, record.data.field_type_id]
                        });
                    });
                    this.store.reload();
                }
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Selezionare un parametro');
        }
    }
});

Ext.reg('methodfieldgrid', Lab.MethodFieldGrid);
