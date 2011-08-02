/**
 * Драйвер для броузеров IE lt 8, поддерживающих userData
 */
LocalStorage.drivers['IE_driver'] = {
    _storage : null,

    type : 'IE',

    check : function() {
        return !!window.ActiveXObject;
    },

    init : function() {
        var elm = document.createElement('div');

        elm.style.display = 'none';
        elm.id = 'LocalStorageElement';
        document.body.appendChild(elm);
        elm.addBehavior('#default#userData');
        elm.load('namespace');
        this._storage = elm;
    },

    get : function(key) {
        key += '';
        return this.parseJSON(this._storage.getAttribute(key));
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
                value : this.parseJSON(attrs[i].value)
            });
        }
        return ret;
    },

    removeAll : function() {
        var attrs = this._storage.XMLDocument.documentElement.attributes;

        for(var i = 0; i < attrs.length; ++i) {
            this['delete'](attrs.name);
        }
    }
};