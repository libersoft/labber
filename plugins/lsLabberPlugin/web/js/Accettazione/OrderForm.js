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
 * Form di un ordine.
 */
Lab.OrderForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this,

        to_send = new Ext.form.Checkbox({
            fieldLabel: 'Inviare rdp?',
            name:       'to_send'
        }),

        customerCombo = new Lab.CustomerCombo({
            fieldLabel: 'Cliente',
            hiddenName: 'contact_id',
            allowBlank: false
        }),

        offerCombo = new Ext.form.ComboBox({
            fieldLabel:     'Offerta',
            hiddenName:     'offer_id',
            triggerAction:  'all',
            displayField:   'name',
            valueField:     'id',
            store: new Lab.sfDirectStore({
                autoLoad:   false,
                baseParams: {
                    doctrineClass:  'Offer',
                    searchFields:   ['name', 'number'],
                    tableMethod:    'retrieveActiveOffersList'
                },
                fields:     ['id', {
                    name: 'name',
                    convert: function (v, r) {
                        // mostra il codice dell'offerta seguito dal nome
                        return r.number + ' - ' + r.name;
                    }
                }]
            })
        }),

        billingCustomerCombo = new Lab.CustomerCombo({
            fieldLabel: 'Invio Fattura',
            hiddenName: 'billing_contact_id',
            doctrineClass: 'ContactAddress',
            doctrineWheres:
            [
            {
                field: 'parent_id',
                operator: '=',
                value: customerCombo.getValue()
            },
            {
                field: 'is_invoice',
                operator: '=',
                value: 'true'
            }
            ]
        }),
        
        billingFieldset = new Ext.form.FieldSet({
            title:          'Fatturazione',
            collapsed:      true,
            collapsible:    true,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype:          'combo',
                fieldLabel:     'Opzioni',
                hiddenName:     'billing_options',
                forceSelection: true,
                triggerAction:  'all',
                displayField:   'option',
                valueField:     'option',
                store: new Ext.data.DirectStore({
                    autoDestroy: true,
                    baseParams: {
                        table:  'Order',
                        field:  'billing_options'
                    },
                    directFn: Lab.db.getEnumValues,
                    reader: new Ext.data.ArrayReader({
                        fields:     ['option'],
                        idIndex:    0
                    })
                })
            },
            billingCustomerCombo,
            {
                xtype:              'numberfield',
                fieldLabel:         'Prezzo (iva esclusa)',
                name:               'price',
                allowNegative:      false,
                decimalSeparator:   ','
            },
            {
                xtype:      'textarea',
                fieldLabel: 'Nota fattura',
                name:       'nota_fatturazione'
            }]
        });

        config = Ext.apply({
            title: 'Dati ordine',
            iconCls: 'icon-small-clipboard-text',
            labelWidth: 150,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype:  'hidden',
                name:   'user_id',
                value:  Lab.CONFIG.user.id
            },
            {
                xtype:      'displayfield',
                fieldLabel: 'Numero',
                name:       'numero'
            },
            {
                xtype: 'xdatetime',
                fieldLabel: 'Data arrivo',
                name: 'arrived_at',
                allowBlank: false,
                dateFormat: 'd/m/y',
                timeFormat: 'H:i',
                value: (function(){
                    if (config){
                        if(config.record.data.arrived_at != null){
                            return config.record.data.arrived_at;
                        }
                    }
                    return new Date();
                })()
            },
            customerCombo,
            offerCombo,
            {
                xtype:      'label',
                fieldLabel: 'Rif. Offerta',
                hidden: !config,
                html:      function(){
                    if(config){
                        if(config.record.data.offername){
                            var name = 'Offerta_'+config.record.data.offername+'_rev_0.odt';
                            name = name.replace(new RegExp(/\//g), "_");
                            return '<a target="_blank" href="data/offer/'+name+'">'+name+'</a>';
                        }
                        else {
                            return 'Nessun offerta associata';
                        }
                    }
                }()

            },
            {
                xtype:      'technicalmanagercombo',
                fieldLabel: 'Referente tecnico',
                allowBlank: false,
                ref:        'technicalManagerCombo'
            },
            {
                xtype:      'textarea',
                fieldLabel: 'Nota ordine',
                name:       'note'
            },
            to_send,
            billingFieldset,
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

        Lab.OrderForm.superclass.constructor.call(this, config);

        customerCombo.on('select', function (combo, record) {
            // filtra le offerte per il cliente selezionato
            offerCombo.store.setBaseParam('doctrineWheres', [{
                field:      'contact_id',
                operator:   '=',
                value:      record.id
            }]);
            offerCombo.store.load();
            offerCombo.focus();            
        });

        if (this.record) {
            offerCombo.store.setBaseParam('doctrineWheres', [{
                field:      'contact_id',
                operator:   '=',
                value:      this.record.data.contact_id
            }]);
        }

        offerCombo.on('select', function (combo, record) {
            this.getStore().load({
                callback: function () {
                    this.setValue(record.json.technical_manager_id);
                },
                scope: this
            });
        }, this.technicalManagerCombo);
    }
});

Ext.reg('orderform', Lab.OrderForm);
