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

Lab.SampleForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        descrizione = new Ext.form.TextField({
            fieldLabel: 'Descrizione interna',
            name: 'descrizione',
            allowBlank: false,
            labelStyle: 'font-weight:bold;'
        }),

        codcliente = new Ext.form.TextArea({
            fieldLabel: 'Riferimento del cliente (sul CdA)',
            name: 'codcliente',
            allowBlank: false,
            labelStyle: 'font-weight:bold;'
        }),

        prodotto = new Lab.ComboField({
            doctrineClass: 'SampleType',
            fieldLabel: 'Prodotto',
            hiddenName: 'sample_type_id',
            valueField: 'id'
        }),

        gruppo_matrice = new Ext.form.ComboBox({
            fieldLabel:     'Gruppo (di matrici)',
            hiddenName:     'gruppo_matrice',
            forceSelection: true,
            minChars:       2,
            triggerAction:  'all',
            displayField:   'name',
            valueField:     'id',
            listeners: {
                select: function (field, record) {
                    matrix.lastQuery = null;
                    matrix.clearValue();

                    matrix.store.setBaseParam('tableMethodParam', record.data.id);
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

        matrix = new Ext.form.ComboBox({
            fieldLabel: 'Sottomatrice',
            hiddenName: 'matrix_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 15,
            triggerAction: 'all',
            forceSelection: true,
            minChars: 2,
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Matrix',
                    tableMethod: 'retrieveMatrixBranch',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 15
            })
        }),

        urgency = new Ext.form.ComboBox({
            fieldLabel:     'Priorità',
            hiddenName:     'urgency',
            triggerAction:  'all',
            editable:       false,
            mode:           'local',
            store:          [[4, 'Normale'], [3, 'Urgente'], [2, 'Urgentissimo']]
        }),

        fieldsetGenerale = {
            xtype: 'columnfieldset',
            title: 'Generale',
            collapsible: false,
            left: [descrizione, codcliente, urgency],
            right: [prodotto, gruppo_matrice, matrix, {xtype: 'limitsgroupcombo'}]
        },

        // Campi "comuni" campionamento/prelievo e ritiro
        data_prelievo = new Lab.SampleDateField({
            name: 'data_prelievo',
            arrivalDate: config.order.data.arrived_at,
            allowBlank: false,
            labelStyle: 'font-weight:bold;'
        }),

        ora_prelievo = new Ext.form.TimeField({
            fieldLabel: 'Ora prelievo',
            name: 'ora_prelievo',
            format: 'H:i:s',
            editable: true,
            minValue: '08:00:00',
            maxValue: '23:30:00',
            increment: 15,
            value: new Date()
        }),

        fine_prelievo = new Ext.form.TimeField({
            fieldLabel: 'Fine prelievo',
            name: 'fine_prelievo',
            format: 'H:i:s',
            editable: true,
            minValue: '08:00:00',
            maxValue: '23:30:00',
            increment: 15
        }),

        data_ritiro = new Lab.SampleDateField({
            name: 'data_ritiro',
            arrivalDate: config.order.data.arrived_at
        }),

        acuradiStore = new Ext.data.SimpleStore({
            fields: [{
                name: 'name',
                type: 'string'
            }],
            data: [['Laboratorio'], ['Cliente'], ['Terzi']]
        }),

        prelevato_da = new Ext.form.ComboBox({
            allowBlank: false,
            displayField: 'name',
            editable: false,
            fieldLabel: 'A cura di',
            forceSelection: true,
            hiddenName: 'prelevato_da',
            labelStyle: 'font-weight:bold;',
            mode: 'local',
            store: acuradiStore,
            triggerAction: 'all',
            valueField: 'name'
        }),

        ritirato_da = new Ext.form.ComboBox({
            displayField: 'name',
            editable: false,
            fieldLabel: 'A cura di',
            forceSelection: true,
            hiddenName: 'ritirato_da',
            mode: 'local',
            store: acuradiStore,
            triggerAction: 'all',
            valueField: 'name'
        }),

        metodo_campionamento = new Ext.form.TextField({
            fieldLabel: 'Norma di campionamento',
            name: 'metodo_campionamento'
        }),

        punto_prelievo = new Ext.form.TextField({
            fieldLabel: 'Punto',
            name: 'punto_prelievo'
        }),

        prelevatore = new Lab.ComboField({
            doctrineClass: 'Employee',
            fieldLabel: 'Addetto',
            hiddenName: 'addetto_prelievo'
        }),

        ritiratore = new Lab.ComboField({
            doctrineClass: 'Employee',
            fieldLabel: 'Addetto',
            hiddenName: 'ritiratore'
        }),

        luogo_prelievo = new Ext.form.TextField({
            fieldLabel: 'Luogo',
            name: 'luogo_prelievo'
        }),

        luogo_ritiro = new Ext.form.TextField({
            fieldLabel: 'Luogo',
            name: 'luogo_ritiro'
        }),

        note_prelievo = new Ext.form.TextArea({
            fieldLabel: 'Note',
            name: 'note_prelievo'
        }),

        fieldsetPrelievo = new Lab.ColumnFieldset({
            title: 'Prelievo/Campionamento',
            left: [data_prelievo, ora_prelievo, fine_prelievo, prelevato_da, metodo_campionamento],
            right: [prelevatore, luogo_prelievo, punto_prelievo, note_prelievo]
        }),

        fieldsetRitiro = {
            xtype: 'columnfieldset',
            title: 'Ritiro',
            collapsed: true,
            left: [data_ritiro, ritirato_da],
            right: [ritiratore, luogo_ritiro]
        },

        /**
         * Campi del fieldset "Dettagli Specifici"
         */
        data_scadenza = new Ext.form.DateField({
            fieldLabel: 'Data richiesta di fine analisi',
            format: 'd/m/Y',
            name: 'data_scadenza',
            validator: function (value) {
                var ret = true;
                if (value) {
                    var arrivalDate = config.order.data.arrived_at;
                    var valueDate = new Date();

                    valueDate = Date.parseDate(value, 'd/m/Y');

                    if (valueDate < arrivalDate.clearTime()) {
                        ret = "La data richiesta di fine analisi dev'essere uguale o successiva alla data di arrivo.";
                    }
                }
                return ret;
            }
        }),

        trasportatore = new Ext.form.ComboBox({
            fieldLabel:     'Trasportatore',
            hiddenName:     'trasportatore',
            forceSelection: true,
            triggerAction:  'all',
            displayField:   'option',
            valueField:     'option',
            store: new Ext.data.DirectStore({
                autoDestroy: true,
                baseParams: {
                    table:  'Sample',
                    field:  'trasportatore'
                },
                directFn: Lab.db.getEnumValues,
                reader: new Ext.data.ArrayReader({
                    fields:     ['option'],
                    idIndex:    0
                })
            })
        }),

        temperaturaPanel = new Ext.Panel({
            xtype: 'panel',
            layout: 'hbox',
            fieldLabel: 'Temperatura di consegna',
            submitValue: false,
            items: [{
                xtype: 'textfield',
                emptyText: '°C',
                flex: 3,
                margins: '0 2 0 0',
                maxLength: 3,
                name: 'temperatura'
            },
            {
                xtype: 'checkbox',
                boxLabel: 'Stampa',
                flex: 1,
                margins: '0 0 0 2',
                name: 'stampa_temperatura'
            }]
        }),

        conforme = new Ext.form.Checkbox({
            fieldLabel: 'Conforme?',
            name:       'is_adequate',
            checked:    true,
            handler: function () {
                condizioni.toggle();
            }
        }),

        condizioni = new Ext.form.TextField({
            fieldLabel: 'Condizioni all\'arrivo',
            name:       'condizioni',
            disabled:   true
        }),
                
        trasporto = new Ext.form.ComboBox({
            displayField: 'name',
            editable: false,
            fieldLabel: 'Trasporto',
            forceSelection: true,
            hiddenName: 'trasporto',
            mode: 'local',
            store: new Ext.data.SimpleStore({
                fields: ['name'],
                data: [['Refrigerato'], ['Temperatura ambiente']]
            }),
            triggerAction: 'all',
            valueField: 'name'
        }),

        notalab = new Ext.form.TextField({
            fieldLabel: 'Nota per laboratorio',
            name: 'notalab'
        }),

        notardp = new Ext.form.TextArea({
            fieldLabel: 'Nota per il certificato',
            name: 'notardp'
        }),

        placeextest = new Ext.form.TextField({
            fieldLabel: 'Luogo esecuzione prove',
            name: 'place_execution_test'
        }),

        fieldsetSpecifici = {
            xtype: 'columnfieldset',
            title: 'Dettagli specifici',
            collapsed: true,
            left: [temperaturaPanel, conforme, condizioni,placeextest,notardp],
            right: [data_scadenza, trasportatore, trasporto, notalab]
        }
        
        config = Ext.apply({
            title: 'Dati campione',
            autoScroll: true, 
            iconCls: 'icon-small-clipboard-task',
            defaults: {
                anchor: '-20'
            },
            labelWidth: 120,
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'hidden',
                name: 'order_id'
            }, fieldsetGenerale, fieldsetPrelievo, fieldsetRitiro, fieldsetSpecifici],
            padding: 5
        }, config);

        Lab.SampleForm.superclass.constructor.call(this, config);
        
        if (config.order) {
            this.getForm().setValues({
                order_id: config.order.id
            });
        }
    }
});

