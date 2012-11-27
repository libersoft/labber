/*jslint
 onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
 bitwise: true, regexp: true, strict: true, newcap: true, immed: true
 
 */

/*global
 Ext: true,
 Lab: true,
 console: true,
 window: true
 */

"use strict";

Ext.Direct.on('exception', function (e) {
    if (e.message || e.where) {
        Ext.Msg.show({
            title: 'Errore',
            msg: 'Il server riporta il seguente errore: <br/>' + '"<i><b>' + e.message + '</b></i>"',
            iconCls: 'icon-small-bomb',
            buttons: {
                cancel: 'Debug...',
                ok: 'Ok'
            },
            icon: Ext.Msg.ERROR,
            fn: function (b) {
                if (b === 'cancel') {
                    var text = (function () {
                        var text = '<div ' +
                        'style="text-align:center;' +
                        'width:100%;' +
                        'border:1px solid red;' +
                        'background-color:#FFE2E7;' +
                        'padding-top:10px;' +
                        'padding-bottom:10px;' +
                        'font-weight:bold;' +
                        '">' +
                        e.message +
                        '</div>' +
                        '<br/>' +
                        'action:' + e.action +
                        '<br/>' +
                        'method:  <b>' + e.method + '</b>' +
                        '<br/>' +
                        '<br/>' +
                        '<hr/>',
                        i,
                        trace = e.where;
                        for (i = 0; i < trace.length; i += 1) {
                            text += 'call: ' + Number(trace.length - i);
                            text += '<br/>';
                            text += 'file: <b>' + trace[i].file + '</b>';
                            text += '<br/>';
                            text += 'line: ' + trace[i].line;
                            text += '<br/>';
                            text += 'function: ' + trace[i]['function'];
                            text += '<br/>';
                            text += 'class: ' + trace[i]['class'];
                            text += '<br/>';
                            text += 'tipe: ' + trace[i].tipe;
                            text += '<br/>';
                            text += 'args: ' + trace[i].args.toSource();
                            text += '<br/><br/><hr/>';
                        }
                        return text;
                    }()),
                    win = new Ext.Window({
                        title: 'Debugging tools',
                        html: text,
                        maximizable: true,
                        modal: true,
                        height: 500,
                        width: 600,
                        layout: 'fit',
                        autoDestroy: true,
                        items: {
                            xtype: 'tabpanel',
                            border: false,
                            items: [{
                                xtype: 'panel',
                                html: text,
                                border: false,
                                title: 'Stack trace',
                                autoScroll: true,
                                bodyStyle: 'background-color: #ffffff; padding: 5px'
                            }
                            ],
                            activeTab: 0
                        },
                        iconCls: 'icon-small-script',
                        buttons: [{
                            text: 'close',
                            handler: function () {
                                win.close();
                            },
                            iconCls: 'icon-small-cross'
                        }

                        ]
                    });
                    win.show();
                }
            }
        });
    } else {
        Ext.Msg.show({
            title: 'Sessione scaduta',
            msg: 'Premere "OK" per effettuare nuovamente il login',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING,
            fn: function () {
                window.location.reload();
            }
        });
    }
});

Ext.Direct.on('event', function (e, p) {
    if (e.result) {
        // se nel risultato c'e' una proprieta' debug la stampo in console
        if (e.result.debug) {
            console.debug(e.result.debug);
        }

        // se la risposta è not successful mostro un messaggio di errore
        if (e.result.success == false) {
            Ext.Msg.show({
                title: 'Errore',
                msg: 'Il server riporta il seguente errore: <br/>' + '"<i><b>' + e.result.message + '</b></i>"',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        }
    }
});
