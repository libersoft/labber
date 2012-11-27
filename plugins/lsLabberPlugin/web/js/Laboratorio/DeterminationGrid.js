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
 * La griglia dei controlli mostrata in Laboratorio.
 */
Lab.LaboratorioAnalysesGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,

        filters = new Ext.ux.grid.GridFilters({
            encode: true,
            local: true,
            menuFilterText: 'Filtra'
        }),

        newLineOnEnter = function (field, e) {
            if (e.getKey() === e.ENTER) {
                e.stopEvent();

                var sm = self.getSelectionModel(),
                sc = sm.getSelectedCell();

                self.stopEditing();

                if (sc[0] + 1 < analysesStore.getCount()) {
                    sm.select(sc[0] + 1, sc[1]);
                } else {
                    sm.select(0, sc[1]);
                }
                return;
            }
        },

        printColumn = new Ext.grid.CheckColumn({
            header: 'Stampa',
            dataIndex: 'stampa',
            width: 75
        }),       

        columnModel = new Ext.grid.ColumnModel({
            defaults: {
                filterable: false,
                filter: {
                    type: 'string'
                },
                sortable: true,
                width: 150
            },
            columns: [new Ext.grid.RowNumberer(),
            {
                header: 'Numero campione',
                dataIndex: 'Samplenumero',
                width: 120
            },
            {
                header: 'Denominazione',
                dataIndex: 'Denominationname'
            },
            {
                header: 'Metodo',
                dataIndex: 'Methodname'
            },
            {
                header: 'Unità di misura',
                dataIndex: 'um',
                align: 'right',
                width: 100
            },
            {
                header: 'Valore',
                dataIndex: 'valore_inserito',
                editor: {
                    xtype: 'numberfield',
                    allowNegative: false,
                    decimalPrecision: 7,
                    decimalSeparator: '.',
                    listeners: { specialKey: newLineOnEnter },
                    selectOnFocus: true,
                    vtype: 'valoreDeterminazione'
                },
                width: 100,
                align: 'right',
                tooltip: 'Valore dell\'analisi inserito manualmente',
                css: 'background-color: #ccccff;'
            },
            {
                header: 'Risultato',
                dataIndex: 'risultato_formattato',
                width: 100,
                align: 'right',
                tooltip: 'Risultato formattato secondo metodo',
                css: 'background-color: #6666ff;'
            },
            {
                header: 'Incertezza',
                dataIndex: 'uncertainty'
            },
            {
                header: 'Limiti',
                dataIndex: 'limiti'
            },
            {
                header: 'Alias denominazione',
                dataIndex: 'denomination_alias'
            },
            {
                header: 'Reparto',
                dataIndex: 'MethodUnitname'
            },
            {
                header: 'LOQ',
                dataIndex: 'loq'
            },
            {
                header: 'LOD',
                dataIndex: 'lod'
            },
            {
                header: 'Parametri',
                dataIndex: 'params',
                width: 255
            },
            {
                header: 'Recupero',
                dataIndex: 'recovery'
            },
            {
                header: 'Tipo controllo',
                dataIndex: 'tipo_controllo',
                width: 100
            },
            {
                header: 'Data inzio',
                dataIndex: 'data_inizio',
                editor: {
                    xtype: 'datefield',
                    format: 'd/m/Y',
                    listeners: {
                        specialKey: newLineOnEnter
                    },
                    selectOnFocus: true
                },
                renderer: function (v) {
                    return Ext.util.Format.date(v, 'd/m/Y');
                },
                filter: {
                    type: 'dateIt'
                }
            },
            {
                header: 'Data fine',
                dataIndex: 'data_fine',
                editor: {
                    xtype: 'datefield',
                    format: 'd/m/Y',
                    selectOnFocus: true,
                    listeners: {
                        specialKey: newLineOnEnter
                    }
                },
                renderer: function (v) {
                    return Ext.util.Format.date(v, 'd/m/Y');
                },
                filter: {
                    type: 'dateIt'
                }
            },
            {
                header: 'Data scadenza',
                dataIndex: 'data_scadenza',
                editor: {
                    xtype: 'datefield',
                    format: 'd/m/Y',
                    selectOnFocus: true,
                    listeners: {
                        specialKey: newLineOnEnter
                    }
                },
                renderer: function (v) {
                    return Ext.util.Format.date(v, 'd/m/Y');
                },
                filter: {
                    type: 'dateIt'
                }
            },
            {
                header:     'Priorità',
                dataIndex:  'priorita',
                xtype:      'defconcolumn',
                editor: {
                    xtype:          'combo',
                    fieldLabel:     'Priorità',
                    hiddenName:     'priorita',
                    triggerAction:  'all',
                    editable:       false,
                    mode:           'local',
                    store:          [[4, 'Normale'], [3, 'Urgente'], [2, 'Urgentissimo']]
                }
            },
            {
                header: 'Nota del laboratorio',
                dataIndex: 'nota_laboratorio'
            }, printColumn,
            {
                header: 'Cliente',
                dataIndex: 'fullname'
//                renderer: function (value, metadata, record, rowIndex, colIndex, store) {
//                    if (record.data.contactnote != null) metadata.attr = 'ext:qtip="' + record.data.contactnote + '" ext:qtitle="<h3>Note Cliente:</h3>"';
//                    else metadata.attr = 'ext:qtip="" ext:qtitle="<h3>Note Cliente:</h3>"';
//                    return value;
//                }
            },
            {
                header: 'N. Ordine',
                dataIndex: 'ordername',
                width: 160
            }],

            isCellEditable: function(col, row) {
                var record = analysesStore.getAt(row);
                if (record.get('Samplestato') < 3) {
                    return Ext.grid.ColumnModel.prototype.isCellEditable.call(this, col, row);
                }
                return false;
            }
        }),

        analysesStore = new Ext.data.GroupingStore({
            autoDestroy: true,
            baseParams: {
                doctrineClass: 'Determination'
            },
            proxy: new Ext.data.DirectProxy({
                api: {
                    create: Lab.db.create,
                    read: Lab.determination.labList,
                    update: Lab.determination.labUpdate,
                    destroy: Lab.db.destroy
                }
            }),
            reader: new Ext.data.JsonReader({
                root: 'data',
                totalProperty: 'total',
                idProperty: 'id',
                remoteSort: false,
                fields: ['id', 'ordername', 'Denominationname', 'Methodname', 'MethodUnitname',
                'Samplenumero', 'sample_id', 'um', 'tipo_controllo', 'priorita',
                'nota_laboratorio', 'cifre_decimali', 'cifre_significative',
                'risultato_formattato', 'storico', 'limiti', 'denomination_alias', 'fullname',
                'uncertainty', 'recovery', 'loq', 'lod', 'Samplestato',
                {
                    name: 'valore_inserito',
                    type: 'number',
                    useNull: true
                },
                {
                    name: 'data_inizio',
                    type: 'date',
                    dateFormat: 'Y-m-d'
                },
                {
                    name: 'data_fine',
                    type: 'date',
                    dateFormat: 'Y-m-d'
                },
                {
                    name: 'data_scadenza',
                    type: 'date',
                    dateFormat: 'Y-m-d'
                },
                {
                    name: 'stampa',
                    type: 'bool'
                },
                {
                    name: 'conforme',
                    type: 'bool'
                },
                {
                    name: 'params',
                    convert: Lab.utils.implode
                }]
            }),
            remoteGroup: false,
            writer: new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: false
            })
        }),

        topToolbar = new Ext.Panel({
            border: false,
            items: [{
                xtype: 'filteringtoolbar',
                hideButton: true,
                itemId: 'filteringToolbar',
                store: analysesStore,
                items: [{
                    xtype: 'combo',
                    itemId: 'sampleNumberCombo',
                    name: 'd.sample_id',
                    emptyText: 'Campione',
                    displayField: 'numero',
                    valueField: 'id',
                    triggerAction: 'all',
                    minChars: 3,
                    store: new Lab.sfDirectStore({
                        autoDestroy: true,
                        autoLoad: false,
                        baseParams: {
                            doctrineClass: 'Sample',
                            doctrineWheres: [{
                                field: 'bozza',
                                operator: '=',
                                value: 'false'
                            }],
                            displayField: 'numero'
                        },
                        fields: ['id', 'numero'],
                        sortInfo: {
                            field: 'numero',
                            direction: 'DESC'
                        }
                    })
                },
                ' ',
                {
                    xtype: 'clearcombo',
                    name: 'u.id',
                    emptyText: 'Reparto',
                    disabled: true,
                    displayField: 'name',
                    valueField: 'id',
                    triggerAction: 'all',
                    store: new Lab.sfDirectStore({
                        autoDestroy: true,
                        autoLoad: false,
                        baseParams: {
                            doctrineClass: 'Unit',
                            sort: 'name'
                        },
                        fields: ['id', 'name']
                    })
                },
                ' ',
                {
                    xtype:          'clearcombo',
                    name:           'd.valore_inserito',
                    disabled:       true,
                    triggerAction:  'all',
                    mode:           'local',
                    store: new Ext.data.ArrayStore({
                        id: 0,
                        fields: [
                        'myId',
                        'displayText'
                        ],
                        data: [['IS', 'Da valorizzare'], ['IS NOT', 'Valorizzati']]
                    }),
                    valueField: 'myId',
                    displayField: 'displayText',
                    listeners: {
                        select: function (combo) {
                            var lastOptions = (analysesStore.lastOptions) ? analysesStore.lastOptions : {params: {}},

                            filter = {
                                field:      combo.name,
                                operator:   combo.getValue(),
                                value:      null
                            };

                            if (!lastOptions.params.filters) {
                                lastOptions.params.filters = {};
                            }
                            lastOptions.params.filters[combo.name] = filter;
                            lastOptions.params.start = 0;

                            analysesStore.reload(lastOptions);
                        },
                        cleared: function (field) {
                            var lastOptions = config.store.lastOptions;
                            delete lastOptions.params.filters[field.name];
                            config.store.reload(lastOptions);
                        }
                    }
                }]
            }]
        });

        // Mostra gli storici se attivati nelle preferenze
        if (Lab.CONFIG.histories) {
            var columns = columnModel.config;
            columns.push({
                xtype: 'actioncolumn',
                width: 50,
                items: [{
                    icon: Lab.CONFIG.root_dir+'/images/icons/blog.png',
                    tooltip: 'Storico',
                    handler: Lab.utils.historyWindow
                }]
            });
            columnModel.setConfig(columns, true);
        }

        config = Ext.apply({
            border: false,
            clicksToEdit: 1,
            colModel: columnModel,
            loadMask: true,
            plugins: [printColumn, filters],
            stateful: true,
            stateId: 'laboratorioanalysesgrid',
            store: analysesStore,
            stripeRows: true,
            tbar: topToolbar,
            view: new Ext.grid.GroupingView({
                deferEmptyText: false,
                emptyText: 'Selezionare un campione...',
                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Controlli" : "Controllo"]})',
                getRowClass: function (record) {
                    return (record.data.conforme) ? '' : 'laboratorio-determination-grid-nonconforme';
                }
            })
        }, config);

        Lab.LaboratorioAnalysesGrid.superclass.constructor.call(this, config);

        this.getTopToolbar().get('filteringToolbar').get('sampleNumberCombo').on('beforeselect', function () {
            this.ownerCt.items.each(function () {
                this.enable();
            });
        });

        this.on('afterrender', function () {
            this.getTopToolbar().get('filteringToolbar').get('sampleNumberCombo').focus();
        });

        // rimuove l'emptyText della view dopo il primo load dello store
        this.getStore().on('load', function () {
            delete this.getView().emptyText;
        }, this);
    }
});

Ext.reg('laboratorioanalysesgrid', Lab.LaboratorioAnalysesGrid);
