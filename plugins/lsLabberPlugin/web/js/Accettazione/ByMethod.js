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
 * Interfaccia di inserimento controlli "per metodo".
 * 
 * Riceve un recordId e un recordLocal che indica su quale campo del
 * db salvare valori e filtrare che sia Sample, Packet o OfferSection
 */
Lab.ByMethod = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        matrix = new Ext.form.ComboBox({
            emptyText:  '(sotto) Matrice',
            hiddenName: 'matrix_id',
            disabled: true,
            pageSize:   20,
            listeners: {
                select: function (combo, record) {

                   denominationFieldset.removeAll();
                    var cg  = new Ext.form.CheckboxGroup({
                        columns:    3,
                        defaults: {
                            anchor: '-20'
                        },
                        items: [{
                            hidden:         true,
                            submitValue:    false
                        }]
                    });
                    denominationFieldset.add(cg);
                    denominationFieldset.doLayout();

                    Lab.method.getDeterminationType({
                        id: method.getValue(),
                        matrix: this.getValue()
                    }, function (result) {
                    this.data = result.data;
                    Ext.each(this.data, function (dt) {
                        var items   = cg.items,
                            columns = cg.panel.items,
                            column  = columns.itemAt(items.getCount() % columns.getCount()),
                            checkbox = column.add({
                                boxLabel:   dt.Denomination.name,
                                inputValue: dt.Denomination.id,
                                name:       'denomination_ids'
                            });
                        items.add(checkbox);
                    });
                    denominationFieldset.doLayout();
                    okButton.enable();
                    }, this);
                }
            },
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                autoDestroy: true,
                baseParams: {
                    doctrineClass:  'Matrix',
                    doctrineJoins:  ['Matrix.DeterminationType'],
                    sort:           'name'
                },
                fields:     ['id', 'name'],
                pageSize:   20
            })
        }),

        method = new Ext.form.ComboBox({
         
            emptyText: 'Metodo',
            hiddenName: 'method_id',
            listeners: {
                select: function (combo, record) {
                    denominationFieldset.removeAll();
                    var cg  = new Ext.form.CheckboxGroup({
                        columns:    3,
                        defaults: {
                            anchor: '-20'
                        },
                        items: [{
                            hidden:         true,
                            submitValue:    false
                        }]
                    });
                    denominationFieldset.add(cg);
                    denominationFieldset.doLayout();

                    Lab.method.getDeterminationType({
                        id: this.getValue()
                    }, function (result) {
                    this.data = result.data;
                    Ext.each(this.data, function (dt) {
                        var items   = cg.items,
                            columns = cg.panel.items,
                            column  = columns.itemAt(items.getCount() % columns.getCount()),
                            checkbox = column.add({
                                boxLabel:   dt.Denomination.name,
                                inputValue: dt.Denomination.id,
                                name:       'denomination_ids'
                            });
                        items.add(checkbox);
                    });
                    denominationFieldset.doLayout();
                    okButton.enable();
                    }, this);

                    matrix.clearValue();
                    var doctrineWhereIns = [{
                        field: 'DeterminationType.method_id',
                        valueSet: [this.getValue()]
                    }];
                    matrix.store.setBaseParam('doctrineWhereIns', doctrineWhereIns);
                    matrix.store.load();
                    matrix.enable();
                   
                    // aggiunge una checkbox per ogni Denomination collegata al Method selezionato
                   
                }
            },
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'Method',
                    sort:           'name'
                },
                fields:     ['id', 'name', 'DeterminationType'],
                pageSize: 20
            })
        }),

        denominationFieldset = new Ext.form.FieldSet({
            title:  'Denominazioni'
        }),

        resetFun = function () {
            okButton.disable();
            denominationFieldset.removeAll();
            method.lastQuery = null;
            method.clearValue();
            matrix.lastQuery = null;
            matrix.clearValue();
        },

        okFun = function() {
            var valuez = self.getForm().getValues();
            Ext.each(valuez.denomination_ids, function (denomination_id, index) {
                // TODO: manca il salvataggio dei parametri "di default"
                var determinationData = Ext.copyTo({denomination_id: denomination_id}, valuez, ['matrix_id', 'method_id', 'params', config.recordLocal]);
                Lab.db.create({
                    doctrineClass:  'Determination',
                    data:           determinationData
                }, function (result) {
                    if (result.success) {
                        Lab.flash.msg('Successo', 'Controllo inserito correttamente.');
                    } else {
                        Lab.flash.msg('Errore', result.message);
                    }
                });
            });
            resetFun();
        },

        okButton = new Ext.Button({
            text:       'OK',
            iconCls:    'icon-small-ok',
            handler:    okFun,
            disabled:   true
        });

        config = Ext.apply({
            autoScroll: true,
            bbar: [{
                text:       'Reset',
                handler:    resetFun
            },
            '->',
            okButton],
            border:     false,
            padding:    5,
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
                items: [method, matrix]
            },
            // conterrà il JSON dei parametri selezionati
            {
                xtype: 'hidden',
                name: 'params',
                ref: 'hiddenparams'
            },
            denominationFieldset]
        }, config);

        Lab.ByMethod.superclass.constructor.call(this, config);
    }
});

Ext.reg('insertbymethod', Lab.ByMethod);
