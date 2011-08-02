var cases = [
    [0, 'easy string'],
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

QUnit.module('LocalStorage');
QUnit.test('Инициализации библиотеки', function() {
    QUnit.raises(LocalStorage.init(), 'прошло без исключений');
});
QUnit.test('Доступность стораджа', function() {
    LocalStorage.init();
    QUnit.ok(LocalStorage.check(), 'стордж доступен');
});

if (LocalStorage.init()) {
    QUnit.test('Проверка записи LocalStorage::data', function() {
        LocalStorage.init();
        LocalStorage.driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            QUnit.raises(
                driver.set(cases[i][0], cases[i][1]),
                'прошло без исключений key: ' + cases[i][0] + ', value: ' + cases[i][1]
            );
        }
    });

    QUnit.test('Проверка чтения driver::get', function() {
        LocalStorage.init();
        LocalStorage.driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }

        for (var i = 0; i < cases.length; ++i) {
            var value = driver.get(cases[i][0]);

            QUnit.deepEqual(
                value,
                cases[i][1],
                'должно быть верно'
            );
            if (cases[i].length > 2) {
                for (var j = 2; j < cases[i].length; ++j) {
                    QUnit.notDeepEqual(
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
    QUnit.test('Инициализации драйвера', function() {
        QUnit.raises(driver.init(), 'прошло без исключений');
    });

    QUnit.test('Удаление всех ключей', function() {
        driver.init();
        QUnit.raises(driver.removeAll(), 'прошло без исключений');
    });

    QUnit.test('Проверка записи driver::set', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            QUnit.raises(
                driver.set(cases[i][0], cases[i][1]),
                'прошло без исключений key: ' + cases[i][0] + ', value: ' + cases[i][1]
            );
        }
    });

    QUnit.test('Проверка чтения driver::get', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }
        
        for (var i = 0; i < cases.length; ++i) {
            var value = driver.get(cases[i][0]);

            QUnit.deepEqual(
                value,
                cases[i][1],
                'должно быть верно'
            );
            if (cases[i].length > 2) {
                for (var j = 2; j < cases[i].length; ++j) {
                    QUnit.notDeepEqual(
                        value,
                        cases[i][j],
                        'должно быть не верно'
                    );
                }
            }
        }
    });

    QUnit.test('Проверка удаления driver::remove', function() {
        driver.init();
        driver.removeAll();

        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }

        for (var i = 0; i < cases.length; ++i) {
            driver.remove(cases[i][0]);

            QUnit.strictEqual(
                driver.get(cases[i][0]),
                undefined,
                'должно быть undefined'
            );
        }
    });

    QUnit.test('Проверка удаления всего driver::removeAll', function() {
        driver.init();
        driver.removeAll();
        
        for (var i = 0; i < cases.length; ++i) {
            driver.set(cases[i][0], cases[i][1]);
        }

        driver.removeAll();
        for (var i = 0; i < cases.length; ++i) {
            QUnit.strictEqual(
                driver.get(cases[i][0]),
                undefined,
                'должно быть undefined'
            );
        }
    });
}