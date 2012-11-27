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
 *  Inserimento grezzo
 */
Lab.RawInsert = Ext.extend(Ext.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            border: false,
            margins: '5 5 5 5',
            padding: 10,
            buttons: [{
                text: 'Inserisci',
                disabled: true,
                handler: this.newInsert,
                ref: '../button',
                scope: this
            }],
            items: [{
                xtype: 'cachetable',
                anchor: '100% 75%',
                ref: 'grid',
                offerSection: config.offerSection
            },
            {
                xtype: 'fieldset',
                title: 'Parametri',
                anchor: '100% 25%',
                ref: 'parameters'
            }]
        }, config);

        Lab.RawInsert.superclass.constructor.call(this, config);
    },

    newInsert: function (b, e) {
        // raccoglie nome e valore dei parametri selezionati e li imposta
        // come value del field hidden, che verrà inviato nel form
        var params = {},
            sinal = true,
            json = this.grid.selModel.getSelected().json,
            data = {
                denomination_id: json.denomination_id,
                matrix_id: json.matrix_id,
                method_id: json.method_id,
                scale_id: json.scale_id,
                um_id: json.um_id,
                cifre_decimali: json.max_decimal_digits,
                cifre_significative: json.significant_digits,
                price: json.price,
                constants: json.constants
            };

        this.parameters.items.each(function (combo) {
            var comboValue = combo.getValue();
            params[combo.fieldLabel] = comboValue;

            // controlla che tutti i parametri scelti siano accreditati
            var store = combo.getStore()
            if (store) {
                var index = store.findExact('value', comboValue);
                var record = store.getAt(index);
                sinal = record ? sinal && record.data.is_sinal : sinal;
            }
        });

        data['is_sinal'] = json.is_sinal && sinal;
        data['params'] =  Ext.util.JSON.encode(params);
        data[this.recordLocal] = this.recordId;

        // Setta il JSON 'source' per l'indicazione dell'origine di
        // questa Determination ai fini della fatturazione
        data['source'] = Ext.util.JSON.encode({
            table: 'DeterminationType',
            id: json.id
        });

        // Imposta la "Data inizio" del controllo nel campione ad oggi
        if (this.recordLocal == 'sample_id')
        {
            var d = new Date();
            data['data_inizio'] = d.format('Y-m-d');
        }

        Lab.db.create({
            doctrineClass: 'Determination',
            data: data
        }, function (result) {
            if (result.success) {
                Lab.flash.msg('Successo', 'Controllo inserito correttamente.');
                this.ownerCt.fireEvent('insert');

                // Associa alla Determination appena creata il *Source appropriato
                var priceData = {
                    record_id: this.recordId,
                    determination_id: result.data.id
                };

                if (this.recordLocal === 'offer_section_id') {
                    Lab.offerSection.priceCreate({
                        data: priceData
                    });
                } else if (this.recordLocal === 'sample_id') {
                    Lab.sample.priceCreate({
                        data: priceData
                    });
                }
            } else {
                Lab.flash.msg('Errore', result.message);
            }
        }, this);
    },

    updateParameters: function (r) {

        var parameters = this.parameters,

        doctrineWhereIns = [{
            field:      'DeterminationType.denomination_id',
            valueSet:   [r.data.denomination_id]
        },
        {
            field:      'DeterminationType.matrix_id',
            valueSet:   [r.data.matrix_id]
        },
        {
            field:      'DeterminationType.method_id',
            valueSet:   [r.data.method_id]
        }],

        determinationTypeFieldStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'DeterminationTypeField',
                doctrineJoins: ['DeterminationTypeField.DeterminationType']
            },
            fields:     ['field_type_id', 'value', 'is_default', 'is_sinal']
        });

        parameters.removeAll();

        determinationTypeFieldStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
        determinationTypeFieldStore.load({
            params: {
                groupby: 'value'
            },
            callback: function (results) {
                var values = {}, defaults = {};

                // values è un array di Store
                Ext.each(results, function (item) {
                    // Inizializzazione, se serve
                    if (!values[item.data.field_type_id]) {
                        values[item.data.field_type_id] = new Ext.data.ArrayStore({
                            fields: ['value', 'is_sinal'],
                            idIndex: 0
                        });
                    }

                    // Creazione e inserimento
                    var value = Ext.num(item.data.value, item.data.value),
                        r = new values[item.data.field_type_id].recordType({
                            value: value,
                            is_sinal: item.data.is_sinal
                        });
                    values[item.data.field_type_id].insert(0, r);

                    // Array di appoggio per i valori di default
                    if (item.data.is_default) {
                        defaults[item.data.field_type_id] = value;
                    }
                });

                Ext.each(r.json.MethodFields, function (item) {
                    parameters.add(new Ext.form.ComboBox({
                        displayField:   'value',
                        valueField:     'value',
                        editable:       false,
                        fieldLabel:     item.name,
                        mode:           'local',
                        store:          values[item.id],
                        submitValue:    false,
                        tpl:            '<tpl for="."><div class="{[values.is_sinal ? "x-combo-list-item determinationType-grid-sinal" : "x-combo-list-item"]}">{value}</div></tpl>',
                        triggerAction:  'all',
                        value:          defaults[item.id]
                    }));
                });

                parameters.doLayout();
            }
        });

        this.button.enable();
    }
});



