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
 *  Griglia delle regole
 *
 *  Riceve i dati del metodo in 'method'
 */
Lab.MethodRuleGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        sfStore = new Lab.sfDirectStore({
            api: {
                read: Lab.method.getRules,
                destroy: Lab.db.destroy
            },
            autoDestroy: true,
            baseParams: {
                doctrineClass: 'MethodRule',
                methodId: config.method.id
            },
            fields: ['id', 'method_id', 'matrix_ids', 'denomination_ids', 'action', 'value', 'matrices', 'denominations', 'rule']
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [{
                header: 'Denominazioni',
                dataIndex: 'denominations',
                renderer: function (v) {
                    if (v === '"all"') {
                        return "Per <b>tutte</b> le denominazioni di questo metodo";
                    } else {
                        return "Per le denominazioni: " + v;
                    }
                }
            },
            {
                header: 'Matrici',
                dataIndex: 'matrices',
                renderer: function (v) {
                    if (v === '"all"') {
                        return "Su <b>tutte</b> le matrici di questo metodo";
                    } else {
                        return "Sulle matrici: " + v;
                    }
                }
            },
            {
                header: 'Azione',
                dataIndex: 'rule'
            }]
        }),

        topToolbar = new Ext.Toolbar({
            items: [{
                text: 'Nuova',
                iconCls: 'icon-small-add',
                tooltip: 'Aggiungi una nuova regola',
                handler: function () {
                    var newWindow = new Lab.RuleWindow({
                        title: 'Nuova regola',
                        method: config.method
                    });
                    newWindow.show();
                    newWindow.on('close', function () {
                        sfStore.reload();
                    });
                }
            },
            {
                text: 'Copia',
                iconCls: 'icon-rule-copy',
                handler: this.copy,
                scope: this
            },
            '->',
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina le regole selezionate',
                handler: function () {
                    var sm = self.getSelectionModel();
                    if (sm.hasSelection()) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare le regole selezionate?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(sm.getSelections());
                                sfStore.reload();
                            }
                        });
                    }
                }
            }]
        });

        config = Ext.apply({
            border: false,
            cm: colModel,
//            loadMask: true,
            store: sfStore,
            tbar: topToolbar,
            title: 'Regole',
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodRuleGrid.superclass.constructor.call(this, config);

        // listeners
        this.on('rowdblclick', function (grid, rowIndex) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record);
        });
    },

    copy: function () {
        if (this.selModel.hasSelection()) {
            var record = this.selModel.getSelected();
            Lab.method.copyRule({
                record_id: record.id
            }, function (r) {
                if (r.success) {
                    Lab.flash.msg('Successo', r.message);
                    this.store.reload();
                } else {
                    Lab.flash.msg('Errore', r.message);
                }
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Selezionare prima la regola da copiare');
        }
    },

    editWindow: function (record) {
        var self = this,

        win = new Lab.RuleWindow({
            title:    'Modifica regola',
            method:   self.method,
            ruleId:   record.id,
            rule:     record.data
        });
        win.show();

        win.on('close', function (w) {
            if (w.result) {
                self.store.reload();
            }
        });
    }
});

Ext.reg('methodrulegrid', Lab.MethodRuleGrid);

/**
 * Riceve method nel caso di una new, method, ruleId e rule nel caso di edit
 */
