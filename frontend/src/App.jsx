import React, { useEffect, useState } from "react";
import { getFilters, createFilter, addFilterToImage, getProcessedImages, getUnprocessedImages } from "./api";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Nuevo endpoint para editar nombre de etiqueta
const updateFilterName = async (filterId, newName) => {
  await axios.put(`http://127.0.0.1:8000/filters/${filterId}`, { name: newName });
};

function Sidebar({ setView, view }) {
  return (
    <div className="sidebar bg-dark border-end vh-100 p-4" style={{ width: 220, position: "fixed", left: 0, top: 0, boxShadow: "2px 0 8px #222" }}>
      <h4 className="mb-4 text-light">Menú</h4>
      <button className={`btn w-100 mb-3 ${view === "label" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setView("label")}>Etiquetar imágenes</button>
      <button className={`btn w-100 mb-3 ${view === "processed" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setView("processed")}>Imágenes procesadas</button>
      <button className={`btn w-100 mb-3 ${view === "filters" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setView("filters")}>Editar etiquetas</button>
      <button className={`btn w-100 mb-3 ${view === "list" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setView("list")}>Listado de imágenes</button>
    </div>
  );
}

// Tabla paginada de imágenes
function ImageListView({ images }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.ceil(images.length / perPage);
  const paginated = images.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mt-5">
      <h2 className="mb-4 text-dark" style={{ fontWeight: 600 }}>Listado de imágenes</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label className="me-2 fw-bold">Cantidad por página:</label>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="form-select d-inline w-auto">
            {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-outline-dark me-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span className="fw-bold">{page} / {totalPages || 1}</span>
          <button className="btn btn-outline-dark ms-2" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered bg-white rounded shadow">
          <thead>
            <tr>
              <th>Nombre (URL)</th>
              <th>Fecha y hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(img => (
              <tr key={img.id}>
                <td style={{ wordBreak: "break-all" }}>{img.url}</td>
                <td>{img.processed_at ? new Date(img.processed_at).toLocaleString() : "-"}</td>
                <td>
                  <span className={`badge ${img.processed_at ? "bg-success" : "bg-secondary"}`}>
                    {img.processed_at ? "Procesada" : "No procesada"}
                  </span>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">No hay imágenes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditModal({ show, image, filters, onSave, onClose }) {
  const [selected, setSelected] = useState(image ? image.filters.map(f => f.id) : []);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setSelected(image ? image.filters.map(f => f.id) : []);
    setLoading(false);
  }, [image]);
  if (!show || !image) return null;
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-dark text-light">
            <h5 className="modal-title">Editar etiquetas</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <img src={image.url} alt="detalle" className="img-fluid rounded mb-3" style={{ maxHeight: 300 }} />
            <div className="mb-3">
              {filters.map((f) => (
                <button
                  key={f.id}
                  className={`btn m-1 ${selected.includes(f.id) ? "btn-primary" : "btn-outline-primary"}`}
                  style={{ borderRadius: 20, minWidth: 100, fontWeight: 500 }}
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]
                    )
                  }
                  disabled={loading}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" disabled={loading} onClick={async () => {
              setLoading(true);
              await onSave(image.id, selected);
              setLoading(false);
            }}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn btn-secondary" disabled={loading} onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vista para editar etiquetas
function FilterEditor({ filters, onRename }) {
  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");
  return (
    <div className="mt-5">
      <h2 className="mb-4 text-dark" style={{ fontWeight: 600 }}>Editar etiquetas</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <table className="table table-bordered bg-white rounded shadow">
            <thead>
              <tr>
                <th>Nombre actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filters.map(f => (
                <tr key={f.id}>
                  <td>
                    {editing === f.id ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="form-control"
                      />
                    ) : (
                      f.name
                    )}
                  </td>
                  <td>
                    {editing === f.id ? (
                      <>
                        <button className="btn btn-success btn-sm me-2" onClick={async () => { await onRename(f.id, newName); setEditing(null); }}>Guardar</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancelar</button>
                      </>
                    ) : (
                      <button className="btn btn-outline-dark btn-sm" onClick={() => { setEditing(f.id); setNewName(f.name); }}>Editar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [view, setView] = useState("label");
  const [processedImages, setProcessedImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterSelected, setFilterSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetchData();
    setImageIndex(0); // Reinicia el índice al cambiar de vista
  }, [view]);

  const fetchData = async () => {
    const fltrs = await getFilters();
    setFilters(fltrs);
    if (view === "label") {
      const imgs = await getUnprocessedImages();
      setImages(imgs);
      setRotation(0);
      setSelectedTags([]);
      setImageIndex(0);
    } else if (view === "processed") {
      const procImgs = await getProcessedImages();
      setProcessedImages(procImgs);
      setSelected([]);
      setFilterSelected([]);
    } else if (view === "list") {
      // Trae todas las imágenes (procesadas y no procesadas)
      const res = await axios.get("http://127.0.0.1:8000/images/?skip=0&limit=10000");
      setAllImages(res.data);
    }
  };

  const handleAddFilter = async () => {
    if (newFilter.trim()) {
      const filter = await createFilter(newFilter);
      setFilters([...filters, filter]);
      setNewFilter("");
    }
  };

  // Etiquetar imagen con varias etiquetas
  const handleLabelImage = async () => {
    if (images.length === 0 || selectedTags.length === 0) return;
    for (const filterId of selectedTags) {
      await addFilterToImage(images[imageIndex].id, filterId);
    }
    const imgs = await getUnprocessedImages();
    setImages(imgs);
    setRotation(0);
    setSelectedTags([]);
    setImageIndex(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Siguiente imagen sin procesar
  const handleNext = () => {
    setRotation(0);
    setSelectedTags([]);
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  };

  // Volver a la imagen anterior
  const handlePrev = () => {
    setRotation(0);
    setSelectedTags([]);
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDownloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const selectedImages = processedImages.filter(img => selected.includes(img.id));
    const fetchImage = async (url) => {
      const res = await fetch(url);
      return await res.blob();
    };
    for (const img of selectedImages) {
      const blob = await fetchImage(img.url);
      zip.file(img.url.split('/').pop(), blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "imagenes_procesadas.zip";
    link.click();
  };

  // Filtrar imágenes procesadas por etiquetas seleccionadas
  const filteredProcessed = filterSelected.length === 0
    ? processedImages
    : processedImages.filter(img =>
        filterSelected.every(fId => img.filters.map(f => f.id).includes(fId))
      );

  // Editar etiquetas de imagen procesada
  const handleOpenModal = (img) => {
    setModalImage(img);
    setShowModal(true);
  };

  // Eliminar todas las etiquetas antes de agregar las nuevas
  const handleSaveModal = async (imageId, filterIds) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/images/${imageId}/filters`);
      for (const fId of filterIds) {
        await addFilterToImage(imageId, fId);
      }
      setShowModal(false);
      setModalImage(null);
      fetchData();
    } catch (err) {
      alert("Error al guardar etiquetas. Verifica el backend.");
      setShowModal(false);
      setModalImage(null);
    }
  };

  // Renombrar etiqueta
  const handleRenameFilter = async (filterId, newName) => {
    await updateFilterName(filterId, newName);
    fetchData();
  };

  return (
    <div style={{ background: "#e9ecef", minHeight: "100vh", padding: "32px" }}>
      <Sidebar setView={setView} view={view} />
      <div className="flex-grow-1" style={{ marginLeft: 260 }}>
        <div className="container text-center pt-5" style={{ maxWidth: 900, margin: "0 auto", padding: "32px", background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px #ccc" }}>
          <h1 className="mb-4 text-dark" style={{ fontWeight: 700, letterSpacing: 1 }}>Etiquetador de Imágenes</h1>
          {view === "label" && (
            images.length > 0 ? (
              <>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 30 }}>
                  <img
                    src={images[imageIndex]?.url}
                    alt="to-label"
                    className="img-fluid mb-3 shadow rounded"
                    style={{ maxHeight: "650px", transform: `rotate(${rotation}deg)`, background: "#fff", border: "2px solid #dee2e6" }}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ position: "absolute", top: 10, right: 10 }}
                    onClick={handleRotate}
                  >
                    Rotar
                  </button>
                </div>
                <div className="mb-3">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      className={`btn m-1 ${selectedTags.includes(f.id) ? "btn-primary" : "btn-outline-primary"}`}
                      style={{ borderRadius: 20, minWidth: 100, fontWeight: 500 }}
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]
                        )
                      }
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <div className="d-flex justify-content-center mb-3">
                  <input
                    type="text"
                    value={newFilter}
                    onChange={(e) => setNewFilter(e.target.value)}
                    placeholder="Nuevo filtro"
                    className="form-control w-50 me-2"
                    style={{ borderRadius: 20 }}
                  />
                  <button className="btn btn-success" style={{ borderRadius: 20 }} onClick={handleAddFilter}>
                    Agregar
                  </button>
                </div>
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <button className="btn btn-outline-dark" style={{ borderRadius: 20, minWidth: 150 }} onClick={handlePrev} disabled={imageIndex === 0}>
                    Volver
                  </button>
                  <button className="btn btn-dark" style={{ borderRadius: 20, minWidth: 150 }} onClick={handleLabelImage} disabled={selectedTags.length === 0}>
                    Etiquetar
                  </button>
                  <button className="btn btn-outline-dark" style={{ borderRadius: 20, minWidth: 150 }} onClick={handleNext} disabled={imageIndex >= images.length - 1}>
                    Siguiente →
                  </button>
                </div>
              </>
            ) : (
              <p className="text-muted">No hay más imágenes</p>
            )
          )}
          {view === "processed" && (
            <div>
              <h2 className="mb-4 text-dark" style={{ fontWeight: 600 }}>Imágenes procesadas</h2>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <span className="me-2 fw-bold">Filtrar por etiqueta:</span>
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      className={`btn btn-sm m-1 ${filterSelected.includes(f.id) ? "btn-primary" : "btn-outline-primary"}`}
                      style={{ borderRadius: 20, minWidth: 80, fontWeight: 500 }}
                      onClick={() =>
                        setFilterSelected((prev) =>
                          prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]
                        )
                      }
                    >
                      {f.name}
                    </button>
                  ))}
                  {filterSelected.length > 0 && (
                    <button className="btn btn-link text-danger ms-2" onClick={() => setFilterSelected([])}>Limpiar filtro</button>
                  )}
                </div>
                <button className="btn btn-outline-primary" onClick={handleDownloadZip} disabled={selected.length === 0}>
                  Descargar seleccionadas (.zip)
                </button>
              </div>
              <div className="row justify-content-center">
                {filteredProcessed.length > 0 ? filteredProcessed.map((img) => (
                  <div className="col-md-4 mb-4" key={img.id}>
                    <div className={`card shadow border-0 ${selected.includes(img.id) ? 'border-primary' : ''}`} style={{ background: "#f8f9fa" }}>
                      <div className="form-check text-start ms-2 mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selected.includes(img.id)}
                          onChange={() => handleSelect(img.id)}
                          id={`img-check-${img.id}`}
                        />
                        <label className="form-check-label" htmlFor={`img-check-${img.id}`}>Seleccionar</label>
                      </div>
                      <img src={img.url} className="card-img-top rounded" alt="procesada" style={{ maxHeight: 200, objectFit: "contain", background: "#fff" }} />
                      <div className="card-body">
                        <div className="mb-2 text-muted" style={{ fontSize: 13 }}>
                          Procesada: {img.processed_at ? new Date(img.processed_at).toLocaleString() : "-"}
                        </div>
                        <div className="mb-2">
                          {img.filters.map((f, j) => (
                            <span key={j} className="badge bg-primary me-1" style={{ borderRadius: 12, fontSize: 14 }}>{f.name}</span>
                          ))}
                        </div>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => handleOpenModal(img)}>
                          Detalle / Editar etiquetas
                        </button>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-muted">No hay imágenes procesadas</p>}
              </div>
              <EditModal
                show={showModal}
                image={modalImage}
                filters={filters}
                onSave={handleSaveModal}
                onClose={() => setShowModal(false)}
              />
            </div>
          )}
          {view === "filters" && (
            <FilterEditor filters={filters} onRename={handleRenameFilter} />
          )}
          {view === "list" && (
            <ImageListView images={allImages} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
