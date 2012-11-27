"use strict";
/*jslint
 onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
 bitwise: true, regexp: true, strict: true, newcap: true, immed: true
 */

/*global
 Ext: true,
 Lab: true,
 location: true
 */

Ext.ns('Lab');

Lab.MainPanel = Ext.extend(Ext.Panel, {
    
    constructor: function (config) {

        var self = this,

        openMyHome = function () {
            var vpp = Ext.getCmp('main-panel');
            vpp.layout.center.panel.removeAll();
            vpp.layout.center.panel.add({
                xtype: 'myhome'
            });
            vpp.layout.center.panel.doLayout();
        };

        config = Ext.apply({
            bbar: ['<img src="' +
                    Lab.CONFIG.root_dir +
                    '/images/icons/libersoft.png">LiberSoft'],
            bodyStyle: 'padding:10px',
            id: 'main-panel',
            items: [{
                xtype: 'panel',
                region: 'center',
                layout: 'fit',
                margins: '5 5 5 5',
                id: 'main-panel-center',
                items: {
                    xtype: 'myhome'
                }
            }],
            layout: 'border',
            tbar: [' ', {
                text: '<img src="' +
                    Lab.CONFIG.root_dir +
                    '/images/menu-logo.png">',
                handler: openMyHome
            },
            '-']
        }, config);

        Lab.MainPanel.superclass.constructor.call(this, config);

        var buttons = {
            'accettazione': new Ext.SplitButton({
                text: 'Accettazione',
                iconCls: 'icon-small-book',
                width: '100%',
                style: 'text-align:left;',
                handler: function () { this.showMenu(); },
                menu: {
                    defaults: {
                        handler: function (b) {
                            var vpp = Ext.getCmp('main-panel');
                            vpp.layout.center.panel.removeAll();
                            vpp.layout.center.panel.add({
                                xtype: b.itemXtype,
                                border: false,
                                iconCls: b.iconCls,
                                title: 'Accettazione: ' + b.text
                            });
                            vpp.layout.center.panel.doLayout();
                        }
                    },
                    items: [{
                        text: 'Ordini',
                        iconCls: 'icon-small-book',
                        itemXtype: 'accettazioneordersgrid',
                        layout: 'fit'
                    },
                    {
                        text: 'Campioni composita',
                        iconCls: 'icon-composite',
                        itemXtype: 'accettazionecomposite'
                    }]
                }
            }),

            'laboratorio': new Ext.SplitButton({
                text: 'Laboratorio',
                iconCls: 'icon-small-flask',
                width: '100%',
                handler: function () { this.showMenu(); },
                menu: {
                    defaults: {
                        handler: function (b) {
                            var vpp = Ext.getCmp('main-panel');
                            vpp.layout.center.panel.removeAll();
                            vpp.layout.center.panel.add({
                                xtype: b.itemXtype,
                                border: false,
                                iconCls: b.iconCls,
                                
                                title: 'Laboratorio: ' + b.text
                            });
                            vpp.layout.center.panel.doLayout();
                        }
                    },
                    items: [{
                        text: 'Campioni',
                        iconCls: 'icon-small-jar-empty',
                        itemXtype: 'laboratoriosamplesgrid',
                        layout: 'fit'
                    },
                    {
                        text: 'Controlli',
                        iconCls: 'icon-small-beaker-empty',
                        itemXtype: 'laboratorioanalysesgrid',
                        layout: 'fit'
                    },
                    {
                        text: 'Composita',
                        iconCls: 'icon-composite',
                        itemXtype: 'laboratoriocompositegrid',
                        layout: 'border'
                    }]
                }
            }),
            
            'commerciale': new Ext.SplitButton({
                text: 'Commerciale',
                iconCls: 'icon-small-commerciale',
                handler: function () { this.showMenu(); },
                menu: {
                    defaults: {
                        handler: function (b) {
                            var vpp = Ext.getCmp('main-panel');
                            vpp.layout.center.panel.removeAll();
                            vpp.layout.center.panel.add({
                                xtype: 'panel',
                                border: false,
                                layout: 'fit',
                                title: 'Commerciale: ' + b.text,
                                iconCls: b.iconCls,
                                items: [{
                                    xtype: b.itemXtype
                                }]
                            });
                            vpp.layout.center.panel.doLayout();
                        }
                    },
                    items: [{
                        text: 'Contatti',
                        iconCls: 'icon-small-clienti',
                        itemXtype: 'contactgrid'
                    },
                    {
                        text: 'Offerte',
                        iconCls: 'icon-small-offer',
                        itemXtype: 'offersgrid'
                    },
                    {
                        text: 'Storico offerte',
                        iconCls: 'icon-small-offer',
                        itemXtype: 'offersrevisiongrid'
                    },
                    {
                        text: 'Tabelle limiti',
                        iconCls: 'icon-limitsgroup',
                        itemXtype: 'limitstablegrid'
                    },
                    {
                        text: 'Fatture',
                        iconCls: 'icon-bills',
                        itemXtype: 'billsgrid'
                    }]
                }
                
            }),

            'controlli': new Ext.SplitButton({
                text: 'Controlli',
                iconCls: 'icon-magnifier-left',
                handler: function () { this.showMenu(); },
                menu: {
                    defaults: {
                        handler: function (b) {
                            var vpp = Ext.getCmp('main-panel');
                            vpp.layout.center.panel.removeAll();
                            vpp.layout.center.panel.add({
                                xtype: 'panel',
                                border: false,
                                layout: 'fit',
                                title: 'Controlli: ' + b.text,
                                iconCls: b.iconCls,
                                items: [{
                                    xtype: b.itemXtype
                                }]
                            });
                            vpp.layout.center.panel.doLayout();
                        }
                    },
                    items: [
                    {
                        text: "Metodi",
                        iconCls: 'icon-method',
                        itemXtype: 'methodgrid'
                    },
                    {
                        text: 'Costanti',
                        itemXtype: 'constantsgrid',
                        iconCls: 'icon-methodConstant'
                    },
                    {
                        text: 'Denominazioni',
                        itemXtype: 'denominationsgrid',
                        iconCls: 'icon-denomination'
                    },
                    {
                        text: 'Gruppi di denominazioni',
                        itemXtype: 'denominationsgroupsgrid',
                        iconCls: 'icon-denominationsGroup'
                    },
                    {
                        text: 'Enti',
                        itemXtype: 'organization',
                        iconCls: 'icon-organization'
                    },
                    {
                        text: 'Tabelle limiti',
                        itemXtype: 'limitsgroupsgrid',
                        iconCls: 'icon-limitsgroup'
                    },
                    {
                        text: 'Matrici',
                        iconCls: 'icon-matrix',
                        itemXtype: 'matrixtree'
                    },
                    {
                        text: 'Pacchetti',
                        iconCls: 'icon-packet',
                        itemXtype: 'packetgrid'
                    },
                    {
                        text: 'Parametri',
                        itemXtype: 'fieldtypesgrid',
                        iconCls: 'icon-fieldType'
                    },
                    {
                        text: 'Prodotti',
                        itemXtype: 'sampleTypeGrid',
                        iconCls: 'icon-sampleType'
                    },
                    {
                        text: 'Tecniche analitiche',
                        itemXtype: 'analyticalTechnique',
                        iconCls: 'icon-analyticalTechnique'
                    },
                    {
                        text: 'Unità di misura',
                        iconCls: 'icon-unitOfMeasurement',
                        itemXtype: 'unitofmeasurementgrid'
                    }
                    ]
                }
            }),

            'configurazione': new Ext.SplitButton({
                text: 'Configurazione',
                iconCls: 'icon-small-screwdriver',
                handler: function () { this.showMenu(); },
                menu: {
                    defaults: {
                        handler: function (b) {
                            var vpp = Ext.getCmp('main-panel');
                            vpp.layout.center.panel.removeAll();
                            vpp.layout.center.panel.add({
                                xtype: 'panel',
                                border: false,
                                layout: 'fit',
                                title: 'Configurazione: ' + b.text,
                                iconCls: b.iconCls,
                                items: [{
                                    xtype: b.itemXtype
                                }]
                            });
                            vpp.layout.center.panel.doLayout();
                        }
                    },
                    items: [{
                        text: 'Utenti',
                        iconCls: 'icon-small-group',
                        itemXtype: 'usergrid'
                    },
                    {
                        text: 'Laboratori',
                        iconCls: 'icon-small-department',
                        itemXtype: 'departmentgrid'
                    },
                    {
                        text: 'Preferenze',
                        handler: Lab.utils.configurationWindow,
                        iconCls: 'icon-configurations'
                    }]
                }
            })
        },

        tail = ['->',
        {
            text:       '<b>'+Lab.CONFIG.user.fullname+'</b>',
            iconCls:    'icon-small-user',
            handler:    this.changePassword
        },
        '-',
        {
            text: 'logout',
            iconCls: 'icon-logout',
            handler: function () {
                location.href = Lab.CONFIG.logout_url;
            }
        }];

        // l'admin ha tutti i bottoni
        if (!Lab.CONFIG.user.is_admin) {
            // permissions è un array di stringhe con lo stesso nome delle
            // proprietà di buttons
            Ext.each(Lab.CONFIG.user.permissions, function (item) {
                // non tutti i permessi hanno un bottone associato
                if (buttons[item]) {
                    self.getTopToolbar().add(buttons[item]);
                }
            });
        } else {
            // Ext.iterate si usa per iterare le proprietà di un oggetto
            Ext.iterate(buttons, function (button) {
                self.getTopToolbar().add(buttons[button]);
            });
        }
        self.getTopToolbar().add(tail);
        self.getTopToolbar().doLayout();
    },

    changePassword: function (b, e) {
        if (!Ext.getCmp('userWindow')) {
            var form = new Ext.form.FormPanel({
                frame:      true,
                labelWidth: 150,
                padding:    5,
                defaults: {
                    anchor: '-20'
                },
                items: [{
                    xtype:  'hidden',
                    name:   'id',
                    value:  Lab.CONFIG.user.id
                },
                {
                    xtype:      'textfield',
                    fieldLabel: 'Password corrente',
                    name:       'actual',
                    inputType:  'password',
                    itemId:     'actualPasswordField'
                },
                {
                    xtype:          'textfield',
                    fieldLabel:     'Nuova password',
                    inputType:      'password',
                    itemId:         'newPasswordField',
                    submitValue:    false
                },
                {
                    xtype:              'textfield',
                    fieldLabel:         'Conferma password',
                    inputType:          'password',
                    name:               'new',
                    validationDelay:    '1000',
                    validator: function (value) {
                        var ret = true;
                        if (value) {
                            var newpass = form.getComponent('newPasswordField').getValue();

                            if (newpass !== value) {
                                ret = "no.";
                            }
                        }
                        return ret;
                    }
                }]
            }),

            passwd = function () {
                var basicForm = form.getForm();
                if (basicForm.isValid()) {
                    Lab.user.changePassword({
                        values: basicForm.getValues()
                    }, function (result) {
                        if (result.success) {
                            win.close();
                        } else {
                            form.getComponent('actualPasswordField').markInvalid();
                        }
                        Lab.flash.msg(result.success ? 'Successo' : 'Errore', result.message);
                    });
                }
            },

            win = new Ext.Window({
                title:      'Cambia password',
                id:         'userWindow',
                draggable:  false,
                layout:     'fit',
                width:      375,
                height:     175,
                buttons: [{
                    text:       'OK',
                    handler:    passwd
                }],
                items: [form]
            });

            win.show();
            win.alignTo(e.getTarget());
        }
    }
});

Ext.reg('mainpanel', Lab.MainPanel);
