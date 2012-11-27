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

Lab.SamplesTab = Ext.extend(Ext.Panel, {
	// override initComponent
	initComponent: function () {
		// used applyIf rather than apply so user could
		// override the defaults
		Ext.applyIf(this, {
			layout: 'border',
			items: [{
				xtype: 'laboratoriosamplesgrid',
				itemId: 'gridPanel',
				region: 'center'
			},
            {
				xtype: 'labsampledetail',
				itemId: 'detailPanel',
				region: 'south',
				height: 160,
				split: true,
				collapsible: true,
                frame: true
			}]
		});
		// call the superclass's initComponent implementation
		Lab.SamplesTab.superclass.initComponent.call(this);
	},
	// override initEvents
	initEvents: function () {
		// call the superclass's initEvents implementation
		Lab.SamplesTab.superclass.initEvents.call(this);

		// now add application specific events
		// notice we use the selectionmodel's rowselect event rather
		// than a click event from the grid to provide key navigation
		// as well as mouse navigation
		var sampleGridSm = this.getComponent('gridPanel').getSelectionModel();
		sampleGridSm.on('rowselect', this.onRowSelect, this);
	},
	// add a method called onRowSelect
	// This matches the method signature as defined by the 'rowselect'
	// event defined in Ext.grid.RowSelectionModel
	onRowSelect: function (sm, rowIdx, r) {
		// getComponent will retrieve itemId's or id's. Note that itemId's
		// are scoped locally to this instance of a component to avoid
		// conflicts with the ComponentMgr
		var detailPanel = this.getComponent('detailPanel');
		detailPanel.updateDetail(r.data);
	}
});
// register an xtype with this class
Ext.reg('labsamplestab', Lab.SamplesTab);
