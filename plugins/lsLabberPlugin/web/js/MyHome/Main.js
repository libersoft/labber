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
 *  Dashboard
 *
 *  Conterrà gli avvisi del framework di messaggistica.
 */
Lab.MyHome = Ext.extend(Ext.Panel, {

    constructor: function (config) {

        config = Ext.apply({
            title: 'MyHome',
            iconCls: 'icon-small-home',
            border: false,
            bodyStyle: 'background-color:#ECF0F6',
            layout: new Ext.layout.HBoxLayout({
                align: 'middle'
            }),
            items: [{
                xtype: 'panel',
                border: false,
                width: '100%',
                height: 188,
                bodyStyle: 'background-color:#ECF0F6',
                html: '<center><img src="'+Lab.CONFIG.root_dir+'/images/logo-300px.png"></center>'
            }]
        }, config);

        Lab.MyHome.superclass.constructor.call(this, config);
    }
});

Ext.reg('myhome', Lab.MyHome);
