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

        if (!isNaN(eventDate)) {
            const eventHTML = `
                <div class="card mt-2" id="event-${eventId}">
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
        const event = { id: eventId, title, date };
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
    }

    function loadEventsFromLocalStorage() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => {
            addEventCard(event.id, event.title, new Date(event.date));
            scheduleNotification(event.title, new Date(event.date), event.id);
        });
    }

    function addEventCard(eventId, eventTitle, eventDate) {
        const eventHTML = `
            <div class="card mt-2" id="event-${eventId}">
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
                showNotification(title);
                playAlarm();
                removeEvent(id);
            }, timeToEvent);
        }
    }

    function showNotification(title) {
        if (Notification.permission === "granted") {
            new Notification("Evento de Hoje", {
                body: `Não se esqueça!: ${title}`,
                icon: "https://image.flaticon.com/icons/png/512/609/609051.png"
            });
        } else {
            alert(`Não se esqueça do seu evento: ${title}`);
        }
    }

    function playAlarm() {
        alarmSound.play();
    }

    window.removeEvent = function(id) {
        const eventCard = document.getElementById(`event-${id}`);
        if (eventCard) {
            eventCard.remove();
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


document.addEventListener("DOMContentLoaded", function() {
    // Seu código existente...

    function scheduleNotification(title, date, id) {
        const now = new Date();
        const timeToEvent = date - now;

        if (timeToEvent > 0) {
            setTimeout(function() {
                showNotification(title);
                playAlarm();
                removeEvent(id);
            }, timeToEvent);
        } else {
            // Se o tempo já passou, remove o evento imediatamente
            removeEvent(id);
        }
    }

});

// evento para informar o usuario sobre data e hora inválido:

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
            <div class="card mt-2" id="event-${eventId}">
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