Lab.ColumnFieldset = Ext.extend(Ext.form.FieldSet, {
    constructor: function(config) {

        config = Ext.apply({
            anchor: '-20',
            collapsible: true,
            items: [{
                /**
                 *  Layout a Colonne
                 */
                layout: 'column',
                border: false,
                defaults: {
                    // default per le colonne
                    columnWidth: 0.5,
                    layout: 'form',
                    border: false,
                    xtype: 'panel',
                    labelWidth: 120
                },
                items: [{
                    // colonna sinistra
                    defaults: {
                        // defaults per i campi
                        anchor: '100%',
                        border: false
                    },
                    items: config.left
                },
                // fine colonna sinistra
                {
                    // colonna destra
                    defaults: {
                        // defaults per i campi
                        anchor: '100%',
                        border: false
                    },
                    bodyStyle: 'padding-left:12px',
                    layout: 'form',
                    border: false,
                    items: config.right
                }]
            // fine colonna destra
            }]
        }, config);

        Lab.ColumnFieldset.superclass.constructor.call(this, config);

    }

});

Lab.SampleDateField = Ext.extend(Ext.form.DateField, {
    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Data',
            format: 'd/m/Y',
            validator: function (value) {
                var ret = true;
                if (value) {
                    var valueDate = new Date();

                    valueDate = Date.parseDate(value, 'd/m/Y');

                    if (valueDate > config.arrivalDate.clearTime()) {
                        ret = "Questa data non può essere successiva alla data di arrivo!";
                    }
                }
                return ret;
            }
        }, config);

        Lab.SampleDateField.superclass.constructor.call(this, config);
    }
});

