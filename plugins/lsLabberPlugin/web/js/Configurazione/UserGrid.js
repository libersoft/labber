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
 *  Griglia che elenca gli utenti del sistema
 */
Lab.UserGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    constructor: function (config) {

        var self = this,

        Dude = Ext.data.Record.create([{
            name: 'id'
        },
        {
            name: 'username'
        },
        {
            name: 'password'
        },
        {
            name: 'Profile.in_sales'
        },
        {
            name: 'Profile.is_sales_secretary'
        },
        {
            name: 'Profile.is_technical_manager'
        },
        {
            name: 'permissionNames',
            type: 'string',
            mapping: 'permissions',
            convert: function (v, rec) {
                var perms = '';
                for (var i = 0; i < v.length; i++) {
                    if (i !== 0) {
                        perms += ', ';
                    }
                    perms += v[i].description;
                }
                return perms;
            }
        },
        {
            name: 'permissionIds',
            mapping: 'permissions',
            convert: function (v) {
                return Ext.pluck(v, 'id');
            }
        },
        {
            name: 'Profile.name',
            mapping: 'Profile ? obj.Profile.name : null'
        },
        {
            name: 'Profile.surname',
            mapping: 'Profile ? obj.Profile.surname : null'
        },
        {
            name: 'Profile.email',
            mapping: 'Profile ? obj.Profile.email : null'
        },
        {
            name: 'Profile.tel_number',
            mapping: 'Profile ? obj.Profile.tel_number : null'
        }]),

        store = new Ext.data.DirectStore({
            reader: new Ext.data.JsonReader({
                root: 'data',
                totalProperty: 'total',
                idProperty: 'id'
            }, Dude),
            remoteSort: true,
            autoLoad: true,
            autoSave: true,
            writer: new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: false
            }),
            api: {
                create: Lab.db.create,
                read: Lab.db.list,
                update: Lab.db.update,
                destroy: Lab.db.destroy
            },
            baseParams: {
                start: 0,
                doctrineClass: 'sfGuardUser',
                sort: 'Profile.surname',
                doctrineJoins: ['sfGuardUser.permissions','sfGuardUser.Profile']
            }
        }),

        colModel = new Ext.grid.ColumnModel({
            defaults: {
                width: 160,
                sortable: true
            },
            columns: [new Ext.grid.RowNumberer(),{
                header: 'Utente',
                dataIndex: 'Profile.surname',
                renderer: function (value, metadata, record, rowIndex, colIndex, store) {
                    return record.data['Profile.surname'] + ' ' + record.data['Profile.name'];
                },
                fixed: true
            },
            {
                header: 'Username',
                dataIndex: 'username',
                fixed: true
            },
            {
                header: 'Email',
                dataIndex: 'Profile.email',
                fixed: true
            },
            {
                header: 'Numero di telefono',
                dataIndex: 'Profile.tel_number',
                fixed: true
            },
            {
                header: 'Permessi',
                dataIndex: 'permissionNames',
                sortable: false
            }]
        });

        config = Ext.apply({
            border: false,
            cm: colModel,
            loadMask: true,
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true
            }),
            store: store,
            tbar: [{
                text: 'Nuovo',
                iconCls: 'icon-small-add',
                handler: this.newWindow,
                scope: this
            },
            '->',
            {
                text: 'Elimina',
                iconCls: 'icon-small-minus',
                handler: this.removeSelected,
                scope: this
            }],
            viewConfig: {
                forceFit: true
            }
        }, config);
        
        Lab.UserGrid.superclass.constructor.call(this, config);

        this.on('rowdblclick', function (grid, rowIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            this.editWindow(record, e);
        })
    },

    newWindow: function (b, e) {
        var win = new Lab.UserWindow({
            title: 'Nuovo utente'
        });

        win.on('close', function () {
            this.store.reload();
        }, this);

        win.show(e.getTarget());
    },

    editWindow: function (record, e) {
        var win = new Lab.UserWindow({
            title: 'Modifica utente ' + record.data.username,
            record: record
        });

        win.on('close', function () {
            this.store.reload();
        }, this);

        win.show(e.getTarget());
    },

    removeSelected: function () {
        if (this.selModel.hasSelection()) {
            Ext.Msg.confirm('Attenzione', 'Vuoi eliminare l\'utente selezionato?', function (b) {
                if (b === 'yes') {
                    this.store.remove(this.selModel.getSelected());
                }
            }, this);
        }
    }
});

Ext.reg('usergrid', Lab.UserGrid);


/**
 * Form utenti del sistema.
 */
Lab.UserWindow = Ext.extend(Ext.Window, {

    constructor: function (config) {

        var phoneChars = Ext.escapeRe('+0123456789'),

        numberRe = new RegExp('[' + phoneChars + ']'),

        permissionsStore = new Lab.sfDirectStore({
            autoLoad: true,
            baseParams: {
                doctrineClass: 'sfGuardPermission'
            },
            fields: ['id', 'name', 'description'],
            remoteSort: false
        }),

        form = new Ext.FormPanel({
            border: false,
            labelWidth: 150,
            monitorValid: true,
            padding: 10,
            buttons: [{
                text: 'OK',
                formBind: true,
                iconCls: 'icon-small-ok',
                scope: this,
                handler: function (b, e) {
                    // con 'true' prende solo i campi modificati
                    var values = form.getForm().getFieldValues(true),
                    selectedPermissions = form.grid.selModel.getSelections();

                    values.permissions = Ext.pluck(selectedPermissions, 'id');

                    Lab.user.save(values, function (r) {
                        if (r.success) {
                            this.close();
                        }
                    }, this);
                }
            }],
            defaults: {
                allowBlank: false,
                anchor: '-20',
                xtype: 'textfield'
            },
            items: [{
                xtype: 'hidden',
                name: 'id',
                // così manda sempre 'id'
                isDirty: function () {return true;}
            },
            {
                fieldLabel: 'Nome',
                name: 'Profile.name'
            },
            {
                fieldLabel: 'Cognome',
                name: 'Profile.surname'
            },
            {
                fieldLabel: 'Username',
                name: 'username'
            },
            {
                fieldLabel: 'Password',
                name: 'password',
                inputType: 'password'
            },
            {
                fieldLabel: 'Email',
                name: 'Profile.email',
                allowBlank: true
            },
            {
                fieldLabel: 'Numero di telefono',
                name: 'Profile.tel_number',
                maskRe: numberRe,
                allowBlank: true
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Referente commerciale',
                name: 'Profile.in_sales'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Segreteria commerciale',
                name: 'Profile.is_sales_secretary'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Referente tecnico',
                name: 'Profile.is_technical_manager'
            },
            {
                xtype: 'permissiongrid',
                title: 'Permessi',
                height: 192,
                store: permissionsStore,
                ref: 'grid'
            }]
        });

        config = Ext.apply({
            maximizable: true,
            modal: true,
            width: 600,
            height: 512,
            minWidth: 400,
            minHeight: 512,
            layout: 'fit',
            plain: true,
            buttonAlign: 'center',
            items: [form]
        }, config);

        Lab.UserWindow.superclass.constructor.call(this, config);

        if (this.record) {
            var record = this.record;
            form.getForm().loadRecord(record);

            permissionsStore.on('load', function () {
                var records = [];
                Ext.each(record.data.permissionIds, function (id) {
                    records.push(permissionsStore.getById(id));
                });
                form.grid.selModel.selectRecords(records);
            });
        }
    }
});
