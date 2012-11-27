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
 *  Campioni inclusi in una fattura
 */
Lab.BillSamplesGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {
        var sfStore = new Lab.sfDirectStore({
                baseParams: {
                    doctrineClass: 'Sample',
                    doctrineJoins: ['Sample.Order'],
                    doctrineWheres: [{
                        field: 'bill_id',
                        operator: '=',
                        value: config.record.id
                    }]
                },
                fields: ['id', 'numero', 'Order.numero', 'bill_id', 'price']
            }),

            colModel = new Ext.grid.ColumnModel({
                defaults: {
                    menuDisabled: true
                },
                columns: [new Ext.grid.RowNumberer(), {
                    header: 'Ordine',
                    dataIndex: 'Order.numero'
                },
                {
                    header: 'Numero',
                    dataIndex: 'numero'
                },
                {
                    header: 'Prezzo',
                    dataIndex: 'price',
                    xtype: 'numbercolumn',
                    format: '0.000,00/i',
                    editor: new Ext.form.NumberField({
                        allowNegative: false,
                        decimalSeparator: ','
                    })
                }]
            }),

            actionBar = new Ext.Toolbar([{
                text: 'Seleziona',
                gridState: 'list',
                handler: this.associate,
                iconCls: 'icon-small-add',
                scope: this
            }]);

        config = Ext.apply({
            border: false,
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: actionBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.BillSamplesGrid.superclass.constructor.call(this, config);
    },

    changeSelectionModel: function (newSelectionModel) {
        this.selModel.clearSelections();
        this.selModel.destroy();
        this.selModel = newSelectionModel;
        this.selModel.init(this);
    },

    associate: function (b) {
        if (b.gridState === 'list') {
            b.gridState = 'add';
            b.setText('Completato');

            var cbsm = new Ext.grid.CheckboxSelectionModel({
                header: '',
                width: 23
            }),
            cbcm = this.colModel,
            cbds = this.store,
            wheres = [{
                field: 'Order.contact_id',
                operator: '=',
                value: this.record.data.contact_id
            },
            {
                field: 'stato',
                operator: '>',
                value: 0
            }];

            cbcm.columns[0] = cbsm;
            cbcm.setEditable(cbcm.findColumnIndex('price'), false);
            cbds.setBaseParam('doctrineWheres', wheres);

            this.store.load({
                callback: function (records) {
                    var added = [];
                    Ext.each(records, function (r) {
                        if (r.data.bill_id) {
                            added.push(r);
                        }
                    }, this);
                    this.changeSelectionModel(cbsm);
                    this.reconfigure(cbds, cbcm);
                    this.selModel.selectRecords(added);
                },
                scope: this
            });
        } else {
            this.store.each(function (r) {
                r.set('bill_id', null);
            });
            Ext.each(this.selModel.getSelections(), function (r) {
                r.set('bill_id', this.record.id);
            }, this);
            
            b.gridState = 'list';
            b.setText('Seleziona');

            var rscm = this.colModel,
                rsds = this.store,
                where = [{
                    field: 'bill_id',
                    operator: '=',
                    value: this.record.id
                }];

            rscm.columns[0] = new Ext.grid.RowNumberer();
            rscm.setEditable(rscm.findColumnIndex('price'), true);
            rsds.setBaseParam('doctrineWheres', where);

            this.store.load({
                callback: function () {
                    this.changeSelectionModel(new Ext.grid.CellSelectionModel());
                    this.reconfigure(rsds, rscm);
                },
                scope: this
            });
        }
    }
});

Ext.reg('billsamplesgrid', Lab.BillSamplesGrid);
