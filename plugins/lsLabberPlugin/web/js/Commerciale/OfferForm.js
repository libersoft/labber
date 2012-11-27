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
 *
 */
Lab.OfferForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {
        var self = this,

        descrizione = new Ext.form.TextArea({
            fieldLabel: 'Descrizione',
            name: 'name'
        }),
        contact = new Lab.CustomerCombo({
            fieldLabel:         'Cliente',
            hiddenName:         'contact_id'
        }),
        offerstate = new Lab.OfferStateCombo({
            value: 0
        }),
        data_emissione = new Ext.form.DateField({
            fieldLabel:         'Data di emissione',
            name:               'emission_date',
            value: new Date()
        }),
        data_validita = new Ext.form.DateField({
            fieldLabel:         'Validità dell\'offerta',
            name:               'validity_date',
            value: (function(){
                var date = new Date();
                date.setDate(date.getDate() + 60);
                return date;
            })()
        }),
        data_conferma = new Ext.form.DateField({
            fieldLabel:         'Data di conferma',
            name:               'confirm_date'
        }),
        data_scadenza = new Ext.form.DateField({
            fieldLabel:         'Data di scadenza',
            name:               'expire_date'
        }),
        referente_commerciale = new Ext.form.ComboBox({
            fieldLabel:         'Referente commerciale',
            hiddenName:         'sales_manager_id',
            forceSelection:     true,
            triggerAction:      'all',
            displayField:       'fullname',
            valueField:         'id',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'User',
                    tableMethod:    'retrieveSalesManagersList',
                    searchFields:   ['name', 'surname']
                 },
                fields: ['id', 'name', 'surname',
                {
                    name:       'fullname',
                    mapping:    'surname + \' \' + obj.name'
                }]
            })
        }),
        segreteria_commerciale = new Ext.form.ComboBox({
            fieldLabel:         'Segreteria commerciale',
            hiddenName:         'sales_secretary_id',
            forceSelection:     true,
            triggerAction:      'all',
            displayField:       'fullname',
            valueField:         'id',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'User',
                    tableMethod:    'retrieveSalesSecretaryList',
                    searchFields:   ['name', 'surname']
                 },
                fields: ['id', 'name', 'surname',
                {
                    name:       'fullname',
                    mapping:    'surname + \' \' + obj.name'
                }]
            })
        }),
        referente_tecnico = new Lab.TechnicalManagerCombo({
            fieldLabel:         'Referente tecnico'
        }),
        modalita_fatturazione = new Lab.BillingModalityCombo({
            fieldLabel:         'Modalità di fatturazione'
        }),
        modalita_pagamento = new Lab.PaymentModalityCombo({
            fieldLabel:         'Modalità di pagamento'
        }),
        riferimento_cliente = new Ext.form.TextField({
            fieldLabel:         'Riferimento del cliente',
            name:               'contact_reference'
        }),        
        condizioni_aggiuntive = new Ext.form.TextArea({
            fieldLabel:         'Condizioni aggiuntive',
            name:               'additional_condition'
        }),
        note = new Ext.form.TextArea({
            fieldLabel:         'Note',
            name:               'note'
        }),
        fieldsetGenerale = {
            xtype: 'columnfieldset',
            title: 'Generale',
            collapsible: false,
            left: [contact, offerstate],
            right: [descrizione]
        },
        fieldsetDate = {
            xtype: 'columnfieldset',
            title: 'Date',
            collapsible: false,
            left: [data_emissione, data_validita],
            right: [data_conferma, data_scadenza]
        },
        fieldsetReferenti = {
            xtype: 'columnfieldset',
            title: 'Dettagli Offerta',
            collapsible: false,
            left: [referente_commerciale, segreteria_commerciale, referente_tecnico],
            right: [modalita_fatturazione, modalita_pagamento, riferimento_cliente]
        },
        fieldsetNote = {
            xtype: 'columnfieldset',
            title: 'Note',
            collapsed: true,
            collapsible: true,
            left: [condizioni_aggiuntive],
            right: [note]
        };

        config = Ext.apply({
            title: 'Dati offerta',
            iconCls: 'icon-small-clipboard-text',
            labelWidth: 150,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype:              'hidden',
                name:               'id'
            },
            fieldsetGenerale,
            fieldsetDate,
            fieldsetReferenti,
            fieldsetNote,
            {
                xtype:      'label',
                fieldLabel: 'Nota del cliente',
                hidden: !config,
                text:      function(){                    
                    if(config){
                        return config.record.data.contactnote;
                    }
                    else {
                        return '';
                    }
                }()
            }],
            padding: 10
        }, config);

        Lab.OfferForm.superclass.constructor.call(this, config);
        contact.focus(true, 1000);
    }
});

Ext.reg('offerform', Lab.OfferForm);
