import React, { useState } from "react";

function FilterView({ classified }) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? classified.filter((c) => c.tags.includes(filter))
    : classified;
    const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classified, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "clasificacion.json";
    link.click();
    };

    const downloadCSV = () => {
    const rows = classified.map(c => [c.image, ...c.tags]);
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "clasificacion.csv";
    link.click();
    };


  return (
    <div>
      <h3>Imágenes clasificadas</h3>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Filtrar por etiqueta..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="row">
        {filtered.map((item, i) => (
          <div className="col-md-3 mb-3" key={i}>
            <div className="card">
              <img src={item.image} className="card-img-top" alt="classified" />
              <div className="card-body">
                {item.tags.map((t, j) => (
                  <span key={j} className="badge bg-primary me-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-3">
    <button className="btn btn-outline-success me-2" onClick={downloadJSON}>Descargar JSON</button>
    <button className="btn btn-outline-primary" onClick={downloadCSV}>Descargar CSV</button>
    </div>
    </div>
  );
}

export default FilterView;
