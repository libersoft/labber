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
 * Uno store da usare con il modulo db
 *
 * Utilizzo:
 *
   var sfStore = new Lab.sfDirectStore({
       baseParams: {
           doctrineClass: ...
       },
       fields: ['id', 'name', 'description', 'etcetc'],
       pageSize: 20
   });
 *
 */
Lab.sfDirectStore = Ext.extend(Ext.data.DirectStore, {

    constructor: function (config) {

        config = Ext.apply({
            api: {
                create: Lab.db.create,
                read: Lab.db.list,
                update: Lab.db.update,
                destroy: Lab.db.destroy
            },
            autoLoad: {params:{start: 0, limit: config.pageSize}},
            autoSave: true,
            fields: [{
                name: 'id',
                type: 'integer'
            }],
            idProperty: 'id',
            remoteSort: true,
            root: 'data',
            totalProperty: 'total',
            writer: new Ext.data.JsonWriter({
                encode: false
            })
        }, config);

        Lab.sfDirectStore.superclass.constructor.call(this, config);
    }
});
