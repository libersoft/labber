/*global
    Ext: true,
    Lab: true
 */

"use strict";

Ext.ns('Lab');

/**
 * La griglia dei campioni mostrata in Laboratorio
 */
Lab.LaboratorioSamplesGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        // create reusable renderer
        Ext.util.Format.comboRenderer = function (combo) {
            return function (value) {
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : combo.valueNotFoundText;
            }
        }

        var statuses = [['0', 'In esecuzione'], ['1', 'Completato'], ['2', 'Stampato'], ['3', 'Validato']],

        flags = [['0', 'Da Stampare'], ['1', 'Stampato']],

        // create the combo instance
        statusCombo = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            store: statuses
        }),

        rdp_choice = new Ext.form.ComboBox({
            baseParams: {
                doctrineClass: 'Rdp'
            },
            typeAhead: true,
            triggerAction: 'all',
            forceSelection: true,
            pageSize: 20,
            emptyText: 'Rapporto di prova',
            itemId: 'rdp_choice',
            store: new Lab.sfDirectStore({
                remoteSort: true,
                fields: [
                {
                    name: 'id'
                },
                {
                    name: 'name',
                    type: 'string'
                }],
                baseParams: {
                    doctrineClass: 'Rdp',
                    sort: 'name'
                },
                autoLoad: false,
                autosave: true
            }),
            valueField: 'id',
            displayField: 'name'
        }),

        self = this,

        pageSize = 20,

        dateRenderer = Ext.util.Format.dateRenderer('d/m/Y'),

        fullName = function (v, record) {
            if (record.Order.Contact) {
                if (record.Order.Contact.alias != null) {
                    return record.Order.Contact.alias + ' - ' + record.Order.Contact.name;
                }
                else {
                    return record.Order.Contact.name;
                }
            } else {
                return null;
            }
        },

        sfStore = new Lab.sfDirectStore({
            autoLoad: {
                params: {
                    start:  0,
                    limit:  pageSize,
                    // mostra di default i campioni in esecuzione
                    filters: {
                        stato: {
                            field:      'stato',
                            operator:   '=',
                            value:      0
                        }
                    }
                }
            },
            autoSave:   true,
            baseParams: {
                doctrineClass: 'Sample',
                doctrineJoins: ['Sample.Order.Contact', 'Sample.MatrixGroup', 'Sample.Files'],
                doctrineWheres: [{
                    field: 'bozza',
                    operator: '=',
                    value: 'false'
                }],
                dir: 'DESC'
            },
            fields: [{
                name: 'id'
            },
            {
                name: 'numero'
            },
            {
                name: 'Order.numero',
                mapping: 'Order ? obj.Order.numero : null'
            },
            {
                name: 'order_id'
            },
            {
                name: 'bozza'
            },
            {
                name: 'sample_type_id'
            },
            {
                name: 'MatrixGroup.name',
                mapping: 'MatrixGroup ? obj.MatrixGroup.name : null'
            },
            {
                name: 'gruppo_matrice'
            },
            {
                name: 'codcliente'
            },
            {
                name: 'descrizione'
            },
            {
                name: 'data_campionamento',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'acuradi'
            },
            {
                name: 'metodo_campionamento'
            },
            {
                name: 'campionatore'
            },
            {
                name: 'luogo_campionamento'
            },
            {
                name: 'data_prelievo',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'prelevato_da'
            },
            {
                name: 'addetto_prelievo'
            },
            {
                name: 'luogo_prelievo'
            },
            {
                name: 'data_ritiro',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'ritirato_da'
            },
            {
                name: 'ritiratore'
            },
            {
                name: 'luogo_ritiro'
            },
            {
                name: 'temperatura'
            },
            {
                name: 'stampa_temperatura'
            },
            {
                name: 'condizioni'
            },
            {
                name: 'data_scadenza',
                type: 'date',
                dateFormat: 'Y-m-d'
            },
            {
                name: 'trasportatore'
            },
            {
                name: 'trasporto'
            },
            {
                name: 'notalab'
            },
            {
                name: 'storico'
            },
            {
                name: 'conforme',
                type: 'bool'
            },
            {
                name: 'stato'
            },
            {
                name: 'Order.Contact.name',
                type: 'string',
                convert: fullName
            },
            {
                name: 'early'
            },
            {
                name: 'printed'
            },
            {
                name: 'print_date',
                convert: function (v, record) {
                    if(record.storico != null){
                        var jstorico = Ext.util.JSON.decode(record.storico),
                        i = jstorico.length - 1;
                        while(i >= 0){
                            if(jstorico[i].action == 'print' | jstorico[i].action == 'rdp_early' | jstorico[i].action == 'rdp_supplement'){
                                var date = new Date(jstorico[i].timestamp*1000);
                                return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
                            }
                            i--;
                        }
                    }
                    return '';
                }
            },
            {
                name: 'to_send',
                mapping: 'Order ? obj.Order.to_send : null'
            },
            {
                name: 'Order.arrived_at',
                type: 'date',
                dateFormat: 'Y-m-d H:i:s'
            },
            {
                name: 'certificate',
                convert: function (v, record) {
                    var file = '';
                    Ext.each(record.Files, function (item) {
                        if (item.certificate) {
                            file = item.file;
                        }
                    });
                    if (file !== '') {
                        return '<a target="_blank" href="/uploads/samples/'+file+'">'+file+'</a>';
                    }
                }
            }],
            pageSize: pageSize,
            listeners: {
                update: function (store, record) {
                    if (self.ownerCt.initialConfig.xtype == 'laboratoriocompositegrid') {
                        self.ownerCt.items.items[1].store.reload();
                    }
                }
            }
        }),

        actionColumn = {
            xtype: 'actioncolumn',
            menuDisabled: true,
            width: 64,
            items: [{
                icon: Lab.CONFIG.root_dir + '/images/icons/edit-list-order.png',
                tooltip: 'Ordina controlli',
                handler: this.orderDeterminations
            }]
        },

        columns = [{
            header: 'Cliente',
            dataIndex: 'Order.Contact.name'
//            renderer: function (value, metadata, record, rowIndex, colIndex, store) {
//                if (record.data.contactnote != null) {
//                    metadata.attr = 'ext:qtip="' + record.data.contactnote + '" ext:qtitle="<h3>Note Cliente:</h3>"';
//                }
//                else {
//                    metadata.attr = 'ext:qtip="" ext:qtitle="<h3>Note Cliente:</h3>"';
//                }
//                return value;
//            },
        },
        {
            header: 'N. Ordine',
            dataIndex: 'Order.numero'
        },
        {
            header: 'N. Campione',
            dataIndex: 'numero'
        },
        {
            header: 'Matrice',
            dataIndex: 'MatrixGroup.name'
        },
        {
            header: 'Descrizione',
            width: 250,
            dataIndex: 'descrizione'
        },
        {
            header: 'Nota laboratorio',
            dataIndex: 'notalab'
        },
        {
            header: 'Data scadenza',
            dataIndex: 'data_scadenza',
            renderer: dateRenderer
        },
        {
            header: 'Stato',
            dataIndex: 'stato',
            editor: statusCombo,
            renderer: Ext.util.Format.comboRenderer(statusCombo)
        },
        {
            header: 'Codice riferimento cliente',
            dataIndex: 'codcliente'
        },
        {
            header: 'Data arrivo',
            dataIndex: 'Order.arrived_at',
            renderer: dateRenderer
        },
        {
            header: 'Condizioni',
            dataIndex: 'condizioni'
        },
        {
            header: 'Anticipato',
            width: 70,
            dataIndex: 'early',
            renderer: function (value) {
                return value ? 'Sì' : 'No';
            }
        },
        {
            header: 'Stampato',
            width: 70,
            dataIndex: 'printed',
            renderer: function (value) {
                return value ? 'Sì' : 'No';
            }
        },
        {
            header: 'Data stampa',
            width: 150,
            dataIndex: 'print_date',
            sortable: false
        },
        {
            header: 'Certificato',
            dataIndex: 'certificate',
            width: 175,
            sortable: false
        }, actionColumn],

        filters = new Ext.ux.grid.GridFilters({
            local:          true,       //only filter locally,
            menuFilterText: 'Filtri',
            // filters may be configured through the plugin,
            // or in the column definition within the column model configuration
            filters: [{
                type:       'date',
                dataIndex:  'data_scadenza',
                dateFormat: 'd/m/Y',
                beforeText: 'Prima del',
                afterText:  'Dopo il',
                onText:     'Il'
            },
            {
                type:       'date',
                dataIndex:  'Order.arrived_at',
                dateFormat: 'd/m/Y',
                beforeText: 'Prima del',
                afterText:  'Dopo il',
                onText:     'Il'
            }]
        }),

        topToolbar = new Ext.Panel({
            border: false,
            items: [{
                xtype: 'filteringtoolbar',
                itemId: 'filteringToolbar',
                items: [{
                    xtype: 'clearcombo',
                    itemId: 'sampleNumberCombo',
                    name: 'numero',
                    emptyText: 'Campione',
                    displayField: 'numero',
                    valueField: 'numero',
                    triggerAction: 'all',
                    store: new Lab.sfDirectStore({
                        autoDestroy: true,
                        autoLoad: false,
                        baseParams: {
                            doctrineClass: 'Sample',
                            sort: 'numero'
                        },
                        fields: ['id', 'numero']
                    })
                },
                ' ',
                {
                    xtype: 'clearcombo',
                    name: 'order_id',
                    emptyText: 'Ordine',
                    displayField: 'numero',
                    valueField: 'id',
                    triggerAction: 'all',
                    store: new Lab.sfDirectStore({
                        autoDestroy: true,
                        autoLoad: false,
                        baseParams: {
                            doctrineClass: 'Order',
                            sort: 'numero'
                        },
                        fields: ['id', 'numero']
                    })
                },
                ' ',
                {
                    xtype:          'clearcombo',
                    emptyText:      'Stato',
                    name:           'stato',
                    triggerAction:  'all',
                    store:          statuses,
                    value:          0
                },
                ' ',
                {
                    xtype: 'clearcombo',
                    name: 'Order.Contact.id',
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
                }],
                store: sfStore
            },
            {
                xtype: 'toolbar',
                items: [{
                    text:       'Valida',
                    iconCls:    'icon-small-script-stamp',
                    hidden:     Lab.CONFIG.user.permissions.indexOf('validate') == -1,
                    handler: function () {
                        var selected = self.getSelectionModel().getSelected();
                        if (selected) {
                            switch (selected.data.stato) {
                                case '0':
                                    Lab.flash.msg('Errore', 'Non puoi validare un campione in esecuzione');
                                    break;
                                case '1': case '2':
                                    // de-JSONizzo se già esiste, array vuoto altrimenti
                                    var storico = (selected.data.storico) ? Ext.util.JSON.decode(selected.data.storico) : [];
                                    storico.push({
                                        user:       Lab.CONFIG.user.userid,
                                        action:     'validated',
                                        value:      true,
                                        timestamp:  new Date().format('U')
                                    });
                                    selected.set('stato',   3);
                                    selected.set('storico', Ext.util.JSON.encode(storico));
                                    self.store.save();
                                    if(!selected.data.to_send){
                                        Ext.MessageBox.show({
                                            height: 300,
                                            width: 300,
                                            buttons: Ext.Msg.OK,
                                            title: 'Attenzione',
                                            msg: 'NON spedire il rapporto di prova al cliente'
                                        });
                                    }
                                    break;
                                case '3':
                                    Lab.flash.msg('Errore', 'Campione già validato');
                                    break;
                                default:
                                    Lab.flash.msg('Errore', 'Guru Meditation');
                            }
                        }
                    }
                },
                '->',
                {
                    text: 'Salva certificati',
                    iconCls: 'icon-report',
                    hidden: Lab.printodt === undefined,
                    handler: function () {
                        var selected = self.getSelectionModel().getSelected();
                        if (selected) {
                            Ext.MessageBox.show({
                                msg: 'Salvataggio rdp, attendere prego...',
                                progressText: 'Salvataggio...',
                                width:300,
                                wait:true,
                                waitConfig: {
                                    interval:200
                                },
                                icon:'icon-disc'
                            });
                            Lab.printodt.cda({
                                sampleID: selected.id,
                                keys: self.getSelectionModel().selections.keys,
                                supp_nb: self.topToolbar.items.items[1].getComponent('suppl_nb').getValue(),
                                date: self.topToolbar.items.items[1].getComponent('date_rdp').getValue()
                            },
                            function (result) {
                                this.result = result;

                                if (result.success) {
                                    sfStore.reload();
                                    var msg = '';
                                    if(result.count > 0){
                                        msg += '<br /><b>Rdp creati</b><br /><br />'
                                        for(var i = 0; i != result.count; i++){
                                            msg += '<a target="_blank" href="data/rdp/odt/'+result.rdp[i]+'">'+result.rdp[i]+'</a><br />';
                                        }
                                    }
                                    if(result.count_error > 0){
                                        msg += '<br /><b>Rdp non creati</b><br /><br />'
                                        for(i = 0; i != result.count_error; i++){
                                            msg += result.rdp_error[i]+'</a><br />';
                                        }
                                    }
                                    Ext.MessageBox.show({
                                        height: 300,
                                        width: 500,
                                        buttons: Ext.Msg.OK,
                                        title: 'Risultato Creazione Rdp',
                                        msg: msg
                                    });
                                } else {
                                    console.debug(result.res);
                                }
                            }, this)
                        }
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Supplemento/i',
                    flex: 1,
                    margins: '0 0 0 2',
                    name: 'suppl_nb',
                    itemId: 'suppl_nb'
                }, '-', 'Data Rdp',
                {
                    name: 'Data Rdp',
                    xtype: 'datefield',
                    width: 100,
                    value: new Date(),
                    itemId: 'date_rdp'
                }]
            }]
        });

        // Mostra gli storici se attivati nelle preferenze
        if (Lab.CONFIG.histories) {
            actionColumn.items.push({
                icon: Lab.CONFIG.root_dir + '/images/icons/blog.png',
                tooltip: 'Storico',
                handler: Lab.utils.historyWindow
            });
        }

        config = Ext.apply({
            bbar: new Ext.PagingToolbar({
                displayInfo:    true,
                displayMsg:     'Visualizzati campioni da {0} a {1} di {2}',
                emptyMsg:       'Non ci sono campioni da visualizzare',
                pageSize:       pageSize,
                plugins:        [filters],
                store:          sfStore
            }),
            border:     false,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true,
                    width: 160
                },
                columns: columns
            }),
            iconCls:    'icon-small-jar-empty',
            loadMask:   true,
            plugins:    [filters],
            sm:         new Ext.grid.RowSelectionModel({singleSelect: true}),
            stateful:   true,
            stateId:    'laboratoriosamplesgrid',
            store:      sfStore,
            tbar:       topToolbar,
            viewConfig: {
                getRowClass: function (record) {
                    return record.data.conforme ? '' : 'laboratorio-determination-grid-nonconforme';
                }
            }
        }, config);

        Lab.LaboratorioSamplesGrid.superclass.constructor.call(this, config);

        this.on('afterrender', function () {
            this.getTopToolbar().get('filteringToolbar').get('sampleNumberCombo').focus();
        });
    },

    orderDeterminations: function (grid, rowIndex, colIndex) {
        var record = grid.store.getAt(rowIndex),

        tree = new Ext.tree.TreePanel({
            animate: true,
            autoScroll: true,
            border: false,
            ddScroll: true,
            enableDD: true,
            useArrows: true,
            rootVisible: false,
            root: {
                expanded: true,
                id: record.id,
                loader: new Ext.tree.TreeLoader({
                    directFn: Lab.sample.getOrderedDeterminations
                })
            }
        }),

        win = new Ext.Window({
            layout: 'fit',
            modal: true,
            title: 'Ordinamento dei controlli per il report',
            width: 480,
            height: 320,
            items: [tree],
            buttons: [{
                text: 'Salva ordinamento',
                disabled: true,
                ref: '../saveButton',
                handler: function () {
                    var i = 0, determinationsOrder = [];

                    tree.root.eachChild(function () {
                        determinationsOrder.push({
                            id: this.id,
                            index: i++
                        });
                    });

                    Lab.determination.saveOrder({
                        orderInfo: determinationsOrder
                    }, function () {
                        win.purgeListeners();
                        win.close();
                    });
                }
            }]
        });

        tree.on('movenode', function () {
            win.saveButton.enable();
            tree.orderChanged = true;
        });

        // Chiede conferma se l'ordine è cambiato ma non si è salvato
        win.on('beforeclose', function () {
            if (tree.orderChanged) {
                Ext.Msg.confirm('Attenzione', 'L\'ordine dei controlli è cambiato. Vuoi chiudere senza salvare?', function (btnId) {
                    if (btnId === 'yes') {
                        win.purgeListeners();
                        win.close();
                    }
                });
            }

            return !tree.orderChanged;
        });

        win.show();
    }
});

Ext.reg('laboratoriosamplesgrid', Lab.LaboratorioSamplesGrid);
