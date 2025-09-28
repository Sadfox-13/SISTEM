import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const initialForm = {
    id: null,
    entregador: "",
    valor: "",
    tipo: "",
    data: "",
    veiculo: "",
    endereco: "",
    recebedor: "",
    observacao: "",
  };

  const [deliveries, setDeliveries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("registrar");
  const [adminAuth, setAdminAuth] = useState(false);
  const [login, setLogin] = useState({ user: "", pass: "" });

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("Todos");

  useEffect(() => {
    const saved = localStorage.getItem("deliveries");
    if (saved) setDeliveries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("deliveries", JSON.stringify(deliveries));
  }, [deliveries]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addDelivery = (e) => {
    e.preventDefault();
    if (!form.entregador || !form.valor || !form.data) return;
    setDeliveries([...deliveries, { ...form, id: Date.now() }]);
    setForm(initialForm);
  };

  const deleteDelivery = (id) => {
    const updated = deliveries.filter((d) => d.id !== id);
    setDeliveries(updated);
  };

  const startEdit = (record) => {
    setForm(record);
    setEditing(record.id);
  };

  const saveEdit = () => {
    const updated = deliveries.map((d) =>
      d.id === editing ? { ...form, id: editing } : d
    );
    setDeliveries(updated);
    setForm(initialForm);
    setEditing(null);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(deliveries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entregas");
    XLSX.writeFile(wb, "entregas.xlsx");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (login.user === "admin" && login.pass === "1234") {
      setAdminAuth(true);
      setLogin({ user: "", pass: "" });
    } else {
      alert("Usuário ou senha incorretos");
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchSearch = [d.recebedor, d.endereco, d.tipo].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    );
    const matchDate = filterDate ? d.data === filterDate : true;
    const matchVehicle = filterVehicle !== "Todos" ? d.veiculo === filterVehicle : true;
    return matchSearch && matchDate && matchVehicle;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">📦 Registro de Entregas</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button onClick={() => setTab("registrar")} className={`px-4 py-2 rounded ${tab === "registrar" ? "bg-blue-600" : "bg-gray-700"}`}>Registrar</button>
        <button onClick={() => setTab("visualizar")} className={`px-4 py-2 rounded ${tab === "visualizar" ? "bg-blue-600" : "bg-gray-700"}`}>Visualizar</button>
        <button onClick={() => setTab("admin")} className={`px-4 py-2 rounded ${tab === "admin" ? "bg-blue-600" : "bg-gray-700"}`}>Admin</button>
      </div>

      {tab === "registrar" && (
        <form onSubmit={addDelivery} className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          <input name="entregador" value={form.entregador} onChange={handleFormChange} placeholder="Nome do entregador" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <input name="valor" value={form.valor} onChange={handleFormChange} placeholder="Valor da entrega" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <input type="date" name="data" value={form.data} onChange={handleFormChange} className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <select name="veiculo" value={form.veiculo} onChange={handleFormChange} className="p-2 rounded bg-gray-800 border border-gray-700 w-full">
            <option value="">Selecione veículo</option>
            <option value="Moto">Moto</option>
            <option value="Carro">Carro</option>
          </select>
          <input name="tipo" value={form.tipo} onChange={handleFormChange} placeholder="Tipo de entrega" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <input name="endereco" value={form.endereco} onChange={handleFormChange} placeholder="Endereço" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <input name="recebedor" value={form.recebedor} onChange={handleFormChange} placeholder="Recebedor" className="p-2 rounded bg-gray-800 border border-gray-700 w-full" />
          <textarea name="observacao" value={form.observacao} onChange={handleFormChange} placeholder="Observação" className="p-2 rounded bg-gray-800 border border-gray-700 w-full col-span-1 md:col-span-2"></textarea>
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg col-span-1 md:col-span-2">{editing ? "Salvar Alterações" : "Registrar"}</button>
        </form>
      )}

      {tab === "visualizar" && (
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-1/3 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600">
              <option>Todos</option>
              <option>Moto</option>
              <option>Carro</option>
            </select>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Exportar Excel</button>
          </div>
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
                {filteredDeliveries.map((r) => (
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
      )}

      {tab === "admin" && (
        <div className="max-w-5xl mx-auto">
          {!adminAuth ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm mx-auto">
              <input type="text" placeholder="Usuário" value={login.user} onChange={(e) => setLogin({ ...login, user: e.target.value })} className="p-2 rounded bg-gray-800 border border-gray-700" />
              <input type="password" placeholder="Senha" value={login.pass} onChange={(e) => setLogin({ ...login, pass: e.target.value })} className="p-2 rounded bg-gray-800 border border-gray-700" />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Entrar</button>
            </form>
          ) : (
            <div className="overflow-x-auto bg-gray-800 rounded">
              <table className="min-w-full text-sm md:text-base">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2">Data</th>
                    <th className="p-2">Entregador</th>
                    <th className="p-2">Valor</th>
                    <th className="p-2">Veículo</th>
                    <th className="p-2">Endereço</th>
                    <th className="p-2">Recebedor</th>
                    <th className="p-2">Observação</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((r) => (
                    <tr key={r.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="p-2">{r.data}</td>
                      <td className="p-2">{r.entregador}</td>
                      <td className="p-2">{r.valor}</td>
                      <td className="p-2">{r.veiculo}</td>
                      <td className="p-2">{r.endereco}</td>
                      <td className="p-2">{r.recebedor}</td>
                      <td className="p-2">{r.observacao}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => startEdit(r)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">Editar</button>
                        <button onClick={() => deleteDelivery(r.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}