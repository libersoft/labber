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
 * Funzioni generali.
 */
Lab.utils = {

    /**
     * Mostra la finestra dei parametri di configurazione.
     */
    configurationWindow: function (b, e) {
        var phoneChars = Ext.escapeRe('+0123456789'),
        
        numberRe = new RegExp('[' + phoneChars + ']'),
       
        form = new Ext.FormPanel({
            border: false,
            labelWidth: 165,
            padding: 10,
            defaultType: 'fieldset',
            items: [{
                title: 'Anagrafica',
                defaults: {
                    anchor: '-20'
                },
                defaultType: 'textfield',
                items: [{
                    fieldLabel:     'Nome azienda',
                    name:           'company_name'
                },
                {
                    fieldLabel:     'Descrizione azienda',
                    name:           'company_description'
                },
                {
                    fieldLabel:     'Indirizzo',
                    name:           'address'
                },
                {
                    fieldLabel:     'Tel',
                    maskRe:         numberRe,
                    name:           'telephone_number'
                },
                {
                    fieldLabel:     'Fax',
                    maskRe:         numberRe,
                    name:           'fax_number'
                },
                {
                    fieldLabel:     'Email',
                    name:           'mail'
                },
                {
                    fieldLabel:     'PEC',
                    name:           'pec'
                },
                {
                    fieldLabel:     'Sito web',
                    name:           'website'
                }]
            },
            {
                title: 'Opzioni',
                defaults: {
                    anchor: '-20'
                },
                items: [{
                    xtype:          'checkbox',
                    fieldLabel:     'Storici',
                    name:           'histories'
                },
                {
                    xtype:          'numberfield',
                    fieldLabel:     'Coefficiente prezzo/costo',
                    name:           'price_multiplier',
                    allowNegative:  false,
                    autoWidth:      true
                }]
            }]
        }),

        confSave = function (b) {
            var values = form.getForm().getFieldValues(true);   // dirtyOnly

            // TODO: generalizzare
            Lab.CONFIG.histories = values.histories;

            Lab.configurations.save({
                values: values
            }, function (r) {
                Lab.flash.msg(r.success ? 'Successo' : 'Errore', r.message);
            });

            win.close();
        },

        win = new Ext.Window({
            title: "Preferenze dell'applicazione",
            buttonAlign: 'center',
            iconCls: 'icon-configurations',
            layout: 'fit',
            modal: true,
            width: 640,
            height: 480,
            items: form,
            buttons: [{
                text: 'Salva',
                handler: confSave
            }]
        });

        Lab.db.list({
            doctrineClass: 'Configurations'
        }, function (r) {
            var values = {};
            Ext.each(r.data, function (v) {
                values[v.name] = Ext.util.JSON.decode(v.value);
            });
            form.getForm().setValues(values);

            win.show(e.getTarget());
        });

    },

    /**
     * Mostra la finestra dello storico
     */
    historyWindow: function (grid, rowIndex, colIndex, item) {
        var record = grid.store.getAt(rowIndex),
        storico = record.get('storico') || record.get('history');

        if (storico) {
            var listView = new Ext.list.ListView({
                store: new Ext.data.JsonStore({
                    data:   Ext.util.JSON.decode(storico),
                    fields: ['user', 'action', 'value', {
                        name:   'timestamp',
                        convert: function (v) {
                            var dt = new Date();
                            dt = Date.parseDate(v, 'U');
                            return dt.format('d/m/Y H:i:s');
                        }
                    }]
                }),
                columns: [{
                    header:     'Utente',
                    dataIndex:  'user'
                },{
                    header:     'Azione',
                    dataIndex:  'action'
                },{
                    header:     'Valore',
                    dataIndex:  'value',
                    align:      'right',
                    width:      .25
                },{
                    header:     'Quando',
                    dataIndex:  'timestamp',
                    align:      'right'
                }]
            });

            var win = new Ext.Window({
                layout: 'fit',
                modal:  true,
                width:  640,
                height: 480,
                items: new Ext.Panel({
                    border: false,
                    items:  listView
                })
            });
            win.show();
        } else {
            Lab.flash.msg('Errore', 'Storico non presente per questo controllo.')
        }
    },

    /**
     * implode()-like di un oggetto JSON
     */
    implode: function (json) {
        var object = Ext.util.JSON.decode(json),
                 i = 0,
            string = '';

        Ext.iterate(object, function (k, v) {
            if (i != 0) {
                string += ', ';
            }
            string += k + ': ' + v;
            i++;
        });

        return string;
    },

    htmlentities : function(stringa){
        stringa = stringa.replace(/"/g,'&#34;');
        stringa = stringa.replace(/'/g,'&#39;');
        return stringa;
    }
};

Lab.flash = function(){
    var msgCt;

    function createBox(t, s){
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.slideIn('t').pause(1).ghost("t", {remove:true});
        },

        init : function(){
            /*
            var t = Ext.get('exttheme');
            if(!t){ // run locally?
                return;
            }
            var theme = Cookies.get('exttheme') || 'aero';
            if(theme){
                t.dom.value = theme;
                Ext.getBody().addClass('x-'+theme);
            }
            t.on('change', function(){
                Cookies.set('exttheme', t.getValue());
                setTimeout(function(){
                    window.location.reload();
                }, 250);
            });*/

            var lb = Ext.get('lib-bar');
            if(lb){
                lb.show();
            }
        }
    };
}();
