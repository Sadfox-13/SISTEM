// src/App.jsx - versão dark + responsiva (PC e celular)

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const STORAGE_KEY = "deliveries_app_data_v1";
const ADMIN_KEY = "deliveries_app_admin_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadDeliveries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveDeliveries(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) {
      const defaultAdmin = { username: "admin", password: "admin123" };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
      return defaultAdmin;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { username: "admin", password: "admin123" };
  }
}

function saveAdmin(admin) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export default function DeliveryApp() {
  const [tab, setTab] = useState("register");
  const [deliveries, setDeliveries] = useState([]);
  const [form, setForm] = useState({
    entregador: "",
    valor: "",
    tipo: "Local",
    data: "",
    veiculo: "Moto",
    endereco: "",
    recebedor: "",
    observacao: "",
  });
  const [filter, setFilter] = useState({ query: "", dateFrom: "", dateTo: "", veiculo: "" });
  const [admin, setAdmin] = useState(loadAdmin());
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setDeliveries(loadDeliveries());
  }, []);

  useEffect(() => {
    saveDeliveries(deliveries);
  }, [deliveries]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function addDelivery(e) {
    e && e.preventDefault();
    if (!form.data || !form.valor || !form.endereco) {
      alert("Preencha ao menos data, valor e endereço.");
      return;
    }
    const newItem = { ...form, id: uid(), createdAt: new Date().toISOString() };
    setDeliveries((d) => [newItem, ...d]);
    setForm({ entregador: "", valor: "", tipo: "Local", data: "", veiculo: "Moto", endereco: "", recebedor: "", observacao: "" });
    setTab("view");
  }

  function exportToXLSX(filtered = deliveries) {
    if (!filtered || filtered.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }
    const wsData = filtered.map((r) => ({
      ID: r.id,
      Entregador: r.entregador,
      Valor: r.valor,
      Tipo: r.tipo,
      Data: r.data,
      Veiculo: r.veiculo,
      Endereco: r.endereco,
      Recebedor: r.recebedor,
      Observacao: r.observacao,
      CriadoEm: r.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entregas");
    XLSX.writeFile(wb, `entregas_${new Date().toISOString().slice(0,19)}.xlsx`);
  }

  function applyFilter(list) {
    return list.filter((r) => {
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const hay = `${r.entregador} ${r.endereco} ${r.recebedor} ${r.tipo}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter.veiculo && filter.veiculo !== "") {
        if (r.veiculo !== filter.veiculo) return false;
      }
      if (filter.dateFrom && new Date(r.data) < new Date(filter.dateFrom)) return false;
      if (filter.dateTo && new Date(r.data) > new Date(filter.dateTo)) return false;
      return true;
    });
  }

  function loginAdmin(e) {
    e && e.preventDefault();
    if (adminForm.username === admin.username && adminForm.password === admin.password) {
      setIsAdmin(true);
      setTab("admin");
      setAdminForm({ username: "", password: "" });
    } else {
      alert("Usuário ou senha incorretos.");
    }
  }

  function logoutAdmin() {
    setIsAdmin(false);
    setTab("register");
  }

  function startEdit(id) {
    const item = deliveries.find((d) => d.id === id);
    if (!item) return;
    setEditing(item.id);
    setForm({ ...item });
    setTab("register");
  }

  function saveEdit() {
    if (!editing) return addDelivery();
    setDeliveries((list) => list.map((it) => (it.id === editing ? { ...form, id: editing } : it)));
    setEditing(null);
    setForm({ entregador: "", valor: "", tipo: "Local", data: "", veiculo: "Moto", endereco: "", recebedor: "", observacao: "" });
    setTab("view");
  }

  function deleteDelivery(id) {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    setDeliveries((d) => d.filter((x) => x.id !== id));
  }

  function renderRegister() {
    return (
      <div className="max-w-4xl mx-auto p-4 text-gray-200">
        <h2 className="text-xl font-bold mb-4">Registrar entrega</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); editing ? saveEdit() : addDelivery(); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input name="entregador" value={form.entregador} onChange={handleFormChange} placeholder="Nome do entregador" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <input name="valor" value={form.valor} onChange={handleFormChange} placeholder="Valor da entrega" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <select name="tipo" value={form.tipo} onChange={handleFormChange} className="p-2 rounded bg-gray-800 border border-gray-700 w-full">
            <option>Local</option><option>Longa Distância</option><option>Expressa</option><option>Outros</option>
          </select>
          <input name="data" value={form.data} onChange={handleFormChange} type="date" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <select name="veiculo" value={form.veiculo} onChange={handleFormChange} className="p-2 rounded bg-gray-800 border border-gray-700 w-full">
            <option>Moto</option><option>Carro</option><option>Bicicleta</option><option>Outro</option>
          </select>
          <input name="endereco" value={form.endereco} onChange={handleFormChange} placeholder="Endereço de entrega" className="p-2 rounded bg-gray-800 border border-gray-700 w-full col-span-1 md:col-span-2" />
          <input name="recebedor" value={form.recebedor} onChange={handleFormChange} placeholder="Nome de quem recebeu" className="p-2 rounded bg-gray-800 border border-gray-700 w-full col-span-1 md:col-span-2" />
          <textarea name="observacao" value={form.observacao} onChange={handleFormChange} placeholder="Observação" className="p-2 rounded bg-gray-800 border border-gray-700 w-full col-span-1 md:col-span-2" />
          <div className="flex gap-2 col-span-1 md:col-span-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 w-full md:w-auto">{editing ? "Salvar edição" : "Registrar"}</button>
            <button type="button" onClick={() => { setForm({ entregador: "", valor: "", tipo: "Local", data: "", veiculo: "Moto", endereco: "", recebedor: "", observacao: "" }); setEditing(null); }} className="px-4 py-2 rounded bg-gray-700 w-full md:w-auto">Limpar</button>
          </div>
        </form>
      </div>
    );
  }

  function renderView() {
    const list = applyFilter(deliveries);
    return (
      <div className="max-w-6xl mx-auto p-4 text-gray-200">
        <h2 className="text-xl font-bold mb-4">Visualizar entregas</h2>
        <div className="overflow-x-auto bg-gray-800 rounded">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2">Data</th>
                <th className="p-2">Entregador</th>
                <th className="p-2">Valor</th>
                <th className="p-2 hidden sm:table-cell">Veículo</th>
                <th className="p-2 hidden sm:table-cell">Endereço</th>
                <th className="p-2">Recebedor</th>
                <th className="p-2 hidden md:table-cell">Observação</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={7} className="p-3 text-center">Nenhum registro encontrado.</td></tr>}
              {list.map((r) => (
                <tr key={r.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="p-2">{r.data}</td>
                  <td className="p-2">{r.entregador}</td>
                  <td className="p-2">{r.valor}</td>
                  <td className="p-2 hidden sm:table-cell">{r.veiculo}</td>
                  <td className="p-2 hidden sm:table-cell">{r.endereco}</td>
                  <td className="p-2">{r.recebedor}</td>
                  <td className="p-2 hidden md:table-cell">{r.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderAdmin() {
    if (!isAdmin) {
      return (
        <div className="max-w-md mx-auto p-4 text-gray-200">
          <h2 className="text-xl font-bold mb-4">Área Admin - Login</h2>
          <form onSubmit={loginAdmin} className="grid gap-2">
            <input placeholder="Usuário" value={adminForm.username} onChange={(e) => setAdminForm((s) => ({ ...s, username: e.target.value }))} className="p-2 rounded bg-gray-800 border border-gray-700" />
            <input placeholder="Senha" type="password" value={adminForm.password} onChange={(e) => setAdminForm((s) => ({ ...s, password: e.target.value }))} className="p-2 rounded bg-gray-800 border border-gray-700" />
            <button type="submit" className="px-4 py-2 rounded bg-blue-600">Entrar</button>
          </form>
        </div>
      );
    }
    return (
      <div className="max-w-6xl mx-auto p-4 text-gray-200">
        <h2 className="text-xl font-bold mb-4">Painel Admin</h2>
        <div className="overflow-x-auto bg-gray-800 rounded">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Data</th>
                <th className="p-2">Entregador</th>
                <th className="p-2">Valor</th>
                <th className="p-2">Veículo</th>
                <th className="p-2">Endereço</th>
                <th className="p-2">Recebedor</th>
                <th className="p-2">Obs</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((r) => (
                <tr key={r.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.data}</td>
                  <td className="p-2">{r.entregador}</td>
                  <td className="p-2">{r.valor}</td>
                  <td className="p-2">{r.veiculo}</td>
                  <td className="p-2">{r.endereco}</td>
                  <td className="p-2">{r.recebedor}</td>
                  <td className="p-2">{r.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 items-center justify-between p-4">
          <h1 className="text-2xl font-bold w-full sm:w-auto text-center sm:text-left">Registro de Entregas</h1>
          <nav className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
            <button onClick={() => setTab("register")} className={`px-3 py-2 rounded ${tab === "register" ? "bg-blue-600" : "bg-gray-700"}`}>Registrar</button>
            <button onClick={() => setTab("view")} className={`px-3 py-2 rounded ${tab === "view" ? "bg-blue-600" : "bg-gray-700"}`}>Visualizar</button>
            <button onClick={() => setTab("admin")} className={`px-3 py-2 rounded ${tab === "admin" ? "bg-blue-600" : "bg-gray-700"}`}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="py-6">
        {tab === "register" && renderRegister()}
        {tab === "view" && renderView()}
        {tab === "admin" && renderAdmin()}
      </main>

      <footer className="text-center p-4 text-sm text-gray-500">
        Sistema de Registro de Entregas — Responsivo
      </footer>
    </div>
  );
}
