document.addEventListener("DOMContentLoaded", async function () {
  // @note Определяем глобальные переменные

  // Определяем таблицу
  const clientTable = document.getElementById("client-table");
  // Определяем кнопку Добавить клиента
  let addButton = document.getElementById("add-button");
  // Определяем модальное окно
  let modalWindow = document.getElementById("modal-window");
  // Определяем кнопку закрытия модального окна
  let closeButton = document.querySelector(".close-button");
  // Определяем кнопку Новый клиент
  let newClientButton = document.getElementById("new-client-button");
  newClientButton.classList.add("add-change-client-button");
  // Определяем оверлей и спиннер
  let overlay = document.createElement("div");
  overlay.className = "overlay";
  let spinner = document.createElement("div");
  spinner.className = "spinner";

  // Добавляем спиннер и оверлей во время загрузки
  function showOverlayAndSpinner() {
    // @func показа оверлея и спиннера
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
  }

  showOverlayAndSpinner();

  async function handleHashChange() {
    // Обработки хэша страницы
    const hash = window.location.hash;
    const match = hash.match(/^#edit-client-(\d+)$/);
    if (match) {
      const clientId = match[1];
      openChangeClientWindow(clientId);
      modalContainer.classList.add("active");
      document.body.classList.add("modal-active");
    }
  }

  // Определяем сообщения об ошибках валидации
  const validationErrorSurname = "";
  const validationErrorName = "";
  const validationErrorPhone = "";
  const validationErrorMail = "";
  const validationErrorEmpty = "";

  // Получаем базу клиентов с сервера
  let clientsListResponse = await fetch(
    "https://clients-crm-d4240a57da57.herokuapp.com/api/clients",
    {
      method: "GET",
    }
  );
  // Преобразуем ответ сервера в json
  let clientsList = await clientsListResponse.json();

  // Функция для получения одного клиента

  function getClient(client) {
    // @func получения клиента (Get client)
    // Создаем строку в таблице
    const clientRow = document.createElement("tr");
    clientRow.setAttribute("data-id", client.id);
    clientRow.classList.add("table-row");

    // Добавляем строку с клиентом в конец таблицы
    clientTable.append(clientRow);
    // Преообразуем контакты в строку

    const numberOfContacts = client.contacts.length;

    let clientContacts = client.contacts;

    // Функция для генерации контактов

    function getClientContacts(clientContacts) {
      // Генерируем все контакты
      // Создаем обертку для контактов
      let contactsWrapper = document.createElement("div");
      contactsWrapper.className = "contacts-wrapper";

      let html = "";

      // Генерируем HTML для видимых контактов
      clientContacts.slice(0, 4).forEach((contact) => {
        html += generateContactHtml(contact);
      });

      // Генерируем HTML для скрытых контактов

      if (clientContacts.length > 4) {
        const hiddenContactsHtml = clientContacts
          .slice(4)
          .map(
            (contact) =>
              `<div class="contact-hidden">${generateContactHtml(
                contact
              )}</div>`
          )
          .join("");
        html += hiddenContactsHtml;
        html += `<button class="show-more-contacts-btn">+${
          clientContacts.length - 4
        }</button>`;
      }
      contactsWrapper.innerHTML = html; // Добавляем сгенерированный HTML код в обертку
      return contactsWrapper.outerHTML; // Возвращаем HTML код обертки
    }

    // Функция для генерации каждого контакта

    function generateContactHtml(contact) {
      if (contact.type === "Телефон") {
        function formatPhoneNumber(number) {
          // Функция форматирования телефонного номера, чтобы взять с сервера данные без пробелов и отразить как даннные с пробелами
          // Удаляем из номера все пробелы цифр
          const digits = number.replace(/ /g, "");
          // Форматируем номер согласно маске
          return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
        }
        const formattedPhone = formatPhoneNumber(contact.value);
        return (
          '<div class="tooltip-wrapper"> <div class="marker"> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g opacity=""> <circle class="marker-color" cx="8" cy="8" r="8" fill=""/> <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/> </g> </svg> </div> <span class="tooltip">' +
          contact.type +
          ":&nbsp;" +
          formattedPhone +
          "</span></div>"
        );
      }
      if (contact.type === "Эл. почта") {
        return (
          '<div class="tooltip-wrapper"> <div class="marker"> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill=""/> </svg> </div> <span class="tooltip">' +
          contact.type +
          ": " +
          contact.value +
          "</span> </div>"
        );
      }
      if (contact.type === "Фейсбук") {
        return (
          '<div class="tooltip-wrapper"> <div class="marker"> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill=""/> </svg> </div> <span class="tooltip">' +
          contact.type +
          ": " +
          contact.value +
          "</span> </div>"
        );
      }
      if (contact.type === "Вконтакте") {
        return (
          '<div class="tooltip-wrapper"> <div class="marker"> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill=""/> </svg> </div> <span class="tooltip">' +
          contact.type +
          ": " +
          contact.value +
          "</span> </div>"
        );
      }
      if (contact.type === "Другое") {
        return (
          '<div class="tooltip-wrapper"> <div class="marker"> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill=""/> </svg> </div> <span class="tooltip">' +
          contact.type +
          ": " +
          contact.value +
          "</span> </div>"
        );
      }
    }

    let contactsHtml = getClientContacts(clientContacts);

    // Создаем новый объект с объединенным ФИО и другими доработками, готовый ко вставке в таблицу
    client = {
      id: client.id,
      name: client.surname + " " + client.name + " " + client.lastName,
      createdAt: convertDateFromISO(client.createdAt),
      updatedAt: convertDateFromISO(client.updatedAt),
      contacts: contactsHtml,
    };

    function convertDateFromISO(dateISO) {
      // Функция перевода даты из ISO формата в читаемый
      const date = new Date(dateISO);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}.${month}.${year} <span class="small">${hours}:${minutes}</span>`;
    }

    // Разносим параметры клиента по ячейкам
    for (let key in client) {
      let clientCell = document.createElement("td");
      clientCell.innerHTML = client[key];
      clientCell.classList.add(`cell-${[key]}`);
      clientRow.append(clientCell);
    }

    // Добавляем кнопки изменения и удаления в последнюю ячейку
    let actionCell = document.createElement("td");
    let changeButton = document.createElement("button");
    changeButton.textContent = "Изменить";
    changeButton.classList.add("change-button");
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.classList.add("delete-button");
    clientRow.append(actionCell);
    actionCell.append(changeButton, deleteButton);

    let linkCell = document.createElement("td");
    clientRow.append(linkCell);
    // Формируем ссылку
    let clientLink = document.createElement("a");
    clientLink.href = `#edit-client-${client.id}`;
    clientLink.textContent = "Ссылка";
    clientLink.classList.add("client-link");
    clientLink.addEventListener("click", function (e) {
      // лушатель на клик по ссылке клиента
      e.preventDefault();

      const fullUrl =
        window.location.origin +
        window.location.pathname +
        clientLink.getAttribute("href");
      navigator.clipboard
        .writeText(fullUrl)
        .then(() =>
          alert("Ссылка на страницу клиента скопирована в буфер обмена")
        )
        .catch((err) => console.error("Ошибка при копировании: ", err));
    });
    linkCell.append(clientLink);

    async function deleteClient(clientId) {
      // @func удаления клиента

      const response = await fetch(
        `https://clients-crm-d4240a57da57.herokuapp.com/api/clients/${clientId}`,
        {
          method: "DELETE",
        }
      );
      // После успешного удаления записи о клиенте

      const updatedClientsResponse = await fetch(
        "https://clients-crm-d4240a57da57.herokuapp.com/api/clients"
      );
      const updatedClientsList = await updatedClientsResponse.json();
      // Очищаем таблицу
      clientTable.innerHTML = "";

      // Отрисовываем таблицу заново с обновленным списком клиентов
      renderClients(updatedClientsList);
      // Убираем оверлей
      document.querySelector(".overlay").remove();
    }

    // Кнопка Изменить

    changeButton.addEventListener("click", async function () {
      // @click на кнопку Изменить клиента

      // Добавляем класс clicked на кнопку изменения клиента
      changeButton.classList.add("clicked");
      // Запускаем функцию блокирования всех кнопок и поля ввода
      blockAllButtonsAndInputs();

      // Ждем завершения openChangeClientWindow
      await openChangeClientWindow(client.id);
      saveChangesButton.onclick = function () {
        saveChangesToServer(client.id);
      };
      window.location.hash = `edit-client-${client.id}`;
      // Запускаем функцию снятия блокировки со всех кнопок и поля ввода
      unblockAllButtonsAndInputs();
      // Снимаем класс clicked с кнопки изменения клиента
      changeButton.classList.remove("clicked");
    });

    // Назначаем событие клика по кнопке Удалить
    deleteButton.addEventListener("click", function () {
      // Вешаем стиль clicked
      deleteButton.classList.add("clicked");
      // Запускаем функцию блокирования всех кнопок и поля ввода
      blockAllButtonsAndInputs();
      // Рисуем модальное окно
      let modalWindowDelete = document.createElement("div");
      modalWindowDelete.classList.add("modal-window-delete");

      let head = document.createElement("h2");
      head.textContent = "Удалить клиента";
      let text = document.createElement("p");
      text.textContent = "Вы действительно хотите удалить данного клиента?";
      let deleteButtonInsideModal = document.createElement("button");
      deleteButtonInsideModal.textContent = "Удалить";
      deleteButtonInsideModal.classList.add("delete-button-inside-modal");
      let cancelButton = document.createElement("button");
      cancelButton.textContent = "Отмена";
      cancelButton.classList.add("cancel-button");
      modalWindowDelete.appendChild(head);
      modalWindowDelete.appendChild(text);
      modalWindowDelete.appendChild(deleteButtonInsideModal);
      modalWindowDelete.appendChild(cancelButton);
      document.body.appendChild(modalWindowDelete);
      deleteButtonInsideModal.onclick = function () {
        showOverlayAndSpinner();
        deleteClient(client.id); // Передаем ID клиента в функцию удаления
        modalWindowDelete.remove();
      };
      cancelButton.onclick = function () {
        modalWindowDelete.remove();
      };
      // Запускаем функцию снятия блокировки со всех кнопок и поля ввода
      unblockAllButtonsAndInputs();
      // Снимаем стиль clicked
      deleteButton.classList.remove("clicked");
    });
  }

  async function openChangeClientWindow(clientId) {
    // @func открытия окна изменения клиента (и отработки дальнейшей логики)

    // Получаем данные с сервера
    const response = await fetch(
      `https://clients-crm-d4240a57da57.herokuapp.com/api/clients/${clientId}`
    );
    const clientData = await response.json();
    let modalWindow = document.getElementById("modal-window");
    modalWindow.classList.remove("display-none");
    // Меняем заголовок
    modalWindow.querySelector("h2").textContent = "Изменить данные";

    // Добавляем ID клиента после заголовка
    const clientIdInfo = document.createElement("span");
    clientIdInfo.classList.add("client-id-info");
    clientIdInfo.textContent = `ID: ${clientId}`;
    modalWindow
      .querySelector("h2")
      .insertAdjacentElement("afterend", clientIdInfo);
    // Показываем кнопку Сохранить изменения
    const saveChangesButton = document.getElementById("save-changes-button");
    saveChangesButton.disabled = true;
    saveChangesButton.classList.remove("display-none");

    // Заполняем модальное окно ФИО клиента
    let changingClientSurnameValue = (document.getElementById(
      "input-surname"
    ).value = clientData.surname);
    let changingClientNameValue = (document.getElementById("input-name").value =
      clientData.name);
    let changingClientLastName = (document.getElementById(
      "input-lastname"
    ).value = clientData.lastName);

    // Вешаем слушатели на инпуты фамилии и имени, чтобы работала валидация

    document
      .getElementById("input-surname")
      .addEventListener("input", validateInputs); // Слушатель поля Фамилия
    document
      .getElementById("input-name")
      .addEventListener("input", validateInputs);

    // Стираем все контакты, накопленные с предыдущего изменения
    let allContactsWrapper = document.querySelector(".all-contacts-wrapper");

    allContactsWrapper.innerHTML = "";

    // Заполняем модальное окно контактами клиента с сервера

    if (clientData.contacts.length > 0) {
      function createContactSelect(contactTypes, setContact) {
        // Функция генерации блока с контактами при изменении клиента
        const contactSelect = document.createElement("select");

        contactTypes.forEach((type) => {
          const contactOptions = document.createElement("option");
          contactOptions.textContent = type;
          contactOptions.value = type;
          if (setContact === type) {
            contactOptions.selected = true;
          }
          contactSelect.appendChild(contactOptions);
        });
        return contactSelect;
      }
      const contactTypes = [
        "Телефон",
        "Эл. почта",
        "Фейсбук",
        "Вконтакте",
        "Другое",
      ];
      for (let i = 0; i < clientData.contacts.length; i++) {
        const newContactWrapper = document.createElement("div");
        newContactWrapper.classList.add("contact-wrapper");
        newContactWrapper.id = `contact${i + 1}`;
        const selectWrapper = document.createElement("div");
        selectWrapper.classList.add("element");
        const setContact = clientData.contacts[i].type;
        const contactSelect = createContactSelect(contactTypes, setContact);
        contactSelect.classList.add("contact-select");
        contactSelect.addEventListener(
          "change",
          checkInputsAndSetButtonStateWhileEditing
        );
        allContactsWrapper.appendChild(newContactWrapper);
        newContactWrapper.append(selectWrapper);
        selectWrapper.appendChild(contactSelect);

        new Choices(contactSelect, {
          shouldSort: false, // Отключаем сортировку, чтобы опции отображались в исходном порядке
          searchEnabled: false, // Отключаем возможность поиска, если это не требуется
          itemSelectText: "",
        });
        const contactInput = document.createElement("input");
        contactInput.classList.add("contact-input");
        if (contactSelect.value === "Телефон") {
          // форматируем телефон по маске 000 000 00 00
          contactInput.value = clientData.contacts[i].value.replace(
            /(\d{3})(\d{3})(\d{2})(\d{2})/,
            "$1 $2 $3 $4"
          );
        } else {
          contactInput.value = clientData.contacts[i].value;
        }
        contactInput.addEventListener("input", validateInputs);
        newContactWrapper.appendChild(contactInput);
        const contactDeleteBtn = document.createElement("button");
        contactDeleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill=""/>
        </svg>
        `;
        let contactDeleteWrapper = document.createElement("div");
        contactDeleteWrapper.classList.add("tooltip-wrapper");
        let contactDeleteTooltip = document.createElement("span");
        contactDeleteTooltip.classList.add("tooltip");
        contactDeleteTooltip.textContent = "Удалить контакт";
        contactDeleteBtn.setAttribute("type", "button");
        contactDeleteBtn.classList.add("remove-contact-button");
        contactDeleteBtn.classList.add("marker");
        newContactWrapper.appendChild(contactDeleteWrapper);
        contactDeleteWrapper.appendChild(contactDeleteBtn);
        contactDeleteWrapper.appendChild(contactDeleteTooltip);
        contactDeleteBtn.onclick = deleteContactEverywhere; // Клик на кнопку удаления контакта
      }
    }

    // Убираем оверлей после загрузки окна изменений клиента
    // document.querySelector(".overlay").remove();

    // Кнопка закрытия модального окна (если изменений не произошло)
    closeButton.onclick = function () {
      closeModalWindow();
    };

    function deleteContactEverywhere(event) {
      // Функция удаления контакта из разметки и из сервера

      const contactWrapper = event.target.closest(".contact-wrapper");
      const input = contactWrapper.querySelector("input");
      if (contactWrapper && confirm("Удалить контакт?")) {
        input.value = "";
        checkInputsAndSetButtonStateWhileEditing();
        contactWrapper.remove();
      }
      if (addContactButton.disabled) {
        addContactButton.disabled = false;
      }
      saveChangesButton.disabled = false;
    }

    // Вешаем слушатель событий на все поля ввода, чтобы делать кнопку Сохранить активной и изменить поведение кнопки "Закрыть модальное окно", когда поля вввода в модальном окне отличаются от сохраненных данных на сервере
    document
      .getElementById("modal-window")
      .addEventListener("input", checkInputsAndSetButtonStateWhileEditing);

    function checkInputsAndSetButtonStateWhileEditing() {
      const userContactsData = Array.from(
        document.querySelectorAll(".contact-wrapper")
      ).map((wrapper) => {
        return {
          type: wrapper.querySelector("select").value,
          value: wrapper
            .querySelector("input")
            .value.replace(/\s+/g, "")
            .trim(),
        };
      });

      // Сравниваем контакты

      const isContactsEqual = areContactsEqual(
        userContactsData,
        clientData.contacts
      );

      // Функция глубокого сравнения массивов

      function areContactsEqual(contacts1, contacts2) {
        if (contacts1.length != contacts2.length) {
          return false;
        }
        for (let i = 0; i < contacts1.length; i++) {
          if (
            contacts1[i].type != contacts2[i].type ||
            contacts1[i].value != contacts2[i].value
          ) {
            return false;
          }
        }
        return true;
      }

      // Обновляем значение isNameAndSurnameFilled перед проверкой условия
      const inputSurname = document
        .getElementById("input-surname")
        .value.trim();
      const inputName = document.getElementById("input-name").value.trim();
      const inputLastName = document
        .getElementById("input-lastname")
        .value.trim();

      const isNameAndSurnameFilled = inputSurname !== "" && inputName !== "";

      const isNameSurnameLastnameEqual =
        inputSurname === clientData.surname &&
        inputName === clientData.name &&
        inputLastName === clientData.lastName;

      let allContactsValid = true;

      for (i = 0; i < userContactsData.length; i++) {
        let isValid = validateContactinChangeWindow(
          userContactsData[i].value,
          userContactsData[i].type
        );
        if (!isValid) {
          allContactsValid = false;

          break;
        }
      }

      if (!isNameAndSurnameFilled || !allContactsValid) {
        // Если имя или фамилия не заполнены, то кнопка сохранения не активна
        saveChangesButton.disabled = true;
        closeButton.onclick = function () {
          closeModalWindow();
        };
      } else if (isNameSurnameLastnameEqual && isContactsEqual) {
        // Если ФИО и контакты в модальном окне совпадают с данными на сервере, то кнопка сохранения не активна
        saveChangesButton.disabled = true;
        closeButton.onclick = function () {
          closeModalWindow();
        };
      } else {
        saveChangesButton.disabled = false;
        // Модальное окно будет закрыто только после предупреждения пользователем
        closeButton.onclick = function () {
          if (
            confirm(
              "Вы действительно хотите закрыть окно? Несохраненные данные исчезнут"
            )
          ) {
            closeModalWindow();
          }
        };
      }
    }

    // Открываем модальное окно и добавляем активные классы после получения данных

    modalContainer.classList.add("active");
    document.body.classList.add("modal-active");
  }

  function blockAllButtonsAndInputs() {
    // Функция блокирования всех кнопок и инпутов
    // Блокируем кнопки в таблице
    const allButtons = document.querySelectorAll("table button");
    allButtons.forEach((button) => {
      button.disabled = true;
    });
    // Блокируем ссылки в таблице
    const allLinks = document.querySelectorAll("table a");
    allLinks.forEach((link) => {
      link.classList.add("disabled");
    });
    // Блокируем кнопку Добавить клиента
    const newClientButton = document.getElementById("add-button");
    newClientButton.disabled = true;
    // Блокируем инпут поиска
    const input = document.getElementById("search-input");
    input.disabled = true;
  }

  function unblockAllButtonsAndInputs() {
    // Функция разблокировки всех кнопок и инпутов
    // Снимаем блокировку кнопок в таблице
    const allButtons = document.querySelectorAll("table button");
    allButtons.forEach((button) => {
      button.disabled = false;
    });
    // Снимаем блокировку ссылок в таблице
    const allLinks = document.querySelectorAll("table a");
    allLinks.forEach((link) => {
      link.classList.remove("disabled");
    });
    // Снимаем блокировку кнопки Добавить клиента
    const newClientButton = document.getElementById("add-button");
    newClientButton.disabled = false;
    // Снимаем блокировку инпута поиска
    const input = document.getElementById("search-input");
    input.disabled = false;
  }

  // Определяем кнопку сохранения клиента
  const saveChangesButton = document.getElementById("save-changes-button");
  saveChangesButton.classList.add("add-change-client-button");
  async function saveChangesToServer(clientId) {
    // @func сохранения измений в клиенте на сервер
    // Показываем оверлей
    showOverlayAndSpinner();
    // Получаем данные с сервера
    const responseSecond = await fetch(
      `https://clients-crm-d4240a57da57.herokuapp.com/api/clients/${clientId}`
    );
    const clientData = await responseSecond.json();
    const userContactsData = Array.from(
      document.querySelectorAll(".contact-wrapper")
    ).map((wrapper) => {
      return {
        type: wrapper.querySelector("select").value,
        value: wrapper.querySelector("input").value.replace(/ /g, ""),
      };
    });
    // Сравниваем контакты
    const isContactsEqual = areContactsEqual(
      userContactsData,
      clientData.contacts
    );

    // Функция глубокого сравнения массивов
    function areContactsEqual(contacts1, contacts2) {
      if (contacts1.length !== contacts2.length) {
        return false;
      }
      for (let i = 0; i < contacts1.length; i++) {
        if (
          contacts1[i].type !== contacts2[i].type ||
          contacts1[i].value !== contacts2[i].value
        ) {
          return false;
        }
      }
      return true;
    }

    // Собираем массив того, что изменилось
    let changedClient = getChangedParameters(userContactsData, isContactsEqual);

    function getChangedParameters(userContactsData, isContactsEqual) {
      let changes = {};
      if (
        document.getElementById("input-surname").value !== clientData.surname
      ) {
        changes.surname = document.getElementById("input-surname").value;
      }
      if (document.getElementById("input-name").value !== clientData.name) {
        changes.name = document.getElementById("input-name").value;
      }
      if (
        document.getElementById("input-lastname").value !== clientData.lastName
      ) {
        changes.lastName = document.getElementById("input-lastname").value;
      }
      if (!isContactsEqual) {
        changes.contacts = userContactsData;
      }
      return changes;
    }

    // Отправляем на сервер обновленные данные

    const response = await fetch(
      `https://clients-crm-d4240a57da57.herokuapp.com/api/clients/${clientId}`,
      {
        method: "PATCH",
        body: JSON.stringify(changedClient),
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    // Отрабатываем ошибки сервера
    if (!response.ok) {
      if (response.status > 400) {
        throw new Error("Ошибка сервера: " + response.status);
      } else {
        throw new Error("Что-то пошло не так");
      }
    } else {
      // Если все хорошо, то убираем модальное окно
      modalWindow.classList.add("display-none");
      // Скрываем кнопку "Сохранить изменения"
      saveChangesButton.classList.add("display-none");
      // Очищаем поля ввода ФИО
      document.getElementById("input-surname").value = "";
      document.getElementById("input-name").value = "";
      document.getElementById("input-lastname").value = "";
      // Очищаем поле с контактами
      allContactsWrapper.innerHTML = "";
      // Очищаем таблицу

      clientTable.innerHTML = "";
      // Обновляем данные с серевра
      const updatedClientsListResponse = await fetch(
        "https://clients-crm-d4240a57da57.herokuapp.com/api/clients",
        {
          method: "GET",
        }
      );

      const updatedClientsList = await updatedClientsListResponse.json();

      // Делаем рендер
      renderClients(updatedClientsList);
      // Удаляем ID пользователя рядом с заголовком в модальном окне
      document.querySelector(".client-id-info").remove();
      // Удаляем оверлей
      document.querySelector(".overlay").remove();
      // Убираем класс active с обертки оверлея
      modalContainer.classList.remove("active");
      document.body.classList.remove("modal-active");
    }
  }

  function closeModalWindow() {
    // Функция закрытия модального окна
    modalWindow.classList.add("display-none");
    modalContainer.classList.remove("active");
    document.body.classList.remove("modal-active");
    allContactsWrapper.innerHTML = "";
    document.getElementById("input-surname").value = "";
    document.getElementById("input-name").value = "";
    document.getElementById("input-lastname").value = "";
    // Скрываем кнопку "Новый клиент"
    newClientButton.classList.add("display-none");

    // Очищаем поле с контактами
    allContactsWrapper.innerHTML = "";
    // Удаляем поле с ID
    if (document.querySelector(".client-id-info")) {
      document.querySelector(".client-id-info").remove();
    }
  }

  function renderClients(clientsList) {
    // Функция рендера таблицы
    for (let i = 0; i < clientsList.length; i++) {
      getClient(clientsList[i]);
    }
  }

  // Первичный рендер в конце которого убираем спиннер
  renderClients(clientsList);
  // Убираем оверлей после загрузки данных клиентов
  overlay.remove();

  addButton.onclick = function () {
    // @click на кнопку Добавить клиента (открытие модального окна)
    // Делаем заголовок
    modalWindow.querySelector("h2").textContent = "Добавить клиента";
    modalWindow.classList.remove("display-none");
    // Красим пустые инпуты фамилии и имени красным, чтобы показать, где ошибка
    document.getElementById("input-name").classList.add("input-error");
    document.getElementById("input-surname").classList.add("input-error");

    // Скрываем кнопку "Сохранить изменения"
    let saveChangesButton = document.getElementById("save-changes-button");
    saveChangesButton.classList.add("display-none");
    // Показываем кнопку Новый клиент
    newClientButton.classList.remove("display-none");
    // Делаем ее неактивной
    newClientButton.disabled = true;

    // Устанавливаем слушатели на поля ФИО для изменения кнопки создания клиента

    document
      .getElementById("input-surname")
      .addEventListener("input", validateInputs); // Слушатель поля Фамилия
    document
      .getElementById("input-name")
      .addEventListener("input", validateInputs);

    // Делаем валидацию инпутов (отобразятся ошибки в заполнении полей имени и фамилии, поскольку они пустые)

    validateInputs();

    // Обновляем логику закрытия модального окна в зависимости от заполнености полей ФИО или контактов

    closeButton.onclick = function () {
      if (isNewClientWindowInputsEmpty()) {
        if (confirm("Закрыть окно? Все несохраненые изменения будут потяряны"))
          closeModalWindow();
      } else {
        closeModalWindow();
      }
    };

    function isNewClientWindowInputsEmpty() {
      // @note Функция проверки всех инпутов в модальном окне на заполненность

      const modalWindowInputs = document.querySelectorAll(
        "#modal-window input"
      );
      return Array.from(modalWindowInputs).some(
        (input) => input.value.trim() !== ""
      );
    }
  };

  function validateInputs() {
    // @note Функция валидации всех инпутов

    // Определяем контейнер для ошибок
    let validationErrorsContainer = document.getElementById("errors-container");
    // Определяем массив с ошибками
    let validationErrors = [];
    // Определяем поля ввода имени и фамилии
    const clientName = document.getElementById("input-name").value.trim();
    const clientSurname = document.getElementById("input-surname").value.trim();

    validationErrorsContainer.innerHTML = "";

    // Переключаем класс с ошибкой на инпуте в зависимости от заполненности полей имени и фамилии
    document
      .getElementById("input-name")
      .classList.toggle("input-error", !clientName);
    document
      .getElementById("input-surname")
      .classList.toggle("input-error", !clientSurname);

    // Проверяем одновременную заполненность полей с именем и фамилией
    const isNameAndSurnameFilled = clientName && clientSurname;

    let phoneError = false;
    let mailError = false;
    let otherError = false;
    let allContactsValid = true;

    // Определяем контакты
    const contacts = document.querySelectorAll(".contact-wrapper");
    contacts.forEach((contact) => {
      const select = contact.querySelector("select");
      const input = contact.querySelector("input");
      let inputValue = input.value.trim();
      if (select.value === "Телефон") {
        inputValue = applyPhoneMask(inputValue); // Применяем маску к телефону
        input.value = inputValue;
      }
      const isValid = validateContact(inputValue, select.value);
      input.classList.toggle("input-error", !isValid); // Переключаем класс ошибки в зависимости от валидности
      if (!isValid) {
        allContactsValid = false;
        if (select.value === "Телефон") {
          phoneError = true;
        }
        if (select.value === "Эл. почта") {
          mailError = true;
        }
        if (
          select.value === "Фейсбук" ||
          select.value === "Вконтакте" ||
          select.value === "Другое"
        ) {
          otherError = true;
        }
      }
    });

    // Делаем кнопку "Новый клиент" активной, если заполнены фамилия и имя, а также все контакты (при их наличии) заполнены верно
    newClientButton.disabled = !(isNameAndSurnameFilled && allContactsValid);

    // Делаем проверку на ошибки каждого поля

    if (clientSurname === "") {
      validationErrors.push("Фамилия обязательна к заполнению");
    }

    if (clientName === "") {
      validationErrors.push("Имя обязательно к заполнению");
    }

    if (phoneError) {
      validationErrors.push("Телефон должен состоять из 10 цифр");
    }

    if (mailError) {
      validationErrors.push(
        "Адрес электронной почты должен быть заполнен корректно"
      );
    }

    if (otherError) {
      validationErrors.push(
        "Поле контакта (Фейсбук, Вконтакте, Другое) не должно быть пустым"
      );
    }

    validationErrors.forEach((error) => {
      // Проходим по каждой строчке массива с ошибками и добавляем их текст в соответствующий контейнер модального окна
      const errorSpan = document.createElement("span");
      errorSpan.classList.add("validation-error");
      errorSpan.textContent = error;
      validationErrorsContainer.appendChild(errorSpan);
    });
  }

  function applyPhoneMask(value) {
    // Получаем только цифры из ввода
    let digits = value.replace(/\D/g, "");
    // Форматируем ввод
    let formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      8
    )} ${digits.slice(8, 10)}`;
    return formatted;
  }

  function validateContact(value, type) {
    // Функция валидации контакта
    switch (type) {
      case "Телефон":
        return /^\d{3} \d{3} \d{2} \d{2}$/.test(value);
      case "Эл. почта":
        return /^[^@]+@[^@]+\.[^@]+$/.test(value);
      case "Фейсбук":
      case "Вконтакте":
      case "Другое":
        return value.trim().length > 0;
    }
  }

  function validateContactinChangeWindow(value, type) {
    // Функция валидации контакта
    switch (type) {
      case "Телефон":
        return /\d{10}/.test(value); // Проверяем телефон без учета форматирования (потому что в модальном окне форматирование применится потом)
      case "Эл. почта":
        return /^[^@]+@[^@]+\.[^@]+$/.test(value);
      case "Фейсбук":
      case "Вконтакте":
      case "Другое":
        return value.trim().length > 0;
    }
  }
  // Кнопка раскрытия остальных контактов при их количестве больше, чем 4

  document.querySelectorAll(".show-more-contacts-btn").forEach((button) => {
    button.addEventListener("click", function () {
      let parentRow = this.closest("tr");
      parentRow.querySelectorAll(".contact-hidden").forEach((contact) => {
        contact.classList.remove("contact-hidden");
      });
      button.style.display = "none"; // Скрываем кнопку после использования
    });
  });

  // Функция создания селекта для контакта

  function createContactSelect(contactTypes) {
    const contactSelect = document.createElement("select");
    contactSelect.addEventListener("change", validateInputs);
    contactTypes.forEach((type) => {
      const contactOption = document.createElement("option");
      contactOption.textContent = type;
      contactSelect.appendChild(contactOption);
    });
    return contactSelect;
  }

  let contactCount = 1;

  // Вешаем слушатель событий на все поля ввода контактов

  let allContactsWrapper = document.querySelector(".all-contacts-wrapper");

  function deleteContactFromHTML(event) {
    // Функция удаления контакта из разметки
    const contactWrapper = event.target.closest(".contact-wrapper");
    const input = contactWrapper.querySelector("input");
    if (contactWrapper) {
      if (input.value.trim()) {
        if (confirm("Удалить контакт?")) {
          contactWrapper.remove();
        }
      } else {
        // Если ничего не введено в инпут, то удаляем контакт без подтверждения
        contactWrapper.remove();
      }
    }
    if (addContactButton.disabled) {
      addContactButton.disabled = false;
    }
  }

  let addContactButton = document.getElementById("add-contact-button");

  // Типы контактов
  const contactTypes = [
    "Телефон",
    "Эл. почта",
    "Фейсбук",
    "Вконтакте",
    "Другое",
  ];

  addContactButton.onclick = function () {
    // Клик на кнопку Добавить контакт
    const newContactWrapper = createContactWrapper(contactCount, contactTypes);
    allContactsWrapper.append(newContactWrapper);
    contactCount++;

    // Проверяем количество контактов и делаем неактивной кнопку добавления нового контакта

    if (allContactsWrapper.children.length > 9) {
      addContactButton.disabled = true;
    }
    newClientButton.disabled = true;

    validateInputs();
  };

  function createContactWrapper(contactCount, contactTypes) {
    // @note Функция создания пустого контакта
    const newContactWrapper = document.createElement("div");
    newContactWrapper.classList.add("contact-wrapper");
    newContactWrapper.id = `contact${contactCount}`;
    const selectWrapper = document.createElement("div");
    selectWrapper.classList.add("element");
    const contactSelect = createContactSelect(contactTypes);
    contactSelect.classList.add("contact-select");

    selectWrapper.appendChild(contactSelect);
    newContactWrapper.appendChild(selectWrapper);
    new Choices(contactSelect, {
      shouldSort: false, // Отключаем сортировку, чтобы опции отображались в исходном порядке
      searchEnabled: false, // Отключаем возможность поиска, если это не требуется
      itemSelectText: "",
    });
    const contactInput = document.createElement("input");
    contactInput.classList.add("input-error");
    contactInput.classList.add("contact-input");
    contactInput.addEventListener("input", validateInputs);
    newContactWrapper.appendChild(contactInput);
    const contactDeleteBtn = document.createElement("button");
    contactDeleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill=""/>
    </svg>
    `;
    let contactDeleteWrapper = document.createElement("div");
    contactDeleteWrapper.classList.add("tooltip-wrapper");
    let contactDeleteTooltip = document.createElement("span");
    contactDeleteTooltip.classList.add("tooltip");
    contactDeleteTooltip.textContent = "Удалить контакт";
    contactDeleteBtn.setAttribute("type", "button");
    contactDeleteBtn.classList.add("remove-contact-button");
    contactDeleteBtn.classList.add("marker");
    newContactWrapper.appendChild(contactDeleteWrapper);
    contactDeleteWrapper.appendChild(contactDeleteBtn);
    contactDeleteWrapper.appendChild(contactDeleteTooltip);
    contactDeleteBtn.onclick = deleteContactFromHTML;

    return newContactWrapper;
  }

  // Показываем все контакты после клика на кнопку Показать все контакты

  document.querySelectorAll(".show-more-contacts-btn").forEach((button) => {
    button.addEventListener("click", function () {
      let parentRow = this.closest("tr");
      parentRow.querySelectorAll(".contact-hidden").forEach((contact) => {
        contact.classList.remove("contact-hidden");
      });
      button.style.display = "none"; // Скрываем кнопку после использования
    });
  });

  //  @click на кнопку Новый клиент (сохранение на сервер)
  newClientButton.onclick = async function (e) {
    e.preventDefault();
    // Показываем оверлей и спиннер
    showOverlayAndSpinner();
    // Получаем ФИО клиента
    let inputSurname = document.getElementById("input-surname");
    let inputSurnameValue = inputSurname.value.trim();
    let inputName = document.getElementById("input-name");
    let inputNameValue = inputName.value.trim();
    let inputLastName = document.getElementById("input-lastname");
    let inputLastNameValue = inputLastName.value.trim();
    // Получаем контактные данные клиента
    const allContactsWrapper = document.querySelector(".all-contacts-wrapper");
    const contactWrappers =
      allContactsWrapper.querySelectorAll(".contact-wrapper");
    const contactsData = Array.from(contactWrappers).map((wrapper) => {
      return {
        type: wrapper.querySelector("select").value,
        value: wrapper.querySelector("input").value.replace(/ /g, ""),
      };
    });

    // Отправляем данные на сервер
    const response = await fetch(
      "https://clients-crm-d4240a57da57.herokuapp.com/api/clients",
      {
        method: "POST",
        body: JSON.stringify({
          surname: inputSurnameValue,
          name: inputNameValue,
          lastName: inputLastNameValue,
          contacts: contactsData,
        }),
        headers: {
          "Content-type": "application/json",
        },
      }
    );

    // Скрываем модальное окно
    modalWindow.classList.add("display-none");

    // Очищаем поля ввода ФИО
    document.getElementById("input-surname").value = "";
    document.getElementById("input-name").value = "";
    document.getElementById("input-lastname").value = "";
    // Очищаем поле с контактами
    allContactsWrapper.innerHTML = "";

    // Скрываем кнопку Новый клиент
    newClientButton.classList.add("display-none");

    // Очищаем таблицу
    clientTable.innerHTML = "";
    // Обновляем данные с серевра
    const updatedClientsListResponse = await fetch(
      "https://clients-crm-d4240a57da57.herokuapp.com/api/clients",
      {
        method: "GET",
      }
    );

    const updatedClientsList = await updatedClientsListResponse.json();

    // Делаем рендер

    renderClients(updatedClientsList);

    // Убираем овелей и спиннер
    document.querySelector(".overlay").remove();

    document.body.classList.remove("modal-active");

    // Убираем класс active с обертки оверлея
    modalContainer.classList.remove("active");
    document.body.classList.remove("modal-active");
  };

  // @note Раздел сортировка

  let sortedByIdAsc = true;
  let sortedByNameAsc = false;
  let sortedByCreatedAtAsc = false;
  let sortedByUpdatedAtAsc = false;
  let sortedTable = [];

  // @note Определяем кнопки для сортировки по различным заголовкам
  const sortByIdButton = document.getElementById("sort-by-id-button");
  const sortByNameButton = document.getElementById("sort-by-name-button");
  const sortByCreatedAtButton = document.getElementById(
    "sort-by-created-button"
  );
  const sortByUpdatedAtButton = document.getElementById(
    "sort-by-updated-button"
  );

  sortByIdButton.onclick = function () {
    // Клик по кнопке сортировки по ID
    removeSortingStylesEverywhere();
    this.classList.add("sorting-now");
    if (sortedByIdAsc) {
      sortByIdDesc();
    } else {
      this.classList.add("sorting-asc");
      sortByIdAsc();
    }
    sortedByIdAsc = !sortedByIdAsc;
    sortedByNameAsc = false;
    sortedByCreatedAsc = false;
    sortedByUpdatedAsc = false;
    clientTable.innerHTML = "";
    renderClients(sortedTable);
  };

  sortByNameButton.onclick = function () {
    // Клик по кнопке сортировки по имени
    removeSortingStylesEverywhere();
    this.classList.add("sorting-now");
    if (sortedByNameAsc) {
      sortByNameDesc();
      document.getElementById("sorting-descr").textContent = "Я–А";
    } else {
      this.classList.add("sorting-asc");
      sortByNameAsc();
      document.getElementById("sorting-descr").textContent = "А–Я";
    }
    sortedByNameAsc = !sortedByNameAsc;
    sortedByIdAsc = false;
    sortedByCreatedAtAsc = false;
    sortedByUpdatedAtAsc = false;
    clientTable.innerHTML = "";
    renderClients(sortedTable);
  };

  sortByCreatedAtButton.onclick = function () {
    // Клик по кнопке сортировки по Дате и времени создания
    removeSortingStylesEverywhere();
    this.classList.add("sorting-now");
    if (sortedByCreatedAtAsc) {
      sortByCreatedAtDesc();
    } else {
      this.classList.add("sorting-asc");
      sortByCreatedAtAsc();
    }
    sortedByCreatedAtAsc = !sortedByCreatedAtAsc;
    sortedByIdAsc = false;
    sortedByNameAsc = false;
    clientTable.innerHTML = "";
    renderClients(sortedTable);
  };

  sortByUpdatedAtButton.onclick = function () {
    // Клик по кнопке сортировки по Дате и времени изменения
    removeSortingStylesEverywhere();
    this.classList.add("sorting-now");
    if (sortedByUpdatedAtAsc) {
      sortByUpdatedAtDesc();
    } else {
      this.classList.add("sorting-asc");
      sortByUpdatedAtAsc();
    }
    sortedByUpdatedAtAsc = !sortedByUpdatedAtAsc;
    sortedByIdAsc = false;
    sortedByNameAsc = false;
    sortedByCreatedAtAsc = false;
    clientTable.innerHTML = "";
    renderClients(sortedTable);
  };

  // @note Функции сортировки

  function sortByIdAsc() {
    // @note Функция сортировки по ID по возрастанию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let idA = a.id;
      let idB = b.id;
      if (idA > idB) {
        return 1;
      }
      if (idA < idB) {
        return -1;
      }
      return 0;
    }));
  }

  function sortByIdDesc() {
    // @func сортировки по ID по убыванию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let idA = a.id;
      let idB = b.id;
      if (idA > idB) {
        return -1;
      }
      if (idA < idB) {
        return 1;
      }
      return 0;
    }));
  }

  function sortByNameAsc() {
    // @func сортировки по имени по возрастанию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let fullNameA = a.surname + a.name + a.lastName;
      let fullNameB = b.surname + b.name + b.lastName;
      if (fullNameA > fullNameB) {
        return 1;
      }
      if (fullNameA < fullNameB) {
        return -1;
      }
      return 0;
    }));
  }

  function sortByNameDesc() {
    // Функция сортировки по имени по убыванию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let fullNameA = a.surname + a.name + a.lastName;
      let fullNameB = b.surname + b.name + b.lastName;
      if (fullNameA > fullNameB) {
        return -1;
      }
      if (fullNameA < fullNameB) {
        return 1;
      }
      return 0;
    }));
  }

  function sortByCreatedAtAsc() {
    // Функция сортировки по Дате и времени создания по возрастанию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let createdAtA = a.createdAt;
      let createdAtB = b.createdAt;
      if (createdAtA > createdAtB) {
        return 1;
      }
      if (createdAtA < createdAtB) {
        return -1;
      }
      return 0;
    }));
  }

  function sortByCreatedAtDesc() {
    // @note Функция сортировки по Дате и времени создания по убыванию
    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let createdAtA = a.createdAt;
      let createdAtB = b.createdAt;
      if (createdAtA > createdAtB) {
        return -1;
      }
      if (createdAtA < createdAtB) {
        return 1;
      }
      return 0;
    }));
  }

  function sortByUpdatedAtAsc() {
    // Функция сортировки по Дате и времени изменения по возрастанию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let updatedAtA = a.updatedAt;
      let updatedAtB = b.updatedAt;
      if (updatedAtA > updatedAtB) {
        return 1;
      }
      if (updatedAtA < updatedAtB) {
        return -1;
      }
      return 0;
    }));
  }

  function sortByUpdatedAtDesc() {
    // Функция сортировки по Дате и времени изменения по убыванию

    const tableData = extractTable();
    return (sortedTable = [...tableData].sort(function (a, b) {
      let updatedAtA = a.updatedAt;
      let updatedAtB = b.updatedAt;
      if (updatedAtA > updatedAtB) {
        return -1;
      }
      if (updatedAtA < updatedAtB) {
        return 1;
      }
      return 0;
    }));
  }

  function removeSortingStylesEverywhere() {
    // @note Функция для убирания класса sorting now со всех кнопок

    let allSortingButtons = document.querySelectorAll("thead button");

    allSortingButtons.forEach(function (item) {
      item.classList.remove("sorting-now");
      item.classList.remove("sorting-asc");
    });
  }

  function extractTable() {
    // Функция извлечения таблицы из верстки

    const tableRows = document.querySelectorAll("#client-table tr");
    const data = Array.from(tableRows).map((row) => {
      const cells = row.querySelectorAll("td");
      const id = parseInt(cells[0].textContent, 10);
      const fullName = cells[1].textContent.split(" ");
      const surname = fullName[0];
      const name = fullName[1];
      const lastName = fullName[2];
      const createdAt = convertDateToISO(cells[2].textContent);
      const updatedAt = convertDateToISO(cells[3].textContent);
      const contacts = extractContacts(cells[4]);

      return {
        id,
        surname,
        name,
        lastName,
        createdAt,
        updatedAt,
        contacts,
      };
    });

    return data;
  }

  function convertDateToISO(dateString) {
    // Обратного перевода даты в ISO формат
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
  }

  function extractContacts(contactCell) {
    // @note Функция извлечения контактов (для функции извлечения таблицы)
    const contactDivs = contactCell.querySelectorAll(".tooltip-wrapper");
    const contacts = Array.from(contactDivs).map((div) => {
      const tooltipText = div.querySelector(".tooltip").textContent;
      const [type, value] = tooltipText.split(":").map((text) => text.trim());
      return { type, value };
    });
    return contacts;
  }

  // @chapter Поиск
  // Определяем поле ввода
  const searchInput = document.getElementById("search-input");

  async function fetchSearchData(searchValue) {
    // @func поиска
    if (searchValue.trim()) {
      const response = await fetch(
        `https://clients-crm-d4240a57da57.herokuapp.com/api/clients?search=${searchValue}`,
        {
          method: "GET",
        }
      );
      const searchResult = await response.json();
      previewSearchResults(searchResult);

      clientTable.innerHTML = "";
      renderClients(searchResult);
    } else {
      const response = await fetch(
        `https://clients-crm-d4240a57da57.herokuapp.com/api/clients?search=${searchValue}`,
        {
          method: "GET",
        }
      );

      const searchPreview = document.getElementById("search-preview");
      const searchResult = await response.json();
      clientTable.innerHTML = "";
      renderClients(searchResult);
    }
  }

  // Функция предзаполнения

  async function previewSearchResults(searchResult) {
    // @func предзаполнения

    const searchResultPreview = searchResult.map((client) => {
      return {
        surname: client.surname,
        name: client.name,
        id: client.id,
      };
    });
    let searchPreview = document.getElementById("search-preview");
    if (searchPreview) {
      searchPreview.style.display = "block";
      searchPreview.innerHTML = "";
      searchResultPreview.forEach((client) => {
        let previewElement = document.createElement("li");
        previewElement.textContent = `${client.surname} ${client.name}`;
        searchPreview.appendChild(previewElement);
        previewElement.addEventListener(
          "mouseenter",
          createHighlightFucntion(client)
        );
        previewElement.addEventListener("click", createScrollToClicked(client));
      });
    } else {
      console.log("Что-то пошло не так");
    }
    function createHighlightFucntion(client) {
      return function highlightSearchPreview() {
        let resultNumber = client;
        const tableRows = document.querySelectorAll("#client-table tr");
        const tableRow = document.querySelector(
          `#client-table tr[data-id="${client.id}"]`
        );
        if (tableRow) {
          tableRows.forEach((row) => {
            row.classList.remove("highlighted");
          });
          tableRow.classList.add("highlighted");
        }
      };
    }
    function createScrollToClicked(client) {
      return function scrollToClicked() {
        let resultNumber = client;
        const tableRows = document.querySelectorAll("#client-table tr");
        const tableRow = document.querySelector(
          `#client-table tr[data-id="${client.id}"]`
        );
        if (tableRow) {
          tableRow.scrollIntoView({ behavior: "smooth", block: "center" });
          searchPreview = document.getElementById("search-preview");
          if (searchPreview) {
            searchPreview.style.display = "none";
          }
        } else {
          console.error(`Table row with data-id="${client.id}" not found.`);
        }
      };
    }
  }

  // Делаем отсрочку после ввода символа в поле поиска и отправкой данных на сервер

  let debounceTimeout;
  function debounce(func, delay) {
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  searchInput.addEventListener(
    "input",
    debounce(function () {
      fetchSearchData(this.value);
    }, 300)
  );

  // @chapter Иное

  // Анимация открытия модального окна
  const modalContainer = document.getElementById("modal-container");
  const openModalButton = document.getElementById("add-button"); // Используем ID кнопки

  openModalButton.addEventListener("click", function () {
    modalContainer.classList.add("active");
    document.body.classList.add("modal-active");
  });

  // Вызываем функцию проверки хэша в адресной строке браузера
  handleHashChange();
});
