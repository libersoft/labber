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

Lab.MethodMatrixGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'MethodMatrix',
                doctrineJoins: ['MethodMatrix.Matrix'],
                doctrineWheres: [{
                    field: 'method_id',
                    operator: '=',
                    value: config.method.id
                }]
            },
            fields: ['id', 'Matrix.name','matrix_id','method_id','created_at', 'updated_at'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel(
        {
            columns: [
            {
                header: 'Nome',
                dataIndex: 'Matrix.name'
            }],
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200,
                editable: false
            }
        }),

        topBar = new Ext.Toolbar({
            items: [{
                text: 'Associa',
                iconCls: 'icon-small-node-insert',
                tooltip: 'Associa una nuova matrice',
                handler: this.newMatrix,
                scope: this
            },
            {
                text:       'Associa multiple',
                iconCls:    'icon-small-node-insert-previous',
                tooltip:    'Associa più matrici contemporaneamente',
                handler:    this.newMatrices,
                scope:      this
            },
            {
                text:       'Disassocia',
                iconCls:    'icon-small-node-delete',
                tooltip: 'Rimuovi l\'associazione fra matrice e metodo',
                handler: function (b) {
                    if (self.getSelectionModel().hasSelection()) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'associazione metodo/matrice?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(self.getSelectionModel().getSelections());
                            }
                        });
                    } else {
                        Ext.Msg.show({
                            title: 'Errore',
                            msg: 'Nessuna matrice selezionata',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                }
            },
            '->',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'Matrix.name',
                emptyText: 'Filtra per nome'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Matrici da {0} a {1} di {2}',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            title: 'Matrici',
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: topBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodMatrixGrid.superclass.constructor.call(this, config);
    },

    newMatrix: function () {
        var that = this,

        createFun = function () {
            var mmCombo = Ext.getCmp('methodMatrixCombo');

            Lab.db.create({
                doctrineClass: 'MethodMatrix',
                data: {
                    method_id: that.method.id,
                    matrix_id: mmCombo.value
                }
            }, function () {
                that.store.reload();

                mmCombo.reset();
                mmCombo.focus();
            });
        },

        win = new Ext.Window({
            width: 480,
            height: 128,
            bodyStyle: 'background-color:#fff',
            defaultButton: 'methodMatrixCombo',
            layout: 'fit',
            modal: true,
            padding: 10,
            resizable: false,
            items: [{
                xtype: 'form',
                border: false,
                labelWidth: 75,
                monitorValid: true,
                buttons: [{
                    text: 'Associa matrice',
                    formBind: true,
                    handler: createFun,
                    scope: this
                }],
                items: [{
                    xtype: 'matrixcombo',
                    allowBlank: false,
                    anchor: '-20',
                    forceSelection: true,
                    id: 'methodMatrixCombo',
                    name: 'matrix_id',
                    listeners: {
                        specialkey: function (field, e) {
                            // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                            // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                            if (e.getKey() == e.ENTER) {
                                createFun();
                            }
                        }
                    }
                }]
            }]
        });

        win.show();
    },

    newMatrices: function (b) {
        var that = this,

        win = new Ext.Window({
            width:      512,
            height:     384,
            bodyStyle:  'background-color:#fff;',
            layout:     'fit',
            modal:      true,
            resizable:  false,
            padding:    10,
            items: {
                xtype:  'panel',
                border: false,
                layout: 'fit',
                buttons: [{
                    text: 'Associa',
                    handler: function () {
                        win.close();
                        that.store.reload();
                    }
                }],
                items: [{
                    xtype: 'methodmatrixtree',
                    method: that.method
                }]
            }
        });

        win.show();
    }
});

Ext.reg('methodmatrixgrid', Lab.MethodMatrixGrid);
