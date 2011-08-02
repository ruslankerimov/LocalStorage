/**
 * Драйвер для броузеров, поддерживающих flash
 */
LocalStorage.drivers['Flash_driver'] = {
    type : 'Flash',

    check : function() {
        return false;
    }
};