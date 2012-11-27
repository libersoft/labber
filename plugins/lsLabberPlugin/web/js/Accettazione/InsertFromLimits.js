/*global
    Ext: true,
    Lab: true
*/

"use strict";

Ext.ns('Lab');

/**
 *  Inserimento da tabella limiti.
 */
Lab.InsertFromLimits = Ext.extend(Lab.RawInsert, {

    constructor: function (config) {

        var sfStore = new Lab.sfDirectStore({
            api: {
                read: Lab.determinationType.list
            },
            autoLoad: false,
            fields: [
                'id', 'Method', 'Matrix', 'Denomination', 'method_id',
                'matrix_id', 'denomination_id', 'um', 'is_default', 'is_sinal',
                'significant_digits', 'max_decimal_digits', 'scale_id', 'um_id',
                'price'
            ],
            pageSize: 20
        }),

        filterBar = {
            xtype: 'filteringtoolbar',
            store: sfStore,
            items: [{
                xtype: 'combo',
                emptyText: 'Matrice',
                name: 'matrix_id',
                displayField: 'name',
                valueField: 'id',
                triggerAction: 'all',
                ref: 'matrixcombo',
                listeners: {
                    select: function (field, record) {
                        // filtra la combobox delle sottomatrici
                        var matrix = field.ownerCt.submatrixcombo;

                        matrix.lastQuery = null;
                        matrix.clearValue();

                        matrix.store.setBaseParam('groupMatrixId', record.data.id);
                        matrix.store.load();
                        matrix.focus();

                        // il listener della FilteringToolbar
                        var lastOptions = (sfStore.lastOptions) ? sfStore.lastOptions : {
                            params: {}
                        },

                        filter = {
                            field:      field.name,
                            operator:   '=',
                            value:      field.getValue()
                        };

                        if (!lastOptions.params.filters) {
                            lastOptions.params.filters = {};
                        }
                        lastOptions.params.filters[field.name] = filter;
                        lastOptions.params.start = 0;

                        sfStore.reload(lastOptions);
                    }
                },
                store: new Lab.sfDirectStore({
                    autoDestroy: true,
                    autoLoad: false,
                    baseParams: {
                        doctrineClass: 'Matrix',
                        tableMethod: 'retrieveRootMatricesList'
                    },
                    fields: ['id', 'name']
                })
            },
            ' ',
            {
                xtype: 'submatrixcombo',
                emptyText: 'Sottomatrice',
                name: 'submatrix_id',
                ref: 'submatrixcombo'
            },
            ' ',
            {
                xtype: 'combo',
                ref: 'denominationCombo',
                emptyText: 'Denominazione',
                name: 'denomination_id',
                displayField: 'name',
                valueField: 'id',
                pageSize: 99,
                triggerAction: 'all',
                store: new Lab.sfDirectStore({
                    autoDestroy: true,
                    autoLoad: false,
                    baseParams: {
                        doctrineClass: 'Denomination',
                        doctrineJoins: ['Denomination.Limits'],
                        doctrineWhereIns: [{
                            field:      'Limits.group_id',
                            valueSet:   [config.limitsGroupId]
                        }],
                        sort: 'Limits.position'
                    },
                    fields: ['id', 'name'],
                    pageSize: 99
                })
            },
            ' ',
            {
                xtype: 'methodcombo',
                emptyText: 'Metodo',
                name: 'method_id'
            },
            ' ',
            {
                xtype: 'checkbox',
                boxLabel: 'Preferito?',
                name: 'is_default'
            }]
        };

        config = Ext.apply({
            items: [{
                xtype: 'cachetable',
                anchor: '100% 75%',
                ref: 'grid',
                offerSection: config.offerSection,
                sample: config.sample,
                store: sfStore,
                tbar: filterBar
            },
            {
                xtype: 'fieldset',
                title: 'Parametri',
                anchor: '100% 25%',
                ref: 'parameters'
            }]
        }, config);

        Lab.InsertFromLimits.superclass.constructor.call(this, config);

        this.grid.getTopToolbar().denominationCombo.on('beforeselect', function (c, r, i) {
            this.selectedIndex = i;
        });

        this.grid.getTopToolbar().denominationCombo.on('afterrender', function (combo) {
            combo.store.load({
                callback: function (r, options) {
                    var recordSelected = r[0];
                    combo.setValue(recordSelected.get(combo.valueField));
                    combo.fireEvent('select', combo, recordSelected, 0);
                    combo.selectedIndex = 0;
                }
            });
        });
    },

    newInsert: function (b, e) {
        Lab.InsertFromLimits.superclass.newInsert.call(this, b, e);

        var combo = this.grid.getTopToolbar().denominationCombo,
            nextIndex = combo.selectedIndex + 1,
            next = combo.store.getAt(nextIndex);

        combo.setValue(next.id);
        combo.fireEvent('select', combo, next, nextIndex);
        combo.selectedIndex = nextIndex;
    }
});

Ext.reg('insertfromlimits', Lab.InsertFromLimits);
