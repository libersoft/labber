"use strict";
/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true
 */

/*global
    Ext: true,
    Lab: true
 */

Ext.ns('Lab');

/**
 *
 */
Lab.OffersRevisionGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var pageSize = 50,

        self = this,

        sfStore = new Ext.data.GroupingStore({
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    filters: function() {
                        if(Lab.CONFIG.user.in_sales_secretary && Lab.CONFIG.user.in_sales){
                            return {
                                sales_secretary_id: {
                                    field:      'sales_secretary_id',
                                    operator:   '=',
                                    value:      Lab.CONFIG.user.profile_id
                                },
                                sales_manager_id: {
                                    field:      'sales_manager_id',
                                    operator:   '=',
                                    value:      Lab.CONFIG.user.profile_id
                                }
                            };
                        }
                        else {
                            if(Lab.CONFIG.user.in_sales_secretary){
                                return {
                                    sales_secretary_id: {
                                        field:      'sales_secretary_id',
                                        operator:   '=',
                                        value:      Lab.CONFIG.user.profile_id
                                    }
                                };
                            }
                            else {
                                if(Lab.CONFIG.user.in_sales){
                                    return {
                                        sales_manager_id: {
                                            field:      'sales_manager_id',
                                            operator:   '=',
                                            value:      Lab.CONFIG.user.profile_id
                                        }
                                    };
                                }
                            }
                        }
                    }
                }
            },
            autoSave: false,           
            proxy: new Ext.data.DirectProxy({
                api: {
                    read: Lab.offer.list
                }
            }),
            groupField: 'name',
            baseParams: {
                doctrineJoins: ['Offer.Contact']
            },
            reader: new Ext.data.JsonReader({
                root: 'data',
                totalProperty: 'total',
                remoteSort: true,
                fields: [
                    {
                        name: 'name'
                    },
                    {
                        name: 'revision'
                    },
                    {
                        name: 'date_rev'
                    },
                    {
                        name: 'description'
                    },
                    {
                        name: 'contact'
                    },
                    {
                        name: 'contactid'
                    },
                    {
                        name: 'attach'
                    }]
            }),
            //            pageSize:   pageSize,
            remoteGroup: true,

            writer: new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: false
            })
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                width: 200
            },
            columns: [new Ext.grid.RowNumberer(), {
                    header:     'Codice Offerta',
                    dataIndex:  'name'
                },
                {
                    header:     'Rev',
                    dataIndex:  'revision',
                    width: 40,
                    align: 'center'
                },
                {
                    header:     'Descrizione',
                    dataIndex:  'description'
                },
                {
                    header:     'Cliente',
                    dataIndex:  'contact'
                },
                {
                    header:     'Data Revisione',
                    dataIndex:  'date_rev',
                    width: 80
                },
                {
                    header:     'Allegato',
                    dataIndex:  'attach',
                    renderer: function (value) {
                        var of_name = value.replace(new RegExp(/\//g), "_");
                        return '<a target="_blank" href="data/offer/' + of_name +'">' + value +'</a>';
                    }
                }]
        }),

        topToolbar = new Ext.Panel({
            border: false,
            items: [{
                    xtype: 'filteringtoolbar',
                    items: [
                        {
                            xtype: 'clearcombo',
                            name: 'Offer.Contact.id',
                            emptyText: 'Cliente',
                            displayField: 'name',
                            valueField: 'id',
                            triggerAction: 'all',
                            pageSize: 20,
                            store: new Lab.sfDirectStore({
                                autoDestroy: true,
                                autoLoad: false,
                                baseParams: {
                                    doctrineClass: 'Contact',
                                    sort: 'name'
                                },
                                fields: ['id', 'name']
                            })
                        },
                        {
                            xtype: 'clearcombo',
                            name: 'id',
                            emptyText: 'Offerta',
                            displayField: 'number',
                            valueField: 'id',
                            triggerAction: 'all',
                            pageSize: 20,
                            store: new Lab.sfDirectStore({
                                autoDestroy: true,
                                autoLoad: false,
                                baseParams: {
                                    doctrineClass: 'Offer',
                                    sort: 'number'
                                },
                                fields: ['id', 'number']
                            })
                        },
                        {
                            xtype: 'clearcombo',
                            name: 'sales_manager_id',
                            emptyText: 'Referente commerciale',
                            displayField: 'fullname',
                            valueField: 'id',
                            triggerAction: 'all',
                            pageSize: 20,
                            value: (function(){
                                if (Lab.CONFIG.user.in_sales){
                                     return Lab.CONFIG.user.profile_id;
                                }
                            }()),
                            store: new Lab.sfDirectStore({
                                autoLoad:   false,
                                baseParams: {
                                    doctrineClass:  'User',
                                    tableMethod:    'retrieveSalesManagersList',
                                    searchFields:   ['name', 'surname']
                                },
                                fields: ['id', 'name', 'surname',
                                    {
                                        name:       'fullname',
                                        mapping:    'surname + \' \' + obj.name'
                                    }]
                            })
                        },
                        {
                            xtype: 'clearcombo',
                            name: 'sales_secretary_id',
                            emptyText: 'Segreteria commerciale',
                            displayField: 'fullname',
                            valueField: 'id',
                            triggerAction: 'all',
                            pageSize: 20,
                            value: (function(){
                                if (Lab.CONFIG.user.in_sales_secretary){
                                     return Lab.CONFIG.user.profile_id;
                                }
                            }()),
                            store: new Lab.sfDirectStore({
                                autoLoad:   false,
                                baseParams: {
                                    doctrineClass:  'User',
                                    tableMethod:    'retrieveSalesSecretaryList',
                                    searchFields:   ['name', 'surname']
                                },
                                fields: ['id', 'name', 'surname',
                                    {
                                        name:       'fullname',
                                        mapping:    'surname + \' \' + obj.name'
                                    }]
                            })
                        }],
                    store: sfStore
                }]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            ddGroup: 'gridDDGroup',
            stripeRows: true,
            tbar:       topToolbar,
            view: new Ext.grid.GroupingView({
                forceFit: true             
            })
        }, config);

        Lab.OffersRevisionGrid.superclass.constructor.call(this, config);        

    }
});

Ext.reg('offersrevisiongrid', Lab.OffersRevisionGrid);
