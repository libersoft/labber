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
 * Colonne con renderer custom
 */
Lab.DefconColumn = Ext.extend(Ext.grid.Column, {

    data: {
        4:  'Normale',
        3:  'Urgente',
        2:  'Urgentissimo',
        1:  'DEFCON 1'
    },

    constructor: function (cfg) {
        Lab.DefconColumn.superclass.constructor.call(this, cfg);
        var d = this.data;
        this.renderer = function (v) {
            return d[v];
        }
    }
});

Lab.SampleStatusColumn = Ext.extend(Ext.grid.Column, {

    data: ['In esecuzione', 'Completato', 'Stampato', 'Validato'],
    constructor: function (cfg) {
        Lab.SampleStatusColumn.superclass.constructor.call(this, cfg);
        var d = this.data;
        this.renderer = function (v) {
            return d[v];
        }
    }
});
Lab.OfferStatusColumn = Ext.extend(Ext.grid.Column, {

    data: ['Bozza','Emessa', 'Revisionata', 'Scaduta', 'Rifiutata', 'Confermata'],
    constructor: function (cfg) {
        Lab.OfferStatusColumn.superclass.constructor.call(this, cfg);
        var d = this.data;
        this.renderer = function (v) {
            return d[v];
        }
    }
});

Lab.ContactStatusColumn = Ext.extend(Ext.grid.Column, {
    //type0           =>'Contatto non qualificato',
    //type1           =>'Contatto chiuso',
    //type2           =>'Contatto qualificato',
    //type3           =>'Cliente attivo',
    //type4           =>'Partner',
    //type5           =>'Concorrente',
    //type6           =>'Cliente perso',
    //type7           =>'Cliente potenziale',
    //type8           =>'Contatto personale',
    //type9           =>'Cliente storico',
    //type10          =>'Cliente occasionale',

    data: [
    'Contatto non qualificato', 'Contatto chiuso', 'Contatto qualificato', 'Cliente attivo',
    'Partner', 'Concorrente', 'Cliente perso', 'Cliente potenziale', 'Contatto personale',
    'Cliente storico', 'Cliente occasionale'
    ],
    constructor: function (cfg) {
        Lab.ContactStatusColumn.superclass.constructor.call(this, cfg);
        var d = this.data;
        this.renderer = function (v) {
            return d[v];
        }
    }
});

Ext.grid.Column.types.defconcolumn = Lab.DefconColumn;
Ext.grid.Column.types.samplestatuscolumn = Lab.SampleStatusColumn;
Ext.grid.Column.types.contactstatuscolumn = Lab.ContactStatusColumn;
Ext.grid.Column.types.offerstatuscolumn = Lab.OfferStatusColumn;