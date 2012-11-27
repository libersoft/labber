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
 * Questo file dichiara delle combo box utili in varie parti del progetto
 * in modo da poterle usare definendole una sola volta
 */

/* Tabelle limiti */
Lab.LimitsGroupCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel:         'Tabella limiti',
            name:               'limits_group_id',
            pageSize:           20,
            displayField:       'name',
            valueField:         'id',
            forceSelection:     true,
            triggerAction:      'all',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'LimitsGroup',
                    doctrineWheres: [{
                        field: 'unconfirmed',
                        operator: '=',
                        value: 0
                    }],
                    metaData:       true,
                    sort:           'name'
                },
                pageSize:   20
            })
        }, config);

        Lab.LimitsGroupCombo.superclass.constructor.call(this, config);
    }
});

Ext.reg('limitsgroupcombo', Lab.LimitsGroupCombo);


/* Combo con i clienti */
Lab.CustomerCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        var customerStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                sort: 'name',
                doctrineClass: config.doctrineClass ? config.doctrineClass : 'Contact',
                doctrineWheres: config.doctrineWheres ? config.doctrineWheres : null
             },
            fields: [{
                name: 'id',
                type: 'integer'
            },
            {
                name: 'name',
                type: 'string'
            }],
            pageSize: 20
        });

        config = Ext.apply({
            displayField: 'name',
            forceSelection: true,
            pageSize: 20,
            store: customerStore,
            triggerAction: 'all',
            valueField: 'id'
        }, config);

        Lab.CustomerCombo.superclass.constructor.call(this, config);
    }
});

Ext.reg('contactcombo', Lab.CustomerCombo);


/* Combo con gli Enti */
Lab.OrganizationCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        var organizationStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                sort: 'short_name',
                doctrineClass: 'Organization'
             },
            fields: [{
                name: 'id',
                type: 'integer'
            },
            {
                name: 'short_name',
                type: 'string'
            }],
            pageSize: 20
        });

        config = Ext.apply({
            displayField: 'short_name',
            forceSelection: true,
            pageSize: 20,
            store: organizationStore,
            triggerAction: 'all',
            typeAhead: true,
            valueField: 'id'
        }, config);

        Lab.OrganizationCombo.superclass.constructor.call(this, config);
    }
});

/* Combo con le Unità di misura */
Lab.UMCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        var umStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                sort: 'name',
                doctrineClass: 'UnitOfMeasurement'
             },
            fields: [{
                name: 'id',
                type: 'integer'
            },
            {
                name: 'name',
                type: 'string'
            }],
            pageSize: 20
        });

        config = Ext.apply({
            displayField: 'name',
            forceSelection: true,
            pageSize: 20,
            store: umStore,
            triggerAction: 'all',
            typeAhead: true,
            valueField: 'id'
        }, config);

        Lab.UMCombo.superclass.constructor.call(this, config);
    }
});

Ext.reg('umcombo', Lab.UMCombo);

/* Combo con le Unità di misura */
Lab.PrefixCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        var prefixStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                sort: 'name',
                doctrineClass: 'SIPrefix'
             },
            fields: [{
                name: 'id',
                type: 'integer'
            },
            {
                name: 'name',
                type: 'string'
            }],
            pageSize: 20
        });

        config = Ext.apply({
            displayField: 'name',
            forceSelection: true,
            pageSize: 20,
            store: prefixStore,
            triggerAction: 'all',
            typeAhead: true,
            valueField: 'id'
        }, config);

        Lab.PrefixCombo.superclass.constructor.call(this, config);
    }
});

Ext.reg('prefixcombo', Lab.PrefixCombo);

/* Combo con le Unità di misura */
Lab.AnalyticalTecniqueCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        var atStore = new Lab.sfDirectStore({
            autoLoad: false,
            baseParams: {
                sort: 'name',
                doctrineClass: 'AnalyticalTechnique'
             },
            fields: [{
                name: 'id',
                type: 'integer'
            },
            {
                name: 'name',
                type: 'string'
            }],
            pageSize: 20
        });

        config = Ext.apply({
            displayField: 'name',
            forceSelection: true,
            pageSize: 20,
            store: atStore,
            triggerAction: 'all',
            typeAhead: true,
            valueField: 'id'
        }, config);

        Lab.AnalyticalTecniqueCombo.superclass.constructor.call(this, config);
    }
});

Lab.PacketCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Pacchetto',
            name: 'packet_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Packet',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.PacketCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('packetcombo', Lab.PacketCombo);

Lab.MatrixCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Matrice',
            name: 'matrix_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Matrix',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.MatrixCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('matrixcombo', Lab.MatrixCombo);

