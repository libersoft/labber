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
 * Validatori aggiuntivi che ci creiamo
 *
 */
Ext.apply(Ext.form.VTypes, {
    valoreDeterminazione: function (val, field) {
        return true;
    },
    
    valoreDeterminazioneText: 'Errore input',

    valoreDeterminazioneMask: /[\d\.]/

});