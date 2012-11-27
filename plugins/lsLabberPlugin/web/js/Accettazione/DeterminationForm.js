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
 * Form di modifica di un controllo.
 */
Lab.DeterminationForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            border:     false,
            padding:    5,
            labelWidth: 120,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype:          'hidden',
                name:           'id'
            },
            {
                xtype:          'combo',
                fieldLabel:     'Unità di misura',
                hiddenName:     'um_id',
                triggerAction:  'all',
                editable:       false,
                displayField:   'scala_unita',
                valueField:     'unit_of_measurement_id',
                store:  new Lab.sfDirectStore({
                    autoDestroy:    true,
                    baseParams: {
                        doctrineClass:      'MethodUnitOfMeasurement',
                        tableMethod:        'retrieveAssociatedWithMethod',
                        tableMethodParam:   config.methodID
                    },
                    fields: ['prefix_id', 'unit_of_measurement_id',
                    {
                        name: 'scala_unita',
                        convert: function (v, record) {
                            var prefix = (record.Prefix) ? record.Prefix.prefix : '';
                            var symbol = (record.UnitOfMeasurement) ? record.UnitOfMeasurement.symbol : '';
                            return prefix + symbol;
                        }
                    }]
                }),
                listeners: {
                    scope:  this,
                    select: function (combo, record, index) {
                        var scaleHiddenField = this.getComponent('scaleHiddenField');
                        scaleHiddenField.setValue(record.get('prefix_id'));
                    }
                }
            },
            {
                xtype:          'numberfield',
                fieldLabel:     'Cifre Decimali',
                name:           'cifre_decimali'
            },
            {
                xtype:          'numberfield',
                fieldLabel:     'Cifre Significative',
                name:           'cifre_significative'
            },
            {
                xtype:          'textfield',
                fieldLabel:     'Incertezza',
                name:           'incertezza'
            },
            {
                xtype:          'textfield',
                fieldLabel:     'Recupero',
                name:           'recupero'
            },
            {
                xtype:          'textarea',
                fieldLabel:     'Limiti',
                name:           'limiti'
            },
            {
                xtype:          'textfield',
                fieldLabel:     'Alias denominazione',
                name:           'denomination_alias'
            },
            {
                xtype:          'datefield',
                fieldLabel:     'Data scadenza',
                name:           'data_scadenza',
                format:         'Y-m-d'
            },
            {
                xtype:          'combo',
                fieldLabel:     'Priorità',
                hiddenName:     'priorita',
                triggerAction:  'all',
                editable:       false,
                mode:           'local',
                store:          [[4, 'Normale'], [3, 'Urgente'], [2, 'Urgentissimo']]
            },
            {
                xtype:          'textarea',
                fieldLabel:     'Nota report',
                name:           'nota_report'
            },
            {
                xtype:          'numberfield',
                fieldLabel:     'Costo',
                name:           'price',
                allowNegative:  false,
                disabled:       config.inSample
            },
            {
                xtype:          'numberfield',
                fieldLabel:     'Numero riga report',
                name:           'numriga_report'
            },
            {
                xtype:          'hidden',
                itemId:         'scaleHiddenField',
                name:           'scale_id'
            }]
        }, config);

        Lab.DeterminationForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('determinationform', Lab.DeterminationForm);
