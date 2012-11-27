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
 * Interfaccia di inserimento controlli 2.0
 *
 * Riceve un recordId e un recordLocal che indica su quale campo del
 * db salvare valori e filtrare che sia Sample, Packet o OfferSection
 */
Lab.InsertWizard = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        matrixgroup = new Ext.form.ComboBox({
            emptyText: '(Gruppo di) matrici',
            submitValue: false,
            value: config.sampleMatrixGroupID,
            listeners: {
                select: function (c, record) {
                    self.okbutton.disable();
                    parameters.removeAll();
                    determinationTypes.store.removeAll();
                    matrix.lastQuery = null;
                    matrix.clearValue();

                    matrix.store.setBaseParam('groupMatrixId', record.data.id);
                    matrix.store.load();
                    matrix.focus();
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
            })
        }),

        denomination = new Ext.form.ComboBox({
            allowBlank: false,
            emptyText: 'Denominazione',
            hiddenName: 'denomination_id',
            listeners: {
                select: function (c, record) {
                    self.okbutton.disable();
                    parameters.removeAll();
                    determinationTypes.store.removeAll();
                    matrix.lastQuery = null;
                    matrix.clearValue();
                    delete matrix.store.baseParams.groupMatrixId;

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.denomination_id',
                        valueSet: [record.data.id]
                    }];
                    matrix.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    matrix.store.setBaseParam('groupMatrixId',    matrixgroup.getValue());
                    matrix.enable();
                    matrix.store.load({
                        callback: function (r, options, success) {
                            // un array che contiene l'ID del gruppo...
                            var a = [matrixgroup.getValue()];

                            // ... più gli ID delle sottomatrici filtrate
                            Ext.each(r, function (o) {
                                a.push(o.id);
                            });

                            // carico i DeterminationType per le matrici di sopra
                            determinationTypes.store.setBaseParam('doctrineWhereIns', [{
                                field: 'denomination_id',
                                valueSet: [record.data.id]
                            },
                            {
                                field: 'matrix_id',
                                valueSet: a
                            }]);
                            determinationTypes.store.load();
                        }
                    });
                    matrix.focus();
                }
            },
            pageSize: 15,
            store: new Lab.sfDirectStore({
                autoLoad: false,
                baseParams: {
                    doctrineClass:  'Denomination',
                    limit:          15,
                    sort:           'name'
                },
                fields: ['id', 'name'],
                pageSize: 15
            })
        }),

        matrix = new Ext.form.ComboBox({
            emptyText: '(Sotto) matrici',
            disabled: true,
            submitValue: false,
            listeners: {
                select: function (combo, record, index) {
                    self.okbutton.disable();
                    parameters.removeAll();
                    determinationTypes.store.removeAll();

                    determinationTypes.store.setBaseParam('doctrineWhereIns', [{
                        field: 'denomination_id',
                        valueSet: [denomination.getValue()]
                    },
                    {
                        field: 'matrix_id',
                        valueSet: [record.data.id]
                    }]);
                    determinationTypes.store.load();
                }
            },
            store: new Lab.sfDirectStore({
                // overriddo le api per usare la mia funzione pigliamatrici
                api: {
                    read: Lab.matrix.getWithDescendants
                },
                autoLoad: false,
                // 'children' (array) viene passato dalla funzione
                fields: ['id', 'name']
            })
        }),

        determinationTypes = new Ext.grid.GridPanel({
            height:     200,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    fixed:          true,
                    menuDisabled:   true,
                    sortable:       false,
                    width:          210
                },
                columns: [{
                    header:     'Metodo',
                    dataIndex:  'Method.name'
                },
                {
                    header:     'Descrizione',
                    dataIndex:  'Method.description',
                    renderer: function (v, meta) {
                        meta.attr = 'style="white-space: normal;"';
                        return v;
                    },
                    fixed:      false
                },
                {
                    header:     'Matrice',
                    dataIndex:  'Matrix.name'
                }]
            }),
            sm: new Ext.grid.RowSelectionModel({
                listeners: {
                    rowselect: function (sm, rowIndex, r) {
                        // rimuove i widget di eventuali parametri precedentemente
                        // aggiunti per la selezione di un metodo differente
                        parameters.removeAll();

                        var doctrineWhereIns = [{
                            field:      'DeterminationType.denomination_id',
                            valueSet:   [denomination.getValue()]
                        },
                        {
                            field:      'DeterminationType.matrix_id',
                            valueSet:   [r.data.matrix_id]
                        },
                        {
                            field:      'DeterminationType.method_id',
                            valueSet:   [r.data.method_id]
                        }];

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
                                    var r = new values[item.data.field_type_id].recordType({
                                        value: item.data.value,
                                        is_sinal: item.data.is_sinal
                                    });
                                    values[item.data.field_type_id].insert(0, r);

                                    // Array di appoggio per i valori di default
                                    if (item.data.is_default) {
                                        defaults[item.data.field_type_id] = item.data.value;
                                    }
                                });

                                Ext.each(r.json.Method.Fields, function (item) {
                                    parameters.add(new Ext.form.ComboBox({
                                        displayField:   'value',
                                        valueField:     'value',
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

                        self.okbutton.enable();
                    }
                },
                singleSelect: true
            }),
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                autoSave:   false,
                baseParams: {
                    doctrineClass:  'DeterminationType',
                    doctrineJoins:  ['DeterminationType.Method AS m', 'DeterminationType.Matrix', 'm.Fields', 'm.Matrixes.Matrix']
                },
                fields:     ['id', 'method_id', 'matrix_id', 'is_sinal', 'is_default', 'Method.name', 'Method.description', 'Matrix.name']
            }),
            viewConfig: {
                forceFit: true,
                getRowClass: function (record) {
                    var cssClass = '';
                    cssClass += record.data.is_sinal ? 'determinationType-grid-sinal ' : '';
                    cssClass += record.data.is_default ? 'determinationType-grid-default ' : '';
                    return cssClass;
                }
            }
        }),

        determinationTypeFieldStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'DeterminationTypeField',
                doctrineJoins: ['DeterminationTypeField.DeterminationType']
            },
            fields:     ['field_type_id', 'value', 'is_default', 'is_sinal']
        }),

        resetFun = function (b, e) {
            self.okbutton.disable();
            parameters.removeAll();
            determinationTypes.store.removeAll();
            matrix.lastQuery = null;
            matrix.clearValue();
            delete matrix.store.baseParams.groupMatrixId;
            matrix.disable();
            denomination.lastQuery = null;
            denomination.clearValue();
        },

        okFun = function (b, e) {
            if (self.getForm().isValid()) {
                // raccoglie nome e valore dei parametri selezionati e li imposta
                // come value del field hidden, che verrà inviato nel form
                var params = {}, sinal = true;
                parameters.items.each(function (combo) {
                    var comboValue = combo.getValue();
                    params[combo.fieldLabel] = comboValue;

                    // controlla che tutti i parametri scelti siano accreditati
                    var store = combo.getStore();
                    var index = store.findExact('value', comboValue);
                    var record = store.getAt(index);
                    sinal = record ? sinal && record.data.is_sinal : sinal;
                });

                var json = determinationTypes.selModel.getSelected().json,
                    data = {
                        denomination_id: json.denomination_id,
                        matrix_id: json.matrix_id,
                        method_id: json.method_id,
                        scale_id: json.scale_id,
                        um_id: json.um_id,
                        cifre_decimali: json.max_decimal_digits,
                        cifre_significative: json.significant_digits,
                        // accreditato dev'essere metodo/matrice/parametri
                        is_sinal: json.is_sinal && sinal,
                        price: json.price,
                        params: Ext.util.JSON.encode(params)
                    };
                data[config.recordLocal] = config.recordId;

                Lab.db.create({
                    doctrineClass:  'Determination',
                    data:           data
                }, function (result) {
                    if (result.success) {
                        Lab.flash.msg('Successo', 'Controllo inserito correttamente.');
                    } else {
                        Lab.flash.msg('Errore', result.message);
                    }
                });

                resetFun(b);
            } else {
                Lab.flash.msg('Errore', 'Selezionare Denominazione/Matrice/Metodo');
            }
        },

        parameters = new Ext.form.FieldSet({
            items: [],
            title: 'Parametri'
        });

        config = Ext.apply({
            autoScroll: true,
            buttons: [{
                text: 'Reset',
                handler: resetFun,
                tooltip: 'Resettare il form per inserire una nuova Denominazione'
            },
            '->',
            {
                text: 'OK',
                iconCls: 'icon-small-ok',
                handler: okFun,
                disabled: true,
                ref: '../okbutton'
            }],
            border: false,
            margins: '5 5 5 5',
            padding: 5,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype: 'compositefield',
                hideLabel: true,
                defaults: {
                    displayField: 'name',
                    flex: 1,
                    forceSelection: true,
                    minChars: 2,
                    triggerAction: 'all',
                    valueField: 'id'
                },
                items: [matrixgroup, denomination, matrix]
            },
            // conterrà il JSON dei parametri selezionati
            {
                xtype: 'hidden',
                name: 'params',
                ref: 'hiddenparams'
            },
            // la Grid dei metodi
            determinationTypes,
            // il Fieldset dei parametri
            parameters]
        }, config);

        Lab.InsertWizard.superclass.constructor.call(this, config);
    }
});

Ext.reg('insertwizard', Lab.InsertWizard);
