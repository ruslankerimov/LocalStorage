/**
 * Драйвер для броузеров IE lt 8, поддерживающих userData
 */
LocalStorage.drivers['IE_driver'] = {
    _storage : null,

    _inited : false,
    
    type : 'IE',

    check : function() {
        return !!window.ActiveXObject;
    },

    init : function() {
        if ( ! this.check()) {
            return;
        }

        var elm = document.createElement('meta');

        elm.style.display = 'none';
        elm.id = 'LocalStorageElement';
        document.getElementsByTagName('head')[0].appendChild(elm);
        elm.addBehavior('#default#userData');
        elm.load('namespace');
        this._storage = elm;
        this._inited = true;
    },

    get : function(key) {
        key += '';
        var ret = this._storage.getAttribute(key);

        if (ret === null) {
            return undefined;
        }
        return this.parseJSON(ret);
    },

    set : function(key, value) {
        key += '';
        value = this.stringify(value);
        this._storage.setAttribute(key, value);
        this._storage.save('namespace');
    },

    remove : function(key) {
        key += '';
        this._storage.removeAttribute(key);
        this._storage.save('namespace');
    },

    getAll : function() {
        var ret = [],
            attrs = this._storage.XMLDocument.documentElement.attributes;

        for (var i = 0; i < attrs.length; ++i) {
            ret.push({
                key   : attrs[i].name,
                value : this.get(attrs[i].name)
            });
        }
        return ret;
    },

    removeAll : function() {
        var attrs = this._storage.XMLDocument.documentElement.attributes;

        for(var i = 0; i < attrs.length; ++i) {
            this['remove'](attrs[i].name);
        }
    }
};