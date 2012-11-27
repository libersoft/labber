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
 * Tree di Matrix per l'associazione con SampleType
 */
Lab.MatrixTreeSampleType = Ext.extend(Ext.tree.TreePanel, {

    constructor: function (config) {

        var self = this,

        rootNode = new Ext.tree.AsyncTreeNode({
            expanded: true,
            id: Lab.CONFIG.user.department.id,
            loader: new Ext.tree.TreeLoader({
                applyLoader: false,
                baseParams: {
                    // Visualizza le checkbox per ogni nodo
                    recordClass:    'SampleType',
                    recordId:       config.recordId
                },
                directFn: Lab.matrix.getRootMatrices,
                paramOrder: ['node', 'recordClass', 'recordId']
            })
        });

        config = Ext.apply({
            animate: true,
            autoScroll: true,
            border: false,
            loader: {
                baseParams: {
                    // Visualizza le checkbox per ogni nodo
                    recordClass:    'SampleType',
                    recordId:       config.recordId
                },
                paramOrder: ['node', 'recordClass', 'recordId'],
                directFn: Lab.matrix.getChildren
            },
            root: rootNode,
            rootVisible: false,
            tbar: [{
                text: 'Salva',
                iconCls: 'icon-small-save',
                tooltip: 'Salva l\'associazione con le matrici selezionate',
                handler: function () {
                    Lab.sampleType.updateMatrices({'sampleTypeId':config.recordId,'matrixIds':this.getChecked('id')});
                },
                scope: this
            }],
            useArrows: true
        }, config);

        Lab.MatrixTreeSampleType.superclass.constructor.call(this, config);
    }
});

Ext.reg('matrixtreesampletype', Lab.MatrixTreeSampleType);

Lab.MatrixWindowSampleType = Ext.extend(Ext.Window, {

    constructor: function (config) {
        
        var self = this,
        
        form = new Lab.MatrixFormSampleType(),

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
            autoScroll: true,
            width: 320,
            height: 240,
            minWidth: 300,
            minHeight: 200,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'center',
            items: form,
            buttons: [{
                text: 'OK',
                handler: saveMatrix
            }]
        }, config);

        Lab.MatrixWindowSampleType.superclass.constructor.call(this, config);
        
         if (this.matrixId) {
            var doctrineWhereIns = [{
                field: 'id',
                valueSet: [this.matrixId]
            }];

            Lab.db.list({'doctrineClass':'Matrix','doctrineWhereIns':doctrineWhereIns}, function (result, e) {
                form.getForm().setValues(result.data[0]);
            });
        }
    }
});

Lab.MatrixFormSampleType = Ext.extend(Ext.form.FormPanel, {

    constructor: function (config) {

        var self = this;

        config = Ext.apply({
            baseCls: 'x-plain',
            labelWidth: 75,
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'hidden',
                name: 'department_id',
                value: Lab.CONFIG.user.department.id
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Nome',
                name: 'name'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Descrizione',
                name: 'description',
                anchor: '100% -27'
            }]
        }, config);


        Lab.MatrixFormSampleType.superclass.constructor.call(this, config);
    }
});