Lab.ComboField = Ext.extend(Ext.Panel, {
    constructor: function (config) {
        config = Ext.apply({
            layout: 'hbox',
            items: [{
                xtype: 'combo',
                displayField: 'name',
                editable: true,
                flex: 4,
                forceSelection: false,
                hiddenName: config.hiddenName,
                margins: '0 2 0 0',
                pageSize: 10,
                triggerAction: 'all',
                typeAhead: true,
                valueField: (config.valueField) ? config.valueField : 'name',
                store: new Lab.sfDirectStore({
                    autoLoad: false,
                    baseParams: {
                        doctrineClass: config.doctrineClass,
                        sort: 'name'
                    },
                    fields: ['name','id'],
                    pageSize: 10
                })
            },
            {
                xtype: 'button',
                flex: 1,
                handler: function (b, e) {
                    var combo = this.ownerCt.items.itemAt(0);
                    var value = combo.getValue();

                    if (value && (config.valueField ? parseInt(value) != value : true)) {
                        Lab.db.create({
                            doctrineClass: config.doctrineClass,
                            data: {
                                name: value
                            }
                        }, function (r) {
                            Lab.flash.msg('Inserimento riuscito', '');
                            if (config.valueField) {
                                combo.store.reload({
                                    callback: function () {
                                        combo.setValue(r.data.id);
                                    }
                                });
                            }
                        });
                    } else {
                        Lab.flash.msg('Errore', '');
                    }
                },
                iconCls: 'icon-small-add',
                margins: '0 0 0 2',
                tooltip: 'Aggiungi al database'
            }]
        }, config);

        Lab.ComboField.superclass.constructor.call(this, config);
    }
});

Ext.reg('sampleform', Lab.SampleForm);
Ext.reg('columnfieldset', Lab.ColumnFieldset);
Ext.reg('sampledatefield', Lab.SampleDateField);
Ext.reg('combofield', Lab.ComboField);
