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
 *  GridPanel per Limit
 */
Lab.LimitsGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass:  'Limit',
                doctrineJoins: ['Limit.Denomination', 'Limit.Prefix', 'Limit.Unit'],
                doctrineWheres: [{
                    field:  'group_id',
                    operator:   '=',
                    value:  config.groupID
                }],
                sort: 'position'
            },
            fields: ['id', 'group_id', 'denomination_id', 'prefix_id', 'unit_id', 'value', 'denomination_alias', 'Denomination.name', {
                name: 'prefix+unit',
                convert: function (v, record) {
                    var prefix = (record.Prefix) ? record.Prefix.prefix : '';
                    var symbol = (record.Unit) ? record.Unit.symbol : '';
                    return prefix + symbol;
                }
            }]
        }),

        colModel = new Ext.grid.ColumnModel({
            columns: [new Ext.grid.RowNumberer(), {
                header:     'Denominazione',
                dataIndex:  'Denomination.name'
            },
            {
                header:     'Alias',
                dataIndex:  'denomination_alias'
            },
            {
                header:     'Unità di misura',
                dataIndex:  'prefix+unit'
            },
            {
                header:     'Valore',
                dataIndex:  'value',
                editor:     {xtype: 'textarea'}
            }]
        }),

        actionBar = new Ext.Toolbar([{
            text: 'Nuovo',
            handler: this.newWindow,
            iconCls: 'icon-small-add',
            scope: this
        },
        '->',
        {
            text: 'Elimina',
            disabled: true,
            handler: this.deleteRecords,
            iconCls: 'icon-small-remove',
            ref: 'removeBtn',
            scope: this
        }]),

        filters = new Ext.ux.grid.GridFilters({
            encode:         true,
            menuFilterText: 'Filtri',
            filters: [{
                type:       'string',
                dataIndex:  'Denomination.name'
            },
            {
                type:       'string',
                dataIndex:  'denomination_alias'
            }]
        });

        config = Ext.apply({
            border:         false,
            clicksToEdit:   1,
            colModel:       colModel,
            ddGroup:        'limitsgrid-dd',
            enableDragDrop: true,
            listeners:      {validateedit: this.validateEdit},
            loadMask:       false,
            plugins:        [filters],
            sm:             new Ext.grid.RowSelectionModel({singleSelect: true}),
            store:          sfStore,
            stripeRows:     true,
            tbar:           actionBar,
            viewConfig:     {forceFit: true}
        }, config);

        Lab.LimitsGrid.superclass.constructor.call(this, config);

        this.getSelectionModel().on('selectionchange', function (sm) {
            actionBar.removeBtn.setDisabled(!sm.hasSelection());
        });

        this.on('afterrender', function () {
            var grid = this,
                ddrow = new Ext.dd.DropTarget(this.getView().mainBody, {
                    ddGroup:    'limitsgrid-dd',
                    notifyDrop: function (dd, e, data) {
                        var sm = grid.getSelectionModel(),
                            rows = sm.getSelections(),
                            cindex = dd.getDragData(e).rowIndex;

                        if (sm.hasSelection()) {
                            for (var i = 0; i < rows.length; i++) {
                                Lab.limits.reorder({
                                    limit_id: rows[i].id,
                                    position: cindex + 1
                                }, function () {
                                    var lastOptions = grid.store.lastOptions;
                                    Ext.apply(lastOptions, {
                                        callback: function () {
                                            sm.selectRow(cindex);
                                        }
                                    });
                                    grid.store.reload(lastOptions);
                                });
                            }
                        }
                    }
                });
        });
    },

    newWindow: function () {
        var that = this,

        win = new Lab.ObjectWindow({
            title:          'Nuovo limite',
            width:          500,
            height:         400,
            defaultButton:  'limitDenominationCombo',
            doctrineClass:  this.store.baseParams.doctrineClass,
            tabItems: [{
                xtype:      'limitform',
                groupID:    this.groupID,
                ref:        'form'
            }]
        });

        win.addButton({
            text: 'Nuovo',
            iconCls: 'icon-small-add'
        }, function () {
            var form = this.tabpanel.form.getForm();

            if (form.isValid()) {
                Lab.db.create({
                    doctrineClass:  that.store.baseParams.doctrineClass,
                    data:           form.getFieldValues()
                }, function (result) {
                    if (result.success) {
                        form.findField('value').reset();
                        form.findField('denomination_id').reset();
                        form.findField('denomination_id').focus();
                        that.store.reload();
                    }
                }, form);
            } else {
                Ext.Msg.alert('Impossibile salvare', 'Alcuni campi non sono coerenti')
            }
        }, win);

        win.show();

        win.on('close', function (w) {
            if (w.result) {
                // è stata eseguita una db.create
                that.store.reload();
            }
        });
    },

    deleteRecords: function () {
        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare il limite selezionato?', function (b) {
            if (b === 'yes') {
                this.store.remove(this.getSelectionModel().getSelected());
            }
        }, this);
    },

    // Sostituisce le virgole con i punti nel campo 'value'
    validateEdit: function (e) {
        e.value = e.value.replace(",", ".");
    }
});



Lab.LimitForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        config = Ext.apply({
            title:      'Dati',
            iconCls:    'icon-small-clipboard-text',
            padding:    10,
            defaults: {
                anchor: '-20'
            },
            items: [{
                xtype:      'hidden',
                name:       'id'
            },
            {
                xtype:      'hidden',
                name:       'group_id',
                value:      config.groupID
            },
            {
                xtype:      'denominationcombo',
                allowBlank: false,
                fieldLabel: 'Denominazione',
                id:         'limitDenominationCombo',
                listeners: {
                    select: function (combo, record) {
                        combo.ownerCt.aliasField.setValue(record.data.alias);
                    }
                }
            },
            {
                xtype:      'hidden',
                name:       'denomination_alias',
                ref:        'aliasField'
            },
            {
                xtype:      'prefixcombo',
                fieldLabel: 'Prefisso',
                name:       'prefix_id'
            },
            {
                xtype:      'umcombo',
                allowBlank: false,
                fieldLabel: 'Unità di misura',
                name:       'unit_id'
            },
            {
                xtype:      'textarea',
                allowBlank: false,
                fieldLabel: 'Valore',
                name:       'value'
            },
            {
                xtype:      'panel',
                padding:    5,
                html: 'Esempio di sintassi:' +
                      '<pre>' +
                          '<br>&nbsp;&nbsp;&gt;0.6<br>' +
                          '&nbsp;&nbsp;&lt;1.51' +
                      '</pre><br>' +
                      'senza spazi, a capo dopo ciascuno; oppure:' +
                      '<pre>' +
                          '<br>&nbsp;&nbsp;Assenti<br>' +
                          '&nbsp;&nbsp;Assente' +
                      '</pre>'

            }]
        }, config);

        Lab.LimitForm.superclass.constructor.call(this, config);
    }
});

Ext.reg('limitsgrid', Lab.LimitsGrid);
Ext.reg('limitform', Lab.LimitForm);
