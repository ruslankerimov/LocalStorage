/**
 * Библиотека, реализующая хранилище данных на клиенте
 */
var LocalStorage = (function() {
    var self = {},          /* Ссылка на себя */
        driver = null,      /* Драйвер для работы со стороджем */
        check  = false;     /* Флаг доступности */

    function init() {
        var driverType;

        /* Обходим драйвера в определённом порядке и находим первый подходящий */
        for (var i = 0; i < LocalStorage.config.driversPriority.length; ++i) {
            var driverName = LocalStorage.config.driversPriority[i] + '_driver';

            if (LocalStorage.drivers[driverName].check()) {
                driverType = LocalStorage.config.driversPriority[i];
                break;
            }
        }

        if ( ! driverType) {
            return;
        }

        check  = true;
        driver = new LocalStorage.Driver(driverType);
        driver.init();
        garbageCollector();
    }

    /**
     * Получает значение ключа
     * @param key
     * @return  в случае, если ключ не был задан возвращает undefined
     */
    function get(key) {
        key = LocalStorage.config.namespace + '_' + key;
        var ret = driver.get(key);

        if ( ! ret) {
            return ret;
        } else if (ret.expires !== undefined) {
            var now = (new Date).getTime();

            if (ret.expires && now < ret.expires) {
                driver.remove(key);
                return undefined;
            } else {
                return ret.value;
            }
        }

        return ret;
    }

    /**
     * Устанавливает ключ в значение
     * @param {String} key
     * @param value
     * @param {Number} period время жизни ключа в секундах
     * @return {Boolean} возвращает успешность записи
     */
    function set(key, value, period) {
        period = parseInt(period || 0);
        key = LocalStorage.config.namespace + '_' + key;

        var now = (new Date).getTime();

        try {
            driver.set(key, {
                value   : value,
                expires : now + period * 1000
            });
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Удаляет ключи с истекшим сроком
     */
    function garbageCollector() {
        var list = driver.getAll(),
            now = (new Date).getTime();

        for (var i = 0; i < list.length; ++i) {
            var item = list[i];

            if (item.key.indexOf(LocalStorage.config.namespace + '_') == 0
                && item.value && item.value.expires
                && now > item.value.expires) {
                    driver.remove(item.key);
            }
        }
    }

    /**
     * Публичные методы и свойства, прокидываем приватные методы
     */
    self.init  = init;
    self.check = function() {
        return check;
    };

    /**
     * Универсальный метод: геттер и сеттер
     */
    self.data = function () {
        var args = Array.prototype.slice.call(arguments);

        if (args.length > 1) {
            return set.apply(self, args);
        } else if (args.length == 1) {
            return get.apply(self, args);
        }
    };

    return self;
})();


LocalStorage.config = {
    driversPriority : ['DOM', 'IE', 'Flash'], /* Приоритет при выборе драйвера */
    namespace       : 'ls'                    /* Namespace дла ключей */
};

/**
 * Фабрика для драйвера
 */
LocalStorage.Driver = function(type) {
    var needDriver = LocalStorage.drivers[type + '_driver'];

    if (needDriver) {
        for(var key in needDriver) {
            this[key] = needDriver[key];
        }
    }
};

LocalStorage.Driver.prototype = {
    escapeString : function(str) {
        return str;
    },

    /**
     * Преобразование объекта в строку
     * @param {Object} o
     * @return {String}
     */
    stringify : function self(o) {
        if (window.JSON && JSON.stringify) {
            return JSON.stringify(o);
        }

        var type = typeof(o);

        if (type == 'undefined') {
            return 'undefined';
        } else if (type == 'number' || type == 'boolean') {
            return o + '';
        } else if (o === null) {
            return 'null';
        }

        if (type == 'string') {
            return '"' + this.escapeString(o) + '"';
        }

        /* Array */
        var ret = [];
        if (type != 'function' && typeof(obj.length) == 'number') {
            for (var i = 0; i < o.length; ++i) {
                ret.push(self(o[i]));
            }

            return '[' + ret.join(',') + ']';
        }

        if (type == 'function') {
            throw new TypeError('Unable to convert object of type "function" to json.');
        }

        for (var k in o) if (o.hasOwnProperty(k)) {
            ret.push('"' + k + '"' + ':' + self(o[k]));
        }

        return '{' + ret.join(',') + '}';
    },

    /**
     * Преобразование строки в объект
     * @todo добавить проверку на безопасный парсинг
     * @param str
     * @return {Object}
     */
    parseJSON : function(str) {
        try {
            var ret = eval('(' + str + ')');
        } catch (e) {
            ret = null;
        }
        return ret;
    },

    /**
     * Проверка доступности драйвера
     * @return {Boolean}
     */
    check : function() {
        return false;
    },

    /**
     * Инициализяция драйвера
     */
    init : function() {},

    /**
     * Получение значения по ключу
     * @param {String} key
     * @return в случае, если ключ не был задан возвращает undefined
     */
    get : function(key) {},

    /**
     * Установка зачения ключа
     * @param {String} key
     * @param value
     */
    set : function(key, value) {},

    /**
     * Удаление ключа
     * @param key
     */
    remove : function(key) {},

    /**
     * Получение всех ключей
     * @return {Array}
     */
    getAll : function() {},

    /**
     * Удаление всех ключей
     */
    removeAll : function() {}
};

LocalStorage.drivers = {};

LocalStorage.init(); /* Инициализацию можно вынести и в другое место */