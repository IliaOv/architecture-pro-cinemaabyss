@startuml
!NEW_C4_STYLE=1
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title C4 — Уровень контейнеров (Containers)

Person(user, "Пользователь", "Использует веб, мобильные приложения или Smart TV для просмотра контента")

System_Boundary(system, "Кинобездна") {

    Container(apiGW, "API Gateway", "Nginx / Kong / Envoy", "Единая точка входа для клиентов, маршрутизация запросов к микросервисам")

    Container(auth, "Auth Service", "Go", "Аутентификация, авторизация, управление профилями пользователей. Хранит хэши паролей и токены")

    Container(userSvc, "User Service", "Go", "Данные профилей, настройки, избранные списки, история просмотров")

    Container(ratingSvc, "Rating Service", "Go", "Оценки пользователей, лайки/дизлайки, агрегации и хранение")

    Container(moviesSvc, "Movies Service", "Go", "Каталог видео: названия, жанры, актёры, метаданные")

    Container(subscriptionSvc, "Subscription & Billing Service", "Go", "Управление подписками, скидками, платежами")

    Container(ratingSvc, "Rating Service", "Go", "Оценки пользователей, лайки/дизлайки, агрегации и хранение")

    Container(recoAdapter, "Recommendation Adapter", "Go", "Прокси-слой взаимодействия со сторонней рекомендательной системой. Асинхронные вызовы")

    ContainerDb(pgUsers, "Users DB", "PostgreSQL", "Данные пользователей")
    ContainerDb(pgVideos, "Video DB", "PostgreSQL", "Информация о видео, жанрах, актёрах")
    ContainerDb(pgRatings, "Rating DB", "PostgreSQL", "Оценки пользователей")
    ContainerDb(pgSubs, "Billing DB", "PostgreSQL", "Подписки, транзакции, скидки")

    ContainerQueue(events, "Events", "Kafka / RabbitMQ", "Асинхронные события: новая оценка, обновление каталога, изменение подписки")

}

System_Ext(recoSystem, "Recommendation System", "Сторонняя рекомендательная система")

System_Ext(paymentGateway, "Payment Gateway", "Внешняя платежная система")

System_Ext(on, "Online cinema", "Онлайн кинотеатры")

' Relationships

Rel(user, apiGW, "Взаимодействует через REST")

Rel(apiGW, auth, "REST")
Rel(apiGW, userSvc, "REST")
Rel(apiGW, moviesSvc, "REST")
Rel(apiGW, subscriptionSvc, "REST")
Rel(apiGW, ratingSvc, "REST")
Rel(apiGW, recoAdapter, "REST")

Rel(auth, pgUsers, "Чтение/запись")

Rel(userSvc, pgUsers, "Чтение/запись")

Rel(ratingSvc, pgRatings, "Чтение/запись")

Rel(subscriptionSvc, pgSubs, "Чтение/запись")
Rel(subscriptionSvc, paymentGateway, "API вызовы")
Rel(moviesSvc, on, "API вызовы")
Rel(moviesSvc, pgVideos, "Чтение/запись")
Rel(moviesSvc, events, "Публикует события")
Rel(ratingSvc, events, "Публикует события")
Rel(subscriptionSvc, events, "Публикует события")

Rel(events, recoAdapter, "Триггеры рекомендаций")

Rel(recoAdapter, recoSystem, "Запросы рекомендаций")

@enduml
