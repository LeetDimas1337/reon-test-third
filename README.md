# Задание - написать механизм получения и сохранения oAuth(далее) токена.

1. Загрузить интеграцию - виджет в интерфейс амо через amo маркет.
2. При нажатии кнопки установить получать токен
3. При нажатии отключить удалять токен

Цель - подготовить серверную часть виджета для получения и хранения токенов от нескольких аккаунтов для корректной
работы будущего виджета.
При установке/удалении виджета на указанную в настройках ссылку приходит GET-запрос с необходимыми нам данными.

Нужно настроить роутер на эти эндпоинты и в модуле api.js изменить методы получения access и refresh токенов так, чтобы
при получении они сохранялись в отдельный .json файл, а при удалении, соответственно, файл удалялся. Для того, чтобы
файлы можно было отличать друг от друга в название файла добавлять account_id. После получения протестить работу сервера
получением любых данных с API amoCRM.
 
