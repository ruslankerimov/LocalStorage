/**
 * Библиотека, реализующая кроссбраузерно хранилище данных на клиенте
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
        key += '';

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

            if (item.value && item.value.expires && now > item.value.expires) {
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
    driversPriority : ['DOM', 'IE', 'Flash'] /* Приоритет при выботе драйвера */
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
        if (JSON && JSON.stringify) {
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
        if (type != 'function' && typeof(obj.length) == 'number') {
            var ret = [];

            for (var i = 0; i < o.length; ++i) {
                ret.push(self(o[i]));
            }

            return '[' + ret.join(',') + ']';
        }

        if (type == 'function') {
            throw new TypeError('Unable to convert object of type "function" to json.');
        }

        var ret = [];

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
    }
};

LocalStorage.drivers = {};

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

/**
 * Драйвер для броузеров, поддерживающих flash
 */
LocalStorage.drivers['Flash_driver'] = {
    type : 'Flash',
    
    check : function() {
        return false;
    }
};

/* Хуже не будет если инициадизацию провести прямо здесь */
//LocalStorage.init();