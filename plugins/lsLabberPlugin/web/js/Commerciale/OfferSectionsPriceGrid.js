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
Lab.OfferSectionsPriceGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,
        
        product = function (v, record) {
            return record.price * record.numbers_sample;
        },

        perc = function (v, record) {
            var perc = (100 * record.offered_price) / (record.price * record.numbers_sample);
            return 100 - perc;
        },

        offer_price = new Ext.form.NumberField({
            xtype: 'numberfield',
            value: config.price,
            width: 80,
            listeners: {
                specialkey: function (field, e) {
                    if (e.getKey() === e.ENTER) {
                        Lab.offer.storePrice({
                            id: config.offerId,
                            price: offer_price.getValue(),
                            table: 'Offer'
                        }, function (result) {
                            self.ownerCt.ownerCt.result = result;
                            self.ownerCt.ownerCt.close();
                        }, this);
                     }
                }
            }
        }),

        sfStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass:  'OfferSection',
                doctrineJoins: ['OfferSection.Offer']
            },
            fields: ['id', 'title', 'days', 'offer_id', 'numbers_sample', {
                name: 'price',
                type: 'float'
            },
            {
                name: 'product',
                type: 'number',
                convert: product
            },
            {
                name: 'offered_price',
                type: 'number'
            },
            {
                name: 'perc',
                type: 'number',
                convert: perc
            }]
        }),

        newLineOnEnter = function (field, e) {
            if (e.getKey() === e.ENTER) {
                e.stopEvent();

                var sm = self.getSelectionModel(),
                sc = sm.getSelectedCell();

                self.stopEditing();

                if (sc[0] + 1 < sfStore.getCount()) {
                    sm.select(sc[0] + 1, sc[1]);
                } else {
                    sm.select(0, sc[1]);
                }
            }
        },
   
        colModel = new Ext.grid.ColumnModel({
            defaults: {
                editable: false,
                format: '0.000,00/i',
                menuDisabled: true,
                sortable: true,
                width: 200,
                xtype: 'numbercolumn'
            },
            columns: [new Ext.grid.RowNumberer(), {
                xtype: 'gridcolumn',
                header: 'Titolo',
                dataIndex: 'title'
            },
            {
                header: 'Prezzo Unitario',
                dataIndex: 'price'
            },
            {
                header: 'Numero Campioni',
                dataIndex: 'numbers_sample',
                editable: true,
                format: '0',
                editor: new Ext.form.NumberField({
                    allowDecimals: false,
                    allowNegative: false,
                    selectOnFocus: true,
                    listeners: {
                        change: function () {
                            sfStore.reload();
                        },
                        specialKey: newLineOnEnter
                    }
                })
            },
            {
                header:     'Totale',
                dataIndex:  'product'
            },
            {
                header: 'Prezzo Offerto',
                dataIndex: 'offered_price',
                editable: true,
                editor: new Ext.form.NumberField({
                    allowNegative: false,
                    decimalSeparator: ',',
                    selectOnFocus: true,
                    listeners: {
                        change: function () {
                            sfStore.reload();
                        },
                        specialKey: newLineOnEnter
                    }
                })
            },
            {
                header: '% Sconto',
                dataIndex: 'perc'
            }]
        }),

        statusBar = new Ext.Toolbar([{
            xtype: 'tbbutton',
            iconCls: 'icon-small-refresh',
            handler: function () {
                sfStore.reload();
            }
        },
        {
            xtype: 'tbtext',
            text: 'Somma aritmetica dei prezzi offerti: \u20ac '
        },
        {
            xtype: 'tbtext',
            itemId: 'sum'
        },
        '->',
        {
            xtype: 'tbtext',
            text: 'Prezzo Offerta'
        },
        offer_price,
        {
            xtype: 'tbtext',
            text: '\u20ac'
        }]);

        config = Ext.apply({
            bbar: statusBar,
            border: false,
            clicksToEdit: 1,
            colModel: colModel,
            iconCls: 'icon-small-offer-section',
            store: sfStore,
            stripeRows: true,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.OfferSectionsPriceGrid.superclass.constructor.call(this, config);

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

    priceSum: function () {
        var sum = this.store.sum('offered_price'),
        sumText = this.getBottomToolbar().getComponent('sum');
        sumText.setText(Ext.util.Format.number(sum, '0.000,00/i'));
        this.getBottomToolbar().doLayout();
    }
});

Ext.reg('offersectionspricegrid', Lab.OfferSectionsPriceGrid);
