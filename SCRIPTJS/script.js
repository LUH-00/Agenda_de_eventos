document.addEventListener("DOMContentLoaded", function() {
    const addEventButton = document.getElementById("addEventButton");
    const eventFormContainer = document.getElementById("eventFormContainer");
    const eventsList = document.getElementById("eventsList");
    const alarmSound = document.getElementById("alarmSound");

    addEventButton.addEventListener("click", function() {
        showEventForm();
    });

    function showEventForm() {
        const eventId = Date.now();
        const formHTML = `
            <div class="card form-card" id="form-${eventId}">
                <div class="card-body">
                    <form onsubmit="submitEvent(event, ${eventId})">
                        <div class="form-group">
                            <label for="eventTitle-${eventId}">Título do Evento</label>
                            <input type="text" class="form-control" id="eventTitle-${eventId}" required>
                        </div>
                        <div class="form-group">
                            <label for="eventDate-${eventId}">Data e Hora do Evento</label>
                            <input type="datetime-local" class="form-control" id="eventDate-${eventId}" required>
                        </div>
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i></button>
                    </form>
                    <button class="btn btn-danger btn-sm float-right mt-2" onclick="removeForm(${eventId})">&times;</button>
                </div>
            </div>
        `;

        eventFormContainer.insertAdjacentHTML("beforeend", formHTML);
    }

    window.submitEvent = function(event, eventId) {
        event.preventDefault();
        addEvent(eventId);
    }

    function addEvent(eventId) {
        const eventTitle = document.getElementById(`eventTitle-${eventId}`).value;
        const eventDate = new Date(document.getElementById(`eventDate-${eventId}`).value);

        const now = new Date();
        const timeToEvent = eventDate - now;

        if (!isNaN(eventDate)) {
            if (timeToEvent <= 0) {
                alert("A data e hora selecionadas já passaram. Por favor, selecione uma data e hora futuras.");
                return;
            }

            const eventHTML = `
                <div class="card mt-2 event-card ${eventDate < now ? 'event-card-passed' : ''}" id="event-${eventId}">
                    <div class="card-body">
                        <h5 class="card-title">${eventTitle}</h5>
                        <p class="card-text">${eventDate.toLocaleString()}</p>
                        <button class="btn btn-danger btn-sm float-right" onclick="removeEvent(${eventId})">&times;</button>
                    </div>
                </div>
            `;

            eventsList.insertAdjacentHTML("beforeend", eventHTML);
            saveEventToLocalStorage(eventId, eventTitle, eventDate);
            scheduleNotification(eventTitle, eventDate, eventId);
            removeForm(eventId);
        } else {
            alert("Por favor, insira uma data e hora válidas.");
        }
    }

    function saveEventToLocalStorage(eventId, title, date) {
        const event = { id: eventId, title, date, notified: false };
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
    }

    function loadEventsFromLocalStorage() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => {
            const eventDate = new Date(event.date);
            if (new Date() > eventDate && !event.notified) {
                // Evento já passou e ainda não foi notificado
                showMissedNotification(event.title);
                playAlarm();
                markEventAsNotified(event.id);
            } else {
                // Adiciona o evento à lista, verificando se já passou para aplicar a classe event-card-passed
                addEventCard(event.id, event.title, eventDate);
                scheduleNotification(event.title, eventDate, event.id);
            }
        });
    }

    function addEventCard(eventId, eventTitle, eventDate) {
        const now = new Date();
        const eventHTML = `
            <div class="card mt-2 event-card ${eventDate < now ? 'event-card-passed' : ''}" id="event-${eventId}">
                <div class="card-body">
                    <h5 class="card-title">${eventTitle}</h5>
                    <p class="card-text">${eventDate.toLocaleString()}</p>
                    <button class="btn btn-danger btn-sm float-right" onclick="removeEvent(${eventId})">&times;</button>
                </div>
            </div>
        `;

        eventsList.insertAdjacentHTML("beforeend", eventHTML);
    }

    function scheduleNotification(title, date, id) {
        const now = new Date();
        const timeToEvent = date - now;

        if (timeToEvent > 0) {
            setTimeout(function() {
                showNotification(title, id);
                playAlarm();
            }, timeToEvent);
        }
        // Não há remoção automática de eventos passados aqui
    }

    function showNotification(title, id) {
        if (Notification.permission === "granted") {
            const notification = new Notification("Evento de Hoje", {
                body: `Não se esqueça!: ${title}`,
                icon: "https://image.flaticon.com/icons/png/512/609/609051.png"
            });

            notification.onclick = function() {
                notification.close();
                stopAlarm();
                removeEvent(id);
            };
        } else {
            alert(`Não se esqueça do seu evento: ${title}`);
            playAlarm();
        }
    }

    function showMissedNotification(title) {
        if (Notification.permission === "granted") {
            new Notification("Evento Perdido", {
                body: `Você perdeu este evento: ${title}`,
                icon: "https://image.flaticon.com/icons/png/512/609/609051.png"
            });
        } else {
            alert(`Você perdeu este evento: ${title}`);
        }
    }

    function markEventAsNotified(id) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.map(event => {
            if (event.id === id) {
                event.notified = true;
            }
            return event;
        });
        localStorage.setItem('events', JSON.stringify(events));
    }

    function playAlarm() {
        alarmSound.play();
    }

    function stopAlarm() {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }

    window.removeEvent = function(id) {
        const eventCard = document.getElementById(`event-${id}`);
        if (eventCard) {
            eventCard.remove();
            stopAlarm();  // Parar o alarme ao remover o evento
            removeEventFromLocalStorage(id);
        }
    }

    window.removeForm = function(id) {
        const formCard = document.getElementById(`form-${id}`);
        if (formCard) {
            formCard.remove();
        }
    }

    function removeEventFromLocalStorage(id) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.id !== id);
        localStorage.setItem('events', JSON.stringify(events));
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    loadEventsFromLocalStorage();
});
