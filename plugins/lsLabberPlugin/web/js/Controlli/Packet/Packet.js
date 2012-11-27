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
 *  Form dettaglio pacchetto
 *
 */
Lab.Packet = Ext.extend(Ext.FormPanel, {

    constructor: function (config) {

        var that = this;

        config = Ext.apply({
            title:      'Dettagli Pacchetto',
            border:     false,
            iconCls:    'icon-small-clipboard-text',
            labelWidth: 150,
            padding:    5,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Nome',
                name: 'name'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Pacchetto semplice',
                name: 'is_proto'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Titolo sul report',
                name: 'report_title'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Riferimento Legislativo',
                name: 'law_reference'
            },
            {
                xtype: 'numberfield',
                fieldLabel: 'Costo',
                name: 'price',
                allowNegative: false
            },
            {
                xtype: 'limitsgroupcombo'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Note',
                name: 'note'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Da confermare',
                name: 'unconfirmed',
                checked: true
            }]
        }, config);

        Lab.Packet.superclass.constructor.call(this, config);
    }
});
