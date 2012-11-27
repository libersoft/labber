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
 * Prezzi dei controlli di un'offerta.
 */
Lab.OfferSectionsDeterminationPriceGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,
        
        offer_price = new Ext.form.NumberField({
            xtype: 'numberfield',
            itemId: 'offprice',
            value: config.price,
            width: 80,
            listeners: {
                'specialkey': function (field, e){
                    if(e.getKey() === e.ENTER){
                        Lab.offer.storePrice({
                            id: config.recordId,
                            price: offer_price.getValue(),
                            table: 'OfferSection'
                        }, function (result) {
                            self.ownerCt.ownerCt.result = result;
                            self.ownerCt.ownerCt.close();
                            if (result.success) {
                                Lab.flash.msg("Prezzo della sezione d'offerta settato", '');
                            }
                        }, this);
                    }
                }
            }
        }),

        sfStore = new Ext.data.GroupingStore({
            baseParams: {
                doctrineClass: 'Determination',
                doctrineJoins: ['Determination.Denomination', 'Determination.Matrix', 'Determination.Method'],
                doctrineWhereIns: [{
                    field: config.recordLocal,
                    valueSet: [config.recordId]
                    }]
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
                fields:     [{
                    name:    'id'
                },
                {
                    name:    'denomination',
                    mapping: 'Denomination ? obj.Denomination.name : null'
                },
                {
                    name:    'matrix',
                    mapping: 'Matrix ? obj.Matrix.name : null'
                },
                'method_id',
                {
                    name:    'method',
                    mapping: 'Method ? obj.Method.name : null'
                },
                {
                    name:    'origine',
                    mapping: 'origine ? obj.origine : " Singolo"'   // lo spazio davanti non è un errore
                },
                {
                    name:    'price',
                    type:    'number'
                },
                {
                    name:    'method_price',
                    type:    'number',
                    convert: function (v, record) {
                        return record.price * Lab.CONFIG.price_multiplier;
                    }
                },
                {
                    name:    'offered_price',
                    type:    'number'
                },
                {
                    name:    'perc',
                    type:    'number',
                    convert: function (v, record) {
                        if (record.price && record.price != 0) {
                            var perc = (100 * record.offered_price) / (record.price * Lab.CONFIG.price_multiplier);
                            return 100 - perc;
                        } else {
                            return 0;
                        }
                    }
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

        newLineOnEnter = function (field, e) {
            if (e.getKey() === e.ENTER) {
                e.stopEvent();

                var sm = self.getSelectionModel(),
                    sc = sm.getSelectedCell(),
                    lastOptions = sfStore.lastOptions;

                self.stopEditing();

                Ext.apply(lastOptions, {
                    callback: function () {
                        console.log(sc);
                        console.log(this.getCount());
                        if (sc[0] + 1 < this.getCount()) {
                            sm.select(sc[0] + 1, sc[1]);
                        } else {
                            sm.select(0, sc[1]);
                        }
                    }
                });
                sfStore.reload(lastOptions);

                return;
            }
        },
   
        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: true,
                sortable: true,
                width: 200
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:    'Denominazione',
                dataIndex: 'denomination'
            },
            {
                header:    'Matrice',
                dataIndex: 'matrix'
            },
            {
                header:    'Metodo',
                dataIndex: 'method'
            },
            {
                xtype:     'numbercolumn',
                format:    '0.000,00/i',
                header:    'Costo metodo',
                dataIndex: 'price',
                width:     150,
                align:     'right'
            },
            {
                xtype:     'numbercolumn',
                format:    '0.000,00/i',
                header:    'Prezzo metodo',
                dataIndex: 'method_price',
                width:     150,
                align:     'right'
            },
            {
                xtype:     'numbercolumn',
                format:    '0.000,00/i',
                header:    'Prezzo offerto',
                dataIndex: 'offered_price',
                editor:    new Ext.form.NumberField({
                    selectOnFocus: true,
                    listeners: {
                        specialKey: newLineOnEnter
                    }
                }),
                width:     150,
                align:     'right'
            },
            {
                header:    'Sconto',
                dataIndex: 'perc',
                width:     90,
                align:     'right',
                renderer:  function (value, metaData, record, rowIndex, colIndex, store) {
                    if (record.data.offered_price < record.data.price) {
                        metaData.attr = 'style="color:red;"';
                    }
                    return Ext.util.Format.number(value, '0.000,00/i') + '%';
               }
            },
            {
                header:    'Pacchetto',
                dataIndex: 'origine'
            }]
        }),

        statusBar = new Ext.Toolbar([
            {
                iconCls: 'icon-small-refresh',
                handler: function () {
                    sfStore.reload();
                }
            },
            'Somma aritmetica dei prezzi offerti: \u20ac ',
            {
                xtype:  'tbtext',
                itemId: 'sum'
            },
            '-',
            {
                xtype: 'tbtext',
                text: 'Percentuale di sconto:  '
            },
            {
                xtype: 'tbtext',
                itemId: 'osperc'
            },
            {
                xtype: 'tbtext',
                text: '%'
            },
            '->',
            'Prezzo sezione: ', offer_price, '\u20ac'
        ]);

        config = Ext.apply({
            bbar:       statusBar,
            border:     false,
            colModel:   colModel,
            title:      'Prezzi controlli',
            iconCls:    'icon-small-offer-section',
            loadMask:   false,
            store:      sfStore,
            stripeRows: true,
            view: new Ext.grid.GroupingView({
                // custom grouping text template to display the number of items per group
                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Controlli" : "Controllo"]})',
                startCollapsed: false,
                forceFit: true
            })
        }, config);

        Lab.OfferSectionsDeterminationPriceGrid.superclass.constructor.call(this, config);

        this.store.on('load', this.priceSum, this);

        this.store.load({
            params: {
                doctrineWheres: [{
                    field:      'offer_section_id',
                    operator:   '=',
                    value:      config.recordId
                }]
            }
        });
    },

    priceSum: function () {
        var sum        = this.store.sum('offered_price'),
            osp        = 100 - ((this.getBottomToolbar().getComponent('offprice').getValue() * 100) / sum),
            sumText    = this.getBottomToolbar().getComponent('sum'),
            ospercText = this.getBottomToolbar().getComponent('osperc');

        sumText.setText(Ext.util.Format.number(sum, '0.000,00/i'));
        ospercText.setText(Ext.util.Format.number(osp, '0.000,00/i'));

        this.getBottomToolbar().doLayout();
    }
});

Ext.reg('offersectionsdeterminationpricegrid', Lab.OfferSectionsDeterminationPriceGrid);
