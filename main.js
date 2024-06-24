document.addEventListener("DOMContentLoaded", async function () {
  // Раздел объявления переменных
  // Адрес сервера
  const serverAddress = "http://localhost:3000";

  // Определяем таблицу
  const clientTable = document.getElementById("client-table");
  // Определяем кнопку Добавить клиента
  let addButton = document.getElementById("add-button");
  // Определяем модальное окно
  let modalWindow = document.getElementById("modal-window");
  // Модальное окно удаления клиента
  let modalWindowDelete = document.getElementById("modal-window-delete");
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
  // ID клиента, с которым работаем
  let currentCliendId;
  // Поля ввода ФИО клиента
  let clientNameInput = document.getElementById("input-name");
  let clientLastNameInput = document.getElementById("input-lastname");
  let clientSurnameInput = document.getElementById("input-surname");
  // Обертка всех контактов
  const allContactsWrapper = document.querySelector(".all-contacts-wrapper");
  // Контейнер для ошибок в модальном окне
  let validationErrorsContainer = document.getElementById("errors-container");
  validationErrorsContainer.classList.add("validation-error");
  // Блок с предпросмотром результатов поиска
  let searchPreview = document.getElementById("search-preview");
  // Определяем массив с ошибками
  let validationErrors = [];
  // Типы контактов
  const contactTypes = [
    "Телефон",
    "Эл. почта",
    "Фейсбук",
    "Вконтакте",
    "Другое",
  ];

  // Кнопка сохранения изменений
  const saveChangesButton = document.getElementById("save-changes-button");
  // Анимация открытия модального окна
  const modalContainer = document.getElementById("modal-container");
  const modalContainerDelete = document.getElementById(
    "modal-container-delete"
  );

  const openModalButton = document.getElementById("add-button"); // Используем ID кнопки

  const searchInput = document.getElementById("search-input");

  // Показываем оверлей и спиннер до загрузки таблицы

  showOverlayAndSpinner();

  // Функция запроса данных на сервере

  const getData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.status);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  // Добавляем спиннер и оверлей во время загрузки
  function showOverlayAndSpinner() {
    // Функция показа оверлея и спиннера\

    overlay.append(spinner);
    document.body.append(overlay);
  }

  // Функция обработки хэша страницы
  async function handleHashChange() {
    const hash = window.location.hash;
    const match = hash.match(/^#edit-client-(\d+)$/);
    if (match) {
      const clientId = match[1];
      openChangeClientWindow(clientId);
      modalContainer.classList.add("active");
      document.body.classList.add("modal-active");
    }
  }

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

  function formatPhoneNumber(number) {
    // Функция форматирования телефонного номера, чтобы взять с сервера данные без пробелов и отразить как даннные с пробелами
    // Удаляем из номера все пробелы цифр
    const digits = number.replace(/ /g, "");
    // Форматируем номер согласно маске
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4");
  }

  // Функция для генерации каждого контакта

  function generateContactHtml(contact) {
    const contactTypes = {
      Телефон: {
        marker:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g opacity=""> <circle class="marker-color" cx="8" cy="8" r="8" fill=""/> <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/> </g> </svg>',
        formatter: formatPhoneNumber,
      },
      "Эл. почта": {
        marker:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill=""/> </svg>',
      },
      Фейсбук: {
        marker:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill=""/> </svg>',
      },
      Вконтакте: {
        marker:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill=""/> </svg>',
      },
      Другое: {
        marker:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill=""/> </svg>',
      },
    };

    const typeData = contactTypes[contact.type] || {
      marker:
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="marker-color" opacity="" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill=""/> </svg>',
      formatter: (x) => x,
    };

    const contactValue = typeData.formatter
      ? typeData.formatter(contact.value)
      : contact.value;

    const contactMarker = typeData.marker;

    return `
        <li class="tooltip-wrapper"> 
        <div class="marker">${contactMarker} </div>
        <span class="tooltip"> ${contact.type}:&nbsp; ${contactValue} </span>
        </li>
        `;
  }

  function getClientContacts(clientContacts) {
    // Создаем обертку для контактов
    let contactsWrapper = document.createElement("ul");
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
            `<div class="contact-hidden">${generateContactHtml(contact)}</div>`
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

  // Функция для получения одного клиента

  function getClient(client) {
    // Создаем строку в таблице
    const clientRow = document.createElement("tr");
    clientRow.setAttribute("data-id", client.id);
    clientRow.classList.add("table-row");

    // Добавляем строку с клиентом в конец таблицы
    clientTable.append(clientRow);
    // Преообразуем контакты в строку

    let clientContacts = client.contacts;

    // Функция для генерации контактов

    let contactsHtml = getClientContacts(clientContacts);

    // Создаем новый объект с объединенным ФИО и другими доработками, готовый ко вставке в таблицу
    client = {
      id: client.id,
      name: client.surname + " " + client.name + " " + client.lastName,
      createdAt: convertDateFromISO(client.createdAt),
      updatedAt: convertDateFromISO(client.updatedAt),
      contacts: contactsHtml,
    };

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

    // Клик на кнопку Изменить в таблице

    changeButton.addEventListener("click", function () {
      handleEditClientClick(changeButton, client.id);
    });

    // Клик на кнопку Удалить (в таблице)
    deleteButton.addEventListener("click", function () {
      handleDeleteClientClick(changeButton, client.id);
    });
  }

  // Клик на кнопку Новый клиент

  newClientButton.addEventListener("click", async function (e) {
    e.preventDefault();
    console.log("Нажатие на кнопку Новый клиент");
    // Собираем все инпуты в модальном окне
    inputsToValidate = gatherCurrentData();
    console.log("inputsToValidate = ", inputsToValidate);

    // Запускаем функцию валидации
    validateInputs(inputsToValidate);

    if (validationErrors.length === 0) {
      // Если валидация прошла успешно (массив с ошибками пустой), то собираем данные, введенные пользователем, чтобы передать на сервер
      // Получаем ФИО клиента
      let inputSurname = clientSurnameInput;
      let inputSurnameValue = inputSurname.value.trim();
      let inputName = clientNameInput;
      let inputNameValue = inputName.value.trim();
      let inputLastName = clientLastNameInput;
      let inputLastNameValue = inputLastName.value.trim();
      // Получаем контактные данные клиента
      const contactWrappers =
        allContactsWrapper.querySelectorAll(".contact-wrapper");
      const contactsData = Array.from(contactWrappers).map((wrapper) => {
        const type = wrapper.querySelector("select").value;
        let value = wrapper.querySelector("input").value;

        if (type === "Телефон") {
          value = value.replace(/[\s-]/g, "");
        }
        return {
          type,
          value,
        };
      });

      console.log("contactsData = ", contactsData);

      // Отправляем данные на сервер

      const response = await fetch(`${serverAddress}/api/clients`, {
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
      });

      // Достаем новые данные клиента из ответа сервера

      const newClient = await response.json();

      // Добавляем новую строку в таблицу

      const clientRow = document.createElement("tr");
      clientRow.setAttribute("data-id", newClient.id);
      clientRow.classList.add("table-row");
      clientTable.append(clientRow);
      fillRowWithClientData(clientRow, newClient);

      // @todo Закрываем окно только если валидация пройдена (может это запихнуть в функцию валидации?)
      closeModalWindow();
    }
  });

  // Функция после клика на кнопку Изменить

  async function handleEditClientClick(clickedButton, clientId) {
    // Добавляем класс clicked на кнопку
    clickedButton.classList.add("clicked");
    // Запускаем функцию блокирования всех кнопок и поля ввода
    blockAllButtonsAndInputs();

    // Ждем завершения openChangeClientWindow
    const clientData = await openChangeClientWindow(clientId);

    window.location.hash = `edit-client-${clientId}`;
    // Запускаем функцию снятия блокировки со всех кнопок и поля ввода
    unblockAllButtonsAndInputs();
    // Снимаем класс clicked с кнопки изменения клиента
    clickedButton.classList.remove("clicked");
  }

  async function handleDeleteClientClick(clickedButton, clientId) {
    console.log("Клик на кнопку удалить в таблице");
    currentCliendId = clientId;
    console.log("currentCliendId", clientId);
    // Добавляем класс clicked на кнопку
    clickedButton.classList.add("clicked");
    // Показываем модальное окно удаления клиента
    showModalWindowDelete();
    // Снимаем стиль clicked
    clickedButton.classList.remove("clicked");
  }

  async function deleteClient(clientId) {
    // Функция удаления клиента
    const response = await fetch(`${serverAddress}/api/clients/${clientId}`, {
      method: "DELETE",
    });
    // Удаляем строку с клиентом из разметки

    const rowToRemove = document.querySelector(`tr[data-id="${clientId}"]`);
    rowToRemove.remove();

    // Убираем оверлей
    // @todo Проверить - не убирается ли оверлей в функции закрытия модального окна. Если нет - может эту строчку как раз туда перенести?
    if (document.querySelector(".overlay")) {
      document.querySelector(".overlay").remove();
    }

    // Восстанавливаем работоспособность кнопки раскрытия контактов
    handleShowMoreContactsButton();
  }

  function showModalWindowDelete() {
    document.body.classList.add("modal-active");
    modalWindowDelete.classList.remove("display-none");
    modalContainerDelete.classList.add("active");
    // Добавляем кнопку Отмена
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-button");
    cancelButton.textContent = "Отмена";
    modalWindowDelete.append(cancelButton);
    cancelButton.addEventListener("click", function () {
      closeModalWindowDelete();
    });
  }

  document // Клик на кнопку Удалить в модальном окне
    .querySelector(".delete-button-inside-modal")
    .addEventListener("click", function () {
      showOverlayAndSpinner();
      deleteClient(currentCliendId); // Передаем ID клиента в функцию удаления
      if (!modalWindow.classList.contains("display-none")) {
        closeModalWindow();
      }
      closeModalWindowDelete();
    });

  // Функция генерации блока с контактами при изменении клиента

  function createContactSelect(setContact) {
    const contactSelect = document.createElement("select");
    contactTypes.forEach((type) => {
      const contactOptions = document.createElement("option");
      contactOptions.textContent = type;
      contactOptions.value = type;
      contactSelect.append(contactOptions);
    });
    return contactSelect;
  }

  function deleteContactEverywhere(event) {
    // Функция удаления контакта из разметки и из сервера

    const contactWrapper = event.target.closest(".contact-wrapper");
    const input = contactWrapper.querySelector("input");
    if (contactWrapper && confirm("Удалить контакт?")) {
      input.value = "";

      contactWrapper.remove();
    }
    if (addContactButton.disabled) {
      addContactButton.disabled = false;
    }
    saveChangesButton.disabled = false;
  }

  function openChangeClientWindow(clientId) {
    // @func открытия окна изменения клиента (и отработки дальнейшей логики)

    // Получаем данные из строчки таблицы, где произошел клик
    currentCliendId = clientId;
    const clientDataRow = document.querySelector(`tr[data-id="${clientId}"]`);
    // Определяем ФИО
    const clientFullname = clientDataRow.querySelector(".cell-name").innerHTML;
    const [clientSurname, clientName, clientLastname] =
      clientFullname.split(" ");
    // Определяем контакты
    let clientContacts = [];
    clientDataRow.querySelectorAll(".tooltip").forEach((contact) => {
      const [type, value] = contact.textContent
        .split(":")
        .map((text) => text.trim());
      clientContacts.push({ type, value });
    });

    // Собираем все данные в объект
    const clientData = {
      id: clientId,
      surname: clientSurname,
      name: clientName,
      lastName: clientLastname,
      contacts: clientContacts,
    };

    // Показываем модальное окно
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
    // Показываем кнопку Сохранить
    saveChangesButton.classList.remove("display-none");
    // Клик на кнопку Сохранить (изменения в клиенте)
    saveChangesButton.addEventListener("click", async function () {
      // Проверяем изменился ли клиент по сравнению с версией на сервере. Получаем id измененного клиента и объект с измененным клиентом
      const clientChangesResult = checkChanges(clientData);

      if (clientChangesResult.isClientChanged) {
        // Если данные изменились, делаем валидацию
        const inputsToValidate = gatherCurrentData();
        validateInputs(inputsToValidate);
        if (validationErrors.length === 0) {
          try {
            const response = await saveChangesToServer(
              // Если валидация прошла успешно, сохраняем данные на сервер
              currentCliendId,
              clientChangesResult.changedClient
            );
            // Берем ответ с сервера с данными измененного клиента
            const changedClientData = await response.json();

            // Находим строчку с измененным клиентом
            const clientRow = document.querySelector(
              `#client-table tr[data-id="${changedClientData.id}"]`
            );
            // Удаляем содержимое строки
            clientRow.innerHTML = "";

            // Заполняем строку данными измененного клиента
            fillRowWithClientData(clientRow, changedClientData);
            // Закрываем модальное окно
            closeModalWindow();
          } catch (error) {
            console.error("Ошибка при сохранении данных на сервере:", error);
          }
        } else {
          validationErrorsContainer.textContent =
            "Данные клиента не изменились по сравнению с текущими данными";
        }
      } else {
        console.log("Данные не изменились");
        validationErrorsContainer.textContent = "Данные клиента не изменились";
      }
    });

    // Добавляем кнопку удаления клиента в модальное окно изменения клиента
    const deleteClientButton = document.createElement("button");
    deleteClientButton.textContent = "Удалить клиента";
    deleteClientButton.classList.add("cancel-button");
    modalWindow.append(deleteClientButton);
    deleteClientButton.addEventListener("click", function () {
      showModalWindowDelete(clientId);
    });
    // Устанавливаем значения в инпуты ФИО
    clientNameInput.value = clientData.name;
    clientLastNameInput.value = clientData.lastName;
    clientSurnameInput.value = clientData.surname;

    // Стираем все контакты, накопленные с предыдущего изменения
    allContactsWrapper.innerHTML = "";

    // Генерируем верстку с контактами

    if (clientData.contacts.length > 0) {
      for (let i = 0; i < clientData.contacts.length; i++) {
        const newContactWrapper = document.createElement("div");
        newContactWrapper.classList.add("contact-wrapper");
        newContactWrapper.id = `contact${i + 1}`;
        const selectWrapper = document.createElement("div");
        selectWrapper.classList.add("element");
        const setContact = clientData.contacts[i].type;
        const contactSelect = createContactSelect();
        contactSelect.classList.add("contact-select");
        contactSelect.value = setContact;

        allContactsWrapper.append(newContactWrapper);
        newContactWrapper.append(selectWrapper);
        selectWrapper.append(contactSelect);

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
          // Вешаем маску для телефона
          applyPhoneMask(contactInput);
        } else if (contactSelect.value === "Эл. почта") {
          // Если тип контакта эл. почта, то вешаем маску для электронной почты
          applyMailMask(contactInput);
          contactInput.value = clientData.contacts[i].value;
        } else {
          contactInput.value = clientData.contacts[i].value;
        }
        newContactWrapper.append(contactInput);
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
        newContactWrapper.append(contactDeleteWrapper);
        contactDeleteWrapper.append(contactDeleteBtn);
        contactDeleteWrapper.append(contactDeleteTooltip);
        contactDeleteBtn.onclick = deleteContactEverywhere;

        // Вешаем на инпут слушатель события смены инпута, чтобы применять и отменять маски
        contactSelect.addEventListener("change", () => {
          applyMasks(contactSelect.value, contactInput);
        });
      }
    }

    // Убираем оверлей после загрузки окна изменений клиента
    overlay.remove();

    // Клик на кнопку закрыть модальное окно (если изменений не произошло)
    closeButton.onclick = function () {
      closeModalWindow();
    };

    // Открываем модальное окно и добавляем активные классы после получения данных

    modalContainer.classList.add("active");
    document.body.classList.add("modal-active");
    return clientData;
  }

  function applyMasks(contactSelectValue, contactInput) {
    // Функция применения маски к инпуту в завивисости от содержания соответствующего селекта
    if (contactSelectValue === "Телефон") {
      applyPhoneMask(contactInput);
    } else if (contactSelectValue === "Эл. почта") {
      applyMailMask(contactInput);
    } else {
      removeMask(contactInput);
      console.log("Снимаем маску");
    }
  }

  function fillRowWithClientData(clientRow, client) {
    // Генерируем HTML для контактов
    let contactsHtml = getClientContacts(client.contacts);
    // Создаем новый объект с объединенным ФИО и свойствами объекта в нужном порядке (как в таблице)
    clientToAdd = {
      id: client.id,
      name: client.surname + " " + client.name + " " + client.lastName,
      createdAt: convertDateFromISO(client.createdAt),
      updatedAt: convertDateFromISO(client.updatedAt),
      contacts: contactsHtml,
    };

    // Разносим параметры клиента по ячейкам
    for (let key in clientToAdd) {
      let clientCell = document.createElement("td");
      clientCell.innerHTML = clientToAdd[key];
      clientCell.classList.add(`cell-${[key]}`);
      clientRow.append(clientCell);
    }

    // Добавляем кнопки изменения и удаления в последнюю ячейку
    let actionCell = document.createElement("td");
    let changeButton = document.createElement("button");
    changeButton.textContent = "Изменить";
    changeButton.classList.add("change-button");
    changeButton.addEventListener("click", function () {
      handleEditClientClick(changeButton, client.id);
    });
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", function () {
      handleDeleteClientClick(changeButton, client.id);
    });
    clientRow.append(actionCell);
    actionCell.append(changeButton, deleteButton);
    let linkCell = document.createElement("td");
    clientRow.append(linkCell);

    // Формируем кнопку с ссылкой на hash клиента
    let clientLink = document.createElement("a");
    clientLink.href = `#edit-client-${client.id}`;
    clientLink.textContent = "Ссылка";
    clientLink.classList.add("client-link");
    clientLink.addEventListener("click", function (e) {
      // Слушатель на клик по ссылке клиента
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
  }

  function checkChanges(serverData) {
    // Функция для проверки факта внесения изменений в данные клиента. Возвращает флаг "Клиент измненен" и данные измененного клиента

    const currentData = gatherCurrentData();
    let changedClient = {};
    let isClientChanged = false;

    // Сравнение ФИО
    if (
      serverData.name !== currentData.name ||
      serverData.surname !== currentData.surname ||
      serverData.lastName !== currentData.lastName
    ) {
      isClientChanged = true;
    }

    // Сравнение контактов
    if (serverData.contacts.length !== currentData.contacts.length) {
      isClientChanged = true;
    } else {
      changedClient.contacts = [];
      for (let i = 0; i < currentData.contacts.length; i++) {
        if (
          serverData.contacts[i].type !== currentData.contacts[i].type ||
          serverData.contacts[i].value !== currentData.contacts[i].value
        ) {
          isClientChanged = true;
        }
      }
    }

    if (isClientChanged) {
      changedClient = currentData;
    }

    return { isClientChanged, changedClient };
  }

  function gatherCurrentData() {
    const currentData = {};
    currentData.name = clientNameInput.value.trim();
    currentData.surname = clientSurnameInput.value.trim();
    currentData.lastName = clientLastNameInput.value.trim();
    currentData.contacts = gatherContactsFromModalWindow();
    return currentData;
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

    // Блокируем инпут поиска

    searchInput.disabled = true;
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

    // Снимаем блокировку инпута поиска

    searchInput.disabled = false;
  }

  // Функция для стирания всех пробелов и иных знаков из номера телефона перед отправлением на сервер

  function preparePhoneNumberForSever(contacts) {
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].type === "Телефон") {
        contacts[i].value = contacts[i].value.replace(/[\s-]/g, "");
      }
    }
    return contacts;
  }

  // Определяем кнопку сохранения клиента

  saveChangesButton.classList.add("add-change-client-button");
  async function saveChangesToServer(clientId, changedClient) {
    // Показываем оверлей
    showOverlayAndSpinner();

    changedClient.contacts = preparePhoneNumberForSever(changedClient.contacts);

    // Отправляем на сервер обновленные данные

    const response = await fetch(`${serverAddress}/api/clients/${clientId}`, {
      method: "PATCH",
      body: JSON.stringify(changedClient),
      headers: {
        "Content-type": "application/json",
      },
    });
    // Отрабатываем ошибки сервера
    if (!response.ok) {
      if (response.status > 400) {
        throw new Error("Ошибка сервера: " + response.status);
      } else {
        throw new Error("Что-то пошло не так");
      }
    } else {
      return response;
      closeModalWindow();
    }
  }

  function closeModalWindow() {
    // Функция закрытия модального окна
    modalWindow.classList.add("display-none");
    modalContainer.classList.remove("active");
    document.body.classList.remove("modal-active");
    allContactsWrapper.innerHTML = "";
    clientSurnameInput.value = "";
    clientNameInput.value = "";
    clientLastNameInput.value = "";
    // Скрываем кнопку "Новый клиент"
    newClientButton.classList.add("display-none");

    // Очищаем поле с контактами
    allContactsWrapper.innerHTML = "";
    // Удаляем поле с ID
    if (document.querySelector(".client-id-info")) {
      document.querySelector(".client-id-info").remove();
    }
    // Удаляем содержание контейнера с ошибками
    validationErrorsContainer.innerHTML = "";
    // Удаляем кнопку удалить, если она есть
    if (document.querySelector(".cancel-button")) {
      document.querySelector(".cancel-button").remove();
    }
    // Удаляем оверлей (если он есть)
    if (document.querySelector(".overlay")) {
      document.querySelector(".overlay").remove();
    }

    // Удаляем классы ошибок с инпутов

    modalWindow.querySelectorAll("input").forEach((input) => {
      if (input.classList.contains("input-error")) {
        input.classList.remove("input-error");
      }
    });

    // Удаляем хэш
    history.replaceState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
  }

  function closeModalWindowDelete() {
    // Функция закрытия модального окна удаления клиента
    modalWindowDelete.classList.add("display-none");
    modalContainerDelete.classList.remove("active");
    document.body.classList.remove("modal-active");
  }

  function renderClients(clientsList) {
    // Функция рендера таблицы
    for (let i = 0; i < clientsList.length; i++) {
      getClient(clientsList[i]);
    }
  }

  // Функция для навешивания класса ошибки на неверно заполненные инпуты
  function addErrorClass(contactInputs, contactType, contactValue) {
    contactInputs.forEach((input) => {
      const inputType = input
        .closest(".contact-wrapper")
        .querySelector("select").value;
      if (inputType === contactType && input.value === contactValue) {
        input.classList.add("input-error");
      }
    });
  }

  async function validateInputs(inputs) {
    // @note Функция валидации всех инпутов
    // Очищаем массив с ошибками
    validationErrors = [];
    // Очищаем контейнер с ошибками
    validationErrorsContainer.innerHTML = "";
    // Определяем все инпуты (для правильного навешивания класса с ошибкой на инпут)
    const contactInputs = modalWindow.querySelectorAll(
      ".contact-wrapper input"
    );
    // Определяем тексты ошибок
    const error = {
      surname: "Поле с фамилией не должно быть пустым",
      name: "Поле с именем не должно быть пустым",
      phone: "Телефон должен состоять из десяти цифр",
      mail: "Адрес электронной почты должен быть корректным (вида name@domain.com)",
      facebook: "Поле «Фейсбук» не должно быть пустым",
      vkontakte: "Поле «Вконтакте» не должно быть пустым",
      other: "Поле «Другое» не должно быть пустым",
    };

    if (!inputs.surname) {
      if (!validationErrors.includes(error.surname)) {
        validationErrors.push(error.surname);
      }
      document.getElementById("input-surname").classList.add("input-error");
    }

    if (!inputs.name) {
      if (!validationErrors.includes(error.name)) {
        validationErrors.push(error.name);
      }
      document.getElementById("input-name").classList.add("input-error");
    }

    inputs.contacts.forEach((element) => {
      const phoneRegExp = /^\d{3} \d{3}-\d{2}-\d{2}$/;
      if (element.type === "Телефон" && !phoneRegExp.test(element.value)) {
        if (!validationErrors.includes(error.phone)) {
          validationErrors.push(error.phone);
        }
        addErrorClass(contactInputs, "Телефон", element.value);
      }

      mailRegExpr = /^[^@]+@[^@]+.[^@]+$/;
      if (element.type === "Эл. почта" && !mailRegExpr.test(element.value)) {
        if (!validationErrors.includes(error.mail)) {
          validationErrors.push(error.mail);
        }
        addErrorClass(contactInputs, "Эл. почта", element.value);
      }

      if (element.type === "Фейсбук" && !element.value) {
        if (!validationErrors.includes(error.facebook)) {
          validationErrors.push(error.facebook);
        }
        addErrorClass(contactInputs, "Фейсбук", element.value);
      }

      if (element.type === "Вконтакте" && !element.value) {
        if (!validationErrors.includes(error.vkontakte)) {
          validationErrors.push(error.vkontakte);
        }
        addErrorClass(contactInputs, "Вконтакте", element.value);
      }
      if (element.type === "Другое" && !element.value) {
        if (!validationErrors.includes(error.other)) {
          validationErrors.push(error.other);
        }
        addErrorClass(contactInputs, "Другое", element.value);
      }
    });

    // Вешаем на каждый инпут с ошибкой слушатель, который снимет ошибку при потере фокуса на таком инпуте

    const allInvalidContactInputs =
      modalWindow.querySelectorAll(".input-error");
    allInvalidContactInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        this.classList.remove("input-error");
      });
    });
    validationErrorsContainer.innerHTML = validationErrors.join("<br>");
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

  let contactCount = 1;

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

  addContactButton.onclick = function () {
    // Клик на кнопку Добавить контакт
    const newContactWrapper = createContactWrapper(contactCount, contactTypes);
    allContactsWrapper.append(newContactWrapper);
    contactCount++;

    // Проверяем количество контактов и делаем неактивной кнопку добавления нового контакта

    if (allContactsWrapper.children.length > 9) {
      addContactButton.disabled = true;
    }
  };

  function applyPhoneMask(input) {
    const inputMask = new Inputmask("999 999-99-99");
    inputMask.mask(input);
  }

  function applyMailMask(input) {
    const inputMask = new Inputmask({
      mask: "*{1,30}[.*{1,30}][.*{1,30}][.*{1,30}]@*{1,30}[.*{2,20}][.*{1,20}]",
      greedy: false,
      definitions: {
        "*": {
          validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
          casing: "lower",
        },
      },
      onBeforePaste: function (pastedValue, opts) {
        pastedValue = pastedValue.toLowerCase();
        return pastedValue.replace("mailto:", "");
      },
    });
    inputMask.mask(input);
  }

  function removeMask(input) {
    Inputmask.remove(input);
  }

  function createContactWrapper(contactCount, contactTypes) {
    // Функция создания пустого контакта в модальном окне
    const newContactWrapper = document.createElement("div");
    newContactWrapper.classList.add("contact-wrapper");
    newContactWrapper.id = `contact${contactCount}`;
    const selectWrapper = document.createElement("div");
    selectWrapper.classList.add("element");
    const contactSelect = createContactSelect(contactTypes);
    contactSelect.classList.add("contact-select");
    selectWrapper.append(contactSelect);
    newContactWrapper.append(selectWrapper);
    new Choices(contactSelect, {
      shouldSort: false, // Отключаем сортировку, чтобы опции отображались в исходном порядке
      searchEnabled: false, // Отключаем возможность поиска, если это не требуется
      itemSelectText: "",
    });
    const contactInput = document.createElement("input");
    contactInput.required = true;
    contactInput.classList.add("contact-input");
    // Вешаем маску для телефона, потому что он по умолчанию тип селекта является телефоном
    applyPhoneMask(contactInput);
    // Вешаем на инпут слушатель события смены инпута, чтобы применять и отменять маски
    contactSelect.addEventListener("change", () => {
      applyMasks(contactSelect.value, contactInput);
    });
    newContactWrapper.append(contactInput);
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
    newContactWrapper.append(contactDeleteWrapper);
    contactDeleteWrapper.append(contactDeleteBtn);
    contactDeleteWrapper.append(contactDeleteTooltip);
    contactDeleteBtn.onclick = deleteContactFromHTML;

    return newContactWrapper;
  }

  // Функция сбора всех контактов из модального окна

  function gatherContactsFromModalWindow() {
    contacts = [];
    const allContactsWrappers = modalWindow
      .querySelectorAll(".contact-wrapper")
      .forEach((contact) => {
        const contactType = contact.querySelector("option").textContent;
        const contactValue = contact
          .querySelector(".contact-input")
          .value.trim();
        contacts.push({ type: contactType, value: contactValue });
      });
    return contacts;
  }

  // @note Раздел сортировки

  // Функция сортировки по указанному ключу (по возрастанию)
  function sortByKeyAsc(key) {
    return (a, b) => {
      if (a[key] > b[key]) return 1;
      if (a[key] < b[key]) return -1;
      return 0;
    };
  }

  // Функция сортировки по указанному ключу (по убыванию)
  function sortByKeyDesc(key) {
    return (a, b) => {
      if (a[key] > b[key]) return -1;
      if (a[key] < b[key]) return 1;
      return 0;
    };
  }

  // Определяем кнопки для сортировки
  const sortButtons = {
    "sort-by-id-button": "id",
    "sort-by-name-button": "fullName",
    "sort-by-created-button": "createdAt",
    "sort-by-updated-button": "updatedAt",
  };

  // Назначаем обработчики событий на кнопки сортировки
  for (const buttonId in sortButtons) {
    const key = sortButtons[buttonId];
    const button = document.getElementById(buttonId);
    button.addEventListener("click", function () {
      const ascFlag = this.classList.contains("sorting-asc");
      clients = extractTable();
      removeSortingStylesEverywhere();
      this.classList.add("sorting-now");

      const sortedTable = [...clients].sort(
        ascFlag ? sortByKeyDesc(key) : sortByKeyAsc(key)
      );
      // Если сортировка по имени, то расставляем маркеры А-Я, Я-А после стрелки
      key === "fullName" && ascFlag
        ? (document.getElementById("sorting-descr").textContent = "Я–А")
        : (document.getElementById("sorting-descr").textContent = "А–Я");
      // Очищаем таблицу и заполняем отсортированными данными
      clientTable.innerHTML = "";
      renderClients(sortedTable);
      // Если отсутствовал флаг сортировки по возрастанию добавляем его
      if (!ascFlag) {
        this.classList.add("sorting-asc");
      }
      // Восстанавливаем работоспособность кнопки раскрытия контактов
      handleShowMoreContactsButton();
    });
  }

  function removeSortingStylesEverywhere() {
    // Функция для удаления класса sorting now со всех кнопок
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
        fullName,
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
    // Функция извлечения контактов (для функции извлечения таблицы)
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

  async function fetchSearchData(searchValue) {
    // Функция поиска
    if (searchValue.trim()) {
      const searchResult = await getData(
        `${serverAddress}/api/clients?search=${searchValue}`
      );

      previewSearchResults(searchResult);

      clientTable.innerHTML = "";
      renderClients(searchResult);
    } else {
      const searchResult = await getData(
        `${serverAddress}/api/clients?search=${searchValue}`
      );

      searchPreview.style.display = "none";

      clientTable.innerHTML = "";
      renderClients(searchResult);
    }
  }

  // Функция предзаполнения

  async function previewSearchResults(searchResult) {
    // Функция предзаполнения

    const searchResultPreview = searchResult.map((client) => {
      return {
        surname: client.surname,
        name: client.name,
        id: client.id,
      };
    });
    if (searchPreview) {
      searchPreview.style.display = "block";
      searchPreview.innerHTML = "";
      searchResultPreview.forEach((client) => {
        let previewElement = document.createElement("li");
        previewElement.textContent = `${client.surname} ${client.name}`;
        searchPreview.append(previewElement);
        previewElement.addEventListener(
          "mouseenter",
          createHighlightFucntion(client)
        );
        previewElement.addEventListener("click", createScrollToClicked(client));
      });
    } else {
      console.log("Что-то пошло не так");
    }
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

  // Делаем отсрочку после ввода символа в поле поиска и отправкой данных на сервер

  function debounce(func, delay) {
    let debounceTimeout;
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
      fetchSearchData(this.value).then(() => {
        console.log("Инпут в поиск");
        handleShowMoreContactsButton();
      });
    }, 300)
  );

  openModalButton.addEventListener("click", function () {
    modalContainer.classList.add("active");
    document.body.classList.add("modal-active");
  });

  addButton.onclick = function () {
    // Клик на кнопку Добавить клиента (открытие модального окна)
    // Делаем заголовок
    modalWindow.querySelector("h2").textContent = "Добавить клиента";
    modalWindow.classList.remove("display-none");

    // Скрываем кнопку "Сохранить изменения"
    saveChangesButton.classList.add("display-none");
    // Показываем кнопку Новый клиент
    newClientButton.classList.remove("display-none");

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

  // @note Раздел - иное (временное)

  // Получаем базу клиентов с сервера
  let clientsList = await getData(`${serverAddress}/api/clients`);

  showOverlayAndSpinner();

  // Первичный рендер в конце которого убираем спиннер
  renderClients(clientsList);
  // Убираем оверлей после загрузки данных клиентов
  overlay.remove();

  // Вызываем функцию проверки хэша в адресной строке браузера
  handleHashChange();

  // Для каждой кнопки раскрытия контактов определяем функцию удаления стиля, который скрывал кнопки-контакты (если их количество > 4)

  handleShowMoreContactsButton();

  function handleShowMoreContactsButton() {
    console.log("Запустилась функция handleShowMoreContactsButton");
    const showMoreContactsButton = document.querySelectorAll(
      ".show-more-contacts-btn"
    );
    showMoreContactsButton.forEach((button) => {
      button.addEventListener("click", function () {
        console.log("КЛик на кнопку showMoreContactsButton");
        let parentRow = this.closest("tr");
        parentRow.querySelectorAll(".contact-hidden").forEach((contact) => {
          contact.classList.remove("contact-hidden");
        });
        button.style.display = "none"; // Скрываем кнопку после использования
      });
    });
  }
});
