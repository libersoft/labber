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
 * 
 */
Lab.MethodDeterminationTypeGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 100,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'DeterminationType',
                doctrineJoins: ['DeterminationType.Method',
                    'DeterminationType.Matrix','DeterminationType.Denomination',
                    'DeterminationType.Fields.FieldType',
                    'DeterminationType.Constants.MethodConstant',
                    'DeterminationType.SIPrefix',
                    'DeterminationType.UnitOfMeasurement'],
                doctrineWheres: [{
                    field: 'method_id',
                    operator: '=',
                    value: config.methodId
                }]
            },
            fields: ['id', 'Method.name', 'Matrix.name', 'Denomination.name', {
                name: 'constants',
                convert: function (v, record) {
                    var result = '';
                    Ext.each(record.Constants, function (item) {
                        result += item.MethodConstant.name + ': <i>' + item.value + '</i><br/>';
                    })
                    return result;
                }
            },
            {
                name: 'fields',
                convert: function (v, record) {
                    var result = '';
                    Ext.each(record.Fields, function (item) {
                        result += item.FieldType.name + ': <i>' + Ext.num(item.value, item.value) + '</i><br/>';
                    })
                    return result;
                }
            },
            {
                name: 'um',
                convert: function (v, record) {
                    var prefix = (record.SIPrefix) ? record.SIPrefix.prefix : '';
                    var symbol = (record.UnitOfMeasurement) ? record.UnitOfMeasurement.symbol : '';
                    return prefix + symbol;
                }
            }, 'is_default', 'is_sinal', 'significant_digits', 'max_decimal_digits', 'price'],
            pageSize: pageSize
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo:    true,
                pageSize:       pageSize,
                store:          sfStore
            }),
            border: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: true
                },
                columns: [{
                    header: 'Matrice',
                    dataIndex: 'Matrix.name',
                    width: 160
                },
                {
                    header: 'Denominazione',
                    dataIndex: 'Denomination.name',
                    width: 160
                },
                {
                    header: 'Costanti',
                    dataIndex: 'constants'
                },
                {
                    header: 'Parametri',
                    dataIndex: 'fields'
                },
                {
                    header: 'Preferito',
                    dataIndex: 'is_default',
                    renderer: function (value) {
                        return (value) ? 'Sì' : null;
                    }
                },
                {
                    header: 'Accreditato',
                    dataIndex: 'is_sinal',
                    renderer: function (value) {
                        return (value) ? 'Sì' : 'No';
                    }
                },
                {
                    header: 'Unità di misura',
                    dataIndex: 'um'
                },
                {
                    header: 'Cifre significative',
                    dataIndex: 'significant_digits'
                },
                {
                    header: 'Cifre decimali',
                    dataIndex: 'max_decimal_digits'
                },
                {
                    xtype: 'numbercolumn',
                    header: 'Costo',
                    dataIndex: 'price',
                    width: 100,
                    align: 'right',
                    format: '0.000,00/i'
                }]
            }),
            loadMask: true,
            store: sfStore,
            title: 'Tipi di controllo'
        }, config);

        Lab.MethodDeterminationTypeGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('methoddeterminationtypegrid', Lab.MethodDeterminationTypeGrid);