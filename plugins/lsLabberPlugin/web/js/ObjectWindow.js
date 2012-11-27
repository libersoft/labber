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
 * Vuole:
 * 
       doctrineClass: '...',
       record: record, //opzionale, serve solo per la edit
       activeTab: n, //opzionale
       tabItems: [...]
 *
 * Lancia:
 *
       close //salvando in 'result' l'id nel caso di una create
 */
Lab.ObjectWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {

        config = Ext.apply({
            modal: true,
            width: 640,
            height: 480,
            minWidth: 300,
            minHeight: 200,
            layout: 'fit',
            maximizable: true,
            plain: true,
            buttonAlign: 'center',
            items: new Ext.TabPanel({
                // se non specificato diversamente, apre il primo tab
                activeTab: (config.activeTab) ? config.activeTab : 0,
                border: false,
                enableTabScroll: true,
                items: config.tabItems,
                ref: 'tabpanel'
            }),
            buttons: [{
                text: 'OK',
                iconCls: 'icon-small-ok',
                scope: this,
                handler: function (b, e) {
                    // XXX: il form dev'essere necessariamente il primo tab
                    var form = this.items.itemAt(0).getItem(0).getForm();
                    
                    if (form.isValid()) {
                        var values = form.getFieldValues(),

                        mask = new Ext.LoadMask(this.getEl(), {
                            msg: "Salvataggio dati...",
                            removeMask: true
                        });
                        mask.show();

                        if (this.record) {
                            // è una edit, salvo e chiamo subito (asincrona) la close
                            Lab.db.update({
                                doctrineClass: this.doctrineClass,
                                data: values
                            }, function (result) {
                                this.result = result;
                                mask.hide();
                                this.close();
                            }, this);
                        } else {
                            // è una new, salvo e aspetto il risultato (l'id) per la close
                            Lab.db.create({
                                doctrineClass: this.doctrineClass,
                                data: values
                            }, function (result) {
                                if (this.store !== undefined) {
                                    values['id'] = result.data.id;
                                    this.newRecord = new this.store.recordType(values, result.data.id);
                                } else {
                                    this.result = result;
                                }
                                mask.hide();
                                this.close();
                            }, this);
                        }
                    } else {
                        Ext.Msg.alert('Impossibile salvare', 'Alcuni campi non sono coerenti')
                    }
                }
            }]
        }, config);

        Lab.ObjectWindow.superclass.constructor.call(this, config);

        if (this.record) {
            this.items.itemAt(0).getItem(0).getForm().loadRecord(this.record);
        }
    }
});

//Ext.reg('%nome_xtype%', Lab.%nome%);
