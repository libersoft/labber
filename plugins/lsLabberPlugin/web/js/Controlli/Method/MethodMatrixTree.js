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
 * L'albero delle matrici con le checkbox per l'associazione.
 */
Lab.MethodMatrixTree = Ext.extend(Ext.tree.TreePanel, {

    constructor: function (config) {

        var self = this,

        rootLoader = new Lab.MatrixLoader({
            applyLoader:    false,
            directFn:       Lab.matrix.getRootMatrices,
            methodId:       config.method.id
        }),

        rootNode = new Ext.tree.AsyncTreeNode({
            expanded: true,
            id:       'root',
            loader:   rootLoader
        });

        config = Ext.apply({
            animate:        true,
            autoScroll:     true,
            loader: new Lab.MatrixLoader({
                directFn:   Lab.matrix.getChildren,
                methodId:   config.method.id
            }),
            root:           rootNode,
            rootVisible:    false,
            useArrows:      true
        }, config);

        Lab.MethodMatrixTree.superclass.constructor.call(this, config);
    }
});


Lab.MatrixLoader = Ext.extend(Ext.tree.TreeLoader, {

    constructor: function (config) {

        config = Ext.apply({
            baseAttrs: {
                listeners: {
                    checkchange: function (node, checked) {
                        var data = {
                            doctrineClass:  'MethodMatrix',
                            data: {
                                method_id:  config.methodId,
                                matrix_id:  node.id
                            }
                        };

                        if (checked) {
                            Lab.db.create(data);
                        } else {
                            Lab.method.removeMatrix(data);
                        }
                    }
                }
            },
            baseParams: {
                // Visualizza le checkbox per ogni nodo
                recordClass:    'Method',
                recordId:       config.methodId
            },
            paramOrder: ['node', 'recordClass', 'recordId']
        }, config);

        Lab.MatrixLoader.superclass.constructor.call(this, config);
    }
});

Ext.reg('methodmatrixtree', Lab.MethodMatrixTree);