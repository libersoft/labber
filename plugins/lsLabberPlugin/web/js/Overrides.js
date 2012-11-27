/*jslint
    onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
    bitwise: true, regexp: true, strict: true, newcap: true, immed: true
    
*/

// Non selezionare la cella se dentro c'è un'actioncolumn
Ext.override(Ext.grid.CellSelectionModel, {
    listeners: {
        beforecellselect: function (sm, row, col) {
            return sm.grid.colModel.columns[col].xtype !== 'actioncolumn';
        }
    }
});

// Rimettiamo le checkbox nel TreeGrid
Ext.override(Ext.ux.tree.TreeGridNodeUI, {
    renderElements : function(n, a, targetNode, bulkRender){
        var t = n.getOwnerTree(),
            cols = t.columns,
            c = cols[0],
            i, buf, len,
            cb = Ext.isBoolean(a.checked);

        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        buf = [
             '<tbody class="x-tree-node">',
                '<tr ext:tree-node-id="', n.id ,'" class="x-tree-node-el x-tree-node-leaf ', a.cls, '">',
                    '<td class="x-treegrid-col">',
                        '<span class="x-tree-node-indent">', this.indentMarkup, "</span>",
                        '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow">',
                        '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " "+a.iconCls : ""), '" unselectable="on">',
                        cb ? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked ? 'checked="checked" />' : '/>')) : '',
                        '<a hidefocus="on" class="x-tree-node-anchor" href="', a.href ? a.href : '#', '" tabIndex="1" ',
                            a.hrefTarget ? ' target="'+a.hrefTarget+'"' : '', '>',
                        '<span unselectable="on">', (c.tpl ? c.tpl.apply(a) : a[c.dataIndex] || c.text), '</span></a>',
                    '</td>'
        ];

        for(i = 1, len = cols.length; i < len; i++){
            c = cols[i];
            buf.push(
                    '<td class="x-treegrid-col ', (c.cls ? c.cls : ''), '">',
                        '<div unselectable="on" class="x-treegrid-text"', (c.align ? ' style="text-align: ' + c.align + ';"' : ''), '>',
                            (c.tpl ? c.tpl.apply(a) : a[c.dataIndex]),
                        '</div>',
                    '</td>'
            );
        }

        buf.push(
            '</tr><tr class="x-tree-node-ct"><td colspan="', cols.length, '">',
            '<table class="x-treegrid-node-ct-table" cellpadding="0" cellspacing="0" style="table-layout: fixed; display: none; width: ', t.innerCt.getWidth() ,'px;"><colgroup>'
        );
        for(i = 0, len = cols.length; i<len; i++) {
            buf.push('<col style="width: ', (cols[i].hidden ? 0 : cols[i].width) ,'px;" />');
        }
        buf.push('</colgroup></table></td></tr></tbody>');

        if(bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", n.nextSibling.ui.getEl(), buf.join(''));
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(''));
        }

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1].firstChild.firstChild;
        var cs = this.elNode.firstChild.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        var index = 3;
        if(cb){
            this.checkbox = cs[3];
            // fix for IE6
            this.checkbox.defaultChecked = this.checkbox.checked;
            index++;
        }
        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
    }
});

// la getValue ritorna null, non stringa vuota
Ext.override(Ext.form.NumberField, {
    getValue: function () {
        var superValue = this.fixPrecision(this.parseValue(Ext.form.NumberField.superclass.getValue.call(this)));
        return superValue === '' ? null : superValue;
    }
});

// Aggiunge un metodo toggle() ai Field
Ext.override(Ext.form.Field, {
    toggle: function () {
        if (this.disabled) {
            this.enable();
        } else {
            this.disable();
        }
    }
});

// Autocomplete callback per i ComboBox
Ext.override(Ext.form.ComboBox, {
    listeners: {
        afterrender: function (combo) {
            var value = combo.getValue();
            // FIXME: magari controllare qualcosa di più preciso dell'esistenza
            // o meno di un proxy dello store collegato
            if (value && combo.store.proxy) {
                combo.store.load({
                    params: {
                        doctrineWhereIns: [{
                            field: 'id',
                            valueSet: [value]
                        }]
                    },
                    callback: function () {
                        combo.setValue(value);
                    }
                });
            }
        },
        // elimina il valore di una combobox che seleziona un id (di solito
        // relazione esterna) quando non viene impostato alcun valore, per
        // evitare di mandare al server coppie qualcosa_id = "" (stringa vuota)
        blur: function () {
            if (this.valueField == "id" && this.value === "") {
                //this.reset();
                this.setValue(null);
            }
        }
    },

    getParams: function (q) {
        var p = {};
        if (this.pageSize) {
            p.start = 0;
            p.limit = this.pageSize;
        }
        p.displayField = this.displayField;
        return p;
    }
})

