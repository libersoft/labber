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
 * 
 */
Lab.SamplesGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        dateRenderer = Ext.util.Format.dateRenderer('d/m/Y'),

        fullName = function (v, record) {
            if (record.Order.Contact) {
                if(record.Order.Contact.alias != null) return record.Order.Contact.alias + ' - ' + record.Order.Contact.name;
                else return record.Order.Contact.name;
            } else {
                return null;
            }
        },

        sfStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'Sample',
                doctrineJoins: ['Sample.Order.Contact', 'Sample.Determinations', 'Sample.Files'],
                dir: 'DESC'
            },
            fields: [{
                name: 'id'
            },
            {
                name: 'numero'
            },
            {
                name: 'contactname',
                mapping: 'Order.Contact ? obj.Order.Contact.name : null'
            },
            {
                name: 'contactnote',
                mapping: 'Order.Contact ? obj.Order.Contact.note : null'
            },
            {
                name: 'contactalias',
                mapping: 'Order.Contact ? obj.Order.Contact.alias : null'
            },
            {
                name: 'order_id'
            },
            {
                name: 'bozza'
            },
            {
                name: 'sample_type_id'
            },
            {
                name: 'gruppo_matrice'
            },
            {
                name: 'matrix_id'
            },
            {
                name: 'codcliente'
            },
            {
                name: 'fullname',
                type: 'string',
                convert: fullName
            },
            {
                name: 'descrizione'
            },
            {
                name: 'data_campionamento',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'ora_campionamento'
            },
            {
                name: 'acuradi'
            },
            {
                name: 'metodo_campionamento'
            },
            {
                name: 'punto_campionamento'
            },
            {
                name: 'campionatore'
            },
            {
                name: 'luogo_campionamento'
            },
            {
                name: 'data_prelievo',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'ora_prelievo'
            },
            {
                name: 'fine_prelievo'
            },
            {
                name: 'prelevato_da'
            },
            {
                name: 'addetto_prelievo'
            },
            {
                name: 'luogo_prelievo'
            },
            {
                name: 'punto_prelievo'
            },
            {
                name: 'note_prelievo'
            },
            {
                name: 'data_ritiro',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'ritirato_da'
            },
            {
                name: 'ritiratore'
            },
            {
                name: 'luogo_ritiro'
            },
            {
                name: 'temperatura'
            },
            {
                name: 'stampa_temperatura'
            },
            {
                name: 'is_adequate'
            },
            {
                name: 'condizioni'
            },
            {
                name: 'data_scadenza',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'trasportatore'
            },
            {
                name: 'trasporto'
            },
            {
                name: 'notalab'
            },
            {
                name: 'notardp'
            },
            {
                name: 'stato'
            },
            {
                name: 'storico'
            },
            {
                name: 'urgency'
            },
            {
                name: 'place_execution_test'
            },
            {
                name: 'unlocked',
                type: 'boolean'
            },
            {
                name: 'limits_group_id'
            },
            {
                name: 'price_total',
                convert: function (v, record) {
                    var total = 0;

                    Ext.each(record.Determinations, function (determination) {
                        total += Ext.num(determination.offered_price, 0);
                    });

                    return total;
                }
            }],
            remoteSort: false
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable:   true,
                width:      160
            },
            columns: [{
                header:     'Numero campione',
                dataIndex:  'numero'
            },
            {
                header:     'Descrizione',
                dataIndex:  'descrizione',
                sortable:   false,
                width:      250
            },
            {
                header:     'Priorità',
                dataIndex:  'urgency',
                xtype:      'defconcolumn'
            },
            {
                header:     'Codice riferimento cliente',
                dataIndex:  'codcliente'
            },
            {
                header:     'Nota per il laboratorio',
                dataIndex:  'notalab',
                sortable:   false,
                width:      250
            },
            {
                header:     'Data scadenza',
                dataIndex:  'data_scadenza',
                renderer:   dateRenderer
            },
            {
                header:     'Nota rdp',
                dataIndex:  'notardp',
                width:      250
            },
            {
                header:     'Cliente',
                dataIndex:  'fullname',
                renderer: function (value, metadata, record) {
                    if (record.data.contactnote) {
                        metadata.attr = 'ext:qtip="' + record.data.contactnote + '" ext:qtitle="<h3>Note Cliente:</h3>"';
                    }

                    return value;
                }
            },
            {
                header: 'Norma di Campionamento',
                dataIndex: 'metodo_campionamento'
            },
            {
                header: 'A cura di',
                dataIndex: 'prelevato_da'
            },
            {
                header: 'Data prelievo/campionamento',
                dataIndex: 'data_prelievo',
                renderer: dateRenderer
            },
            {
                header: 'Data ritiro',
                dataIndex: 'data_ritiro',
                renderer: dateRenderer
            },
            {
                header: 'Trasportatore',
                dataIndex: 'trasportatore'
            },
            {
                header: 'Trasporto',
                dataIndex: 'trasporto'
            },
            {
                header: 'Condizioni',
                dataIndex: 'condizioni'
            },
            {
                header: 'Prezzo totale',
                dataIndex: 'price_total'
            },
            {
                header: 'Stato',
                dataIndex: 'stato',
                xtype: 'samplestatuscolumn'
            },
            {
                xtype: 'actioncolumn',
                header: 'Allegati',
                width: 50,
                renderer: function (v, m, r) {
                    if (Ext.isEmpty(r.json.Files))
                        m.css = 'method-grid-displaynone';
                },
                items: [{
                    icon: Lab.CONFIG.root_dir + '/images/icons/paper-clip.png',
                    tooltip: 'Mostra allegati',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex),

                        win = new Ext.Window({
                            width: 500,
                            height: 300,
                            layout: 'fit',
                            modal: true,
                            plain: true,
                            title: 'Allegati',
                            items: new Lab.AttachmentFileGrid({
                                doctrineClass: 'SampleFile',
                                doctrineField: 'sample_id',
                                objectId: record.id,
                                uploadDir: 'samples',
                                tbar: null,
                                title: null
                            })
                        });

                        win.show();
                    }
                }]
            }]
        }),

        newWindow = function () {
            var win = new Lab.ObjectWindow({
                title: 'Nuovo campione',
                doctrineClass: 'Sample',
                width: 900,
                height: 550,
                minWidth: 640,
                minHeight: 480,
                tabItems: [new Lab.SampleForm({order: config.order})],
                listeners: {
                    close: function (w) {
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
                    }
                }
            });
            win.show();
        };

        config = Ext.apply({
            cm:         colModel,
            iconCls:    'icon-small-jar-empty',
            store:      sfStore,
            stateId:    'accettazionegrigliacampioni',
            stateful:   true,
            tbar:       new Ext.Toolbar(),
            listeners: {
                rowdblclick: function (grid, rowIndex) {
                    this.editWindow(grid.getStore().getAt(rowIndex));
                }
            }
        }, config);

        Lab.SamplesGrid.superclass.constructor.call(this, config);

        if (this.order) {
            // la Grid è nella finestra di edit di un Order
            // filtro per order_id
            var doctrineWheres = [{
                field:      'order_id',
                operator:   '=',
                value:      this.order.id
            }];
            this.store.setBaseParam('doctrineWheres', doctrineWheres);

            // Aggiungi i bottoni alla toolbar
            var tbar = this.getTopToolbar();

            tbar.addButton([{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                handler: newWindow
            },
            {
                text: 'Copia campione',
                iconCls: 'icon-sample-copy',
                disabled: true,
                handler: this.copy,
                scope: this
            },
            {
                text: 'Sblocca',
                iconCls: 'icon-unlock',
                disabled: true,
                handler: function () {
                    var sample = this.getSelectionModel().getSelected();
                    sample.set('unlocked', true);
                    this.editWindow(sample);
                },
                scope: this
            },
            {
                xtype: 'splitbutton',
                text: 'Genera documenti',
                iconCls: 'icon-report',
                disabled: true,
                handler: function () {
                    this.showMenu();
                },
                hidden: !Lab.hasOwnProperty('printodt'),
                menu: {
                    defaults: {
                        iconCls: 'icon-report'
                    },
                    items: [{
                        text: 'Accettazione (ODT)',
                        handlerFn: Lab.printodt ? Lab.printodt.acceptance : null,
                        handler: this.buttonHandler,
                        scope: this
                    },
                    {
                        text: 'Incarico di analisi (ODT)',
                        handlerFn: Lab.printodt ? Lab.printodt.analysisTask : null,
                        handler: this.buttonHandler,
                        scope: this
                    }]
                }
            }]);
            tbar.addFill();
            tbar.addButton({
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                disabled: true,
                handler: function (b) {
                    var sm = self.getSelectionModel();
                    Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i campioni selezionati?', function (b) {
                        if (b === 'yes') {
                            sfStore.remove(sm.getSelections());
                        }
                    });
                }
            });
            tbar.doLayout();

            // Carico i dati
            this.store.load();
        }

        this.getSelectionModel().on('selectionchange', function (sm) {
            this.getTopToolbar().items.each(function () {
                if (this.initialConfig.disabled) {
                    this.setDisabled(!sm.hasSelection());
                }
            });
        }, this);
        
    },

    buttonHandler: function (button) {
        Ext.MessageBox.show({
            msg: 'Salvataggio, attendere prego...',
            progressText: 'Salvataggio...',
            width: 300,
            wait: true,
            waitConfig: {
                interval: 200
            },
            icon: 'icon-disc'
        });

        button.handlerFn({
            keys: this.getSelectionModel().selections.keys
        }, function (result) {
            if (result.success) {
                if (result.files.length > 0) {
                    var msg = '';

                    for (var i = 0; i != result.files.length; i++) {
                        msg += '<a target="_blank" href="' + result.path + result.files[i] + '">' + result.files[i] + '</a><br />';
                    }

                    Ext.MessageBox.show({
                        height: 300,
                        width: 500,
                        buttons: Ext.Msg.OK,
                        title: 'Documenti creati',
                        msg: msg
                    });
                }
            } else {
                Lab.flash.msg('Errore: documenti non creati', '');
            }
        }, this);
    },

    editWindow: function (record) {
        // Non aprire in edit un campione validato
        if (record.data.stato < 3) {
            var editWindowTitle, self = this;

            if (record.json.SampleType == null) {
                if (record.data.contactalias == null) {
                    editWindowTitle = 'Modifica "' + record.data.numero + '" - '+record.data.contactname;
                }
                else editWindowTitle = 'Modifica "' + record.data.numero + '" - '+record.data.contactalias+' - '+record.data.contactname;
            }
            else {
                if (record.data.contactalias == null) {
                    editWindowTitle = 'Modifica "' + record.data.numero + '" - '+record.data.contactname;
                }
                else editWindowTitle = 'Modifica "' + record.data.numero + '" Prodotto:' + record.json.SampleType.name + '" - '+record.data.contactalias+' - '+record.data.contactname;
            }

            var tabItems = [
                {
                    xtype: 'sampleform',
                    order: self.order
                },
                {
                    xtype: 'determinationgrid',
                    recordLocal: 'sample_id',
                    recordId: record.data.id,
                    recordOfferId: record.json.Order ? record.json.Order.offer_id : undefined,
                    limitsGroupID: record.data.limits_group_id,
                    inSample: true,
                    unlocked: record.data.unlocked,
                    sm: new Ext.grid.RowSelectionModel()
                },
                {
                    xtype: 'attachmentfilegrid',
                    doctrineClass: 'SampleFile',
                    doctrineField: 'sample_id',
                    objectId: record.id,
                    uploadDir: 'samples'
                }
            ];

            if (record.data.unlocked) {
                // mostra il dettaglio prezzi
                tabItems.splice(2, 0, {
                    xtype: 'samplesourcegrid',
                    title: 'Dettaglio prezzi',
                    price: record.data.price,
                    recordId: record.id
                });
            }

            var win = new Lab.ObjectWindow({
                title: editWindowTitle,
                width: 900,
                height: 550,
                minWidth: 640,
                minHeight: 480,
                maximizable: true,
                doctrineClass: 'Sample',
                record: record,
                activeTab: 1,
                tabItems: tabItems
            });
            win.show();

            win.on('close', function (w) {
                if (w.result) {
                    self.store.reload();
                }
            });
        } else {
            Lab.flash.msg('Impossibile modificare', 'Il campione è già stato validato');
        }
    },

    copy: function () {
        var sample = this.getSelectionModel().getSelected(),

            win = new Ext.Window({
                title: 'Copia campione',
                width: 320,
                height: 220,
                border: false,
                layout: 'fit',
                modal: true,
                plain: true,
                items: [{
                    xtype: 'form',
                    defaults: {
                        xtype: 'checkbox',
                        align: '-20'
                    },
                    padding: 10,
                    items: [{
                        fieldLabel:     'Descrizione',
                        name:           'descrizione'
                    },
                    {

                        fieldLabel:     'Controlli',
                        name:           'controlli'
                    },
                    {

                        fieldLabel:     'Risultati',
                        name:           'risultati'
                    },
                    {
                        xtype:          'numberfield',
                        fieldLabel:     'Numero di copie',
                        name:           'numero',
                        allowBlank:     false,
                        allowDecimals:  false,
                        allowNegative:  false,
                        value:          1
                    }]
                }],
                buttons: [{
                    text: 'OK',
                    iconCls: 'icon-small-ok',
                    handler: function () {
                        var win  = this.ownerCt.ownerCt,
                            form = win.items.first().getForm();

                        if (form.isValid()) {
                            var values = Ext.apply(form.getFieldValues(), {sample_id: sample.id});

                            Lab.sample.copy({values: values}, function (result) {
                               win.result = result;
                               win.close();
                            });
                        } else {
                            Lab.flash.msg('Impossibile salvare', 'Alcuni campi non sono coerenti');
                        }
                    }
                }]
            });

        win.show();

        win.on('close', function (w) {
            if (w.result) {
                Lab.flash.msg('Operazione completata', 'Copie create con successo');
                this.store.reload();
            }
        }, this);
    }
});

Ext.reg('samplesgrid', Lab.SamplesGrid);
