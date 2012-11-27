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

Lab.SampleDetail = Ext.extend(Ext.Panel, {
	// add tplMarkup as a new property
	tplMarkup: [
		//'Title: <a href="{DetailPageURL}" target="_blank">{Title}</a><br/>',
                '<b>---Generale---</b><br/>',
		'<b>Gruppo Matrice:</b> {gruppo_matrice} <b>- Prodotto:</b> {sample_type} <b>- Descrizione:</b> {descrizione} <b>- Codice Cliente:</b> {codcliente}<br/><br/>',
                '<b>---Campionamento---</b><br/>',
                '<b>A cura di:</b> {acuradi} <b>- Campionamento:</b> {campionamento} <b>- Data Campionamento:</b> {data_campionamento} <b>- Campionatore:</b>{campionatore}<br/><br/>',
                '<b>---Dettagli Specifici---</b><br/>',
                '<b>Data Scadenza:</b> {data_scadenza_s} <b>- Data Ritiro:</b> {data_ritiro}',
                '<b>Trasportatore:</b> {trasportatore} <b>- Trasporto:</b> {trasporto} <b>- Condizioni:</b> {condizioni} <b>- Nota per Laboratorio:</b> {notalab} <br/>'
	],
	// startingMarup as a new property
	startingMarkup: 'Seleziona un campione per visualizzare dettagli addizionali',
	// override initComponent to create and compile the template
	// apply styles to the body of the panel and initialize
	// html to startingMarkup
	initComponent: function () {
		this.tpl = new Ext.Template(this.tplMarkup);
		Ext.apply(this, {
			bodyStyle: {
				background: '#ffffff',
				padding: '7px'
			},
			html: this.startingMarkup
		});
		// call the superclass's initComponent implementation
		Lab.SampleDetail.superclass.initComponent.call(this);
	},
	// add a method which updates the details
	updateDetail: function (data) {
		this.tpl.overwrite(this.body, data);
	}
});
// register the App.BookDetail class with an xtype of bookdetail
Ext.reg('labsampledetail', Lab.SampleDetail);
