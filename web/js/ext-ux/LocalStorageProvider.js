Ext.ns('Ext.ux.state');

/**
 * @class Ext.ux.state.LocalStorageProvider
 * @extends Ext.state.Provider
 * A Provider implementation which saves and retrieves state via the HTML5 localStorage object.
 * If the browser does not support local storage, an exception will be thrown upon instantiating
 * this class.
 * <br />Usage:
 <pre><code>
   Ext.state.Manager.setProvider(new Ext.ux.state.LocalStorageProvider({prefix: 'my-'}));
 </code></pre>
 * @cfg {String} prefix The application-wide prefix for the stored objects
 * @constructor
 * Create a new LocalStorageProvider
 * @param {Object} config The configuration object
 */
Ext.ux.state.LocalStorageProvider = Ext.extend(Ext.state.Provider, {

    constructor: function (config) {
        Ext.ux.state.LocalStorageProvider.superclass.constructor.call(this);
        Ext.apply(this, config);
        this.store = this.getStorageObject();
        this.state = this.readLocalStorage();
    },

    readLocalStorage: function () {
        var store = this.store,
            i = 0,
            len = store.length,
            prefix = this.prefix,
            prefixLen = prefix.length,
            data = {},
            key;

        for (; i < len; ++i) {
            key = store.key(i);
            if (key.substring(0, prefixLen) == prefix) {
                data[key.substr(prefixLen)] = this.decodeValue(store.getItem(key));
            }
        }

        return data;
    },

    set: function (name, value) {
        this.clear(name);
        if (typeof value == "undefined" || value === null) {
            return;
        }
        this.store.setItem(this.prefix + name, this.encodeValue(value));

        Ext.ux.state.LocalStorageProvider.superclass.set.call(this, name, value);
    },

    // private
    clear: function (name) {
        this.store.removeItem(this.prefix + name);

        Ext.ux.state.LocalStorageProvider.superclass.clear.call(this, name);
    },

    getStorageObject: function () {
        try {
            var supports = 'localStorage' in window && window['localStorage'] !== null;
            if (supports) {
                return window.localStorage;
            }
        } catch (e) {
            return false;
        }
        //<debug>
        console.error('LocalStorage is not supported by the current browser');
        //</debug>
    }
});
