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
 *  GridPanel per Bill
 */
Lab.BillsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {
        var pageSize = 50,

        self = this,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'Bill',
                doctrineJoins: ['Bill.Contact']
            },
            fields:     ['id', 'number', 'contact_id', 'Contact.name', 'sent_at', 'payment_conditions', 'currency', 'notes'],
            pageSize:   pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled:   true
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Cliente',
                dataIndex: 'Contact.name'
            },
            {
                header: 'Numero',
                dataIndex: 'number'
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text: 'Nuova',
            handler: this.newWindow,
            iconCls: 'icon-small-add',
            scope: this
        },
        {
            text: 'Genera Dettaglio Fattura',
            iconCls: 'icon-report',
            hidden: Lab.printodt === undefined,
            handler: function () {
                var selected = self.getSelectionModel().getSelected();
                if (selected) {
                    Ext.MessageBox.show({
                        msg: 'Salvataggio Dettaglio Fattura, attendere prego...',
                        progressText: 'Salvataggio...',
                        width:300,
                        wait:true,
                        waitConfig: {
                            interval:200
                        },
                        icon:'icon-disc'
                    });
                    Lab.printodt.bill({
                        billID: selected.id,
                        keys: self.getSelectionModel().selections.keys
                    },
                    function (result) {
                        this.result = result;
                        if(result.success) {
                            if(result.res == '1'){
                                Lab.flash.msg('Dettaglio Fattura creato correttamente', '');
                            }
                            else {
                                Lab.flash.msg('Errore: Dettaglio Fattura non creato', '');
                            }
                            sfStore.reload();
                        }
                        if(result.count > 0){
                            var msg = '';
                            for(var i = 0; i != result.count; i++){
                                msg += '<a target="_blank" href="data/bill_detail/'+result.bill[i]+'">'+result.bill[i]+'</a><br />';
                            }
                            Ext.MessageBox.show({
                                height: 300,
                                width: 500,
                                buttons: Ext.Msg.OK,
                                title: 'Dettaglio Fattura Creato',
                                msg: msg
                            });
                        }
                    }, this)
                }
            }
        },
        '->',
        {
            text: 'Elimina',
            handler: this.deleteRecords,
            iconCls: 'icon-small-remove',
            scope: this
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

        Lab.BillsGrid.superclass.constructor.call(this, config);

        // Apre la finestra per la modifica del record al doppio clic
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    newWindow: function () {
        var that = this,

        win = new Lab.ObjectWindow({
            title: 'Nuova fattura',
            doctrineClass: this.store.baseParams.doctrineClass,
            tabItems: [{
                xtype: 'billform'
            }]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                that.store.reload({
                    callback: function (r, options, success) {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id;
                        var created = this.getById(createdId);
                        that.editWindow(created);
                    }
                });
            }
        });
    },

    editWindow: function (record) {
        var that = this,

        win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.number + '"',
            activeTab: 1,
            doctrineClass: this.store.baseParams.doctrineClass,
            record: record,
            tabItems: [{
                xtype: 'billform'
            },
            {
                xtype: 'billsamplesgrid',
                title: 'Campioni',
                record: record
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
        if (this.selModel.hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le fatture selezionate?', function (b) {
                if (b === 'yes') {
                    if (this.getSelectionModel().selections) {
                        this.store.remove(this.getSelectionModel().getSelections());
                    }
                }
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Selezionare una o più fatture da eliminare');
        }
    }
});


Lab.BillForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            title: 'Dati',
            iconCls: 'icon-small-clipboard-text',
            labelWidth: 150,
            padding: 10,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'contactcombo',
                fieldLabel: 'Cliente',
                name: 'contact_id',
                allowBlank: false
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Numero',
                name: 'number'
            },
            {
                xtype: 'datefield',
                fieldLabel: 'Data emissione',
                name: 'sent_at'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Valuta',
                name: 'currency'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Condizioni di pagamento',
                name: 'payment_conditions'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Annotazioni',
                name: 'notes'
            }]
        }, config);

        Lab.BillForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('billsgrid', Lab.BillsGrid);
Ext.reg('billform', Lab.BillForm);
