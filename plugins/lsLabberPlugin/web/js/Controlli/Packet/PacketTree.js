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
 * Albero dei pacchetti figli di un determinato pacchetto
 */
Lab.PacketTree = Ext.extend(Ext.tree.TreePanel, {

    constructor: function (config) {

        var self = this;

        config = Ext.apply({
            animate: true,
            autoScroll: true,
            border: false,
            iconCls: 'icon-packet',
            loader: {
                directFn: Lab.packet.getChildren
            },
            root: {
                nodeType: 'async',
                expanded: true,
                id: config.record.id,
                text: config.record.data.name
            },
            rootVisible: false,
            tbar: [{
                text: 'Inserisci',
                iconCls: 'icon-small-node-insert',
                tooltip: 'Scegli un altro pacchetto da includere in questo',
                handler: function (b) {
                    var win = new Ext.Window({
                        width: 512,
                        height: 160,
                        bodyStyle: 'background-color:#fff;padding: 10px',
                        iconCls: b.iconCls,
                        layout: 'fit',
                        modal: true,
                        resizable: false,
                        items: {
                            xtype: 'form',
                            border: false,
                            buttons: [{
                                text: 'Inserisci pacchetto',
                                handler: function () {
                                    var values = this.ownerCt.ownerCt.ownerCt.items.itemAt(0).form.getFieldValues();
                                    if (values.packet_id) {
                                        if (values.packet_id != config.record.id) {
                                            Ext.apply(values, {parent_packet_id: config.record.id});
                                            Lab.db.create({
                                                doctrineClass: 'PacketPacket',
                                                data: values
                                            }, function () {
                                                Lab.flash.msg('', 'Pacchetto inserito con successo');
                                                self.reloadTree();
                                            });
                                        } else {
                                            Lab.flash.msg('Errore', 'Non includere il pacchetto in se stesso.');
                                        }
                                    }
                                }
                            }],
                            items: [{
                                xtype: 'packetcombo',
                                anchor: '-20'
                            }]
                        }
                    });
                    win.show();
                }
            },
            {
                text: 'Rimuovi',
                iconCls: 'icon-small-node-delete',
                tooltip: 'Rimuovi l\'inclusione da questo pacchetto',
                handler: function () {
                    var selected = this.getSelectionModel().getSelectedNode();
                    if (selected) {
                        Ext.Msg.confirm('Attenzione', 'Rimuovere l\'inclusione da questo pacchetto?', function (b) {
                            if (b === 'yes') {
                                Lab.db.destroy({
                                    doctrineClass: 'PacketPacket',
                                    data: [config.record.id, selected.id]
                                });
                                this.reloadTree();
                            }
                        }, this);
                    }
                },
                scope: this
            }],
            title: 'Pacchetti inclusi',
            useArrows: true
        }, config);

        Lab.PacketTree.superclass.constructor.call(this, config);
    },

    reloadTree: function () {
        this.getLoader().load(this.root);
        this.root.expand();
    }
});

Ext.reg('packettree', Lab.PacketTree);