/**
 * Драйвер для современных броузеров, поддерживающих стандарт HTML5
 */
LocalStorage.drivers['DOM_driver'] = {
    _storage : null,

    _inited : false,

    _isFF   : false,
    
    type : 'DOM',

    /**
     * Проверка доступности драйвера
     * @return {Boolean}
     */
    check : function() {
        return !!(window.localStorage
            || window.globalStorage /* для FF lt 4 */);
    },

    /**
     * Инициализяция драйвера
     */
    init : function() {
        if ( ! this.check()) {
            return;
        }

        if (window.localStorage) {
            this._storage = window.localStorage
        } else if (window.globalStorage) {
            this._storage = window.globalStorage[document.domain]; /* для FF lt 4 */
            this._isFF = true;
        }
        
        this._inited = true;
    },

    /**
     * Получение значения по ключу
     * @param {String} key
     * @return в случае, если ключ не был задан возвращает undefined
     */
    get : function(key) {
        key += '';
        var ret = this._storage[key];
        
        if (ret === null) {
            ret = undefined;
        }
        return this.parseJSON(ret);
    },

    /**
     * Установка зачения ключа
     * @param {String} key
     * @param value
     */
    set : function(key, value) {
        key += '';
        this._storage[key] = this.stringify(value);
    },

    /**
     * Удаление ключа
     * @param key
     */
    remove : function(key) {
        key += '';
        delete this._storage[key];
    },

    /**
     * Получение всех ключей
     * @return {Array}
     */
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

    /**
     * Удаление всех ключей
     */
    removeAll : function() {
        for (var key in this._storage) if (this._storage.hasOwnProperty(key)) {
            delete this._storage[key];
        }
    }
};