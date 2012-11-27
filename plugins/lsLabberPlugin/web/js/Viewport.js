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


// application main entry point
Ext.onReady(function (vp) {
    
    Ext.BLANK_IMAGE_URL = Lab.CONFIG.root_dir + '/js/ext/resources/images/default/s.gif';

    Ext.state.Manager.setProvider(new Ext.ux.state.LocalStorageProvider({prefix: 'labber-'}));

    // Modifico l'url del router direct dinamicamente
    Ext.app.EXTDIRECT_API.url = Lab.CONFIG.root_dir + Ext.app.EXTDIRECT_API.url;

    Ext.app.EXTDIRECT_API.enableBuffer = 100;
    Ext.app.EXTDIRECT_API.timeout = 300000;
    Ext.Direct.addProvider(Ext.app.EXTDIRECT_API);
    Ext.QuickTips.init();

    vp = new Ext.Viewport({
        layout: 'fit',
        items: {
            xtype: 'mainpanel'
        }
    });

});
