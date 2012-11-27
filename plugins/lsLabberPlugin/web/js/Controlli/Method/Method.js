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
 * FormPanel di un Method
 */
Lab.MethodData = Ext.extend(Ext.FormPanel, {

    constructor: function (config) {
        
        var unitCombo = new Ext.form.ComboBox({
            fieldLabel:     '<b>Laboratorio</b>',
            hiddenName:     'unit_id',
            allowBlank:     false,
            forceSelection: true,
            triggerAction:  'all',
            displayField:   'name',
            valueField:     'id',
            store: new Lab.sfDirectStore({
                autoDestroy:    true,
                autoLoad:       false,
                baseParams: {
                    doctrineClass:  'Unit',
                    sort:           'name'
                 },
                fields:         ['id', 'name']
            })
        }),

        organizationCombo = new Lab.OrganizationCombo({
            fieldLabel: '<b>Ente</b>',
            hiddenName: 'organization_id',
            allowBlank: false
        }),

        umCombo = new Lab.UMCombo({
            fieldLabel: 'Unità di misura',
            hiddenName: 'um_id'
        }),

        prefixCombo = new Lab.PrefixCombo({
            fieldLabel: 'Scala',
            hiddenName: 'prefix_id'
        }),

        atCombo = new Lab.AnalyticalTecniqueCombo({
            fieldLabel: 'Tecnica analitica',
            hiddenName: 'analytical_technique_id'
        });

        config = Ext.apply({
            title:      'Dati',
            autoScroll: true,
            border:     false,
            labelWidth: 150,
            padding:    5,
            defaults: {
                anchor: '-20',
                xtype:  'textfield'
            },
            items: [{
                xtype:  'hidden',
                name:   'id'
            },
            {
                fieldLabel: '<b>Nome</b>',
                name:       'name'
            },
            {
                xtype:      'textarea',
                fieldLabel: 'Descrizione',
                height:     45,
                name:       'description'
            },
            unitCombo,
            organizationCombo,
            atCombo,
            {
                xtype: 'columnfield',
                left: prefixCombo,
                right: umCombo
            },
            {
                xtype: 'columnfield',
                left: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    allowNegative: false,
                    fieldLabel: 'Cifre decimali',
                    name: 'max_decimal_digits'
                },
                right: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    allowNegative: false,
                    fieldLabel: 'Cifre significative',
                    name: 'significant_digits'
                }
            },
            {
                xtype: 'columnfield',
                left: {
                    xtype: 'numberfield',
                    fieldLabel: 'LOQ',
                    name: 'loq',
                    allowNegative: false,
                    decimalPrecision: 5
                },
                right: {
                    xtype: 'numberfield',
                    fieldLabel: 'LOD',
                    name: 'lod',
                    allowNegative: false,
                    decimalPrecision: 5
                }
            },
            {
                xtype: 'numberfield',
                allowDecimals: false,
                allowNegative: false,
                fieldLabel: 'Tempo minimo (in giorni)',
                name: 'days'
            },
            {
                fieldLabel: 'Numero interno',
                name: 'internal_number'
            },
            {
                fieldLabel: '<b>Nome sul rapporto</b>',
                name: 'sinal_name',
                allowBlank: false
            },
            {
                xtype: 'numberfield',
                fieldLabel: 'Costo',
                name: 'cost',
                allowNegative: false
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Note',
                name: 'report_footer'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Da confermare',
                name: 'unconfirmed',
                checked: true
            }]
        }, config);

        Lab.MethodData.superclass.constructor.call(this, config);
    }
});

Ext.reg('methoddata', Lab.MethodData);

