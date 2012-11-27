"use strict";
/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true
    
*/

/*global
    Ext: true,
    Lab: true
*/


Ext.ns('Lab');

/**
 *
 */
Lab.ContactAddressForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this;

        config = Ext.apply({
            title: 'Dettagli indirizzo',
            iconCls: 'icon-small-clipboard-text',
            defaults: {
                anchor: '-20'
            },
            items: [
            {
                xtype:              'hidden',
                name:               'id'
            },
            {
                xtype:              'hidden',
                name:               'parent_id',
                value:              config.parentId
            },
            {
                xtype:              'textfield',
                name:               'contact_id',
                fieldLabel:         'ID indirizzo'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Nome',
                name:               'name'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Alias',
                name:               'alias'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Indirizzo',
                name:               'address'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Citt&agrave;',
                name:               'city'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Provincia',
                name:               'province'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'CAP',
                name:               'cap'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Telefono',
                name:               'telephone'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Cellulare',
                name:               'cellphone'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'FAX',
                name:               'fax'
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Email',
                name:               'email'
            },
            {
                xtype:              'checkbox',
                fieldLabel:         'RdP',
                name:               'is_rdp'
            },
            {
                xtype:              'checkbox',
                fieldLabel:         'Fattura',
                name:               'is_invoice'
            }
            ],
            padding: 10
        }, config);

        Lab.ContactAddressForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('contactaddressform', Lab.ContactAddressForm);
