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
 * Tabella delle offerte.
 */
Lab.OffersGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 25,

        self = this,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass:  'Offer',
                doctrineJoins:  'Offer.Contact',
                tableMethod:    'retrieveOfferList'
            },
            fields:     ['id', 'number', 'name', 'contact_id',
            {
                name:       'Contact.name',
                mapping:    'Contact ? obj.Contact.name : null'
            },
            {
                name:       'contactnote',
                mapping:    'Contact ? obj.Contact.note_offer : null'
            },
            'emission_date', 'validity_date', 'sales_manager_id',
            {
                name:       'SalesManager.surname',
                mapping:    'SalesManager ? obj.SalesManager.surname + \' \' +  obj.SalesManager.name : null'
            },
            'sales_secretary_id', 'expire_date',
            {
                name:       'SalesSecretary.surname',
                mapping:    'SalesSecretary ? obj.SalesSecretary.surname + \' \' +  obj.SalesSecretary.name : null'
            },
            {
                name:       'TechnicalManager.surname',
                mapping:    'TechnicalManager ? obj.TechnicalManager.surname + \' \' +  obj.TechnicalManager.name : null'
            },
            {
                name:       'price',
                type:       'float'
            }, 'note', 'technical_manager_id', 'contact_reference', 'confirm_date',
            'offer_state', 'additional_condition', 'billing_modality',
            'payment_modality', 'revision_number', 'history'],
            pageSize:   pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Codice',
                dataIndex:  'number'
            },
            {
                header:     'Rev',
                dataIndex:  'revision_number',
                width: 40,
                align: 'center'
            },
            {
                header:     'Descrizione',
                dataIndex:  'name'
            },
            {
                xtype:      'offerstatuscolumn',
                header:     'Stato',
                dataIndex:  'offer_state'
            },
            {
                header:     'Cliente',
                dataIndex:  'Contact.name'
            },
            {
                header:     'Riferimento del Cliente',
                dataIndex:  'contact_reference'
            },
            {
                header:     'Data di emissione',
                dataIndex:  'emission_date',
                xtype:      'datecolumn',
                format:     'd/m/Y'
            },
            {
                header:     'Data di conferma',
                dataIndex:  'confirm_date',
                xtype:      'datecolumn',
                format:     'd/m/Y'
            },
            {
                header:     'Referente commerciale',
                dataIndex:  'SalesManager.surname'
            },
            {
                header:     'Segreteria commerciale',
                dataIndex:  'SalesSecretary.surname'
            },
            {
                xtype: 'actioncolumn',
                width: 50,
                items: [{
                    handler: Lab.utils.historyWindow,
                    icon: Lab.CONFIG.root_dir+'/images/icons/blog.png',
                    tooltip: 'Storico'
                }]
            }]
        }),       

        topToolbar = new Ext.Panel({
            border: false,
            items: [{
                xtype: 'filteringtoolbar',
                store: sfStore,
                items: [{
                    xtype: 'combo',
                    name: 'Contact.id',
                    emptyText: 'Cliente',
                    displayField: 'name',
                    valueField: 'id',
                    triggerAction: 'all',
                    pageSize: 20,
                    store: new Lab.sfDirectStore({
                        autoDestroy: true,
                        autoLoad: false,
                        baseParams: {
                            doctrineClass: 'Contact',
                            sort: 'name'
                        },
                        fields: ['id', 'name']
                    })
                }]
            },
            {
                xtype: 'toolbar',
                items: [{
                    text: 'Nuova',
                    handler: this.newWindow,
                    iconCls: 'icon-small-add',
                    scope: this
                },
                {
                    text: 'Copia',
                    handler: this.copy,
                    iconCls: 'icon-offer-copy',
                    scope: this
                },
                {
                    text: 'Conferma',
                    iconCls: 'icon-confirm',
                    handler: this.confirm,
                    scope: this
                },
                {
                    text: 'Genera documento',
                    iconCls: 'icon-report',
                    hidden: Lab.printodt === undefined,
                    handler: function () {
                        var selected = self.getSelectionModel().getSelected();
                        if (selected) {
                            Ext.MessageBox.show({
                                msg: 'Salvataggio Offerta/e, attendere prego...',
                                progressText: 'Salvataggio...',
                                width:300,
                                wait:true,
                                waitConfig: {
                                    interval:200
                                },
                                icon:'icon-disc'
                            });
                            Lab.printodt.offer({
                                offerID: selected.id,
                                keys: self.getSelectionModel().selections.keys
                            },
                            function (result) {
                                this.result = result;
                                if(result.success) {
                                    if(result.res == '1'){
                                        Lab.flash.msg('Offerta creata correttamente', '');
                                    }
                                    else {
                                        Lab.flash.msg('Errore: Offerta non creata', '');
                                    }
                                    sfStore.reload();
                                }
                                if(result.count > 0){
                                    var msg = '';
                                    for(var i = 0; i != result.count; i++){
                                        msg += '<a target="_blank" href="data/offer/'+result.offer[i]+'">'+result.offer[i]+'</a><br />';
                                    }
                                    Ext.MessageBox.show({
                                        height: 300,
                                        width: 500,
                                        buttons: Ext.Msg.OK,
                                        title: 'Offerta Creata',
                                        msg: msg
                                    });
                                }
                            }, this)
                        }
                    }
                },
                {
                    text: 'Ultima Offerta',
                    iconCls: 'icon-report',
                    hidden: Lab.printodt === undefined,
                    handler: function () {
                        var selected = self.getSelectionModel().getSelected();
                        if (selected) {
                            if(selected.data.revision_number != null){
                                var of_name = 'Offerta_' + selected.data.number + '_rev_' + selected.data.revision_number +'.odt';
                                of_name = of_name.replace(new RegExp(/\//g), "_");
                                Ext.MessageBox.show({
                                    height: 300,
                                    width: 500,
                                    buttons: Ext.Msg.OK,
                                    title: 'Ultima Offerta Creata - Offerta:'+selected.data.number,
                                    msg: '<a target="_blank" href="data/offer/' + of_name +'">' + of_name +'</a><br />'
                                });
                            }
                            else {
                              Lab.flash.msg('Attenzione', 'Nessun documento è stato ancora creato per questa offerta');
                            }
                        }
                        else {
                          Lab.flash.msg('Seleziona un offerta', '');
                        }
                    }
                },
                {
                    text: 'Genera ODS',
                    iconCls: 'icon-report',
                    hidden: true,
                    handler: function () {
                        var selected = self.getSelectionModel().getSelected();
                        if (selected) {
                            Ext.MessageBox.show({
                                msg: 'Salvataggio File Offerta, attendere prego...',
                                progressText: 'Salvataggio...',
                                width:300,
                                wait:true,
                                waitConfig: {
                                    interval:200
                                },
                                icon:'icon-disc'
                            });
                            Lab.printodt.offerCalc({
                                offerID: selected.id,
                                keys: self.getSelectionModel().selections.keys
                            },
                            function (result) {
                                this.result = result;
                                if(result.success) {
                                    var msg = '';
                                    if(result.count_f > 0){
                                        msg += '<br /><b>File creati</b><br /><br />'
                                        for(var i = 0; i != result.count_f; i++){
                                            msg += '<a target="_blank" href="data/offer/calc/'+result.files[i]+'">'+result.files[i]+'</a><br />';
                                        }
                                    }
                                    Ext.MessageBox.show({
                                        height: 300,
                                        width: 500,
                                        buttons: Ext.Msg.OK,
                                        title: 'Risultato Creazione File Ods',
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
                }]
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
            stateful: true,
            stateId: 'commercialegrigliaofferte',
            store: sfStore,
            stripeRows: true,
            tbar: topToolbar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.OffersGrid.superclass.constructor.call(this, config);

        // listeners
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    confirm: function (b, e) {
        if (this.selModel.hasSelection()) {
            Ext.Msg.show({
                title: 'Conferma',
                msg: 'Vuoi confermare le offerte selezionate?',
                buttons: Ext.Msg.YESNO,
                fn: function (btn) {
                    if (btn === 'yes') {
                        Ext.each(this.selModel.getSelections(), function (record) {
                            record.set('confirm_date', new Date());
                            record.set('offer_state', 5);
                        });
                    }
                },
                scope: this,
                icon: Ext.Msg.QUESTION,
                animEl: e.getTarget()
            });

            this.store.save();
        } else {
            Lab.flash.msg('Errore', 'Prima selezionare un\'offerta da confermare')
        }
    },

    newWindow: function () {
        var self = this,

        win = new Lab.ObjectWindow({
            title: 'Nuova offerta',
            height: 600,
            width: 840,
            doctrineClass: this.store.baseParams.doctrineClass,
            tabItems: [new Lab.OfferForm()]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                self.store.reload({
                    callback: function (r, options, success) {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id;
                        var created = this.getById(createdId);
                        self.editWindow(created);
                    }
                });
            }
        });
    },

    editWindow: function (record) {
        var self = this,

        win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.number + '"',
            doctrineClass: this.store.baseParams.doctrineClass,
            height: 600,
            width: 840,
            record: record,
            activeTab: 1,
            tabItems: [{
                xtype: 'offerform',
                record: record
            },
            {
                xtype: 'offersectionsgrid',
                offerId: record.id,
                price: record.data.price,
                title: 'Sezioni dell\'offerta'
            }]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                self.store.reload();
            }
        });
    },

    deleteRecords: function () {
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le offerte selezionate?', function (b) {
            if (b === 'yes') {
                if (this.getSelectionModel().selections) {
                    this.store.remove(this.getSelectionModel().getSelections());
                }
            }
        }, this);
    },

    copy: function () {
        if (this.selModel.hasSelection()) {
            var record = this.selModel.getSelected(),

            copyWin = new Ext.Window({
                title: 'Copia offerta "' + record.data.number + '" di ' + record.data['Contact.name'],
                width: 512,
                height: 128,
                bodyStyle: 'background-color:#fff',
                layout: 'fit',
                modal: true,
                padding: 10,
                resizable: false,
                items: [{
                    xtype: 'form',
                    border: false,
                    monitorValid: true,
                    buttons: [{
                        text: 'Copia',
                        formBind: true,
                        handler: function (b) {
                            var form = b.ownerCt.ownerCt.getForm();

                            Lab.offer.copy({
                                data: form.getValues()
                            }, function (r) {
                                if (r.success) {
                                    Lab.flash.msg('Successo', r.message);
                                    copyWin.close();
                                    this.store.reload();
                                }
                            }, this);
                        },
                        scope: this
                    }],
                    defaults: {
                        allowBlank: false,
                        anchor: '-20'
                    },
                    items: [{
                        xtype: 'contactcombo',
                        fieldLabel: 'Per il cliente',
                        hiddenName: 'client_id'
                    },
                    {
                        xtype: 'hidden',
                        name: 'sourceoffer_id',
                        value: record.id
                    }]
                }]
            });
            copyWin.show();
        } else {
            Lab.flash.msg('Errore', "Selezionare l'offerta da copiare")
        }
    }
});

Ext.reg('offersgrid', Lab.OffersGrid);