/* Grid principale per tutti i metodi */
Lab.MethodGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var self = this, pageSize = 25,

        sfStore = new Lab.sfDirectStore({
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    // mostra di default i metodi attivi
                    filters: {
                        unconfirmed: {
                            field:      'unconfirmed',
                            operator:   '=',
                            value:      0
                        }
                    }
                }
            },
            baseParams: {
                doctrineClass: 'Method',
                doctrineJoins: ['Method.Organization', 'Method.Unit', 'Method.Files']
            },
            fields: ['id', 'name', 'description', 'organization_id',
            'prefix_id', 'analytical_technique_id', 'um_id',
            'unit_id', 'price', 'report_footer', 'internal_number',
            'sinal_name', 'significant_digits', 'max_decimal_digits', 'days',
            'estimate_days', 'unconfirmed', 'created_at', 'updated_at',
            {
                name: 'cost',
                type: 'number',
                useNull: true
            },
            {
                name: 'loq',
                type: 'float',
                useNull: true
            },
            {
                name: 'lod',
                type: 'float',
                useNull: true
            },
            {
                name: 'Organization.short_name',
                mapping: 'Organization ? obj.Organization.short_name : null'
            },
            {
                name: 'Unit.name',
                mapping: 'Unit ? obj.Unit.name : null'
            }],
            pageSize: pageSize
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                menuDisabled: true,
                width: 200,
                editable: false
            },
            columns: [{
                header: 'Ente',
                dataIndex: 'Organization.short_name'
            },            
            {
                header: 'Nome',
                dataIndex: 'name'
            },
            {
                header: 'Descrizione',
                dataIndex: 'description'
            },
            {
                header: "Laboratorio",
                dataIndex: 'Unit.name'
            },
            {
                xtype: 'numbercolumn',
                header: "Costo",
                dataIndex: 'cost',
                width: 100,
                align: 'right',
                format: '0.000,00/i'
            },
            {
                header: 'Data di creazione',
                dataIndex: 'updated_at'
            },
            {
                xtype: 'actioncolumn',
                header: 'Allegati',
                width: 50,
                renderer: function (v, m, r) {
                    if (Ext.isEmpty(r.json.Files))
                        m.css = 'method-grid-displaynone';
                },
                items: [{
                    icon: Lab.CONFIG.root_dir + '/images/icons/paper-clip.png',
                    tooltip: 'Mostra allegati',
                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.store.getAt(rowIndex),

                        win = new Ext.Window({
                            width: 500,
                            height: 300,
                            layout: 'fit',
                            modal: true,
                            plain: true,
                            title: 'Allegati',
                            items: new Lab.AttachmentFileGrid({
                                doctrineClass: 'MethodFile',
                                doctrineField: 'method_id',
                                objectId: record.id,
                                uploadDir: 'methods',
                                tbar: null,
                                title: null
                            })
                        });

                        win.show();
                    }
                }]
            }]
        }),

        toolbars = new Ext.Panel({
            border: false,
            items: [{
                xtype:  'filteringtoolbar',
                store:  sfStore,
                items: [{
                    xtype:          'combo',
                    name:           'Unit.id',
                    emptyText:      'Laboratorio',
                    displayField:   'name',
                    valueField:     'id',
                    triggerAction:  'all',
                    store: new Lab.sfDirectStore({
                        autoDestroy:    true,
                        autoLoad:       false,
                        baseParams: {
                            doctrineClass:  'Unit',
                            sort:           'name'
                        },
                        fields: ['id', 'name']
                    })
                },
                ' ',
                {
                    xtype:          'combo',
                    emptyText:      'Confermati?',
                    name:           'unconfirmed',
                    triggerAction:  'all',
                    store:          [[0, 'Confermati'], [1, 'Non confermati']],
                    value:          0
                }]
            },
            new Ext.Toolbar({
                items: [{
                    text: 'Nuovo',
                    iconCls: 'icon-small-add',
                    tooltip: 'Aggiunge un metodo',
                    handler: this.newWindow,
                    scope: this
                },
                {
                    text:       'Copia',
                    iconCls:    'icon-method-copy',
                    tooltip:    'Copia da altro metodo',
                    handler:    self.copyMethod,
                    scope:      self
                },
                {
                    text: 'Elimina',
                    iconCls: 'icon-small-minus',
                    tooltip: 'Elimina un metodo',
                    handler: this.removeRecord,
                    scope: this
                },
                '->',
                {
                    xtype: 'filterfield',
                    store: sfStore,
                    name: 'name',
                    emptyText: 'Filtra per nome'
                },
                ' ',
                {
                    xtype: 'filterfield',
                    store: sfStore,
                    name: 'description',
                    emptyText: 'Filtra per descrizione'
                }]
            })]
        });

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo: true,
                displayMsg: 'Metodi da {0} a {1} di {2}',
                pageSize: pageSize,
                store: sfStore
            }),
            border: false,
            listeners: {
                rowdblclick: function (grid, rowNumber) {
                    var record = grid.getStore().getAt(rowNumber);
                    this.editWindow(record);
                }
            },
            colModel: colModel,
            loadMask: true,
            store: sfStore,
            stripeRows: true,
            tbar: toolbars,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.MethodGrid.superclass.constructor.call(this, config);
    },

    newWindow: function () {
        var win = new Lab.ObjectWindow({
            title: 'Nuovo metodo',
            iconCls: 'icon-method',
            doctrineClass: 'Method',
            width: 800, height: 550,
            minWidth: 600, minHeight: 400,
            store: this.store,
            tabItems: [new Lab.MethodData({
                iconCls: 'icon-small-clipboard-text'
            })]
        });

        win.on('close', function (w) {
            if (w.newRecord) {
                this.editWindow(w.newRecord);
            }
        }, this);

        win.show();
    },

    editWindow: function (record) {
        var win = new Lab.ObjectWindow({
            title: 'Modifica "' + record.data.name + '"',
            iconCls: 'icon-method',
            width: 800, height: 550,
            minWidth: 600, minHeight: 400,
            doctrineClass: 'Method',
            record: record,
            tabItems: [new Lab.MethodData({
                iconCls: 'icon-small-clipboard-text',
                recordId: record.id
            }),
            new Lab.MethodMatrixGrid({
                title: 'Matrici',
                iconCls: 'icon-matrix',
                method: record
            }),
            new Lab.MethodDenominationGrid({
                iconCls: 'icon-denomination',
                methodId: record.id
            }),
            new Lab.MethodUnitOfMeasurementGrid({
                iconCls: 'icon-unitOfMeasurement',
                methodId: record.id
            }),
            new Lab.MethodFieldGrid({
                iconCls: 'icon-fieldType',
                methodId: record.id
            }),
            new Lab.MethodConstantGrid({
                iconCls: 'icon-methodConstant',
                methodId: record.id
            }),
            new Lab.MethodRuleGrid({
                iconCls: 'icon-rule',
                method: record
            }),
            new Lab.MethodDeterminationTypeGrid({
                methodId: record.id
            }),
            new Lab.AttachmentFileGrid({
                doctrineClass: 'MethodFile',
                doctrineField: 'method_id',
                objectId: record.id,
                uploadDir: 'methods'
            })]
        });

        win.on('close', function (w) {
            if (w.result) {
                this.store.reload({
                    // riseleziona la riga del record editato
                    callback: function () {
                        this.getSelectionModel().selectRow(this.store.indexOfId(record.id));
                    },
                    scope: this
                });
            }
        }, this);

        // Aggiunge un tooltip al bottone 'OK'
        win.buttons[0].setTooltip('Salva e rigenera controlli');

        win.show();
    },

    copyMethod: function () {
        var copyWin = new Ext.Window({
            title: 'Copia metodo',
            width: 400,
            height: 210,
            bodyStyle: 'background-color:#fff',
            layout: 'fit',
            modal: true,
            padding: 10,
            resizable: false,
            items: [{
                xtype: 'form',
                border: false,
                monitorValid: true,
                buttons: [{
                    text: 'Copia',
                    formBind: true,
                    handler: function (b) {
                        var form = b.ownerCt.ownerCt.getForm();
                        Lab.method.copy({
                            data: form.getValues()
                        }, function () {
                            copyWin.close();
                            this.store.reload();
                        }, this);
                    },
                    scope: this
                }],
                defaults: {
                    allowBlank: false,
                    anchor: '-20'
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Nome',
                    name: 'name'
                },
                {
                    xtype: 'methodcombo',
                    fieldLabel: 'Metodo origine',
                    hiddenName: 'sourceMethodId'
                },
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Importa',
                    columns: 2,
                    defaults: {
                        name: 'associations'
                    },
                    items: [{
                        boxLabel: 'Dati',
                        inputValue: 'data',
                        checked: true
                    },
                    {
                        boxLabel: 'Denominazioni',
                        inputValue: 'denominations'
                    },
                    {
                        boxLabel: 'Matrici',
                        inputValue: 'matrices'
                    },
                    {
                        boxLabel: 'Unità di misura',
                        inputValue: 'units'
                    },
                    {
                        boxLabel: 'Parametri',
                        inputValue: 'parameters'
                    },
                    {
                        boxLabel: 'Costanti',
                        inputValue: 'constants'
                    }]
                }]
            }]
        });
        copyWin.show();
    },

    removeRecord: function (b) {
        if (this.getSelectionModel().hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare i metodi selezionati?', function (b) {
                if (b === 'yes') {
                    this.store.remove(this.getSelectionModel().getSelections());
                }
            }, this);
        } else {
            Lab.flash.msg('Errore', 'Seleziona almeno un metodo da eliminare');
        }
    }
});

Ext.reg('methodgrid', Lab.MethodGrid);


Lab.ColumnField = Ext.extend(Ext.Panel, {
    constructor: function(config) {

        config = Ext.apply({
            layout: 'column',
            border: false,
            defaults: {
                // default per entrambe le colonne
                columnWidth: 0.5,
                layout: 'form',
                border: false,
                xtype: 'panel',
                labelWidth: 150
            },
            items: [{
                // colonna sinistra
                defaults: {
                    anchor: '100%',
                    border: false
                },
                items: [config.left]
            },
            {
                // colonna destra
                defaults: {
                    anchor: '100%',
                    border: false
                },
                bodyStyle: 'padding-left:12px',
                items: [config.right]
            }]
        }, config);

        Lab.ColumnField.superclass.constructor.call(this, config);
    }

});

Ext.reg('columnfield', Lab.ColumnField);
