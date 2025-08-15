import axios from "axios";
import { useState, useEffect } from "react";
import ChatsTable from "../../components/Table/ChatsTable";
import Select from "../../components/elements/Select/Select";

export default function Dashboard() {
  const [chats, setChats] = useState([]);
  const [chatInfo, setChatInfo] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [summary, setSummary] = useState(null);

  const columnNames = [
    "Называние чата и фото",
    "кол-во участников",
    "Кол-во сообщении",
    "частота сообщении и среднее значение в сутки",
    "Последняя активность",
    "Уровень риска",
  ];

  const chat_info_columns = [
    "Номер аудита",
    "Номер телефона",
    "Имя профиля",
    "Имя в контактах",
    "Права",
    "Кол-во сообщений",
    "Частота сообщений",
    "Последняя активность",
    "Уровень риска"
  ];

  const contact_columns = [
    "Номер телефона",
    "Имя/контакт",
    "Описание",
    "Фото профиля",
    "Почта",
    "Категория - вид деятельности",
    "Список общих групп",
    "Кол-во сообщений",
    "Последняя активность",
    "Телеграм аккаунт",
    "Открытые источники", 
    "Уровень риска"
  ];

  useEffect(() => {
    async function getSummary() {
      try {
        const res = await axios.get("http://localhost:8003/api/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    }
    getSummary();
 }, []);

  const get_chats = async (field, order) => {
    try {
      const response = await axios.get(`http://localhost:8003/api/chats?field=${field}&order=${order}`);
      setChats(response.data);
    } catch {
      console.log("error");
    }
  };

  const get_chat_info = async (chatId) => {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/chat_info/${chatId}`
      );
      setChatInfo([response.data]);
    } catch {
      console.log("error");
    }
  };

  const get_chat_messages = async (chatId) => {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/chat_messages/${chatId}`
      );
      setChatMessages(response.data);
    } catch {
      console.log("error");
    }
  };

  const get_contact_info = async (participantId) => {
    try {
      const response = await axios.get(
        `http://localhost:8003/api/contact_info/${participantId}`
      );
      setContactInfo([response.data]);
    } catch (err) {
      console.error("Error fetching contact info:", err);
    }
  };

  useEffect(() => {
    get_chats();
  }, []);

  const handleChatClick = (chatId) => {
    get_chat_info(chatId);
    get_chat_messages(chatId);
    setContactInfo([]);
  };

  const handleParticipantClick = async (participant) => {
    if (!chatInfo.length) return;

    const chat = chatInfo[0];

    const draftContactInfo = {
      phone: participant.id ? participant.id.replace("@c.us", "") : "N/A",
      contactName: participant.name || "N/A",
      messagesCount: chat.messages || 0,       
      lastActivity: chat.last_activity || "N/A",
      riskLevel: chat.risk_level || "N/A"
    };

    try {
      const extraData = await get_contact_info(participant.id);

      const mergedInfo = {
        ...draftContactInfo,
        ...extraData
      };
      setContactInfo([mergedInfo]);
    } catch (err) {
      console.error("Error fetching contact info:", err);
      setContactInfo([draftContactInfo]);
    }
  };

  return (
    <>
      {/* Header */}
      <header
        className="cg-10 pb-10"
        style={{ backgroundColor: "var(--color-dark-gray)", width: "100wh" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xxl-3 col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <h3 className="info-box pi-20 pb-15">Аккаунт-87079546768</h3>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-6">
              <div className="row cg-10" style={{ justifyContent: "end" }}>
                <h3 className="info-box pi-20 pb-15" style={{ width: "100%" }}>
                  Поиск Чата
                </h3>
                <h3 className="info-box pi-20 pb-15" style={{ width: "100%" }}>
                  Поиск Аккаунта
                </h3>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mb-10 flex-column rg-30">
        {/* Main */}
        <div className="row" style={{ justifyContent: "normal" }}>
          <div className="col-xxl-5 col-xl-5 col-lg-5 col-md-6 col-sm-6">
            <img
              src="/images/WhatsApp.png"
              alt="main"
              style={{ width: "100%" }}
            />
          </div>
          <div className="col-xxl-7 col-xl-6 col-lg-6 col-md-6 col-sm-6">
            <div className="flex-column rg-10">
              <h4 className="main-title">WhatsApp Parser</h4>
              <h5 className="main-text">
                WhatsApp Parser — это инструмент для анализа и структурирования
                данных из чатов WhatsApp. Он позволяет загружать сообщения,
                определять активность пользователей, анализировать частоту
                сообщений и выявлять потенциальные риски.
              </h5>
              <p>
                {" "}
                Основные возможности:
                <br />
                ✅ Извлечение данных из чатов и контактов
                <br />
                ✅ Подсчет количества сообщений и чатов
                <br />
                ✅ Определение частоты сообщений и активности
                <br />
                ✅ Выявление подозрительных чатов и контактов
                <br />✅ Сортировка и фильтрация информации по уровням риска
              </p>
            </div>
          </div>
        </div>
        <main className="row cg-10" style={{ alignItems: "start" }}>
          <div className="col-xxl-3 col-xl-2 col-lg-2 col-md-2 col-sm-2">
            <div className="flex-column rg-20">
              <div className="block">
                <h2 className="pi-20 pb-15 title">Общая Информация</h2>
                <div className="flex-column p-10 rg-10">
                  <h3 className="info-box">
                    Кол-во Чатов: {summary ? summary.total_chats : "-"}
                  </h3>
                  <h3 className="info-box">
                    Кол-во Сообщений: {summary ? summary.total_messages : "-"}
                    </h3>
                  <h3 className="info-box">
                    Подозрительных чатов: {summary ? summary.high_risk : "-"}
                    </h3>
                </div>
              </div>
              <div className="block">
                <h2 className="pi-20 pb-15 title">Фильтры</h2>
                <div className="flex-column p-10 rg-10">
                  <Select
                    options={["", "most participants", "least participants", "highest risk", "lowest risk"]}
                    onChange={(e) => {
                      const selected = e.target.value;

                      let field;
                      let order;

                      if (
                        selected === "most participants" ||
                        selected === "least participants"
                      ) {
                        field = "participants_count";
                        order = selected === "most participants" ? "desc" : "asc";
                      } else if (
                        selected === "highest risk" ||
                        selected === "lowest risk"
                      ) {
                        field = "risk_level";
                        order = selected === "highest risk" ? "desc" : "asc";
                      }

                      get_chats(field, order);          
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-9 col-xl-9 col-lg-9 col-md-9 col-sm-9">
            <div className="flex-column rg-20">
              <div className="block">
                <h2 className="pi-20 pb-15 title">Список Чатов</h2>
                <div className="p-10 table-container">
                  <ChatsTable
                    columnNames={columnNames}
                    columnValues={chats}
                    onClick={handleChatClick}
                  />
                </div>
              </div>

              <div className="block">
                <h2 className="pi-20 pb-15 title">Информация по чату</h2>
                <div className="p-10 table-container">
                  <Table
                    columnNames={chat_info_columns}
                    columnValues={chatInfo}
                    onParticipantClick={handleParticipantClick}
                  />
                </div>
              </div>

              <div className="block">
                <h2 className="pi-20 pb-15 title">Последние сообщения чата</h2>
                <div className="p-10 table-container">
                  <LastMessagesTable messages={chatMessages} />
                </div>
              </div>
              <div className="block">
                <h2 className="pi-20 pb-15 title">Информация по контакту</h2>
                <div className="p-10 table-container">
                  <ContactInfoTable
                    columnNames={contact_columns}
                    contactValues={contactInfo}
                  />
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function Table({ columnNames, columnValues, onParticipantClick }) {
  if (!columnValues.length) return null;

  const chat = columnValues[0];

  if (Array.isArray(chat.participants) && chat.participants.length > 0) {
    return (
      <table className="table">
        <thead>
          <tr>
            {columnNames.map((col, idx) => (
              <th key={idx} className="table-item">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chat.participants.map((participant, pIndex) => (
            <tr 
            key={pIndex}
            onClick={() => onParticipantClick && onParticipantClick(participant)}>
              <td className="table-item">
                {pIndex + 1}
              </td>

              <td className="table-item">
                {participant.id ? participant.id.replace("@c.us", "") : "N/A"}
              </td>

              <td className="table-item">{chat.profile_name || "N/A"}</td>

              <td className="table-item">{participant.name || "N/A"}</td>

              <td className="table-item">
                {participant.isAdmin ? "Admin" : "Not Admin"}
              </td>

              <td className="table-item">{chat.messages || 0}</td>

              <td className="table-item">{chat.frequency || "N/A"}</td>

              <td className="table-item">{chat.last_activity || "N/A"}</td>

              <td className="table-item">{chat.risk_level || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return (
      <table className="table">
        <thead>
          <tr>
            {columnNames.map((col, idx) => (
              <th key={idx} className="table-item">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columnValues.map((item, index) => (
            <tr key={index}>
              {Object.entries(item)
                .filter(([key]) => key !== "id")
                .map(([_, value], i) => (
                  <td key={i} className="table-item">
                    {value}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

function LastMessagesTable({ messages }) {
  
  if (!messages.length) {
    return (
      <table className="table">
        <thead>
          <tr>
            <th className="table-item">Время отправки</th>
            <th className="table-item">Номер отправителя</th>
            <th className="table-item">Имя/контакт отправителя</th>
            <th className="table-item">Текст сообщения</th>
            <th className="table-item">Вложение сообщения</th>
            <th className="table-item">Пересланное/кол-во</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="table-item" colSpan={6}>
              Нет сообщений
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th className="table-item">Время отправки</th>
          <th className="table-item">Номер отправителя</th>
          <th className="table-item">Имя/контакт отправителя</th>
          <th className="table-item">Текст сообщения</th>
          <th className="table-item">Вложение сообщения</th>
          <th className="table-item">Пересланное/кол-во</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((msg, index) => (
          <tr key={index}>
            <td className="table-item">{msg.time || "N/A"}</td>
            <td className="table-item">{msg.sender || "N/A"}</td>
            <td className="table-item">{msg.senderName || "N/A"}</td>
            <td className="table-item">{msg.text || "N/A"}</td>
            <td className="table-item">
              {msg.attachment ? "Есть вложение" : "—"}
            </td>
            <td className="table-item">
              {msg.forwardCount ? `Да/${msg.forwardCount} раз` : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ContactInfoTable({ columnNames, contactValues }) {
  if (!contactValues.length) {
    return null; 
  }

  const contact = contactValues[0];

  return (
    <table className="table">
      <thead>
        <tr>
          {columnNames.map((col, i) => (
            <th key={i} className="table-item">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="table-item">{contact.phone || "N/A"}</td>
          <td className="table-item">{contact.contactName || "N/A"}</td>
          <td className="table-item">{contact.description || "N/A"}</td>
          <td className="table-item">{contact.photo ? "Есть фото" : "—"}</td>
          <td className="table-item">{contact.email || "N/A"}</td>
          <td className="table-item">{contact.category || "N/A"}</td>
          <td className="table-item">{contact.groups || "N/A"}</td>
          <td className="table-item">{contact.messagesCount || 0}</td>
          <td className="table-item">{contact.lastActivity || "N/A"}</td>
          <td className="table-item">{contact.telegram || "N/A"}</td>
          <td className="table-item">{contact.openSources || "N/A"}</td>
          <td className="table-item">{contact.riskLevel || "N/A"}</td>
        </tr>
      </tbody>
    </table>
  );
}