Lab.DenominationCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Denominazione',
            name: 'denomination_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Ext.data.DirectStore({
                api: {
                    read: Lab.denomination.aliasFilter
                },
                autoDestroy: true,
                autoLoad: false,
                fields: ['id', 'name', 'alias', 'identifier'],
                idProperty: 'id',
                pageSize: 12,
                root: 'data',
                totalProperty: 'total'
            }),
            getValue: function () {
                var v = Lab.DenominationCombo.superclass.getValue.call(this);

                if (v) {
                    var r = this.findRecord(this.valueField, v);

                    return r.data.identifier;
                } else {
                    return v;
                }
            }
       }, config);

       Lab.DenominationCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('denominationcombo', Lab.DenominationCombo);

Lab.MethodCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Metodo',
            name: 'method_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Method',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.MethodCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('methodcombo', Lab.MethodCombo);

Lab.MethodConstantCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Costanti',
            name: 'method_constant_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'MethodConstant',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.MethodConstantCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('methodconstantcombo', Lab.MethodConstantCombo);

Lab.MethodReportColumnCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Colonne rapporto',
            name: 'report_column_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'ReportColumn',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.MethodReportColumnCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('methodreportcolumncombo', Lab.MethodReportColumnCombo);

Lab.MethodFieldTypeCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            fieldLabel: 'Parametri',
            name: 'field_type_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 12,
            triggerAction: 'all',
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'FieldType',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 12
            })
       }, config);

       Lab.MethodFieldTypeCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('methodfieldtypecombo', Lab.MethodFieldTypeCombo);

Lab.OfferStateCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            displayField: 'name',
            valueField:'value',
            editable: false,
            fieldLabel: 'Stato',
            forceSelection: true,
            hiddenName: 'offer_state',
            mode: 'local',
            store: new Ext.data.SimpleStore({
            fields: [{
                    name: 'value'
                },
                {
                    name: 'name',
                    type: 'string'
                }
                ],
                data: [[0,'Bozza'], [1,'Emessa'], [2,'Revisionata'],[3,'Scaduta'], [4,'Rifiutata'], [5,'Confermata']]
            }),
            triggerAction: 'all'
       }, config);

       Lab.OfferStateCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('offerstatecombo', Lab.OfferStateCombo);

Lab.BillingModalityCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            displayField: 'name',
            valueField:'value',
            editable: false,
            fieldLabel: 'Modalità di Fatturazione',
            forceSelection: true,
            hiddenName: 'billing_modality',
            mode: 'local',
            store: new Ext.data.SimpleStore({
            fields: [{
                    name: 'value'
                },
                {
                    name: 'name',
                    type: 'string'
                }
                ],
                data: [[0,'Anticipata'],[1,'Consegna Risultati'], [2,'Fine Mese']]
            }),
            triggerAction: 'all'
       }, config);

       Lab.BillingModalityCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('billingmodalitycombo', Lab.BillingModalityCombo);

Lab.PaymentModalityCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            displayField: 'name',
            valueField:'value',
            editable: false,
            fieldLabel: 'Modalità di Pagamento',
            forceSelection: true,
            hiddenName: 'payment_modality',
            mode: 'local',
            store: new Ext.data.SimpleStore({
            fields: [{
                    name: 'value'
                },
                {
                    name: 'name',
                    type: 'string'
                }
                ],
                data: [[0,'Contanti'],[1,'Ri.Ba.'], [2,'Assegno'], [3,'Vaglia Postale']]
            }),
            triggerAction: 'all'
       }, config);

       Lab.PaymentModalityCombo.superclass.constructor.call(this, config);
   }
});

Ext.reg('paymentmodalitycombo', Lab.PaymentModalityCombo);


/* Referenti tecnici */
Lab.TechnicalManagerCombo = Ext.extend(Ext.form.ComboBox, {

    constructor: function (config) {

        config = Ext.apply({
            hiddenName:         'technical_manager_id',
            forceSelection:     true,
            triggerAction:      'all',
            displayField:       'fullname',
            valueField:         'id',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'User',
                    tableMethod:    'retrieveTechnicalManagerList',
                    searchFields:   ['name', 'surname']
                 },
                fields: ['id', 'name', 'surname',
                {
                    name:       'fullname',
                    mapping:    'surname + \' \' + obj.name'
                }]
            })
        }, config);

        Lab.TechnicalManagerCombo.superclass.constructor.call(this, config);
    }
});

Ext.reg('technicalmanagercombo', Lab.TechnicalManagerCombo);
