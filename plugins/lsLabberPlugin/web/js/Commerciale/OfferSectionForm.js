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
 * Form per un'offerta di sezione.
 */
Lab.OfferSectionForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            title: 'Dati sezione',
            iconCls: 'icon-small-clipboard-text',
            labelWidth: 150,
            defaults: {
                anchor:             '-20'
            },
            items: [{
                xtype:              'hidden',
                name:               'id'
            },
            {
                xtype:              'hidden',
                name:               'offer_id',
                value:              config.offerId
            },
            {
                xtype:              'textfield',
                fieldLabel:         'Descrizione',
                name:               'title',
                ref:                'descriptionField',
                maxLength:          255
            },
            {
                xtype:              'combo',
                emptyText:          'Matrice',
                fieldLabel:         'Matrice',
                name:               'matrix_id',
                displayField:       'name',
                valueField:         'id',
                triggerAction:      'all',
                ref:                'matrixcombo',
                listeners: {
                    select: function (field, record) {
                        // filtra la combobox delle sottomatrici
                        var matrix = field.ownerCt.submatrixcombo;

                        matrix.lastQuery = null;
                        matrix.clearValue();

                        matrix.store.setBaseParam('groupMatrixId', record.data.id);
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
            },            
            {
                xtype:              'submatrixcombo',
                emptyText:          'Sottomatrice',
                name:               'submatrix_id',
                fieldLabel:         'Sottomatrice',
                ref:                'submatrixcombo'
            },
            {
                xtype:              'limitsgroupcombo',
                emptyText:          'Tabella limiti'
            },
            {
                xtype:              'checkbox',
                fieldLabel:         'Sezione semplice',
                name:               'is_proto'
            }],
            padding: 10
        }, config);

        Lab.OfferSectionForm.superclass.constructor.call(this, config);

        this.descriptionField.focus(true, 1000);
    }
});

Ext.reg('offersectionform', Lab.OfferSectionForm);
