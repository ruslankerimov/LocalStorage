var cases = [
    ['key0', 'easy string'],
    [null, 'easy string'],
    [undefined, 'easy string'],
    ['key1', 'easy string'],
    ['key2', null, 0, false, '', undefined],
    ['key3', false, 0, null, '', undefined, 1],
    ['key4', {1:'bla', foo:'bar', bla:false}, {1:'bla', foo:'bar', bla:0}, {1:'bla', foo:'bar', bla:''}, {1:'bla', foo:'bar', bla:{}}],
    ['key5', {1:'bla', foo:'bar', sub: {aga: 'rert', bla:false}}, {1:'bla', foo:'bar', sub: {}}, {1:'bla', foo:'bar', sub: {aga: 'rert', bla: 0} }]
];

for (var i in LocalStorage.drivers) {
    (function() {
        var driver = new LocalStorage.Driver(LocalStorage.drivers[i].type);

        QUnit.module(driver.type.toUpperCase() + '_driver');
        QUnit.test('Поддержка драйвера', function() {
            QUnit.ok(driver.check(), 'драйвер подддерживается');
        });

        if (driver.check()) {
            goTests(driver);
        }
    })();
}

module('LocalStorage');
test('Инициализации библиотеки', function() {
    raises(LocalStorage.init(), 'прошло без исключений');
});
LocalStorage.init();
test('Доступность стораджа', function() {
    ok(LocalStorage.check(), 'стордж доступен');
});

if (LocalStorage.check()) {
    test('Проверка записи LocalStorage::data', function() {
        LocalStorage.init();
        LocalStorage.driver().removeAll();

        for (var i = 0; i < cases.length; ++i) {
            raises(
                LocalStorage.data(cases[i][0], cases[i][1]),
                'прошло без исключений key: ' + cases[i][0] + ', value: ' + cases[i][1]
            );
        }
    });

    test('Проверка чтения LocalStorage::data', function() {
        LocalStorage.init();
        LocalStorage.driver().removeAll();

        for (var i = 0; i < cases.length; ++i) {
            LocalStorage.data(cases[i][0], cases[i][1]);
        }

        for (var i = 0; i < cases.length; ++i) {
            var value = LocalStorage.data(cases[i][0]);

            deepEqual(
                value,
                cases[i][1],
                'должно быть верно'
            );
            if (cases[i].length > 2) {
                for (var j = 2; j < cases[i].length; ++j) {
                    notDeepEqual(
                        value,
                        cases[i][j],
                        'должно быть не верно'
                    );
                }
            }
        }
    });
}

function goTests(driver) {
    test('Инициализации драйвера', function() {
        raises(driver.init(), 'прошло без исключений');
    });

    test('Удаление всех ключей', function() {
        driver.init();
        raises(driver.removeAll(), 'прошло без исключений');
    });

    test('Проверка записи driver::set', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            raises(
                driver.set(cases[i][0], cases[i][1]),
                'прошло без исключений key: ' + cases[i][0] + ', value: ' + cases[i][1]
            );
        }
    });

    test('Проверка чтения driver::get', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }
        
        for (var i = 0; i < cases.length; ++i) {
            var value = driver.get(cases[i][0]);

            deepEqual(
                value,
                cases[i][1],
                'должно быть верно'
            );
            if (cases[i].length > 2) {
                for (var j = 2; j < cases[i].length; ++j) {
                    notDeepEqual(
                        value,
                        cases[i][j],
                        'должно быть не верно'
                    );
                }
            }
        }
    });

    test('Проверка удаления driver::remove', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }

        for (var i = 0; i < cases.length; ++i) {
            driver.remove(cases[i][0]);

            strictEqual(
                driver.get(cases[i][0]),
                undefined,
                'должно быть undefined'
            );
        }
    });

    test('Проверка удаления всего driver::removeAll', function() {
        driver.init();
        driver.removeAll();
        
        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }

        driver.removeAll();
        for (var i = 0; i < cases.length; ++i) {
            strictEqual(
                driver.get(cases[i][0]),
                undefined,
                'должно быть undefined'
            );
        }
    });
}