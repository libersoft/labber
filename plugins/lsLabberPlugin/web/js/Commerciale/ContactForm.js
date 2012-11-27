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

Lab.ContactForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            title: 'Sede legale',
            iconCls: 'icon-small-clipboard-text',
            defaults: {
                anchor: '-20',
                readOnly: config.is_locked,
                cls: config.is_locked ? 'contact-grid-lock' : '',
                xtype: 'textfield'
            },
            items: [{
                xtype:              'hidden',
                name:               'id'
            },
            {
                fieldLabel:         'Ragione Sociale',
                name:               'name'
            },
            {
                fieldLabel:         'Alias',
                name:               'alias'
            },
            {
                fieldLabel:         'Indirizzo',
                name:               'address'
            },
            {
                fieldLabel:         'Citt&agrave;/Comune',
                name:               'city'
            },
            {
                fieldLabel:         'Provincia',
                name:               'province',
                maxLength:          2
            },
            {
                fieldLabel:         'CAP',
                name:               'cap'
            },
            {
                fieldLabel:         'P.IVA',
                name:               'piva'
            },
            {
                fieldLabel:         'CF',
                name:               'taxid'
            },
            {
                fieldLabel:         'Telefono',
                name:               'telephone'
            },
            {
                fieldLabel:         'FAX',
                name:               'fax'
            },
            {
                fieldLabel:         'Email',
                name:               'email'
            },
            {
                xtype:              'textarea',
                fieldLabel:         'Note Ordine',
                name:               'note_order'
            },
            {
                xtype:              'textarea',
                fieldLabel:         'Note Offerta',
                name:               'note_offer'
            }
        ],
            padding: 10
        }, config);

        Lab.ContactForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('contactform', Lab.ContactForm);
