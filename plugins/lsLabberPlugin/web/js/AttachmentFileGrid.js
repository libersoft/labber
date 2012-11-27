/*global
    Ext: true,
    Lab: true
*/

"use strict";

Ext.ns('Lab');

/**
 * Gli allegati caricati per un metodo
 */
Lab.AttachmentFileGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,

        sfStore = new Lab.sfDirectStore({
            baseParams: {
                doctrineClass: config.doctrineClass,
                doctrineWheres: [{
                    field: config.doctrineField,
                    operator: '=',
                    value: config.objectId
                }],
                metaData:       true
            }
        }),

        columns = [{
            header: 'File',
            dataIndex: 'file',
            renderer: function (value) {
                return '<a target="_blank" href="/uploads/'+config.uploadDir+'/'+value+'">'+value+'</a>';
            }
        },
        {
            header:     'Descrizione',
            dataIndex:  'description',
            editable:   true,
            editor:     new Ext.form.TextArea()
        }],

        topBar = new Ext.Toolbar({
            items: [{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                tooltip: 'Aggiunge un file',
                handler: this.fileUpload,
                scope: this
            },
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                tooltip: 'Elimina un file',
                handler: function (b, e) {
                    // TODO: devo cancellare anche il file su disco
                    if (self.getSelectionModel().selection) {
                        Ext.Msg.confirm('Attenzione', 'Vuoi eliminare un file?', function (b) {
                            if (b === 'yes') {
                                sfStore.remove(self.getSelectionModel().selection.record);
                            }
                        });
                    }
                }
            }]
        });

        if (config.doctrineClass === 'SampleFile') {
            var check = new Ext.ux.grid.SingleSelectCheckColumn({
                header:     'Certificato',
                dataIndex:  'certificate',
                width:      75
            });
            columns.push(check);
            config = Ext.apply({
                plugins: [check]
            }, config);
        }

        config = Ext.apply({
            border: false,
            title: 'Allegati',
            iconCls: 'icon-paper-clip',
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true,
                    menuDisabled: true,
                    width: 200,
                    editable: false
                },
                columns: columns
            }),
            store: sfStore,
            stripeRows: true,
            tbar: topBar,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.AttachmentFileGrid.superclass.constructor.call(this, config);
    },

    fileUpload: function (b, e) {
        var fp = new Ext.FormPanel({
            fileUpload: true,
            width: 500,
            frame: true,
            autoHeight: true,
            bodyStyle: 'padding: 10px 10px 0 10px;',
            defaults: {
                anchor: '95%',
                allowBlank: false,
                msgTarget: 'side'
            },
            baseParams: {
                subdirectory: this.uploadDir
            },
            items: [{
                xtype: 'hidden',
                name: this.doctrineField,
                value: this.objectId
            },{
                xtype: 'textfield',
                fieldLabel: 'Descrizione',
                name: 'description'
            },{
                xtype: 'fileuploadfield',
                emptyText: 'Seleziona un allegato',
                fieldLabel: 'Allegato',
                name: 'attachment',
                buttonText: '',
                buttonCfg: {
                    iconCls: 'icon-upload-file'
                }
            }],
            buttons: [{
                text: 'Upload',
                handler: function () {
                    if (fp.getForm().isValid()) {
                        fp.getForm().submit({
                            url: 'fileupload.php',
                            waitMsg: 'Uploading your file...',
                            success: function (form, action) {
                                if (action.result.success) {
                                    var values = form.getValues();
                                    values.file = action.result.filename;

                                    Lab.db.create({
                                        doctrineClass: this.doctrineClass,
                                        data: values
                                    }, function () {
                                        Lab.flash.msg('Successo', 'Documento allegato correttamente');
                                        this.store.reload();
                                        win.close();
                                    }, this);
                                }
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            },{
                text: 'Reset',
                handler: function(){
                    fp.getForm().reset();
                }
            }]
        }),

        win = new Ext.Window({
            layout: 'fit',
            maximizable: false,
            resizable: false,
            plain: true,
            modal: true,
            items: [fp]
        });

        win.show();
    }
});

Ext.reg('attachmentfilegrid', Lab.AttachmentFileGrid);


Ext.ux.grid.SingleSelectCheckColumn = Ext.extend(Ext.ux.grid.CheckColumn, {

    processEvent: function (name, e, grid, rowIndex, colIndex) {
        if (name == 'mousedown') {
            var record = grid.store.getAt(rowIndex),
                dataIndex = this.dataIndex;
            record.set(dataIndex, !record.data[dataIndex]);

            grid.store.each(function (r) {
                if (record.id != r.id) {
                    r.set(dataIndex, false);
                }
            });

            return false; // Cancel row selection.
        } else {
            return Ext.ux.grid.CheckColumn.superclass.processEvent.apply(this, arguments);
        }
    }
});
