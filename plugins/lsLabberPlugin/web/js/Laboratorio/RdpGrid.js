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
 *  Griglia con l'elenco degli ordini
 */
Lab.RdpGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        pageSize = 30,
        
        sfStore = new Lab.sfDirectStore({
            autoDestroy:    true,
            autoLoad:       true,
            baseParams: {
                doctrineClass: 'Rdp',
                sort: 'name'
            },
            fields: [{
                name:       'name'
            },
            {
                name:       'id'
            },
            {
                name:       'inc'
            },
            {
                name:       'um'
            },
            {
                name:       'loq'
            },
            {
                name:       'lod'
            },
            {
                name:       'limit_value'
            },           
            {
                name:       'rec'
            },
            {
                name:       'note'
            },
            {
                name:       'start_end'
            },           
            {
                name:       'created_at',
                type:       'date',
                dateFormat: 'Y-m-d H:i:s'
            }]
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {                
                sortable:   true,
                width:      100
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Nome Rapporto di Prova',
                dataIndex: 'name',
                width:      250
            },
            {
                header: 'Incertezza',
                dataIndex: 'inc',
                renderer: function (value, metaData) {                    
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;  
                }
            },
            {
                header: 'Unità di Misura',
                dataIndex: 'um',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Loq',
                dataIndex: 'loq',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Lod',
                dataIndex: 'lod',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Limiti',
                dataIndex: 'limit_value',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Rec',
                dataIndex: 'rec',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Note',
                dataIndex: 'note',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return;
                }
            },
            {
                header: 'Date Inizio e Fine',
                dataIndex: 'start_end',
                renderer: function (value, metaData) {
                    (value) ? metaData.css = 'icon-tick_circle' : metaData.css = 'icon-cross_circle';
                    return; 
                }
            }
            ]
        }),

        toolbars = new Ext.Panel({
            border: false,
            items: [{
                xtype: 'filteringtoolbar',
                items: [{
                    xtype: 'checkbox',
                    boxLabel: 'Incertezza',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'inc'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Unità di Misura',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'um'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Loq',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'loq'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Lod',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'lod'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Limiti',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'limit_value'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Rec',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'rec'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Note',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'note'
                },'-',
                {
                    xtype: 'checkbox',
                    boxLabel: 'Date Inizio e Fine',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'start_end'
                }],
                store: sfStore
            }],
            store: sfStore
        });

        config = Ext.apply({            
            border:     false,
            cm:         colModel,         
            loadMask:   true,
            stateful:   true,
            store:      sfStore,
            stripeRows: true,
            tbar:       toolbars,
            viewConfig: {
                forceFit:   true
            },
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true
            })
        }, config);

        Lab.RdpGrid.superclass.constructor.call(this, config);
    }    
});




Lab.RdpWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {
        var gridrdp =  new Lab.RdpGrid();
        config = Ext.apply({
            modal: true,
            width: 1100,
            height: 600,
            minWidth: 300,
            minHeight: 200,
            layout: 'fit',
            plain: true,
            buttonAlign: 'center',
            items: gridrdp,
            buttons: [{
                text: 'Seleziona',
                iconCls: 'icon-small-ok',
                scope: this,
                handler: function (b, e) {
                    // XXX: il form dev'essere necessariamente il primo tab
                    var sel = gridrdp.getSelectionModel().getSelected();
                    if(sel){
                        var id = gridrdp.getSelectionModel().getSelected().data.id;
                        this.rdp = id;
                        this.close();
                    }
                    else {
                         Lab.flash.msg('Errore','Seleziona un rapporto di prova');
                    }
                }
            }]
        }, config);

        Lab.RdpWindow.superclass.constructor.call(this, config);

        if (this.record) {
            this.items.itemAt(0).getItem(0).getForm().loadRecord(this.record);
        }
    }
});
