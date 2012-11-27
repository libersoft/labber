Ext.ns('Ext.ux.form');

Ext.ux.form.ClearableComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent: function () {
        this.triggerConfig = {
            tag:'span',
            cls:'x-form-twin-triggers',
            cn:[

            {
                tag: "img",
                src: Ext.BLANK_IMAGE_URL,
                cls: "x-form-trigger x-form-clear-trigger"
            },

            {
                tag: "img",
                src: Ext.BLANK_IMAGE_URL,
                cls: "x-form-trigger"
            }
            ]
        };
        Ext.ux.form.ClearableComboBox.superclass.initComponent.call(this);
    },

    onTrigger1Click: function () {
        this.collapse();
        if (!Ext.isEmpty(this.value)) {
            this.setValue();                    // clear contents of combobox
            this.fireEvent('cleared', this);    // send notification that contents have been cleared
        }
    },

    getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger,
    initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger,
    onTrigger2Click: Ext.form.ComboBox.prototype.onTriggerClick,
    trigger1Class: Ext.form.ComboBox.prototype.triggerClass,
    trigger2Class: Ext.form.ComboBox.prototype.triggerClass
});

Ext.reg('clearcombo', Ext.ux.form.ClearableComboBox);
