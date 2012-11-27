/*jslint
 onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
 bitwise: true, regexp: true, strict: true, newcap: true, immed: true
 
 */

/*global
 Ext: true,
 Lab: true
 */

"use strict";

Ext.ux.grid.filter.DateItFilter = Ext.extend(Ext.ux.grid.filter.DateFilter, {

    afterText: 'Dal',

    beforeText: 'Al',

    dateFormat: 'd/m/Y',

    onText: 'Il',

    menuItems: ['after', 'before', '-', 'on'],

    /**
     *  Override per includere gli estremi di dal - al
     **/
    validateRecord: function (record) {
        var key, pickerValue, val = record.get(this.dataIndex);

        if (!Ext.isDate(val)) {
            return false;
        }
        val = val.clearTime(true).getTime();

        for (key in this.fields) {
            if (this.fields[key].checked) {
                pickerValue = this.getFieldValue(key).clearTime(true).getTime();
                //if (key == 'before' && pickerValue < val) {
                if (key === 'before' && pickerValue <= val) {
                    return false;
                }
                //if (key == 'after' && pickerValue > val) {
                if (key === 'after' && pickerValue >= val) {
                    return false;
                }
                if (key === 'on' && pickerValue !== val) {
                    return false;
                }
            }
        }
        return true;
    }
});