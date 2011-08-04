/**
 * Драйвер для современных броузеров, поддерживающих стандарт HTML5
 */
LocalStorage.drivers['DOM_driver'] = {
    _storage : null,

    _inited : false,

    type : 'DOM',

    /**
     * Проверка доступности драйвера
     * @return {Boolean}
     */
    check : function() {
        try {
            return !!localStorage.getItem;
        } catch(e) {
            return false;
        }
    },

    /**
     * Инициализяция драйвера
     */
    init : function() {
        if ( ! this.check()) {
            return;
        }

        this._storage = window.localStorage;
        this._inited = true;
    },

    /**
     * Получение значения по ключу
     * @param {String} key
     * @return в случае, если ключ не был задан возвращает undefined
     */
    get : function(key) {
        key += '';
        var ret = this._storage.getItem(key);
        
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
        this._storage.setItem(key, this.stringify(value));
    },

    /**
     * Удаление ключа
     * @param key
     */
    remove : function(key) {
        key += '';
        this._storage.removeItem(key);
    },

    /**
     * Получение всех ключей
     * @return {Array}
     */
    getAll : function() {
        var ret = [];

        for (var i = 0; i < this._storage.length; ++i) {
            var key = this._storage.key(i);

            ret.push({
                key   : key,
                value : this.get(key)
            })
        }

        return ret;
    },

    /**
     * Удаление всех ключей
     */
    removeAll : function() {
        this._storage.clear();
    }
};