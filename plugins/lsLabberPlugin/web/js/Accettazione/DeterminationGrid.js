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
 * Lista di controlli aggiunti.
 * Riceve un recordId e un recordLocal che indica su quale campo del
 * db salvare valori e filtrare che sia Sample o Packet
 */
Lab.DeterminationGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        sfStore =  new Ext.data.GroupingStore({
            autoLoad: true,
            autoSave: true,
            baseParams: {
                doctrineClass: 'Determination',
                doctrineJoins: ['Determination.Denomination', 'Determination.Matrix', 'Determination.Method', 'Determination.Scale', 'Determination.UnitOfMeasurement'],
                doctrineWhereIns: [{field: config.recordLocal, valueSet: [config.recordId]}]
            },
            groupField: 'origine',
            proxy: new Ext.data.DirectProxy({
                api: {
                    create: Lab.db.create,
                    read: Lab.db.list,
                    update: Lab.db.update,
                    destroy: Lab.db.destroy
                }
            }),
            reader: new Ext.data.JsonReader({
                root: 'data',
                totalProperty: 'total',
                idProperty: 'id',
                fields: ['id',
                {
                    name: 'denomination',
                    mapping: 'Denomination ? obj.Denomination.name : null'
                },
                {
                    name: 'matrix',
                    mapping: 'Matrix ? obj.Matrix.name : null'
                }, 'method_id',
                {
                    name: 'method',
                    mapping: 'Method ? obj.Method.name : null'
                }, 'scale_id', 'um_id',
                {
                    name: 'scala/unita',
                    convert: function (v, record) {
                        var prefix = (record.Scale) ? record.Scale.prefix : '';
                        var symbol = (record.UnitOfMeasurement) ? record.UnitOfMeasurement.symbol : '';
                        return prefix + symbol;
                    }
                }, 'tipo_controllo', 'data_inizio', 'data_fine', 'data_scadenza', 'priorita',
                'nota_report', 'nota_laboratorio', 'cifre_decimali', 'cifre_significative',
                'risultato_formattato', 'valore_inserito', 'storico',
                {
                    name: 'stampa',
                    type: 'bool'
                }, 'incertezza', 'recupero', 'limiti', 'denomination_alias',
                {
                    name: 'numriga_report',
                    type: 'int'
                },
                {
                    name: 'origine',
                    convert: function (v, rec) {
                        // lo spazio davanti non è un errore
                        return v ? v : ' Singolo';
                    }
                }, 'pdp', 'is_sinal',
                {
                    name: 'price',
                    type: 'number'
                },
                {
                    name: 'params',
                    convert: Lab.utils.implode
                }]
            }),
            remoteGroup: false,
            sortInfo: {
                field: 'denomination',
                direction: 'ASC'
            },
            writer: new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: false
            })
        }),

        checkColumnStampa = new Ext.grid.CheckColumn({
            header: 'Stampa',
            dataIndex: 'stampa',
            width: 75
        }),

        buttonsBar = new Ext.Toolbar({
            items: [{
                text:    "Offerta",
                iconCls: 'icon-small-offer',
                hidden:  !config.recordOfferId,
                handler: function (b) {
                    Lab.db.list({
                        doctrineClass: 'Offer',
                        doctrineWhereIns: [{
                            field: 'id',
                            valueSet: [config.recordOfferId]
                        }]
                    }, function (result, e) {
                        var offers = new Lab.OffersGrid(),
                            record = {
                                data: result.data[0],
                                id: config.recordOfferId
                            };

                        offers.editWindow(record);
                    });
                }
            },
            {
                text:       "Inserisci da sezione d'offerta",
                iconCls:    'icon-small-table-insert-row',
                hidden:     !config.recordOfferId,
                handler: function (b) {
                    b.showMenu();
                },
                menu: new Ext.menu.Menu({
                    items: [{
                        text: 'Composta',
                        iconCls: 'icon-small-table-insert-row',
                        handler: this.insertFromOfferSection,
                        scope: this
                    },
                    {
                        text: 'Semplice',
                        iconCls: 'icon-small-table-insert-row',
                        handler: this.singleInsert,
                        scope: this,
                        insertXtype: 'protoinsert',
                        protoType: 'OfferSection',
                        windowTitle: 'Inserimento di sezioni semplici'
                    }]
                })
            },
            {
                xtype: 'splitbutton',
                text: 'Inserisci da pacchetto',
                iconCls: 'icon-small-da-pacchetto',
                hidden: !config.unlocked,
                handler: function (b) {
                    b.showMenu();
                },
                menu: new Ext.menu.Menu({
                    items: [{
                        text: 'Composto',
                        iconCls: 'icon-small-da-pacchetto',
                        handler: function (b) {
                            var win = new Ext.Window({
                                width: 512,
                                height: 160,
                                bodyStyle: 'background-color:#fff;padding: 10px',
                                iconCls: b.iconCls,
                                layout: 'fit',
                                modal: true,
                                resizable: false,
                                title: 'Inserimento pacchetti',
                                items: {
                                    xtype: 'form',
                                    border: false,
                                    buttons: [{
                                        text: 'Inserisci controlli',
                                        handler: function () {
                                            var values = this.ownerCt.ownerCt.ownerCt.items.itemAt(0).form.getFieldValues();
                                            Lab.determination.add({
                                                recordId: config.recordId,
                                                recordLocal: config.recordLocal,
                                                values: values
                                            }, function (result) {
                                                sfStore.reload();
                                                Lab.flash.msg(result.success ? 'Successo' : 'Errore', result.message);
                                            });
                                        }
                                    }],
                                    defaults: {
                                        anchor: '-20'
                                    },
                                    items: [{
                                        xtype: 'packetcombo'
                                    }]
                                }
                            });
                            win.show();
                        }
                    },
                    {
                        text: 'Semplice',
                        iconCls: 'icon-add-protopacket',
                        handler: this.singleInsert,
                        scope: this,
                        insertXtype: 'protoinsert',
                        protoType: 'Packet',
                        windowTitle: 'Inserimento di pacchetti semplici'
                    }]
                })
            },
            {
                xtype:      'splitbutton',
                text:       'Inserisci singolo',
                iconCls:    'icon-small-wizard',
                hidden:     !config.unlocked,
                handler: function (b) {
                    b.showMenu();
                },
                menu: new Ext.menu.Menu({
                    defaults: {
                        handler:    self.singleInsert,
                        scope:      self
                    },
                    items: [{
                        text:           'Guidato',
                        iconCls:        'icon-small-wizard',
                        insertXtype:    'rawinsert'
                    },
                    {
                        text:           'da Tabella limiti',
                        iconCls:        'icon-wall-brick',
                        insertXtype:    'insertfromlimits',
                        handler:        this.chooseLimits,
                        nextFunction:   this.singleInsert
                    }]
                })
            },
            '-',
            {
                text: 'Importa limiti',
                iconCls: 'icon-setlimits',
                handler: this.chooseLimits,
                nextFunction: this.setLimits,
                scope: this
            },
            '->',
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina il controllo selezionato',
                hidden: !config.unlocked,
                handler: function (b, e) {
                    Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i controlli selezionati?', function (b) {
                        if (b === 'yes') {
                            if (self.getSelectionModel().selections) {
                                // RowSelectionModel
                                sfStore.remove(self.getSelectionModel().getSelections());
                            } else {
                                // CellSelectionModel
                                sfStore.remove(self.getSelectionModel().selection.record);
                            }
                        }
                    });
                }
            }]
        }),

        columns = [new Ext.grid.RowNumberer(), {
            header: 'Denominazione',
            dataIndex: 'denomination'
        },
        {
            header: 'Matrice',
            dataIndex: 'matrix'
        },
        {
            header: 'Metodo',
            dataIndex: 'method'
        },
        {
            header: 'Pacchetto semplice',
            dataIndex: 'origine'
        },
        {
            header: 'Pacchetto composto',
            dataIndex: 'pdp'
        },
        {
            header: 'Data Scadenza',
            dataIndex: 'data_scadenza',
            editor: {
                xtype: 'datefield',
                format: 'd/m/Y',
                selectOnFocus: true
            },
            renderer: function (v) {
                return Ext.util.Format.date(v, 'd/m/Y');
            }
        },
        {
            header:     'Priorità',
            dataIndex:  'priorita',
            xtype:      'defconcolumn'
        },
        {
            header: 'Nota Report',
            dataIndex: 'nota_report',
            editor: new Ext.form.TextField()
        },
        {
            header: 'Unità di misura',
            dataIndex: 'scala/unita'
        },
        {
            header: 'Cifre Decimali',
            dataIndex: 'cifre_decimali',
            editor: new Ext.form.NumberField()
        },
        {
            header: 'Cifre Significative',
            dataIndex: 'cifre_significative',
            editor: new Ext.form.NumberField()
        },
        {
            header: 'Incertezza',
            dataIndex: 'incertezza',
            editor: new Ext.form.TextField()
        },
        {
            header: 'Recupero',
            dataIndex: 'recupero',
            editor: new Ext.form.TextField()
        },
        {
            header: 'Limiti',
            dataIndex: 'limiti',
            editor: new Ext.form.TextField()
        },
        {
            header: 'Alias denominazione',
            dataIndex: 'denomination_alias',
            editor: new Ext.form.TextField()
        },
        {
            header: 'Accreditato?',
            dataIndex: 'is_sinal',
            renderer: function (value) {
                return (value) ? 'Sì' : 'No';
            }
        },
        {
            header: 'Parametri',
            dataIndex: 'params'
        },
        checkColumnStampa,
        {
            header: 'Numero riga report',
            dataIndex: 'numriga_report',
            align: 'right',
            editor: new Ext.form.NumberField(),
            width: 115
        }],

        costSum = new Ext.Toolbar.TextItem('0');

        if (!config.inSample) {
            columns.push({
                xtype: 'numbercolumn',
                header: 'Costo',
                dataIndex: 'price',
                align: 'right',
                format: '0.000,00/i'
            });
        }

        config = Ext.apply({
            title: 'Controlli',
            border: false,
            cm: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true,
                    width: 150
                },
                columns: columns
            }),
            ddGroup: 'gridDDGroup',
            enableDragDrop: true,
            iconCls: 'icon-small-determination',
            loadMask: true,
            stateId: 'accettazionegrigliacontrolli',
            stateful: true,
            store: sfStore,
            bbar: {
                xtype: 'statusbar',
                hidden: config.inSample,
                items: ['Costo totale:', costSum, '\u20ac']
            },
            tbar: buttonsBar,
            plugins: [checkColumnStampa],
            view: new Ext.grid.GroupingView({
                getRowClass: function (record) {
                    // Se esiste un'indicazione dei giorni di lavoro di un metodo ed è stata
                    // settata una data di scadenza, effettua il controllo
                    var due = record.data.data_scadenza,
                        days = record.json.Method.days,
                        created = record.json.created_at;

                    if (due && days) {
                        // 'created_at' espresso in epoch time
                        created = Date.parseDate(created, "Y-m-d H:i:s");
                        created = created.format("U");

                        // 'data_scadenza' espressa in epoch time
                        due = Date.parseDate(due, "Y-m-d");
                        due = due.format("U");

                        // secondi minimi per effettuare un controllo con questo metodo
                        days *= 86400;

                        if (due - created < days) {
                            return 'determination-grid-fuoritempo';
                        }
                    }

                    // Caratterizzazione completa di un controllo
                    var uom = record.data.um_id,
                        dec = record.data.cifre_decimali,
                        sig = record.data.cifre_significative,
                        loq = record.data.loq,
                        lod = record.data.lod,
                        unc = record.data.incertezza,
                        rec = record.data.incertezza;

                    if (!uom || !dec || !sig || !loq || !lod || !unc || !rec) {
                        return 'determination-grid-incompleto';
                    }

                    // default
                    return '';
                },
                // custom grouping text template to display the number of items per group
                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Controlli" : "Controllo"]})',
                startCollapsed: false
            })
        }, config);

        Lab.DeterminationGrid.superclass.constructor.call(this, config);

        this.on('rowdblclick', this.edit);
        this.on('rowcontextmenu', this.menu);
        this.on('render', this.drop);

        sfStore.on('load', function () {
            Ext.fly(costSum.getEl()).update(Ext.util.Format.number(this.sum('price'), '0.000,00/i'));
        });
    },

    drop: function () {
        var t = this.getView(),
        ddrow = new Ext.dd.DropTarget(this.getView().mainBody, {
            ddGroup: 'gridDDGroup',
            notifyOver : function (dd, e, data) {
                var dropIndex = t._flyweight.dom.rowIndex;
                return dropIndex !== undefined ? "x-dd-drop-ok" : "x-dd-drop-nodrop";
            },
            notifyDrop: function (ddSource, e, data) {
                var dropIndex = t._flyweight.dom.rowIndex;

                if (dropIndex !== undefined) {
                    var drop = t.ds.getAt(dropIndex),
                    dropOrigin = drop.json.origine;

                    Ext.each(ddSource.dragData.selections, function () {
                        this.set('origine', dropOrigin);
                    });

                    t.ds.reload();
                }
            }
        });
    },

    menu: function (grid, rowIndex, e) {
        // non mostra il menù del tasto destro del browser
        e.stopEvent();

        // crea il menù
        if (!grid.rowContextMenu) {
            grid.rowContextMenu = new Ext.menu.Menu({
                items: {
                    text:       'Modifica selezionati',
                    handler:    grid.batchEdit,
                    iconCls:    'icon-beaker-pencil',
                    scope:      grid
                }
            });
        }

        // mostralo dove si è destrocliccato
        grid.rowContextMenu.showAt(e.getXY());
    },

    batchEdit: function (b, e) {
        var grid = this,

        selModel = this.selModel,

        form = new Lab.DeterminationForm({
            methodID:       selModel.getSelected().get('method_id'),
            monitorValid:   true
        }),

        win = new Ext.Window({
            buttonAlign:    'center',
            iconCls:        'icon-small-clipboard-task',
            modal:          true,
            layout:         'fit',
            plain:          true,
            width:          400,
            height:         450,
            items:          [form]
        });

        win.addButton({
            text:       'OK',
            formBind:   true,
            iconCls:    'icon-small-ok'
        }, function () {
            var values = form.getForm().getValues();

            // salviamo solo quello che è effettivamente settato
            Ext.iterate(values, function (key, value, o) {
                if (value == "") {
                    delete o[key];
                }
            });

            Ext.each(selModel.getSelections(), function (rec) {
                rec.beginEdit();
                Ext.iterate(values, function (key, value, o) {
                    rec.set(key, value);
                });
                rec.endEdit();
            });

            win.result = true;
            win.close();
        });

        win.on('close', function (w) {
            if (w.result) {
                grid.getSelectionModel().clearSelections();
                grid.store.reload();
            }
        });

        win.show(e.getTarget());
    },

    edit: function (grid, rowIndex, e) {
        var record = grid.getStore().getAt(rowIndex),

        form = new Lab.DeterminationForm({
            methodID:   record.data.method_id,
            inSample:   this.inSample
        }),

        win = new Ext.Window({
            buttonAlign:    'center',
            iconCls:        'icon-small-clipboard-task',
            modal:          true,
            layout:         'fit',
            plain:          true,
            width:          400,
            height:         500,
            items:          [form]
        });

        win.addButton({
            text: 'OK',
            iconCls: 'icon-small-ok'
        }, function () {
            var basicForm = form.getForm();

            if (basicForm.isValid()) {
                var values = basicForm.getFieldValues(true);

                Lab.db.update({
                    doctrineClass:  'Determination',
                    data:           values
                }, function (result) {
                    this.result = result;
                    this.close();
                }, win);
            } else {
                Ext.Msg.alert('Impossibile salvare', 'Alcuni campi non sono coerenti')
            }
        });

        win.on('close', function (w) {
            if (w.result) {
                grid.getSelectionModel().clearSelections();
                grid.store.reload();
            }
        });

        win.show(e.getTarget(), function () {
            form.getForm().loadRecord(record);
        });
    },

    insertFromOfferSection: function (b) {
        var that = this, recordID = this.recordId, offerID = this.recordOfferId,

        win = new Ext.Window({
            width: 512,
            height: 160,
            bodyStyle: 'background-color:#fff;padding: 10px',
            iconCls: b.iconCls,
            layout: 'fit',
            modal: true,
            resizable: false,
            items: {
                xtype: 'form',
                border: false,
                buttons: [{
                    text: 'Inserisci controlli',
                    handler: function () {
                        var values = this.ownerCt.ownerCt.ownerCt.items.itemAt(0).form.getFieldValues();
                        Lab.determination.addFromOfferSection({
                            recordId: recordID,
                            values: values
                        }, function (result) {
                            that.store.reload();
                            Lab.flash.msg(result.success ? 'Successo' : 'Errore', result.message);
                        });
                    }
                }],
                defaults: {
                    anchor: '-20'
                },
                items: [{
                    xtype:          'combo',
                    fieldLabel:     'Sezione di offerta',
                    name:           'offer_section_id',
                    displayField:   'title',
                    valueField:     'id',
                    triggerAction:  'all',
                    store: new Lab.sfDirectStore({
                        autoDestroy:    true,
                        autoLoad:       false,
                        baseParams: {
                            doctrineClass:  'OfferSection',
                            doctrineWheres: [{
                                field:      'offer_id',
                                operator:   '=',
                                value:      offerID
                            }],
                            sort:           'title'
                        },
                        fields:         ['id', 'title']
                    })
                }]
            }
        });
        win.show();
    },

    singleInsert: function (b) {
        var that = this,

        win = new Ext.Window({
            iconCls:    b.iconCls,
            width:      960,
            height:     480,
            layout:     'fit',
            maximizable: true,
            modal:      true,
            resizable:  false,
            title: b.windowTitle ? b.windowTitle : "Inserimento " + b.text,
            items: {
                xtype:          b.insertXtype,
                recordId:       that.recordId,
                recordLocal:    that.recordLocal,
                offerSection:   that.offerSection,
                protoType:      b.protoType,
                offerId:        that.recordOfferId,
                limitsGroupId:  that.limitsGroupID
            }
        });

        win.show();
        
        win.on('insert', function () {
            that.store.reload();
        });
    },

    chooseLimits: function (b, e) {
        if (!this.limitsGroupID) {
            var limit = new Lab.LimitsGroupCombo({
                allowBlank: false
            }),

            win = new Ext.Window({
                width: 512,
                height: 160,
                bodyStyle: 'background-color:#fff;padding: 10px',
                defaultButton: limit,
                iconCls: b.iconCls,
                layout: 'fit',
                modal: true,
                resizable: false,
                title: b.text,
                items: {
                    xtype: 'form',
                    border: false,
                    monitorValid: true,
                    buttons: [{
                        text: 'Importa',
                        formBind: true,
                        handler: function () {
                            this.limitsGroupID = limit.value;
                            b.nextFunction.call(this, b);
                            win.close();
                        },
                        scope: this
                    }],
                    defaults: {
                        anchor: '-20'
                    },
                    items: [limit]
                }
            });

            win.show(e.getTarget());
        } else {
            b.nextFunction.call(this, b);
        }
    },

    setLimits: function () {
        Lab.determination.setLimits({
            recordID: this.recordId,
            recordLocal: this.recordLocal,
            limitsGroupID: this.limitsGroupID
        }, function () {
            this.store.reload({
                // Controlla che tutti i controlli abbiano i limiti valorizzati
                callback: function () {
                    var success = true;
                    this.each(function () {
                        if (!this.data.limiti) {
                            success = false;
                            return success;
                        }
                    });

                    !success && Lab.flash.msg('Attenzione!', 'I limiti non sono stati applicati a tutti i controlli');
                }
            });
        }, this);
    }
});

Ext.reg('determinationgrid', Lab.DeterminationGrid);
