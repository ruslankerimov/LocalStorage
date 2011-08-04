/**
 * Драйвер для броузеров FF lt 4
 */
LocalStorage.drivers['FF_driver'] = {
    _storage : null,

    _inited : false,

    type : 'FF',

    check : function() {
        return !!window.globalStorage;
    },

    init : function() {
        if ( ! this.check()) {
            return;
        }

        this._storage = window.globalStorage[document.domain];
        this._inited = true;
    },

    get : function(key) {
        key += '';
        var ret = this._storage[key];
        
//        if (ret === null) {
//            ret = undefined;
//        }
        return this.parseJSON(ret);
    },

    set : function(key, value) {
        key += '';
        this._storage[key] = this.stringify(value);
    },

    remove : function(key) {
        key += '';
        delete this._storage[key];
    },

    getAll : function() {
        var ret = [];

        for (var key in this._storage) if (this._storage.hasOwnProperty(key)) {
            ret.push({
                key   : key,
                value : this.get(key)
            });
        }

        return ret;
    },

    removeAll : function() {
        for (var key in this._storage) if (this._storage.hasOwnProperty(key)) {
            delete this._storage[key];
        }
    }
};