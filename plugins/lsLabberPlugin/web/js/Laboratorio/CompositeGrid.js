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

Lab.CompositeGrid = Ext.extend(Ext.Panel, {
    // override initComponent
    initComponent: function () {
        // used applyIf rather than apply so user could
        // override the defaults
        Ext.applyIf(this, {
            layout: 'border',
            items: [{
                xtype: 'laboratoriosamplesgrid',
                itemId: 'labsamplePanel',
                region: 'center'
            },
            {
                xtype: 'laboratorioanalysesgrid',
                itemId: 'labanalysesPanel',
                region: 'south',
                split: true,
                height: 255
            }]
        });
        // call the superclass's initComponent implementation
        Lab.CompositeGrid.superclass.initComponent.call(this);
    },
    // override initEvents
    initEvents: function () {
        // call the superclass's initEvents implementation
        Lab.CompositeGrid.superclass.initEvents.call(this);

        // now add application specific events
        // notice we use the selectionmodel's rowselect event rather
        // than a click event from the grid to provide key navigation
        // as well as mouse navigation
        var sampleGridSm = this.getComponent('labsamplePanel').getSelectionModel();
        sampleGridSm.on('rowselect', this.onRowSelect, this);

        // il filtro sui campioni qui non serve
        var detailToolbar = this.getComponent('labanalysesPanel').getTopToolbar();
        detailToolbar.get('filteringToolbar').get('sampleNumberCombo').hide();
    },
    // add a method called onRowSelect
    // This matches the method signature as defined by the 'rowselect'
    // event defined in Ext.grid.RowSelectionModel
    onRowSelect: function (sm, rowIdx, r) {
        // getComponent will retrieve itemId's or id's. Note that itemId's
        // are scoped locally to this instance of a component to avoid
        // conflicts with the ComponentMgr
        var determinationStore = this.getComponent('labanalysesPanel').getStore();

        // filtro le determination per il sample_id selezionato
        var lastOptions = determinationStore.lastOptions ? determinationStore.lastOptions : {params: {filters: {}}};

        Ext.apply(lastOptions.params.filters, {
            'd.sample_id': {
                field:    'd.sample_id',
                operator: '=',
                value:    r.data.id
            }
        });

        determinationStore.reload(lastOptions);

        // abilita gli altri filtri alla selezione di un campione
        this.getComponent('labanalysesPanel').getTopToolbar().items.each(function () {
            this.enable();
        });
    }
});
// register an xtype with this class
Ext.reg('laboratoriocompositegrid', Lab.CompositeGrid);