// Così la PagingToolbar continua a mandare le store.lastOptions
Ext.override(Ext.PagingToolbar, {
    listeners: {
        beforechange: function (p, params) {
            var lastOptions = p.store.lastOptions;
            Ext.applyIf(params, lastOptions.params);
        }
    }
});

/**
 * Mostra i qtip nei form Field con l'opzione 'qtip'
 * http://www.extjs.com/forum/showthread.php?p=271883#post271883

    Ext.override(Ext.form.Field, {
        afterRender: Ext.form.Field.prototype.afterRender.createSequence(function(){
            if(this.qtip){
                var target = this.getTipTarget();
                if(typeof this.qtip == 'object'){
                    Ext.QuickTips.register(Ext.apply({
                          target: target
                    }, this.qtip));
                } else {
                    target.dom.qtip = this.qtip;
                }
            }
        }),
        getTipTarget: function(){
            return this.el;
        }
    });

    Ext.override(Ext.form.Checkbox, {
        getTipTarget: function(){
            return this.imageEl;
        }
    });

 */

/**
 * Ext.ux.Overrides
 *
 * This files contains various fixes and/or overridesds:
 *
 * @author  Ing. Jozef Sakalos
 * @version $Id: Ext.ux.Overrides.js 158 2008-04-10 00:03:18Z jozo $
 * @date    13. March 2008
 *
 * @license Ext.ux.Overrides is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

// {{{
// conditional override
/**
 * Same as Ext.override but overrides only if method doesn not exist in target class
 */
Ext.overrideIf = function(origclass, overrides) {
    if(overrides) {
        var p = origclass.prototype;
        for(var method in overrides) {
            if(!p[method]) {
                p[method] = overrides[method];
            }
        }
    }
};
// }}}
// {{{
// methods for Array object
Ext.overrideIf(Array, {

    // {{{
    /**
     * One dimensional copy
     * @return {Array} New array that is copy of this
     */
     copy:function() {
        var a = [];
        for(var i = 0, l = this.length; i < l; i++) {
            a.push(this[i]);
        }
        return a;
    } // eo function copy
    // }}}
    // {{{
    /**
     * @return {Integer} index of v or -1 if not found
     * @param {Mixed} v Value to find indexOf
     * @param {Integer} b Starting index
     */
    ,indexOf:function(v, b) {
        for(var i = +b || 0, l = this.length; i < l; i++) {
            if(this[i] === v) {
                return i;
            }
        }
        return -1;
    } // eo function indexOf
    // }}}
    // {{{
    /**
     * @return {Array} intersection of this and passed arguments
     */
    ,intersect:function() {
        if(!arguments.length) {
            return [];
        }
        var a1 = this, a2, a;
        for(var k = 0, ac = arguments.length; k < ac; k++) {
            a = [];
            a2 = arguments[k] || [];
            for(var i = 0, l = a1.length; i < l; i++) {
                if(-1 < a2.indexOf(a1[i])) {
                    a.push(a1[i]);
                }
            }
            a1 = a;
        }
        return a.unique();
    } // eo function intesect
    // }}}
    // {{{
    /**
     * @return {Integer} index of v or -1 if not found
     * @param {Mixed} v Value to find indexOf
     * @param {Integer} b Starting index
     */
    ,lastIndexOf:function(v, b) {
        b = +b || 0;
        var i = this.length;
        while(i-- > b) {
            if(this[i] === v) {
                return i;
            }
        }
        return -1;
    } // eof function lastIndexOf
    // }}}
    // {{{
    /**
     * @return {Array} New array that is union of this and passed arguments
     */
    ,union:function() {
        var a = this.copy(), a1;
        for(var k = 0, ac = arguments.length; k < ac; k++) {
            a1 = arguments[k] || [];
            for(var i = 0, l = a1.length; i < l; i++) {
                a.push(a1[i]);
            }
        }
        return a.unique();
    } // eo function union
    // }}}
    // {{{
    /**
     * Removes duplicates from array
     * @return {Array} new array with duplicates removed
     */
    ,unique:function() {
        var a = [], i, l = this.length;
        for(i = 0; i < l; i++) {
            if(a.indexOf(this[i]) < 0) {
                a.push(this[i]);
            }
        }
        return a;
    } // eo function unique
    // }}}

});
// }}}

// eof