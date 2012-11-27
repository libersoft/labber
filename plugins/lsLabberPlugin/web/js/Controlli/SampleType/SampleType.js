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
 *  Form dettaglio ordine:
 *  Permette l'accesso ai dati di un vecchio ordine
 *  o permette di crearne uno nuovo.
 */

Lab.SampleType = Ext.extend(Ext.FormPanel, {

    constructor: function (config) {

        var that = this,
        
        center = {
            border: false,
            xtype: 'panel',   
            region: 'center',
            layout: 'form',
            conCls: 'icon-sampleType',
            height: 50,
            defaults: {
                anchor: '0',
                width:500
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
                xtype: 'textfield',
                fieldLabel: 'Descrizione', 
                name: 'description'
            }, 
            {
                xtype: 'textfield', 
                fieldLabel: 'Note',
                name: 'notes'
            }]
        };

        config = Ext.apply({
            border: false,
            title: 'Dettagli Prodotto',
            iconCls: 'icon-small-clipboard-text',
            layout: 'fit',
            items: [center]
        }, config);

        Lab.SampleType.superclass.constructor.call(this, config);
          
        this.loadData = function (record) {
            that.record = record;
            that.getForm().loadRecord(record);
        };

    }
});

Ext.reg('sampleType', Lab.SampleType);

Lab.MatrixSampleType = Ext.extend(Ext.FormPanel, {

    constructor: function (config) {

        var that = this,

                 
        matrixTree = new Lab.MatrixTreeSampleType({recordId: config.recordId}),

        
        config = Ext.apply({
            border: false,
            title: 'Matrici',  
            iconCls: 'icon-matrix',
            layout: 'fit',
            items: [matrixTree]
        }, config);

        Lab.SampleType.superclass.constructor.call(this, config);
          
        this.loadData = function (record) {
            that.record = record;
            that.getForm().loadRecord(record);
        };

    }
});
