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
 * Interfaccia di inserimento controlli definitiva.
 * 
 * Riceve un recordId e un recordLocal che indica su quale campo del
 * db salvare valori e filtrare che sia Sample, Packet o OfferSection
 */
Lab.ByDenomination = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        denomination = new Ext.form.ComboBox({
            allowBlank: false,
            emptyText: 'Denominazione',
            hiddenName: 'denomination_id',
            listeners: {
                select: function (c, record) {
                    self.okbutton.disable();
                    parameters.removeAll();
                    methods.store.removeAll();
                    matrices.lastQuery = null;
                    matrices.clearValue();

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.denomination_id',
                        valueSet: [record.data.id]
                    }];
                    matrices.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    matrices.enable();
                    methods.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    methods.store.load();
                }
            },
            name: 'denomination',
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

        matrices = new Ext.form.ComboBox({
            allowBlank: false,
            disabled: true,
            editable: false,
            emptyText: 'Matrice',
            hiddenName: 'matrix_id',
            listeners: {
                select: function (c, record) {
                    self.okbutton.disable();
                    parameters.removeAll();
                    methods.store.removeAll();

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.matrix_id',
                        valueSet: [record.data.id]
                    },
                    {
                        field: 'DeterminationType.denomination_id',
                        valueSet: [denomination.getValue()]
                    }];
                    methods.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    methods.store.load();
                }
            },
            store: new Lab.sfDirectStore({
                // overriddo le api per usare la mia funzione pigliamatrici
                api: {
                    read: Lab.matrix.getWithDescendants
                },
                autoLoad: false,
//                baseParams: {
//                    doctrineClass:  'Matrix',
//                    sort:           'name'
//                },
                fields: ['id', 'name', 'parent_id']
            }),
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-combo-list-item" style="background-color: {[values.parent_id ? "white" : "cyan"]}">{name}</div>',
                '</tpl>'
            )

        }),

        matrixgroup = new Ext.form.ComboBox({
            disabled: true,
            emptyText: '(Gruppo di) matrici',
            pageSize: 20,
            submitValue: false,
            listeners: {
                select: function (c, record) {
                    if (matrix.getValue() == "") {
                        self.matrixID.setValue(record.id);
                    }

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.matrix_id',
                        valueSet: [record.data.id]
                    },
                    {
                        field: 'DeterminationType.denomination_id',
                        valueSet: [denomination.getValue()]
                    }];
                    methods.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    methods.store.load();

                    matrix.store.load({
                        params: {
                            groupMatrixId: record.data.id
                        }
                    });
                    matrix.focus();
                }
            },
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Matrix',
                    doctrineWheres: [{
                        field: 'parent_id',
                        operator: 'IS',
                        value: 'NULL'
                    }],
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 20
            })
        }),

        matrix = new Ext.form.ComboBox({
            disabled: true,
            emptyText: '(Sotto) matrici',
            submitValue: false,
            listeners: {
                select: function (combo, record, index) {
                    self.matrixID.setValue(record.id);

                    self.okbutton.disable();
                    parameters.removeAll();
                    methods.store.removeAll();

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.matrix_id',
                        valueSet: [record.data.id]
                    },
                    {
                        field: 'DeterminationType.denomination_id',
                        valueSet: [denomination.getValue()]
                    }];
                    methods.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    methods.store.load();
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

        methodStore = new Lab.sfDirectStore({
            autoLoad:   false,
            autoSave:   false,
            baseParams: {
                doctrineClass:  'Method',
                doctrineJoins:  ['Method.DeterminationType', 'Method.Fields', 'Method.Matrixes.Matrix'],
                sort:           'name'
            },
            fields:     ['id', 'name', 'description', 'Matrixes']
        }),

        methods = new Ext.grid.GridPanel({
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    menuDisabled:   true,
                    sortable:       false
                },
                columns: [{
                    header:     'Metodo',
                    dataIndex:  'name',
                    fixed:      true,
                    width:      210
                },
                {
                    header:     'Matrici',
                    dataIndex:  'Matrixes',
                    xtype:      'templatecolumn',
                    tpl:        '<span style="white-space: normal;"><tpl for="Matrixes"><tpl for="Matrix">{[xindex != 1 ? ", " : ""]}{name}</tpl></tpl></span>'
                },
                {
                    header:     'Descrizione',
                    dataIndex:  'description',
                    // Il contenuto della cella va a capo con white-space: normal
                    renderer: function (v, meta) {
                        meta.attr = 'style="white-space: normal;"';
                        return v;
                    }
                }]
            }),
            height:     200,
            listeners: {
                rowclick: function (grid, rowIndex) {
                    // rimuove i widget di eventuali parametri precedentemente
                    // aggiunti per la selezione di un metodo differente
                    parameters.removeAll();

                    var record = grid.getStore().getAt(rowIndex),

                    doctrineWhereIns = grid.store.baseParams.doctrineWhereIns.copy(),
                    whereIn = {
                        field:      'DeterminationType.method_id',
                        valueSet:   [record.data.id]
                    };
                    doctrineWhereIns.push(whereIn);

                    determinationTypeFieldStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    determinationTypeFieldStore.load({
                        params: {
                            groupby: 'value'
                        },
                        callback: function (r) {
                            var values = {}, defaults = {};

                            Ext.each(r, function (item) {
                                if (!values[item.data.field_type_id]) {
                                    values[item.data.field_type_id] = [];
                                }
                                values[item.data.field_type_id].push(item.data.value);

                                if (item.data.is_default) {
                                    defaults[item.data.field_type_id] = item.data.value;
                                }
                            });

                            Ext.each(record.json.Fields, function (item) {
                                parameters.add(new Ext.form.ComboBox({
                                    fieldLabel:     item.name,
                                    store:          values[item.id],
                                    submitValue:    false,
                                    triggerAction:  'all',
                                    value:          defaults[item.id]
                                }));
                            });

                            parameters.doLayout();
                        }
                    });

                    self.methodID.setValue(record.id);
                    self.okbutton.enable();
                }
            },
            sm:         new Ext.grid.RowSelectionModel({singleSelect:true}),
            store:      methodStore,
            viewConfig: {
                forceFit:   true
            }
        }),

        determinationTypeFieldStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'DeterminationTypeField',
                doctrineJoins: ['DeterminationTypeField.DeterminationType']
            },
            fields:     ['field_type_id', 'value', 'is_default']
        }),

        resetFun = function (b, e) {
            self.okbutton.disable();
            parameters.removeAll();
            methods.store.removeAll();
            matrices.lastQuery = null;
            matrices.clearValue();
            matrices.disable();
            denomination.lastQuery = null;
            denomination.clearValue();
        },

        okFun = function (b, e) {
            if (self.getForm().isValid()) {
                // raccoglie nome e valore dei parametri selezionati e li imposta
                // come value del field hidden, che verrà inviato nel form
                var params = {};
                parameters.items.each(function (item) {
                    params[item.fieldLabel] = item.getValue();
                });
                self.hiddenparams.setValue(Ext.util.JSON.encode(params));

                var data = self.getForm().getValues();
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
                Lab.flash.msg('Errore', 'Selezionare una denominazione');
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
                xtype: 'hidden',
                name: config.recordLocal,
                value: config.recordId
            },
            {
                xtype: 'hidden',
                name: 'method_id',
                ref: 'methodID'
            },
            {
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
                items: [denomination, matrices]
            },
            // conterrà il JSON dei parametri selezionati
            {
                xtype: 'hidden',
                name: 'params',
                ref: 'hiddenparams'
            },
            // la Grid dei metodi
            methods,
            // il Fieldset dei parametri
            parameters]
        }, config);

        Lab.ByDenomination.superclass.constructor.call(this, config);
    }
});

Ext.reg('insertbydenomination', Lab.ByDenomination);
