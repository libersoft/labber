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

Lab.AccettazioneComposite = Ext.extend(Ext.Panel, {
    // override initComponent
    initComponent: function () {
        // used applyIf rather than apply so user could
        // override the defaults
        Ext.applyIf(this, {
            layout: 'border',
            items: [{
                xtype: 'accettazioneordersgrid',
                itemId: 'accorderPanel',
                region: 'north',
                split:  true,
                height: 255,
                listeners: {}   // niente doppio clic
            },
            {
                xtype:  'samplesgrid',
                itemId: 'accsamplePanel',
                region: 'center'
            }]
        });
        // call the superclass's initComponent implementation
        Lab.AccettazioneComposite.superclass.initComponent.call(this);
    },
    // override initEvents
    initEvents: function () {
        // call the superclass's initEvents implementation
        Lab.AccettazioneComposite.superclass.initEvents.call(this);

        // now add application specific events
        // notice we use the selectionmodel's rowselect event rather
        // than a click event from the grid to provide key navigation
        // as well as mouse navigation
        var ordersGrid = this.getComponent('accorderPanel');
        ordersGrid.getSelectionModel().on('rowselect', this.onRowSelect, this);

        ordersGrid.getTopToolbar().hide();
    },
    // add a method called onRowSelect
    // This matches the method signature as defined by the 'rowselect'
    // event defined in Ext.grid.RowSelectionModel
    onRowSelect: function (sm, rowIdx, r) {
        // getComponent will retrieve itemId's or id's. Note that itemId's
        // are scoped locally to this instance of a component to avoid
        // conflicts with the ComponentMgr
        var samplesGrid = this.getComponent('accsamplePanel');

        samplesGrid.order = r;  // passo alla grid il record selezionato

        // filtro le determination per il sample_id selezionato
        var lastOptions = samplesGrid.store.lastOptions ? samplesGrid.store.lastOptions : {params: {}};

        Ext.apply(lastOptions.params, {
            doctrineWheres: [{
                field:    'order_id',
                operator: '=',
                value:    r.data.id
            }]
        });

        samplesGrid.store.reload(lastOptions);
	}
});
// register an xtype with this class
Ext.reg('accettazionecomposite', Lab.AccettazioneComposite);
