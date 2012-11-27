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

Lab.MethodUnitOfMeasurementGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass:  'MethodUnitOfMeasurement',
                doctrineJoins:  ['MethodUnitOfMeasurement.UnitOfMeasurement', 'MethodUnitOfMeasurement.Prefix'],
                doctrineWheres: [{
                    field:      'method_id',
                    operator:   '=',
                    value:      config.methodId
                }]
            },
            fields: ['id', {
                name: 'um',
                convert: function (v, record) {
                    var prefix = record.Prefix ? record.Prefix.name : '';
                    var um = record.UnitOfMeasurement ? record.UnitOfMeasurement.name : '';
                    return prefix + um;
                }
            },
            {
                name: 'symbol',
                convert: function (v, record) {
                    var prefix = record.Prefix ? record.Prefix.prefix : '';
                    var symbol = record.UnitOfMeasurement ? record.UnitOfMeasurement.symbol : '';
                    return prefix + symbol;
                }
            }]
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: true,
                sortable: false
            },
            columns: [{
                header: 'Unità di misura',
                dataIndex: 'um'
            },
            {
                header: 'Simbolo',
                dataIndex: 'symbol'
            }]
        }),

        topBar = new Ext.Toolbar({
            items: [{
                text:       'Associa',
                iconCls:    'icon-small-node-insert',
                tooltip:    'Associa un\'unità di misura',
                handler:    this.link,
                scope:      this
            },
            {
                text:       'Disassocia',
                iconCls:    'icon-small-node-delete',
                tooltip:    'Rimuovi l\'associazione con il metodo',
                handler:    this.unlink,
                scope:      this
            }]
        });

        config = Ext.apply({
            border:     false,
            colModel:   colModel,
            store:      sfStore,
            stripeRows: true,
            tbar:       topBar,
            title:      'Unità di misura',
            viewConfig: {
                forceFit:   true
            }
        }, config);

        Lab.MethodUnitOfMeasurementGrid.superclass.constructor.call(this, config);
    },

    unlink: function () {
        var sm = this.getSelectionModel();
        if (sm.hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'associazione con questo metodo?', function (b) {
                if (b === 'yes') {
                    this.store.remove(sm.getSelections());
                }
            }, this);
        }
    },

    link: function (b) {
        var that = this,

        prefixCombo = new Lab.PrefixCombo({
            anchor:     '-20',
            fieldLabel: 'Scala',
            name:       'prefix_id'
        }),

        umCombo = new Lab.UMCombo({
            anchor:     '-20',
            fieldLabel: 'Unità di misura',
            name:       'unit_of_measurement_id'
        }),

        win = new Ext.Window({
            bodyStyle:  'background-color:#fff;padding: 10px',
            iconCls:    b.iconCls,
            layout:     'fit',
            modal:      true,
            resizable:  false,
            width:      512,
            height:     160,
            defaultButton: prefixCombo,
            items: {
                xtype:          'form',
                border:         false,
                monitorValid:   true,
                buttons: [{
                    text:       'Associa unità di misura',
                    formBind:   true,
                    handler: function () {
                        var fieldValues = this.ownerCt.ownerCt.ownerCt.items.itemAt(0).form.getFieldValues();

                        Ext.apply(fieldValues, {
                            method_id: that.methodId
                        });

                        Lab.db.create({
                            doctrineClass:  'MethodUnitOfMeasurement',
                            data:           fieldValues
                        }, function () {
                            that.store.reload();
                        });
                    }
                }],
                items: [prefixCombo,umCombo]
            }
        });

        win.show();
    }
});

Ext.reg('methodunitofmeasurementgrid', Lab.MethodUnitOfMeasurementGrid);
