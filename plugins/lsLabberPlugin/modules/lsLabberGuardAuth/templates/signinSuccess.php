<?php

$message = "<b>Inserisci nome utente e password</b><br/>";

if ($form->hasErrors())
{
  $message .= "<span style=\"color:red;font-weight:bold;\">";
  $message .= "Nome utente e/o password sono sbagliati";
  $message .= "</span>";
}

?>
<script type="text/javascript">
    Ext.ns('Lab');

    Lab.signin = {
        init: function () {
            Ext.QuickTips.init();

            this.panel = new Ext.Panel({
                bbar: [{
                    xtype: 'box',
                    autoEl: {
                      tag: 'img',
                      src: '<?php echo image_path('icons/libersoft', true)?>'
                    }
                }],
                tbar: [' ', {
                    xtype: 'box',
                    autoEl: {
                      tag: 'img',
                      src: '<?php echo image_path('menu-logo', true)?>'
                    }
                }]
            });

            this.viewport = new Ext.Viewport({
                layout: 'fit',
                items: this.panel
            });

            var form = new Ext.form.FormPanel({
                standardSubmit: true,
                border: false,
                defaults: {
                    xtype: 'textfield',
                    width: 150
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Nome utente',
                    name: 'signin[username]',
                    allowBlank: false,
                    anchor: '0',
                    ref: 'username',
                    id: 'sfGuardAuthSigninUsername'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Password',
                    name: 'signin[password]',
                    inputType: 'password',
                    allowBlank: true,
                    anchor: '0'
                },
                {
                    xtype: 'hidden',
                    name: 'signin[remember]',
                    value: true
                },
                {
                    xtype: 'hidden',
                    name: 'signin[_csrf_token]',
                    value: '<?php echo $form->getCSRFToken() ?>'
                }],
                keys: [{
                    key: Ext.EventObject.ENTER,
                    fn: function () {
                        form.getForm().submit();
                    }
                }]
            });

            this.sendData = function () {
                form.getForm().submit();
            };

            this.win = new Ext.Window({
                title: 'Labber: login',
                width: '350',
                height: '200',
                tbar: [
                    '<?php echo $message ?>',
                    '->',
                    '<?php echo image_tag('signinSuccessIcons/lock.png', true)?>'
                ],
                iconCls: 'icon-small-locked',
                layout: 'fit',
                items: form,
                bodyStyle: 'padding:13px;background-color:#ffffff',
                buttons: [{
                    text: 'Login',
                    iconCls: 'icon-medium-key',
                    scale: 'medium',
                    width: 100,
                    handler: this.sendData,
                    scope: this
                }],
                closable: false,
                modal: true,
                resizable: true,
                draggable: true,
                defaultButton: 'sfGuardAuthSigninUsername'
            });

            this.win.show();
        },

        centerWindow: function () {
            this.win.center();
        }
    };

    Ext.onReady(Lab.signin.init, Lab.signin);
</script>
