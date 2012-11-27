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
 * Interfaccia di inserimento controlli "per matrice".
 * 
 * Riceve un recordId e un recordLocal che indica su quale campo del
 * db salvare valori e filtrare che sia Sample, Packet o OfferSection
 */
Lab.BySampleType = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        sampletype = new Ext.form.ComboBox({
            emptyText: 'Prodotto',
            submitValue: false,
            listeners: {
                select: function (c, record) {
                    Lab.sampleType.getMatrix({
                        sample_type_id: sampletype.getValue()
                    }, function (result) {
                       if(result.matrices){
                           var doctrineWhereIns = [{
                               field: 'DeterminationType.matrix_id',
                               operator: '=',
                               valueSet: result.matrices
                           }];
                           methodStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                           methodStore.load();
                           denomination.clearValue();
                           denomination.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                           denomination.store.load();
                           denomination.enable();
                       }
                       else {
                           methodStore.removeAll();
                           denomination.clearValue();
                           denomination.disable();
                       }
                   }, this);        

                },
                added: function (c, record) {
                    if(self.sample_type_id){
                        sampletype.setValue(self.sample_type_id);
                        Lab.sampleType.getMatrix({
                            sample_type_id: self.sample_type_id
                        }, function (result) {
                            if (result.matrices) {
                                var doctrineWhereIns = [{
                                    field: 'DeterminationType.matrix_id',
                                    operator: '=',
                                    valueSet: result.matrices
                                }];
                                methodStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                                methodStore.load();
                                denomination.clearValue();
                                denomination.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                                denomination.store.load();
                                denomination.enable();
                            }
                        }, this);
                    }
                }
            },
            pageSize: 20,
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'SampleType',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 20
            })
        }),

        denomination = new Ext.form.ComboBox({
            emptyText: 'Denominazione',
            hiddenName: 'denomination_id',
            disabled: true,
            listeners: {
                select: function (combo, record, index) {

                    var doctrineWhereIns = [{
                        field: 'DeterminationType.denomination_id',
                        valueSet: [record.data.id]
                    }];
                    
                    methodStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    methodStore.load();
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

                    var record = grid.getStore().getAt(rowIndex);

                    doctrineWhereIns = grid.store.baseParams.doctrineWhereIns.copy();
                    var whereIn = {
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

                    method.setValue(record.id);
                    self.okbutton.enable();
                }
            },
            sm:         new Ext.grid.RowSelectionModel({singleSelect:true}),
            store:      methodStore,
            viewConfig: {
                forceFit:   true
            }
        }),

        method = new Ext.form.Hidden({
            name: 'method_id'
        }),

        determinationTypeFieldStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                doctrineClass: 'DeterminationTypeField',
                doctrineJoins: ['DeterminationTypeField.DeterminationType']
            },
            fields:     ['field_type_id', 'value', 'is_default']
        }),

        resetFun = function (f) {
            parameters.removeAll();
            methods.store.removeAll();
            delete methods.store.baseParams.tableMethod;
            denomination.lastQuery = null;
            denomination.clearValue();
            denomination.disable();
            self.okbutton.disable();
            if(f){               
                sampletype.lastQuery = null;
                sampletype.clearValue();            
            }
            else {
                Lab.sampleType.getMatrix({
                        sample_type_id: sampletype.getValue()
                    }, function (result) {
                       var doctrineWhereIns = [{
                           field: 'DeterminationType.matrix_id',
                           operator: 'IN',
                           valueSet: result.matrices
                       }];
                       methodStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                       methodStore.load();                       
                       denomination.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                       denomination.store.load();
                       denomination.enable();
                    }, this); 
            }
        },

        okFun = function (b, e) {
           if(denomination.getValue()){
                // raccoglie nome e valore dei parametri selezionati e li imposta
                // come value del field hidden, che verrà inviato nel form
                var params = {};
                parameters.items.each(function (item) {
                    params[item.fieldLabel] = item.value;
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
                resetFun(false);
            }
            else {
                Lab.flash.msg('Errore, Determinazione non salvata', 'Selezionare una denominazione');
            }
        },

        parameters = new Ext.form.FieldSet({
            items: [],
            title: 'Parametri'
        }),

        updateQuery = function () {
            sampletype.lastQuery = null;
            matrix.lastQuery = null;
            denomination.lastQuery = null;
            matrix.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
            denomination.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
            determinationTypeFieldStore.setBaseParam('doctrineWhereIns', doctrineWhereIns);
        };

        config = Ext.apply({
            autoScroll: true,
            bbar: [{
                text: 'Reset',
                handler: resetFun
            },
            '->',
            {
                text: 'OK',
                iconCls: 'icon-small-ok',
                handler: okFun,
                disabled: true,
                ref: '../okbutton'
            }],
            bodyStyle: 'padding: 5px',
            border: false,
            margins: '5 5 5 5',
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype: 'hidden',
                name: config.recordLocal,
                value: config.recordId
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
                items: [sampletype, denomination]
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
            parameters,
            // l'Hidden del method_id
            method]
        }, config);

        Lab.BySampleType.superclass.constructor.call(this, config);
    }
});

Ext.reg('insertbysampletype', Lab.BySampleType);