Lab.RuleWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {

        var self = this,

        form = new Lab.RuleForm({
            method:   config.method,
            ruleId:   config.ruleId,
            rule:     config.rule
        }),

        saveRule = function () {
            var doctrineClass = 'MethodRule', o = {};

            if (form.getForm().isValid()) {
                // JSONizza le opzioni in un unico campo hidden
                // (opzioni.valuefield) con name 'value''
                Ext.each(form.opzioni.items.items, function (item) {
                    if (item.name && item.name !== 'value') {
                        var v = item.getValue();

                        // casi particolari: field-values e price
                        switch (item.name) {
                            case 'field-values':
                                o[item.name] = v.split('\n');
                                break;
                            case 'price':
                                o = v;
                                break;
                            default:
                                o[item.name] = v;
                        }
                    // per i valori nei fieldset 'Incertezza' e 'Recupero'
                    } else if (item.baseCls === 'x-fieldset') {
                        item.items.each(function (item) {
                            item.items.each(function (item) {
                                if (item.name) {
                                    o[item.name] = item.getValue();
                                }
                            });
                        });
                    }
                });
                form.opzioni.valuefield.setValue(Ext.util.JSON.encode(o));

                // JSONizza gli array di Denomination e Matrix ID
                var values = form.getForm().getValues();

                if (values.denomination_ids !== 'all' && !Ext.isArray(values.denomination_ids)) {
                    // piglia gli id dei record selezionati nel grid delle
                    // denomination e li restituisce come array
                    values.denomination_ids = Ext.pluck(form.denominationsGrid.selModel.getSelections(), 'id');
                }
                values.denomination_ids = Ext.util.JSON.encode(values.denomination_ids);

                if (values.matrix_ids !== 'all' && !Ext.isArray(values.matrix_ids)) {
                    var matrix_id = values.matrix_ids;
                    values.matrix_ids = [];
                    values.matrix_ids.push(matrix_id);
                }
                values.matrix_ids = Ext.util.JSON.encode(values.matrix_ids);

                if (config.ruleId) {
                    // è una edit
                    Lab.db.update({
                        doctrineClass:  doctrineClass,
                        data:           values
                    }, function (result) {
                        self.result = result;
                        self.close();
                    });
                } else {
                    // è una new
                    Lab.db.create({
                        doctrineClass:  doctrineClass,
                        data:           values
                    }, function (result) {
                        self.result = result;
                        self.close();
                    });
                }
            } else {
                Ext.Msg.alert('Impossibile salvare', 'Alcuni campi non sono coerenti')
            }
        };

        config = Ext.apply({
            modal:       true,
            width:       800,
            height:      600,
            minWidth:    640,
            minHeight:   480,
            layout:      'fit',
            maximizable: true,
            buttonAlign: 'center',
            items: form,
            buttons: [{
                text: 'OK',
                iconCls: 'icon-small-ok',
                handler: saveRule
            }]
        }, config);

        Lab.RuleWindow.superclass.constructor.call(this, config);
    }
});

/**
 * Riceve gli stessi parametri di RuleWindow
 */
