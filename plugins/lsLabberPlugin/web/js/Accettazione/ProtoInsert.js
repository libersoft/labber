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
 * Interfaccia di inserimento sezioni/pacchetti semplici
 *
 * Riceve:
 *     'protoType': Packet o OfferSection
 *     'offerId' se mostra OfferSections
 */
Lab.ProtoInsert = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var storeOptions = {
            params: {}
        },

        group = new Ext.form.ComboBox({
            emptyText: 'Matrice',
            allowBlank: true,
            submitValue: false,
            displayField: 'name',
            valueField: 'id',
            triggerAction: 'all',
            ref: 'matrixcombo',
            forceSelection: true,
            minChars: 2,
            listeners: {
                select: function (field, record) {
                    matrix.lastQuery = null;
                    matrix.clearValue();

                    matrix.store.setBaseParam('tableMethodParam', record.data.id);
                    matrix.store.load();
                    matrix.focus();

                    store.load({
                        params: {
                            matrix_id: record.data.id
                        }
                    });
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
        }),

        matrix = new Ext.form.ComboBox({
            allowBlank: false,
            emptyText: 'Sottomatrice',
            hiddenName: 'matrix_id',
            displayField: 'name',
            valueField: 'id',
            pageSize: 15,
            triggerAction: 'all',
            ref: 'submatrixcombo',
            forceSelection: true,
            minChars: 2,
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Matrix',
                    tableMethod: 'retrieveMatrixBranch',
                    sort: 'name'
                },
                fields: ['id', 'name'],
                pageSize: 15
            }),
            listeners: {
                select: function (field, record) {
                    var options = store.lastOptions;
                    options.params.submatrix_id = record.data.id;
                    store.load(options);
                }
            }
        }),

        store = new Lab.sfDirectStore({
            api: {
                read: Lab.determination.protoList
            },
            autoDestroy: true,
            autoLoad: false,
            baseParams: {
                prototype: config.protoType,
                offerid: config.offerId
            },
            fields: ['id', 'desc', 'method', 'inside'],
            pageSize: 20
        }),

        checks = new Ext.grid.CheckboxSelectionModel(),

        grid = new Ext.grid.GridPanel({
            anchor: '100% 93%',
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                pageSize: store.pageSize,
                store: store
            }),
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    menuDisabled: true,
                    sortable: true
                },
                columns: [checks, {
                    header: 'Descrizione',
                    dataIndex: 'desc',
                    renderer: function (value, metadata, record, rowIndex, colIndex, store) {
                        metadata.attr = 'ext:qtip="' + record.data.inside + '" ext:qtitle="<h3>Controlli inclusi:</h3>"';
                        return value;
                    }
                },
                {
                    header: 'Metodo',
                    dataIndex: 'method'
                }]
            }),
            loadMask: true,
            ref: 'grid',
            sm: checks,
            store: store,
            stripeRows: true,
            viewConfig: {
                forceFit: true
            }
        });

        config = Ext.apply({
            border: false,
            margins: '5 5 5 5',
            monitorValid: true,
            padding: 10,
            buttons: [{
                text: 'Inserisci',
                formBind: true,
                handler: this.newInsert,
                ref: '../button',
                scope: this
            }],
            items: [{
                xtype: 'hidden',
                name: 'record_local',
                value: config.recordLocal
            },
            {
                xtype: 'hidden',
                name: 'record_id',
                value: config.recordId
            },
            {
                xtype: 'compositefield',
                hideLabel: true,
                defaults: {
                    flex: 1
                },
                items: [group, matrix]
            }, grid]
        }, config);

        Lab.ProtoInsert.superclass.constructor.call(this, config);

        // precarica il gruppo di matrici del campione
        if (this.offerSection && this.offerSection.matrix_id) {
            group.setValue(this.offerSection.matrix_id);
            matrix.store.setBaseParam('tableMethodParam', this.offerSection.matrix_id);

            storeOptions.params.matrix_id = this.offerSection.matrix_id;
        }

        // precarica la sottomatrice del campione
        if (this.offerSection && this.offerSection.submatrix_id) {
            matrix.setValue(this.offerSection.submatrix_id);

            storeOptions.params.submatrix_id = this.offerSection.submatrix_id;
        }

        store.load(storeOptions);
    },

    newInsert: function () {
        if (this.grid.getSelectionModel().hasSelection()) {
            Ext.each(Ext.pluck(this.grid.selModel.getSelections(), 'id'), function (selected_id) {
                var data = this.getForm().getValues();

                data.proto_id = selected_id;
                data.prototype = this.protoType;

                Lab.determination.proto({
                    data: data
                }, function (r) {
                    if (r.success) {
                        Lab.flash.msg('Successo', r.message);
                        this.ownerCt.fireEvent('insert');
                    }
                }, this);
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Effettuare almeno una selezione');
        }
    }
});

Ext.reg('protoinsert', Lab.ProtoInsert);
