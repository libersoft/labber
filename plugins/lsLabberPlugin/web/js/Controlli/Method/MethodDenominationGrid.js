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

/*
 * 
 */
Lab.MethodDenominationGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 20,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'MethodDenomination',
                doctrineJoins: ['MethodDenomination.Denomination'],
                doctrineWheres: [{
                    field: 'method_id',
                    operator: '=',
                    value: config.methodId
                }],
                sort: 'Denomination.name'
            },
            fields: ['Denomination.name', 'denomination_id', 'method_id'],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel(
        {
            columns: [
            {
                header: 'Nome',
                dataIndex: 'Denomination.name'
            }],
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200,
                editable: false
            }
        }),

        newDenomination = function (b) 
        {            
            var adCombo = new Lab.DenominationCombo({
                anchor: '-20',
                listeners: {
                    specialkey: function (field, e) {                        
                        if (e.getKey() == e.ENTER) {
                            new_den();
                        }
                    }
                }
            }),

            new_den = function () {                
                var values = win.items.itemAt(0).form.getFieldValues();
                Lab.db.create({"doctrineClass":"MethodDenomination",
                       "data":{'method_id':config.methodId,
                               'denomination_id':values['denomination_id']}},
                       function () {
                         self.store.reload();
                         adCombo.reset();
                         adCombo.focus();
                });
            }

            var win = new Ext.Window(
            {
                width: 512,
                height: 160,
                bodyStyle: 'background-color:#fff;padding: 10px',
                layout: 'fit',
                modal: true,
                resizable: false,
                defaultButton: adCombo,
                items: {
                    xtype: 'form',
                    border: false,
                    buttons: [{
                        text: 'Associa denominazione',
                        handler: new_den
                    }],
                    items: [adCombo]
                }
            });
            win.show();
        },

        newDenominationFromMethod = function (b) 
        {
            var admCombo = new Lab.MethodCombo({
                anchor: '-20',
                listeners: {
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            new_den_from_method();
                        }
                    }
                }
            }),

            new_den_from_method = function () {
                var values = win.items.itemAt(0).form.getFieldValues();
                if (config.methodId !=values['method_id'])
                {
                    Lab.method.denominationFromMethod(
                    {
                        'method_current': config.methodId,
                        'method_from': values['method_id']
                    }, function () {
                        Lab.flash.msg('', 'Denominazione/i da metodo associata/e');
                        self.store.reload();
                        admCombo.reset();
                        admCombo.focus();
                    });
                } else {
                        Ext.Msg.show({
                            title: 'Associazione denominazioni',
                            msg: "Non è possibile associare un metodo con se stesso",
                            icon: Ext.Msg.INFO,
                            minWidth: 100,
                            buttons: Ext.Msg.OK
                        });
                }
            }

            var win = new Ext.Window(
            {
                width: 512,
                height: 160,
                bodyStyle: 'background-color:#fff;padding: 10px',
                layout: 'fit',
                modal: true,
                resizable: false,
                defaultButton: admCombo,
                items: {
                    xtype: 'form',
                    border: false,
                    buttons: [{
                        text: 'Associa dal metodo',
                        handler: new_den_from_method
                    }],
                    items: [admCombo]
                }
            });
            win.show();
        },

        topBar = new Ext.Toolbar(
        {
            items: [
            {
                text:       'Associa',
                iconCls:    'icon-small-node-insert',
                tooltip:    'Associa una nuova denominazione',
                handler: newDenomination
            },
            {
                text:       'Associa da altro metodo',
                iconCls:    'icon-small-node-insert-next',
                tooltip:    'Associa tutte le denominazioni di un altro metodo',
                handler: newDenominationFromMethod
            },

            {
                text:       'Disassocia',
                iconCls:    'icon-small-node-delete',
                tooltip:    'Rimuovi l\'associazione fra matrice e denominazione',
                handler:    this.unlink,
                scope:      this
            },
            '->',
            {
                xtype: 'filterfield',
                store: sfStore,
                name: 'Denomination.name',
                emptyText: 'Filtra per nome'
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Denominazioni da {0} a {1} di {2}',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            title: 'Denominazioni',
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: topBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodDenominationGrid.superclass.constructor.call(this, config);
    },

    unlink: function () {
        if (this.selModel.hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'associazione metodo/denominazione?', function (b) {
                if (b === 'yes') {
                    Ext.each(this.selModel.getSelections(), function (record) {
                        Lab.db.destroy({
                            doctrineClass: 'MethodDenomination',
                            data: [record.data.method_id, record.data.denomination_id]
                        });
                    });
                    this.store.reload();
                }
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Selezionare una denominazione');
        }
    }
});

Ext.reg('methoddenominationgrid', Lab.MethodDenominationGrid);