Lab.CacheTable = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var sfStore = new Lab.sfDirectStore({
            api: {
                read: Lab.determinationType.list
            },
            autoLoad: false,
            fields: [
                'id', 'Method', 'Matrix', 'Denomination', 'method_id',
                'matrix_id', 'denomination_id', 'um', 'is_default', 'is_sinal',
                'significant_digits', 'max_decimal_digits', 'scale_id', 'um_id',
                'price', 'lab'
            ],
            pageSize: 20
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: true,
                sortable: true
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Denominazione',
                dataIndex: 'Denomination'
            },
            {
                header: 'Matrice / Sottomatrice',
                dataIndex: 'Matrix'
            },
            {
                header: 'Metodo',
                dataIndex: 'Method'
            },
            {
                header: 'Preferito',
                dataIndex: 'is_default',
                width: 55,
                renderer: function (value) {
                    return (value) ? 'Sì' : null;
                }
            },
            {
                header: 'Accreditato',
                dataIndex: 'is_sinal',
                width: 55,
                renderer: function (value) {
                    return (value) ? 'Sì' : 'No';
                }
            },
            {
                header: 'Unità di misura',
                dataIndex: 'um',
                sortable: false,
                width: 70
            },
            {
                header: 'Laboratorio',
                dataIndex: 'lab',
                sortable: false,
                width: 90
            }]
        }),

        filterBar = {
            xtype: 'filteringtoolbar',
            store: sfStore,
            buttonText: '',
            items: [{
                xtype: 'combo',
                emptyText: 'Matrice',
                name: 'matrix_id',
                displayField: 'name',
                valueField: 'id',
                triggerAction: 'all',
                ref: 'matrixcombo',
                listeners: {
                    select: function (field, record) {
                        // filtra la combobox delle sottomatrici
                        var matrix = field.ownerCt.submatrixcombo;

                        matrix.lastQuery = null;
                        matrix.clearValue();

                        matrix.store.setBaseParam('groupMatrixId', record.data.id);
                        matrix.store.load();
                        matrix.focus();

                        // il listener della FilteringToolbar
                        var lastOptions = (sfStore.lastOptions) ? sfStore.lastOptions : {
                            params: {}
                        },

                        filter = {
                            field:      field.name,
                            operator:   '=',
                            value:      field.getValue()
                        };

                        if (!lastOptions.params.filters) {
                            lastOptions.params.filters = {};
                        }
                        lastOptions.params.filters[field.name] = filter;
                        lastOptions.params.start = 0;

                        sfStore.reload(lastOptions);
                    }
                },
                store: new Lab.sfDirectStore({
                    autoDestroy: true,
                    autoLoad: false,
                    baseParams: {
                        doctrineClass: 'Matrix',
                        tableMethod: 'retrieveRootMatricesList'
                    },
                    fields: ['id', 'name']
                }),
                width: 128
            },
            ' ',
            {
                xtype: 'submatrixcombo',
                emptyText: 'Sottomatrice',
                name: 'submatrix_id',
                ref: 'submatrixcombo'
            },
            ' ',
            {
                xtype: 'denominationcombo',
                emptyText: 'Denominazione',
                name: 'denomination_id',
                width: 250
            },
            ' ',
            {
                xtype: 'methodcombo',
                emptyText: 'Metodo',
                name: 'method_id',
                width: 250
            },
            ' ',
            {
                xtype: 'checkbox',
                boxLabel: 'Preferito?',
                name: 'is_default'
            }]
        },

        selModel = new Ext.grid.RowSelectionModel({
            singleSelect: true,
            listeners: {
                rowselect: function (sm, rowIndex, record) {
                    sm.grid.ownerCt.updateParameters(record);
                }
            }
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                pageSize: sfStore.pageSize,
                store: sfStore
            }),
            colModel: colModel,
            keys: [{
                key: Ext.EventObject.ENTER,
                fn: function () {
                    this.ownerCt.newInsert.call(this.ownerCt);
                },
                scope: this
            }],
            loadMask: true,
            sm: selModel,
            store: sfStore,
            stripeRows: true,
            tbar: filterBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.CacheTable.superclass.constructor.call(this, config);

        var options = this.defaultFilterValues();
        this.store.load(options);
    },

    defaultFilterValues: function () {
        var options = {
            params: {
                start: 0,
                limit: this.store.pageSize,
                filters: {}
            }
        };

        // precarica il gruppo di matrici della sezione d'offerta
        if (this.offerSection && this.offerSection.matrix_id) {
            this.getTopToolbar().matrixcombo.setValue(this.offerSection.matrix_id);
            this.getTopToolbar().submatrixcombo.store.setBaseParam('groupMatrixId', this.offerSection.matrix_id);

            options.params.filters.matrix_id = {
                field: 'matrix_id',
                operator: '=',
                value: this.offerSection.matrix_id
            };
        }

        // precarica la sottomatrice della sezione d'offerta
        if (this.offerSection && this.offerSection.submatrix_id) {
            this.getTopToolbar().submatrixcombo.setValue(this.offerSection.submatrix_id);
            options.params.filters.submatrix_id = {
                field: 'submatrix_id',
                operator: '=',
                value: this.offerSection.submatrix_id
            };
        }

        return options;
    }
});

/**
 * Serve per estendere la setValue
 */
Lab.SubMatrixCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            displayField: 'name',
            valueField: 'id',
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                // overriddo le api per usare la mia funzione pigliamatrici
                api: {
                    read: Lab.matrix.getWithDescendants
                },
                autoDestroy: true,
                autoLoad: false,
                fields: ['id', 'name']
            }),
            // rimuove il baseParam 'groupMatrixId' al "Mostra tutti"
            setValue: function (value) {
                Lab.SubMatrixCombo.superclass.setValue.call(this, value);
                if (value === undefined) {
                    delete this.store.baseParams.groupMatrixId;
                    this.lastQuery = null;
                }
            }
       }, config);

       Lab.SubMatrixCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('submatrixcombo', Lab.SubMatrixCombo);
Ext.reg('rawinsert', Lab.RawInsert);
Ext.reg('cachetable', Lab.CacheTable);
