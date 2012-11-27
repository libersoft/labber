Ext.ns('Lab');

/**
 * Dettaglio prezzi di una sezione d'offerta.
 */
Lab.OfferSectionSourcePriceGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var grid = this,

        store = new Ext.data.GroupingStore({
            autoLoad: false,
            groupField: 'source',
            proxy: new Ext.data.DirectProxy({
                api: {
                    read:    Lab.offerSection.priceList,
                    update:  Lab.offerSection.priceUpdate,
                    destroy: Lab.offerSection.priceDestroy
                }
            }),
            reader: new Ext.data.JsonReader({
                fields: [{
                    name: 'id'
                },
                {
                    name: 'name'
                },
                {
                    name: 'source'
                },
                {
                    name: 'price',
                    type: 'float'
                },
                {
                    name: 'cost',
                    type: 'float'
                },
                {
                    name: 'discount',
                    convert: function (v, record) {
                        if (record.cost && record.cost != 0) {
                            var perc = (100 * record.price) / (record.cost * Lab.CONFIG.price_multiplier);
                            return 100 - perc;
                        } else {
                            return 0;
                        }
                    }
                }],
                root: 'data'
            }),
            sortInfo: {
                field: 'name'
            },
            writer: new Ext.data.JsonWriter({
                encode: false
            })
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: true,
                sortable: true
            },
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Origine',
                dataIndex:  'source'
            },
            {
                header:     'Nome',
                dataIndex:  'name'
            },
            {
                xtype:      'numbercolumn',
                header:     'Costo',
                dataIndex:  'cost',
                format:     '0.000,00/i',
                align:      'right'
            },
            {
                xtype:      'numbercolumn',
                header:     'Prezzo',
                dataIndex:  'price',
                format:     '0.000,00/i',
                align:      'right',
                editor: {
                    xtype: 'numberfield',
                    selectOnFocus: true,
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                var sm = grid.getSelectionModel(),
                                    sc = sm.getSelectedCell();

                                e.stopEvent();
                                grid.stopEditing();

                                if (sc[0] + 1 < store.getCount()) {
                                    sm.select(sc[0] + 1, sc[1]);
                                } else {
                                    sm.select(0, sc[1]);
                                }
                            }
                        }
                    }
                }
            },
            {
                header:     'Sconto',
                dataIndex:  'discount',
                width:      90,
                align:      'right',
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (record.data.price < record.data.cost) {
                        metaData.attr = 'style="color:red;"';
                    }

                    return Ext.util.Format.number(value, '0.000,00/i') + '%';
               }
            },
            {
                xtype: 'actioncolumn',
                width: 25,
                items: [{
                    icon: Lab.CONFIG.root_dir + '/images/icons/cross-button.png',
                    tooltip: 'Elimina',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex);

                        Ext.Msg.confirm(
                            'Eliminare il dettaglio selezionato?',
                            'Attenzione: controllare la corrispondenza con i controlli inseriti',
                            function (b) {
                                if (b === 'yes') {
                                    grid.store.remove(record);
                                    grid.priceSum();
                                }
                            }
                        );
                    }
                }]
            }]
        }),

        statusBar = new Ext.Toolbar([
            {
                iconCls: 'icon-small-refresh',
                handler: function () {
                    store.reload();
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
            'Prezzo sezione',
            {
                xtype: 'numberfield',
                itemId: 'offprice',
                value: config.price,
                width: 80,
                listeners: {
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            Lab.offerSection.storePrice({
                                id: config.recordId,
                                price: this.getValue()
                            }, function (result) {
                                if (result.success) {
                                    grid.priceSum();
                                    Lab.flash.msg('Successo', result.message);
                                    grid.ownerCt.ownerCt.result = result;
                                }
                            }, this);
                        }
                    }
                }
            },
            '\u20ac'
        ]);

        config = Ext.apply({
            bbar: {
                xtype: 'statusbar',
                items: [
                    'Prezzo sezione:',
                    {
                        xtype:  'tbtext',
                        text:   '0',
                        itemId: 'offeredSum'
                    },
                    '\u20ac'
                ]
            },
            border:     false,
            colModel:   colModel,
            iconCls:    'icon-small-offer-section',
            loadMask:   true,
            store:      store,
            stripeRows: true,
            view: new Ext.grid.GroupingView({
                forceFit: true,
                // custom grouping text template to display the number of items per group
                groupTextTpl: '{text} ({[values.rs.length]})'
            })
        }, config);

        Lab.OfferSectionSourcePriceGrid.superclass.constructor.call(this, config);

        this.store.on('load', this.priceSum, this);
        this.store.on('update', this.priceSum, this);

        // aggiorna i dati ad ogni selezione del tabpanel
        this.on('activate', function () {
            this.store.reload();
        });

        this.store.load({
            params: {
                sectionId: config.recordId
            }
        });
    },

    priceSum: function () {
        var sumPrice = this.store.sum('price'),
            tbtext = this.getBottomToolbar().getComponent('offeredSum');

        // getEl() funge solo quando il componente è renderizzato
        if (tbtext.getEl() !== undefined) {
            Ext.fly(tbtext.getEl()).update(Ext.util.Format.number(sumPrice, '0.000,00/i'));
        } else {
            tbtext.setText(Ext.util.Format.number(sumPrice, '0.000,00/i'));
        }

        // onde evitare chiamate inutili
        if (sumPrice != this.price) {
            Lab.offerSection.storePrice({
                id: this.recordId,
                price: sumPrice
            }, function (result) {
                if (result.success) {
                    this.ownerCt.ownerCt.result = result;
                }
            }, this);
        }
    }
});

Ext.reg('offersectionsourcepricegrid', Lab.OfferSectionSourcePriceGrid);
