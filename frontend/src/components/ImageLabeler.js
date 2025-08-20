import React, { useState } from "react";

function ImageLabeler({ images, labels, onSave }) {
  const [index, setIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  if (images.length === 0) {
    return <h3 className="text-success text-center">¡Todas las imágenes están clasificadas! 🎉</h3>;
  }

  const currentImage = images[index];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag("");
    }
  };

  const handleNext = () => {
    onSave(currentImage, selectedTags);
    setSelectedTags([]);
    setIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
  };

  return (
    <div className="text-center">
      <img
        src={currentImage.url}
        alt="to label"
        className="img-fluid rounded mb-3"
        style={{ maxHeight: "400px" }}
      />
      <div className="mb-3">
        {labels.map((tag, i) => (
          <button
            key={i}
            className={`btn btn-sm m-1 ${
              selectedTags.includes(tag) ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nueva etiqueta"
          className="form-control d-inline w-auto"
        />
        <button className="btn btn-success ms-2" onClick={handleAddTag}>
          Agregar
        </button>
      </div>
      <button className="btn btn-dark" onClick={handleNext}>
        Guardar y Siguiente
      </button>
    </div>
  );
}

export default ImageLabeler;
