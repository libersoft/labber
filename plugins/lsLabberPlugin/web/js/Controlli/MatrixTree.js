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
 * L'albero delle matrici
 */
Lab.MatrixTree = Ext.extend(Ext.ux.tree.TreeGrid, {

    constructor: function (config) {

        var self = this,

        rootLoader = new Ext.tree.TreeLoader({
            applyLoader:    false,
            directFn:       Lab.matrix.getRootMatrices,
            paramOrder:     ['node', 'recordLocal', 'recordId']
        }),

        rootNode = new Ext.tree.AsyncTreeNode({
            expanded: true,
            id: 'root',
            loader: rootLoader
        }),

        // funzione che apre una finestra per una NUOVA matrice.
        newMatrixWin = function () {
            var matrixWin = new Lab.MatrixWindow({
                title: 'Nuova matrice',
                listeners: {
                    matrixcreated: function () {
                        Ext.Msg.show({
                            title:'Matrice salvata',
                            msg: 'Una nuova matrice è stata creata.',
                            buttons: Ext.Msg.OK,
                            fn: function () {
                                self.root.reload();
                            },
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
            });
            matrixWin.show();
        },

        // funzione che apre una finestra per EDITARE una matrice.
        editMatrixWin = function (node) {
            var nodePath = node.getPath(),

            matrixWin = new Lab.MatrixWindow({
                title: 'Modifica "' + node.attributes.name + '"',
                matrixId: node.id,
                listeners: {
                    matrixcreated: function () {
                        Ext.Msg.show({
                            title:'Matrice modificata',
                            msg: 'La matrice è stata modificata con successo.',
                            buttons: Ext.Msg.OK,
                            fn: function () {
                                self.root.reload();
                                self.expandPath(nodePath);
                            },
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
            });
            matrixWin.show();
        };

        config = Ext.apply({
            animate: true,
            border: false,
            columns: (function () {
                // Questa closure restituisce un array di configurazione delle
                // colonne per il TreeGrid in base all'utente loggato;
                //
                // a.gistri ha ID 8

                var columns = [{
                    dataIndex: 'name',
                    header: 'Nome',
                    width: 256
                },
                {
                    dataIndex: 'description',
                    header: 'Descrizione',
                    width: 512
                },
                {
                    dataIndex: 'updated_at',
                    header: 'Data di ultima modifica',
                    width: 256
                }],

                compilerColumns = [{
                    dataIndex: 'name',
                    header: 'Nome',
                    width: 256
                },
                {
                    dataIndex: 'description',
                    header: 'Descrizione',
                    tpl: '<span style="white-space: normal;">{description}</span>',
                    width: 384
                },
                {
                    dataIndex: 'methods',
                    header: 'Metodi associati',
                    tpl: '<span style="white-space: normal;">{methods}</span>',
                    width: 384
                },
                {
                    dataIndex: 'updated_at',
                    header: 'Data di ultima modifica',
                    width: 256
                }];

                if (Lab.CONFIG.user.permissions.indexOf('controlli') != -1) {
                    return compilerColumns;
                } else {
                    return columns;
                }
            })(),
            enableDD: true,
            listeners: {
                dblclick: function (node) {
                    editMatrixWin(node);
                }
            },
            loader: new Ext.tree.TreeLoader({
                paramOrder: ['node', 'recordLocal', 'recordId'],
                directFn: Lab.matrix.getChildren
            }),
            root: rootNode,
            tbar: [{
                text: 'Nuova',
                iconCls: 'icon-small-add',
                tooltip: 'Crea una nuova matrice',
                handler: newMatrixWin
            },
            {
                text: 'Radice',
                iconCls: 'icon-root',
                tooltip: 'Porta al primo livello la matrice selezionata',
                handler: this.rootNode,
                scope: this
            },
            '-',
            {
                text:       'Elimina',
                iconCls:    'icon-small-remove',
                tooltip:    'Elimina la matrice selezionata',
                handler:    this.destroyNode,
                scope:      this
            },
            '->',
            {
                text: 'Aggiorna',
                iconCls: 'icon-small-refresh',
                tooltip: 'Ricarica l\'albero delle matrici',
                handler: function () {
                    this.root.reload();
                },
                scope: this
            }],
            useArrows: true
        }, config);

        Lab.MatrixTree.superclass.constructor.call(this, config);

        this.on('beforemovenode', function (tree, node, oldParent, newParent, index) {
            Lab.flash.msg('Attenzione', 'Matrice '+node.attributes.name+' spostata sotto '+newParent.attributes.name);
            return true;
        });

        this.on('movenode', function (tree, node, oldParent, newParent, index) {
            if (oldParent != newParent) {
                Lab.matrix.updateParent({'matrixId':node.id,'newParentId':newParent.id});
            }
        });
    },

    destroyNode: function () {
        var node = this.getSelectionModel().getSelectedNode();
        if (!node.hasChildNodes()) {
            Ext.Msg.confirm('Sei sicuro?', 'Eliminare la matrice "'+node.attributes.text+'"?', function (btn) {
                if (btn === 'yes') {
                    Lab.db.destroy({
                        doctrineClass:  'Matrix',
                        data:           node.id
                    }, function (result) {
                        if (result.success) {
                            Lab.flash.msg('', 'La matrice selezionata è stata eliminata.')
                            this.root.reload();
                        }
                    }, this);
                }
            }, this);
        } else {
            Ext.Msg.show({
                title:'Impossibile eliminare',
                msg: 'La matrice ha delle matrici figlie associate.',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    },

    rootNode: function () {
        var node = this.getSelectionModel().getSelectedNode();

        Ext.Msg.confirm('Sei sicuro?', 'Portare "'+node.attributes.text+'" al primo livello?', function (btn) {
            if (btn === 'yes') {
                Lab.matrix.updateParent({'matrixId': node.id, 'newParentId': null});
                Lab.matrix.reload({}, function () {
                    Lab.flash.msg('', 'La matrice "'+node.attributes.text+'" è ora di primo livello');
                    this.root.reload();
                }, this);
            }
        }, this);
    }
});

Ext.reg('matrixtree', Lab.MatrixTree);

Lab.MatrixWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {
        
        var self = this,
        
        form = new Lab.MatrixForm(),

        saveMatrix = function () {
            // ottengo dalla db.list solo il record doppiocliccato nel tree
            var doctrineClass = 'Matrix',

            values = form.getForm().getFieldValues();

            if (config.matrixId) {
                // è una edit
                Lab.db.update({'doctrineClass':doctrineClass,'data':values})
            } else {
                // è una new
                Lab.db.create({'doctrineClass':doctrineClass,'data':values});
            }
            self.fireEvent('matrixcreated');
            self.close();
        };

        config = Ext.apply({
            modal: true,
            width: 640,
            height: 480,
            minWidth: 300,
            minHeight: 200,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'center',
            items: form,
            buttons: [{
                text: 'OK',
                iconCls: 'icon-small-ok',
                handler: saveMatrix
            }]
        }, config);

        Lab.MatrixWindow.superclass.constructor.call(this, config);

        if (this.matrixId) {
            var doctrineWhereIns = [{
                field: 'id',
                valueSet: [this.matrixId]
            }];

            Lab.db.list({'doctrineClass':'Matrix','doctrineWhereIns':doctrineWhereIns}, function (result, e) {
                form.getForm().setValues(result.data[0]);
            });
        } else {
            // setta il focus sul nome con un ritardo di 250ms
            form.nameField.focus(false, 500);
        }
    }
});

Lab.MatrixForm = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this;

        config = Ext.apply({
            baseCls: 'x-plain',
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Nome',
                name: 'name',
                ref: 'nameField'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Descrizione',
                name: 'description',
                anchor:     '100% -51'
            },
            {
                xtype:      'checkbox',
                fieldLabel: 'Da confermare',
                name:       'unconfirmed'
            }]
        }, config);

        Lab.MatrixForm.superclass.constructor.call(this, config);
    }
});
