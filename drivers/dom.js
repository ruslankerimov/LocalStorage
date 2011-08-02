/**
 * Драйвер для современных броузеров, поддерживающих стандарт HTML5
 */
LocalStorage.drivers['DOM_driver'] = {
    _storage : null,

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
        this._storage = window.localStorage
            || (window.globalStorage && window.globalStorage[document.domain] /* для FF lt 4 */);
    },

    /**
     * Получение значения по ключу
     * @param {String} key
     * @return в случае, если ключ не был задан возвращает undefined
     */
    get : function(key) {
        key += '';
        return this.parseJSON(this._storage[key]);
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
                value : this.parseJSON(this._storage[key])
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