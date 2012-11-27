"use strict";
/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true    
 */

/*global
    Ext: true,
    Lab: true
 */

Ext.ns('Lab');

/**
 * Griglia delle sezioni di offerta di un'offerta.
 *
 * Riceve 'offerId' da OffersGrid
 */
Lab.OfferSectionsGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var grid = this,

        sfStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'OfferSection'
            },
            fields: ['id', 'title', 'days', 'offer_id', 'numbers_sample', 'section_number', 'limits_group_id', 'rdp_id', 'matrix_id', 'submatrix_id', {
                name:   'price',
                type:   'float'
            },
            {
                name: 'product',
                convert: function (v, record) {
                    return record.price * record.numbers_sample;
                }
            },
            {
                name: 'offered_price',
                type: 'number'
            },
            {
                name: 'perc',
                convert: function (v, record) {
                    var perc = (100 * record.offered_price) / (record.price * record.numbers_sample);
                    return 100 - perc;
                }
            },
            {
                name: 'is_proto',
                type: 'bool'
            }]
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                align: 'right',
                editable: false,
                format: '0.000,00/i',
                menuDisabled: true,
                sortable: true,
                width: 200,
                xtype: 'numbercolumn'
            },
            columns: [{
                header: '',
                dataIndex: 'section_number',
                width: 23,
                fixed: true,
                format: '0'
            },
            {
                header: 'Titolo',
                dataIndex: 'title',
                xtype: 'gridcolumn',
                align: 'left',
                width: 220
            },
            {
                header: 'Giorni',
                dataIndex: 'days',
                format: '0',
                width: 128
            },
            {
                header: 'Prezzo unitario',
                dataIndex: 'price'
            },
            {
                header: 'Numero campioni',
                dataIndex: 'numbers_sample',
                editable: true,
                format: '0',
                editor: new Ext.form.NumberField({
                    allowDecimals: false,
                    allowNegative: false,
                    selectOnFocus: true,
                    listeners: {
                        scope: this,
                        specialKey: this.newLineOnEnter
                    }
                })
            },
            {
                header: 'Totale',
                dataIndex: 'product'
            },
            {
                header: 'Prezzo offerto',
                dataIndex: 'offered_price',
                editable: true,
                editor: {
                    xtype: 'numberfield',
                    allowNegative: false,
                    selectOnFocus: true,
                    listeners: {
                        scope: this,
                        specialKey: this.newLineOnEnter
                    }
                }
            },
            {
                xtype: 'gridcolumn',
                header: 'Sconto',
                dataIndex: 'perc',
                align: 'right',
                renderer: function (value) {
                    return Ext.util.Format.number(value, '0.000,00/i') + '%';
                }
            },
            {
                xtype:  'actioncolumn',
                fixed:  true,
                width:  65,
                items: [{
                    icon: Lab.CONFIG.root_dir+'/images/icons/pencil.png',
                    tooltip: 'Modifica',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex);
                        grid.editWindow(record);
                    }
                },
                {
                    icon: Lab.CONFIG.root_dir+'/images/icons/plus.png',
                    tooltip: 'Copia',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex);
                        grid.cloneRecord(record);
                    }
                },
                {
                    icon: Lab.CONFIG.root_dir+'/images/icons/cross-button.png',
                    tooltip: 'Elimina',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex);
                        grid.deleteRecord(record);
                    }
                }]
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text: 'Nuova',
            handler: this.newWindow,
            iconCls: 'icon-small-add',
            scope: this
        }]);

        config = Ext.apply({
            bbar: {
                xtype: 'statusbar',
                items: [
                    'Prezzo offerta:',
                    {
                        xtype:  'tbtext',
                        text:   '0',
                        itemId: 'offeredSum'
                    },
                    '\u20ac'
                ]
            },
            border: false,
            clicksToEdit: 1,
            colModel: colModel,
            iconCls: 'icon-small-offer-section',
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: actionBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.OfferSectionsGrid.superclass.constructor.call(this, config);

        this.store.on('load', this.priceSum, this);

        this.store.load({
            params: {
                doctrineWheres: [{
                    field:      'offer_id',
                    operator:   '=',
                    value:      config.offerId
                }]
            }
        });
    },

    newLineOnEnter: function (field, e) {
        if (e.getKey() === e.ENTER) {
            e.stopEvent();

            var sm = this.getSelectionModel(),
            sc = sm.getSelectedCell(),
            selectNext = function (count) {
                if (sc[0] + 1 < count) {
                    sm.select(sc[0] + 1, sc[1]);
                } else {
                    sm.select(0, sc[1]);
                }
            };

            this.stopEditing();

            // non c'è bisogno di ricaricare lo store se il valore
            // non è cambiato
            if (field.startValue !== field.getValue()) {
                this.store.reload({
                    callback: function () {
                        selectNext(this.getCount());
                    }
                });
            } else {
                selectNext(this.store.getCount());
            }
        }
    },

    newWindow: function () {
        var self = this,

        win = new Lab.ObjectWindow({
            title: 'Nuova sezione di offerta',
            doctrineClass: this.store.baseParams.doctrineClass,
            width: 512,
            height: 256,
            tabItems: [{
                xtype: 'offersectionform',
                offerId: this.offerId
            }]
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                self.store.reload({
                    callback: function (r, options, success) {
                        // questo è l'id del nuovo oggetto restituito dalla create
                        var createdId = w.result.data.id,
                        created = this.getById(createdId);
                        self.editWindow(created);
                    }
                });
            }
        });
    },

    editWindow: function (record) {
        var self = this,
        win = null,

        items = [{
            xtype: 'offersectionform'
        },
        {
            xtype: 'offersectionsourcepricegrid',
            title: 'Dettaglio prezzi',
            price: record.data.price,
            recordId: record.id
        }];

        if (record.data.is_proto) {
            items.splice(1, 0, {
                xtype: 'determinationprotogrid',
                recordId: record.id,
                recordLocal: 'offer_section_id'
            });
        } else {
            items.splice(1, 0, {
                xtype: 'determinationgrid',
                recordId: record.id,
                recordLocal: 'offer_section_id',
                limitsGroupID: record.data.limits_group_id,
                offerSection: record.data,
                sm: new Ext.grid.RowSelectionModel(),
                stateful: true,
                stateId: 'offersectionsdeterminationsgrid',
                inSample: false,
                unlocked: true
            });
        }

        win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.title + '"',
            maximizable: true,
            width: 960,
            height: 600,
            doctrineClass: this.store.baseParams.doctrineClass,
            record: record,
            activeTab: 1,
            tabItems: items
        });

        win.on('close', function (w) {
            if (w.result) {
                self.store.reload();
            }
        });

        win.show();
    },

    deleteRecord: function (r) {
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le sezioni selezionate?', function (b) {
            if (b === 'yes') {
                this.store.remove(r);
                this.priceSum();
            }
        }, this);
    },

    priceSum: function () {
        var sum = Ext.util.Format.number(this.store.sum('offered_price'), '0.000,00/i');
        Ext.fly(this.getBottomToolbar().getComponent('offeredSum').getEl()).update(sum);
    },

    cloneRecord: function (record) {
        var mask = new Ext.LoadMask(this.getEl());
        mask.show();

        Lab.offer.copySection({offer_section_id: record.id}, function (r) {
            if (r.success) {
                mask.hide();
                Lab.flash.msg('Successo', r.message);
                this.store.reload();
            }
        }, this);
    }
});

Ext.reg('offersectionsgrid', Lab.OfferSectionsGrid);
