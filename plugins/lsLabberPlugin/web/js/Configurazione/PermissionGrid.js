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
 * Lista dei permessi di un utente
 */
Lab.PermissionGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {

        var checkboxSelModel = new Ext.grid.CheckboxSelectionModel();

        config = Ext.apply({
            colModel: new Ext.grid.ColumnModel({
                columns: [checkboxSelModel, {
                    header: 'Tutti',
                    dataIndex: 'description',
                    menuDisabled: true,
                    sortable: true
                }]
            }),
            selModel: checkboxSelModel,
            viewConfig: {
                forceFit: true
            }
        }, config);

        Lab.PermissionGrid.superclass.constructor.call(this, config);
    }
});

Ext.reg('permissiongrid', Lab.PermissionGrid);
