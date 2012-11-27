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
 *  Griglia degli ordini in Accettazione.
 */
Lab.AccettazioneOrdersGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        pageSize = 20,

        filters = new Ext.ux.grid.GridFilters({
            encode:         true,
            menuFilterText: 'Filtri',
            filters: [{
                type:       'date',
                dataIndex:  'arrived_at',
                dateFormat: 'Y-m-d H:i:s',
                beforeText: 'Prima del',
                afterText:  'Dopo il',
                onText:     'Il'
            },
            {
                type:       'string',
                dataIndex:  'Contact.name'
            }]
        }),

        sfStore = new Lab.sfDirectStore({
            autoDestroy:    true,
            autoLoad:       false,
            baseParams: {
                doctrineClass: 'Order',
                doctrineJoins: ['Order.Contact', 'Order.Offer']
            },
            fields: [{
                name:       'id'
            },
            {
                name:       'numero'
            },
            {
                name:       'note'
            },
            {
                name:       'billing_options'
            },
            {
                name:       'price'
            },
            {
                name:       'nota_fatturazione'
            },
            {
                name:       'offername',
                mapping:    'Offer ? obj.Offer.number : null'
            },
            {
                name:       'revision_number',
                mapping:    'Offer ? obj.Offer.revision_number : null'
            },
            {
                name:       'Contact.name',
                mapping:    'Contact ? obj.Contact.name : null'
            },
            {
                name:       'contactnote',
                mapping:    'Contact ? obj.Contact.note_order : null'
            },
            {
                name:       'contactalias',
                mapping:    'Contact ? obj.Contact.alias : null'
            },
            {
                name:       'billing_contact_id'
            },
            {
                name:       'contact_id'
            },
            {
                name:       'offer_id'
            },
            {
                name:       'user_id'
            },
            {
                name:       'technical_manager_id'
            },
            {
                name:       'to_send'
            },
            {
                name:       'arrived_at',
                type:       'date',
                dateFormat: 'Y-m-d H:i:s'
            }],
            pageSize: pageSize,
            sortInfo: {
                field: 'arrived_at',
                direction: 'DESC'
            }
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header: '#',
                dataIndex: 'numero'
            },
            {
                header: 'Cliente',
                dataIndex: 'Contact.name'
            },
            {
                header: 'Data arrivo',
                dataIndex: 'arrived_at',
                renderer: Ext.util.Format.dateRenderer('d M Y H:i')
            }]
        }),

        actionBar = new Ext.Toolbar({
            items: [{
                text: 'Nuovo',
                handler: this.newWindow,
                iconCls: 'icon-small-add',
                scope: this
            },
            {
                text: 'Accetta',
                iconCls: 'icon-small-stamp',
                disabled: true,
                handler: function (b, e) {
                    Ext.Msg.confirm('Conferma', 'Vuoi accettare gli ordini selezionati?', function (b) {
                        if (b === 'yes') {
                            Ext.each(self.getSelectionModel().getSelections(), function (item) {
                                Lab.order.sbozza({
                                    orderId: item.id
                                }, function (result, e) {
                                    self.store.reload();
                                });
                            });
                        }
                    });
                }
            },
            {
                text: 'Genera ODT',
                iconCls: 'icon-report',
                disabled: true,
                hidden: Lab.printodt === undefined,
                handler: function () {
                    var selected = self.getSelectionModel().getSelected();
                    if (selected) {
                        Ext.MessageBox.show({
                            msg: 'Salvataggio Dettaglio Ordine, attendere prego...',
                            progressText: 'Salvataggio...',
                            width:300,
                            wait:true,
                            waitConfig: {
                                interval:200
                            },
                            icon:'icon-disc'
                        });
                        Lab.printodt.printOrderDetail({
                            orderID: selected.id,
                            keys: self.getSelectionModel().selections.keys
                        },
                        function (result) {
                            this.result = result;
                            if(result.success) {
                                if(result.res == '1'){
                                    Lab.flash.msg('Dettaglio Ordine creato correttamente', '');
                                }
                                else {
                                    Lab.flash.msg('Errore: Dettaglio Ordine non creato', '');
                                }
                                sfStore.reload();
                            }
                            if(result.count > 0){
                                var msg = '';
                                for(var i = 0; i != result.count; i++){
                                    msg += '<a target="_blank" href="data/order_detail/'+result.order[i]+'">'+result.order[i]+'</a><br />';
                                }
                                Ext.MessageBox.show({
                                    height: 300,
                                    width: 500,
                                    buttons: Ext.Msg.OK,
                                    title: 'Dettaglio Ordine Creato',
                                    msg: msg
                                });
                            }
                        }, this)
                    }
                }
            },
            {
                text: 'Stampa etichetta',
                iconCls: 'icon-report',
                disabled: true,
                handler: function () {
                    if (self.selModel.hasSelection()) {
                        var selected = self.getSelectionModel().getSelected();
                        location.href = Lab.CONFIG.base_url + '/order/printLabel?orderID=' + selected.id;
                    }
                }
            },
            '->',
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                disabled: true,
                handler: function (b, e) {
                    Ext.Msg.confirm('Attenzione', 'Vuoi eliminare gli ordini selezionati?', function (b) {
                        if (b === 'yes') {
                            sfStore.remove(self.getSelectionModel().getSelections());
                        }
                    });
                }
            }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Visualizzati ordini da {0} a {1} di {2}',
                emptyMsg: 'Non ci sono ordini da visualizzare',
                pageSize: pageSize,
                plugins: [filters],
                store: sfStore
            }),
            border:     false,
            cm:         colModel,
            loadMask:   true,
            stateId:    'accettazionegrigliaordini',
            stateful:   true,
            plugins:    [filters],
            store:      sfStore,
            stripeRows: true,
            tbar:       actionBar,
            listeners: {
                rowdblclick: function (grid, rowIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    grid.editWindow(record);
                }
            },
            viewConfig: {
                forceFit:   true
            }
        }, config);
        
        Lab.AccettazioneOrdersGrid.superclass.constructor.call(this, config);

        this.getSelectionModel().on('selectionchange', function (sm) {
            this.getTopToolbar().items.each(function () {
                if (this.initialConfig.disabled) {
                    this.setDisabled(!sm.hasSelection());
                }
            })
        }, this);

        this.store.load({
            params: {
                start:  0,
                limit:  this.store.pageSize
            }
        });
    },

    editWindow: function (record) {
        var wtitle;

        if (record.data.contactalias == null) {
            wtitle = 'Modifica "' + record.data.numero + '" - ' + record.data['Contact.name'];
        } else {
            wtitle = 'Modifica "' + record.data.numero + '" - ' + record.data.contactalias + ' - ' + record.data['Contact.name'];
        }

        var win = new Lab.ObjectWindow({
            title:          wtitle,
            doctrineClass:  'Order',
            record:         record,
            activeTab:      1,
            height:         512,
            tabItems: [new Lab.OrderForm({
                record: record
            }), new Lab.SamplesGrid({
                title: 'Campioni associati',
                order: record
            })]
        });

        win.on('close', function (w) {
            if (w.result) {
                this.store.reload();
            }
        }, this);

        win.show();
    },

    newWindow: function () {
        var win = new Lab.ObjectWindow({
            title:          'Nuovo ordine',
            height:         512,
            doctrineClass:  'Order',
            tabItems:       [new Lab.OrderForm()]
        });
        
        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                this.store.reload({
                    callback:   function () {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id;
                        var created = this.store.getById(createdId);
                        this.editWindow(created);
                    },
                    scope:      this
                });
            }
        }, this);

        win.show();
    }
});

Ext.reg('accettazioneordersgrid', Lab.AccettazioneOrdersGrid);
