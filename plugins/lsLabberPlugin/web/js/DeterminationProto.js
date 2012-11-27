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
 * Lista di controlli monometodo per pacchetto o sezione semplice
 *
 * Riceve recordLocal e recordId
 */
Lab.DeterminationProtoGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,

        sfStore =  new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: 'Determination',
                doctrineJoins: ['Determination.Denomination', 'Determination.Method'],
                doctrineWhereIns: [{
                    field: config.recordLocal,
                    valueSet: [config.recordId]
                }]
            },
            fields: ['id', 'denomination_id', 'Denomination.name', 'method_id', 'Method.name', 'numriga_report'],
            sortInfo: {
                field: 'numriga_report',
                direction: 'ASC'
            }
        }),

        buttonsBar = new Ext.Toolbar({
            items: [{
                text:       "Inserisci",
                iconCls:    'icon-small-add',
                handler:    this.insert,
                scope:      this
            },
            '->',
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina il controllo selezionato',
                handler: function () {
                    if (self.selModel.hasSelection()) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i controlli selezionati?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(self.selModel.selection.record);
                            }
                        });
                    }
                }
            }]
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: true,
                sortable: true
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: 'Denominazione',
                dataIndex: 'Denomination.name'
            },
            {
                header: 'Metodo',
                dataIndex: 'Method.name',
                sortable: false
            },
            {
                header: 'Numero riga report',
                dataIndex: 'numriga_report',
                align: 'right',
                fixed: true,
                width: 115,
                editor: new Ext.form.NumberField({
                    allowDecimals: false,
                    allowNegative: false
                })
            }]
        });

        config = Ext.apply({
            title: 'Controlli',
            border: false,
            cm: colModel,
            iconCls: 'icon-small-determination',
            loadMask: true,
            store: sfStore,
            tbar: buttonsBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.DeterminationProtoGrid.superclass.constructor.call(this, config);
    },

    insert: function (b, e) {
        var that = this,

        win = new Ext.Window({
            iconCls:    b.iconCls,
            width:      640,
            height:     420,
            layout:     'fit',
            modal:      true,
            resizable:  false,
            items: {
                xtype: 'determinationprotoinsert',
                recordId: that.recordId,
                recordLocal: that.recordLocal
            }
        });

        win.show(e.getTarget());

        win.on('close', function () {
            that.store.reload();
        });
    }
});



Lab.DeterminationProtoInsert = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var denominationChecks = new Ext.grid.CheckboxSelectionModel(),

        denominations = new Ext.grid.GridPanel({
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true
                },
                columns: [denominationChecks, {
                    header: 'Nome',
                    dataIndex: 'name'
                },
                {
                    header: 'Gruppo',
                    dataIndex: 'Group.name'
                }]
            }),
            fieldLabel: 'Denominazioni',
            height: 300,
            ref: 'denominationsGrid',
            selModel: denominationChecks,
            store: new Ext.data.GroupingStore({
                autoDestroy: true,
                reader: new Ext.data.JsonReader({
                    fields: ['id', 'name', {
                        name: 'Group.name',
                        mapping: 'Group ? obj.Group.name : ""',
                        // Serve a ordinare le denominazioni senza gruppo in
                        // fondo alla griglia.
                        sortType: function (v) {
                            return (v === "") ? 'ZZ' : v;
                        }
                    }]
                })
            }),
            view: new Ext.grid.GroupingView({
                forceFit: true
            })
        }),

        methods = new Lab.MethodCombo({
            fieldLabel: 'Metodo',
            name: 'method_id',
            ref: 'methodBox',
            allowBlank: false,
            triggerAction: 'all',
            displayField: 'name',
            valueField: 'id',
            pageSize: 15,
            store: new Lab.sfDirectStore({
                autoDestroy: true,
                autoLoad: false,
                baseParams: {
                    doctrineClass: 'Method',
                    doctrineJoins: ['Method.Denominations.Group'],
                    sort: 'name'
                },
                fields: ['id', 'name', 'Denominations'],
                pageSize: 15
            }),
            listeners: {
                select: function (combo, record, index) {
                    denominations.store.loadData(record.data.Denominations);
                }
            }
        });

        config = Ext.apply({
            border: false,
            monitorValid: true,
            padding: 10,
            buttons: [{
                text: 'Inserisci',
                formBind: true,
                handler: this.submit,
                scope: this
            }],
            defaults: {
                anchor: '-20'
            },
            items: [methods, denominations]
        }, config);

        Lab.DeterminationProtoInsert.superclass.constructor.call(this, config);
    },

    submit: function (b, e) {
        var method_id = this.methodBox.getValue(), data = {};

        Ext.each(Ext.pluck(this.denominationsGrid.selModel.getSelections(), 'id'), function (denomination_id) {
            data = {
                denomination_id: denomination_id,
                method_id: method_id
            };
            data[this.recordLocal] = this.recordId;
            Lab.db.create({
                doctrineClass: 'Determination',
                data: data
            }, function (result) {
                this.result = result;
                if (result.success) {
                    Lab.flash.msg('Controlli inseriti correttamente', '');

                    // Associa alla Determination appena creata il *Source appropriato
                    var priceData = {
                        record_id: this.recordId,
                        determination_id: result.data.id
                    };

                    if (this.recordLocal === 'offer_section_id') {
                        Lab.offerSection.priceCreate({
                            data: priceData
                        });
                    } else if (this.recordLocal === 'sample_id') {
                        Lab.sample.priceCreate({
                            data: priceData
                        });
                    }
                }
                else {
                    Lab.flash.msg('Errore: controlli non inseriti', '');
                }
                this.fireEvent('submitted', {});
            }, this);
        }, this);
    }
});

Ext.reg('determinationprotogrid', Lab.DeterminationProtoGrid);
Ext.reg('determinationprotoinsert', Lab.DeterminationProtoInsert);