Lab.RuleForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        uselessCheckbox = {
            hidden: true,
            submitValue: false
        },

        denominationChecks = new Ext.grid.CheckboxSelectionModel({
            header: '',
            listeners: {
                rowselect: function () {
                    self.alldenominations.setValue(false);
                }
            }
        }),

        denominations = new Ext.grid.GridPanel({
            border: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true
                },
                columns: [denominationChecks, {
                    header: 'Solo le selezionate:',
                    dataIndex: 'name'
                },
                {
                    header: 'Gruppo',
                    dataIndex: 'Group.name'
                }]
            }),
            height: 170,
            ref: '../denominationsGrid',
            selModel: denominationChecks,
            store: new Ext.data.GroupingStore({
                autoDestroy: true,
                reader: new Ext.data.JsonReader({
                    fields: ['id', 'name', {
                        name: 'Group.name',
                        mapping: 'Group ? obj.Group.name : ""',
                        // Serve a ordinare le denominazioni senza gruppo in
                        // fondo alla griglia.
                        sortType: function (v) {
                            return (v === "") ? 'ZZ' : v;
                        }
                    }]
                })
            }),
            view: new Ext.grid.GroupingView({
                forceFit: true
            })
        }),

        matrices = new Ext.form.CheckboxGroup({
            columns: 3,
            defaults: {
                anchor: '-20'
            },
            fieldLabel: 'Solo',
            // è necessario inizializzare un CheckboxGroup con tanti
            // item quante sono le colonne
            items: [uselessCheckbox, uselessCheckbox, uselessCheckbox]
        });

        config = Ext.apply({
            autoScroll: true,
            border: false,
            labelWidth: 100,
            defaults: {
                xtype: 'fieldset',
                anchor: '-20',
                collapsible: true
            },
            items: [{
                xtype: 'hidden',
                name: 'id',
                value: config.ruleId
            },
            {
                xtype: 'hidden',
                name: 'method_id',
                value: config.method.id
            },
            {
                title: 'Denominazioni',
                items: [{
                    xtype: 'checkbox',
                    autoCreate: {
                        tag: 'input',
                        type: 'checkbox',
                        autocomplete: 'off',
                        value: 'all'
                    },
                    fieldLabel: 'Tutte',
                    boxLabel: '(anche quelle che saranno aggiunte in seguito)',
                    checked: (config.rule && config.rule.denomination_ids == '"all"'),
                    handler: function (box, ed) {
                        if (ed) {
                            denominations.selModel.clearSelections();
                        }
                    },
                    name: 'denomination_ids',
                    ref: '../alldenominations'
                }, denominations]
            },
            {
                title: 'Matrici',
                items: [{
                    xtype: 'checkbox',
                    autoCreate: {
                        tag: 'input',
                        type: 'checkbox',
                        autocomplete: 'off',
                        value: 'all'
                    },
                    fieldLabel: 'Tutte',
                    boxLabel: '(anche quelle che saranno aggiunte in seguito)',
                    checked: (config.rule && config.rule.matrix_ids == '"all"'),
                    handler: function (box, ed) {
                        if (ed) {
                            Ext.each(matrices.items.items, function (cb) {
                                cb.setValue(false);
                            });
                        }
                    },
                    name: 'matrix_ids',
                    ref: 'allmatrices'
                }, matrices]
            },
            {
                title: 'Azione',
                collapsible: false,
                items: [{
                    xtype: 'radiogroup',
                    allowBlank: false,
                    columns: 1,
                    defaults: {
                        anchor: '-20',
                        handler: function (box, ed) {
                            if (ed) {
                                this.setOptions(box.inputValue);
                            }
                        },
                        scope: this,
                        name: 'action'
                    },
                    items: [{
                        boxLabel:   'Configura controlli',
                        checked:    (config.rule && config.rule.action == 'multiset'),
                        inputValue: 'multiset'
                    },
                    {
                        boxLabel:   'Marca questa combinazione denominazione/matrice come <b>accreditata Accredia</b>.',
                        checked:    (config.rule && config.rule.action == 'set-certified'),
                        inputValue: 'set-certified'
                    },
                    {
                        boxLabel:   'Marca questo metodo come <b>scelta preferita</b> per denominazione/matrice.',
                        checked:    (config.rule && config.rule.action == 'set-default'),
                        inputValue: 'set-default'
                    },
                    {
                        boxLabel:   'Assegna una valore alla <b>costante</b>:',
                        checked:    (config.rule && config.rule.action == 'set-constant-value'),
                        inputValue: 'set-constant-value'
                    },
                    {
                        boxLabel:   'Specifica i valori di <b>incertezza</b> e <b>recupero</b>:',
                        checked:    (config.rule && config.rule.action == 'set-uncertainty-recovery'),
                        inputValue: 'set-uncertainty-recovery'
                    },
                    {
                        boxLabel:   'Specifica i valori possibili per il <b>parametro</b>',
                        checked:    (config.rule && config.rule.action == 'set-field-values'),
                        inputValue: 'set-field-values'
                    },
                    {
                        boxLabel:   'Cambia l\'<b>unità di misura</b>:',
                        checked:    (config.rule && config.rule.action == 'change-um'),
                        inputValue: 'change-um'
                    },
                    {
                        boxLabel:   'Modifica il <b>costo</b>:',
                        checked:    (config.rule && config.rule.action == 'set-price'),
                        inputValue: 'set-price'
                    },
                    {
                        boxLabel:   '<b>Disabilita</b>',
                        checked:    (config.rule && config.rule.action == 'disable'),
                        inputValue: 'disable'
                    }]
                }]
            },
            {
                title: 'Opzioni',
                collapsed: true,
                ref: 'opzioni'
            }],
            padding: 10
        }, config);

        Lab.db.list({
            doctrineClass: 'Method',
            doctrineJoins: ['Method.Denominations.Group', 'Method.Matrixes.Matrix'],
            doctrineWheres: [{
                field: 'id',
                operator: '=',
                value: config.method.id
            }]
        }, function (r) {
            var method = r.data[0], checkedIds;

            // popola il GridPanel delle Denomination
            denominations.store.loadData(method.Denominations);

            // se è una edit, seleziona prima le Denomination e poi le Matrix
            // salvate nella regola
            if (self.rule) {
                var rows = [];
                Ext.each(Ext.util.JSON.decode(self.rule.denomination_ids), function (item) {
                    rows.push(denominations.store.indexOfId(item));
                });
                denominations.selModel.selectRows(rows);

                checkedIds = Ext.util.JSON.decode(self.rule.matrix_ids);
            }

            // ordina le matrici per nome
            method.Matrixes.sort(function (a, b) {
                return (a.Matrix.name > b.Matrix.name) ? 1 : ((b.Matrix.name > a.Matrix.name) ? -1 : 0);
            });

            Ext.each(method.Matrixes, function (matrix) {
                var checked = false;
                if (self.rule && checkedIds !== 'all') {
                    Ext.each(checkedIds, function (item) {
                        if (item == matrix.Matrix.id) {
                            checked = true;
                            return;
                        }
                    });
                }

                var items = matrices.items,
                    columns = matrices.panel.items,
                    column = columns.itemAt(items.getCount() % columns.getCount()),
                    checkbox = column.add({
                        boxLabel: matrix.Matrix.name,
                        checked: checked,
                        handler: function (box, ed) {
                            if (ed) {
                                box.ownerCt.ownerCt.ownerCt.ownerCt.allmatrices.setValue(false);
                            }
                        },
                        name: 'matrix_ids',
                        inputValue: matrix.Matrix.id
                    });
                items.add(checkbox);
            });
            matrices.doLayout();
        });

        Lab.RuleForm.superclass.constructor.call(this, config);

        this.opzioni.on('afterrender', function () {
            if (this.rule) {
                this.setOptions(this.rule.action, Ext.util.JSON.decode(this.rule.value));
            }
        }, this);
    },

    /**
     * @param {String} inputValue L'azione della MethodRule
     * @param {Object} ruleValue Il value della MethodRule
     */
    setOptions: function (inputValue, ruleValue) {
        var prefix = new Ext.form.ComboBox({
            fieldLabel:     'Scala',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass: 'SIPrefix'
                },
                fields:     ['id', 'prefix']
            }),
            valueField:     'id',
            displayField:   'prefix',
            triggerAction:  'all',
            editable:       false,
            name:           'si-prefix-id',
            submitValue:    false,
            value:          ruleValue ? ruleValue['si-prefix-id'] : this.method.data.prefix_id
        }),

        unit = new Ext.form.ComboBox({
            fieldLabel:     'Unità di misura',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass: 'UnitOfMeasurement'
                },
                fields:     ['id', 'symbol']
            }),
            valueField:     'id',
            displayField:   'symbol',
            triggerAction:  'all',
            editable:       false,
            name:           'um-id',
            submitValue:    false,
            value:          ruleValue ? ruleValue['um-id'] : this.method.data.um_id
        }),

        significant = new Ext.form.NumberField({
            allowBlank:     false,
            allowDecimals:  false,
            fieldLabel:     'Cifre significative',
            name:           'significant-digits',
            submitValue:    false,
            value:          ruleValue ? ruleValue['significant-digits'] : this.method.data.significant_digits
        }),

        decimal = new Ext.form.NumberField({
            allowBlank:     false,
            allowDecimals:  false,
            fieldLabel:     'Cifre decimali',
            name:           'max-decimal-digits',
            submitValue:    false,
            value:          ruleValue ? ruleValue['max-decimal-digits'] : this.method.data.max_decimal_digits
        }),

        loq = new Ext.form.NumberField({
            allowNegative:  false,
            decimalPrecision:   5,
            fieldLabel:     'LOQ',
            name:           'loq',
            submitValue:    false,
            value:          ruleValue ? ruleValue['loq'] : this.method.data.loq
        }),

        lod = new Ext.form.NumberField({
            allowNegative:  false,
            decimalPrecision:   5,
            fieldLabel:     'LOD',
            name:           'lod',
            submitValue:    false,
            value:          ruleValue ? ruleValue['lod'] : this.method.data.lod
        }),

        uncertainty = new Ext.form.FieldSet({
            title: 'Incertezza',
            items: [{
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Valore unico',
                items: [{
                    name: 'incertezza-unico-livello',
                    submitValue: false,
                    value: ruleValue && ruleValue['incertezza-unico-livello'],
                    xtype: 'numberfield',
                    width: 288
                }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 1',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'incertezza-concentrazione-i-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-concentrazione-i-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione bassa',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'incertezza-i-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-i-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 2',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'incertezza-concentrazione-ii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-concentrazione-ii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione media',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'incertezza-ii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-ii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 3',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'incertezza-concentrazione-iii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-concentrazione-iii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione alta',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'incertezza-iii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['incertezza-iii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            }]
        }),

        recovery = new Ext.form.FieldSet({
            title: 'Recupero',
            items: [{
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Valore unico',
                items: [{
                    name: 'recupero-unico-livello',
                    submitValue: false,
                    value: ruleValue && ruleValue['recupero-unico-livello'],
                    xtype: 'numberfield',
                    width: 288
                }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 1',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'recupero-concentrazione-i-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-concentrazione-i-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione bassa',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'recupero-i-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-i-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 2',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'recupero-concentrazione-ii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-concentrazione-ii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione media',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'recupero-ii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-ii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            },
            {
                xtype: 'panel',
                layout: 'hbox',
                border: false,
                fieldLabel: 'Livello 3',
                defaults: {
                    margins: '0 2 0 0'
                },
                items: [{
                   name: 'recupero-concentrazione-iii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-concentrazione-iii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'concentrazione alta',
                   margins: '0 9 0 0',
                   width: 144
               },
               {
                   name: 'recupero-iii-livello',
                   submitValue: false,
                   value: (ruleValue ? ruleValue['recupero-iii-livello'] : undefined),
                   xtype: 'numberfield',
                   width: 48
               },
               {
                   xtype: 'displayfield',
                   value: 'valore'
               }]
            }]
        });

        this.opzioni.removeAll();
        this.opzioni.add({
            xtype:  'hidden',
            name:   'value',
            ref:    'valuefield'
        });

        switch (inputValue) {
            case 'set-constant-value':
                var constant = new Ext.form.ComboBox({
                    fieldLabel: 'Costante',
                    store: new Lab.sfDirectStore({
                        autoLoad:   false,
                        baseParams: {
                            doctrineClass:  'MethodConstant',
                            doctrineJoins:  ['MethodConstant.Methods'],
                            doctrineWheres: [{
                                field:      'Methods.id',
                                operator:   '=',
                                value:      this.method.id
                            }]
                        },
                        fields:     ['id', 'name']
                    }),
                    valueField:     'id',
                    displayField:   'name',
                    triggerAction:  'all',
                    editable:       false,
                    name:           'constant-id',
                    submitValue:    false,
                    value:          (ruleValue ? ruleValue['constant-id'] : undefined)
                });
                var value = new Ext.form.TextField({
                    fieldLabel:     'Valore',
                    name:           'constant-value',
                    submitValue:    false,
                    value:          (ruleValue ? ruleValue['constant-value'] : undefined)
                });
                this.opzioni.add(constant, value);
                this.opzioni.expand();
                break;
            case 'set-field-values':
                var fieldtype = new Ext.form.ComboBox({
                    fieldLabel:     'Parametro',
                    store: new Lab.sfDirectStore({
                        autoLoad:   false,
                        baseParams: {
                            doctrineClass:  'FieldType',
                            doctrineJoins:  ['FieldType.Methods'],
                            doctrineWheres: [{
                                field:      'Methods.id',
                                operator:   '=',
                                value:      this.method.id
                            }]
                        },
                        fields:     ['id', 'name']
                    }),
                    valueField:     'id',
                    displayField:   'name',
                    triggerAction:  'all',
                    editable:       false,
                    name:           'field-id',
                    submitValue:    false,
                    value:          (ruleValue ? ruleValue['field-id'] : undefined)
                });
                var values = new Ext.form.TextArea({
                    fieldLabel:     'Valori',
                    name:           'field-values',
                    submitValue:    false,
                                    // field-values è un Array JS, lo convertiamo in una stringa
                                    // con gli a capo per visualizzarlo nella TextArea
                    value:          (ruleValue ? ruleValue['field-values'].join('\n') : undefined)
                });

                var legend = new Ext.Panel({
                    padding: 5,
                    html: 'Valori (uno per riga):' +
                          '<pre>' +
                              '<br>&nbsp;&nbsp;*: Valore <b>non</b> accreditato Accredia<br>' +
                              '&nbsp;&nbsp;!: Valore di default' +
                          '</pre>'
                });
                this.opzioni.add(fieldtype, values, legend)
                this.opzioni.expand();
                break;
            case 'change-um':
                this.opzioni.add(prefix, unit, decimal, significant, loq, lod);
                this.opzioni.expand();
                break;
            case 'set-price':
                var price = new Ext.form.NumberField({
                    fieldLabel:         'Costo',
                    name:               'price',
                    submitValue:        false,
                    value:              ruleValue,
                    decimalPrecision:   2,
                    allowNegative:      false
                });
                this.opzioni.add(price);
                this.opzioni.expand();
                break;
            case 'set-uncertainty-recovery':
                var help = new Ext.form.Label({
                    html: '<p><b>INFO:</b> le singole costanti vanno comunque' +
                          ' associate al metodo dal relativo tab.</p><br/>'
                });
                this.opzioni.add(help, uncertainty, recovery);
                this.opzioni.expand();
                break;
            case 'multiset':
                var accredia = new Ext.form.Checkbox({
                    fieldLabel: 'Accreditato',
                    name: 'is-sinal',
                    submitValue: false,
                    checked: ruleValue && ruleValue['is-sinal']
                });
                this.opzioni.add(accredia, prefix, unit, decimal, significant, loq, lod, uncertainty, recovery);
                this.opzioni.expand();
                break;
            default:
                this.opzioni.collapse();
        }

        this.opzioni.doLayout();
    }
});

Ext.reg('ruleform', Lab.RuleForm);