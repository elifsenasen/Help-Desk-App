import './App.css';
import React, { useState, useEffect, useRef } from 'react';

import customerImg from './assets/Customer.png';
import staffImg from './assets/Müşteri Hizmetleri.png';
import select_user from './assets/User_Circle.png';
import question from './assets/question-mark-33-840953.png';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [role_header, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState([]);
  const filterCriteriaRef = useRef([]);
  useEffect(() => {
    setFilteredTickets(tickets);
  }, [tickets]);
  const initialFormState = {
    title: '',
    mail: '',
    departman: '',
    description: '',
    category: '',
    priority: '',
    status: 'Açık',
  };

  const [form, setForm] = useState(initialFormState);

  const selectUser = async (selectedRole) => {
    if (!form.mail) {
      alert("Lütfen önce mail adresinizi giriniz.");
      return;
    }
    setRole(selectedRole);
    setIsLoggedIn(true);
    setForm({ ...form, mail: form.mail });
    if (selectedRole === "staff") {
      await getAllTickets();
    }
    setShowWelcome(false);
  };
  

  const getAllTickets = async () => {
    try {
      const res = await fetch("http://localhost:8000/get_tickets", {
        method: "GET",
        headers: {
          "role-header": "staff"
        }
      });
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Talepler alınırken hata:", error);
    }
  };


    const deleteTicket = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:8000/delete/${ticketId}`, {
        method: "DELETE",
        headers: {
          "role-header": "staff"
        }
      });
      const data = await res.json();
      if (data.success) {
          setTickets(prev => prev.filter(t => t._id !== ticketId));
          setFilteredTickets(prev => prev.filter(t => t._id !== ticketId));
          setSelectedTicket(null);
          alert(data.message);
        } else {
          alert(data.message);
    }
    } catch (error) {
      console.error("Talepler alınırken hata:", error);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const res = await fetch("http://localhost:8000/update_status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "role-header": "staff"
      },
      body: JSON.stringify({ id: ticketId, status: newStatus })
    });

    if (!res.ok) throw new Error("Status güncelleme başarısız");

    const data = await res.json();

    if (data.success) {
      setFilteredTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }

      console.log("Güncelleme başarılı:", data.message);
    } else {
      console.error("Güncelleme başarısız:", data.message);
    }

  } catch (error) {
    console.error("Güncelleme sırasında hata:", error);
  }
};


  const createTicket = async () => {
    try {
      const res = await fetch("http://localhost:8000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "role-header": "customer"
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      alert(data.message || "Talep başarıyla oluşturuldu");
      setForm({
        ...form,
        title: '',
        departman: '',
        description: '',
        category: '',
        priority: '',
        status: 'Açık',
      });
    } catch (error) {
      console.error("Talep oluşturulurken hata:", error);
    }
  };


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

const applyFilters = () => {
  const selectedPriorities = filterCriteria.filter(c => ["Yüksek", "Orta", "Düşük"].includes(c));
  const selectedStatuses = filterCriteria.filter(c => ["Açık", "Beklemede", "Kapalı"].includes(c));

  const filteredData = tickets.filter(t => {
    const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(t.priority);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(t.status);
    return priorityMatch && statusMatch;
  });

  setFilteredTickets(filteredData);
  setFiltered(true);
};


  const clearFilters = () => {
    filterCriteriaRef.current = [];
    setFilterCriteria([]);
    setFilteredTickets(tickets);
    setFiltered(false);
  };

  if (showWelcome) {
    return (
      <div className="app-container" style={{ paddingTop: '10px', textAlign: 'center' }}>
        <h2 className="welcome">TECHMAX</h2>
        <h2 className="welcome-title">DESTEK SiSTEMİNE HOŞGELDİNİZ</h2>
        <p className="info-wrapper">
          <img
            src={question}
            alt="Question Icon"
            className="info-icon"
            onClick={() => setShowInfo(!showInfo)}
          />
          <span className="information">Bilgilendirme Metni</span>
          {showInfo && (
            <div className="info-box">
              Bu sistem, müşterilerimizin destek taleplerini kolayca iletmesini ve personelin bu talepleri yönetmesini sağlar.
            </div>
          )}
        </p>

        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <input
            className="form-input"
            type="email"
            placeholder="Mail adresinizi giriniz"
            value={form.mail}
            onChange={(e) => setForm({ ...form, mail: e.target.value })}
            style={{ marginBottom: '20px' }}
          />

          <p className='information'>Lütfen rolünüzü seçerek devam edin.</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'nowrap' }}>
            <div className="role-container">
              <button
                onClick={() => selectUser("customer")}
                className="role-button"
                disabled={!form.mail}
                style={{ opacity: form.mail ? 1 : 0.5, cursor: form.mail ? 'pointer' : 'not-allowed' }}
              >
                <img src={customerImg} alt="Müşteri" />
                <div>Müşteri</div>
              </button>
            </div>

            <div className="role-container">
              <button
                onClick={() => selectUser("staff")}
                className="role-button"
                disabled={!form.mail}
                style={{ opacity: form.mail ? 1 : 0.5, cursor: form.mail ? 'pointer' : 'not-allowed' }}
              >
                <img src={staffImg} alt="Personel" />
                <div>Personel</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role_header === "customer" && isLoggedIn) {
    return (
      <div className="app-container">
        <div className="customer-wrapper">
          <div className="icon-wrapper">
            <img src={select_user} alt="User Icon" />
            <span className="user-mail">{form.mail}</span>
          </div>
          <div className="customer-container">
            <h2>Yeni Destek Talebi</h2>
            <input className="form-input" name="title" placeholder="Başlık" value={form.title} onChange={handleChange} /><br />
            <input className="form-input" name="description" placeholder="Açıklama" value={form.description} onChange={handleChange} /><br />
            <input className="form-input" name="departman" placeholder="Departman" value={form.departman} onChange={handleChange} /><br />
            <select className="form-input" name="category" value={form.category} onChange={handleChange}>
              <option value="">Kategori Seçin</option>
              <option value="Yazılım Sorunları">Yazılım Sorunları</option>
              <option value="Donanım Sorunları">Donanım Sorunları</option>
              <option value="Hesap ve Erişim">Hesap ve Erişim</option>
              <option value="Fatura ve Ödeme">Fatura ve Ödeme</option>
              <option value="Kurulum ve Entegrasyon">Kurulum ve Entegrasyon</option>
              <option value="Performans Sorunları">Performans Sorunları</option>
              <option value="Genel Bilgi / Danışmanlık">Genel Bilgi / Danışmanlık</option>
              <option value="Görüş ve Öneri">Görüş ve Öneri</option>
            </select><br />
            <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
              <option value="">Öncelik Seçin</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Orta">Orta</option>
              <option value="Düşük">Düşük</option>
            </select><br />
            <button onClick={createTicket}>Gönder</button><br /><br />
            <button
              onClick={() => {
                setRole(null);
                setIsLoggedIn(false);
                setForm(initialFormState);
                setShowWelcome(true);
              }}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role_header === "staff" && isLoggedIn) {
    return (
      <>
      <div className="icon-staff-wrapper">
            <img src={select_user} alt="User Icon" />
            <span className="user-mail">{form.mail}</span>
          </div>
      <div className="staff-container">
        <div className="staff-layout">
          <div className="ticket-list-container">
            <h2 className="main-title">Tüm Talepler</h2>

            <div className='main-filter-controls'>
              <select
                className="filter-select"
                multiple
                value={filterCriteria}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                  setFilterCriteria(selectedOptions);
                }}
              >
                <option value="">Filtreler</option>
                <option value="Yüksek">Yüksek Öncelik</option>
                <option value="Orta">Orta Öncelik</option>
                <option value="Düşük">Düşük Öncelik</option>
                <option value="Açık">Açık Durum</option>
                <option value="Beklemede">Beklemede Durum</option>
                <option value="Kapalı">Kapalı Durum</option>
              </select>
              <div className='filter-controls'>
              <button
                className="button-container"
                onClick={applyFilters}
                disabled={filterCriteria.length === 0}
              >
                Filtre Uygula
              </button>

              <button
                className="remove-filter-button"
                onClick={clearFilters}
              >
                Filtreleri Temizle
              </button>
              </div>
            </div>

            {filteredTickets.map((t) => (
              <div
                key={t._id}
                className={`ticket-item ${selectedTicket?._id === t._id ? 'selected' : ''}`}
                onClick={() => setSelectedTicket(t)}
              >
                <strong>{t.title}</strong>
                <div className={`ticket-status status-${t.status.toLowerCase()}`}>
                  {t.status}
                </div>
              </div>
            ))}
          </div>

          <div className="ticket-detail-container">
            <h2 className="section-title">Talep Detayı</h2>
            {selectedTicket ? (
              <>
                <p><strong>Başlık:</strong> {selectedTicket.title}</p>
                <p><strong>Açıklama:</strong> {selectedTicket.description}</p>
                <p><strong>Departman:</strong> {selectedTicket.departman}</p>
                <p><strong>Öncelik:</strong> {selectedTicket.priority}</p>
                <p><strong>Durum:</strong>
                
                  <select
                  className="status-select"
                  value={selectedTicket.status}
                  onChange={(e) => {
                    const updated = { ...selectedTicket, status: e.target.value };
                    setSelectedTicket(updated);
                    updateTicketStatus(updated._id, e.target.value);
                  }}
                >
                  <option value="Açık">Açık</option>
                  <option value="Beklemede">Beklemede</option>
                  <option value="Kapalı">Kapalı</option>
                </select>

                </p>
                <button
                className="delete-button"
                onClick={() => {
                  if (selectedTicket) {
                    deleteTicket(selectedTicket._id);
                  } else {
                    alert("Lütfen önce bir talep seçiniz.");
                  }
                }}
              >
                Sil
              </button>

              </>
            ) : (
              <p>Bir talep seçiniz...</p>
            )}
          </div>
        </div>

        <button
          className="back-button"
          onClick={() => {
            setRole(null);
            setIsLoggedIn(false);
            setForm(initialFormState);
            setShowWelcome(true);
          }}
        >
          Ana Sayfaya Dön
        </button>
      </div>
      </>
    );
  }

  return null;
}

export default App;
