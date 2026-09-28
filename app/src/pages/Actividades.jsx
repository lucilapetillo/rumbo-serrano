import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export const Actividades = () => {
    const [actividades, setActividades] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    
    const [searchParams, setSearchParams] = useSearchParams();
    const categoriaSeleccionada = searchParams.get('categoria') || '';
    
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get('http://localhost:3000/api/actividades'),
            axios.get('http://localhost:3000/api/categorias')
        ])
        .then(([resAct, resCat]) => {
            setActividades(resAct.data);
            setCategorias(resCat.data);
        })
        .catch(err => console.error('Error al cargar actividades:', err))
        .finally(() => setLoading(false));
    }, []);

    // Manejo de cambio de filtro de categoría
    const handleCategoriaChange = (idCat) => {
        if (idCat === categoriaSeleccionada) {
            setSearchParams({});
        } else {
            setSearchParams({ categoria: idCat });
        }
    };

    // Filtrar actividades según buscador y categoría seleccionada
    const actividadesFiltradas = actividades.filter((act) => {
        const coincideCategoria = !categoriaSeleccionada || String(act.categoria_id) === String(categoriaSeleccionada);
        const coincideBusqueda = act.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        act.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        act.ubicacion?.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#222222', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* Header de la Sección */}
            <div className="container pt-5 pb-3">
                <div className="border-bottom pb-4">
                    <span className="badge bg-dark text-white rounded-pill px-3 py-1 fw-bold mb-2" style={{ fontSize: '0.75rem' }}>
                        Catálogo Completo
                    </span>
                    <h1 className="fw-bold text-dark display-5 mb-2">Descubrí tu próxima aventura</h1>
                    <p className="text-muted m-0 fs-6">
                        Explorá las mejores experiencias outdoor, recorridos culturales y excursiones en el Valle de Calamuchita.
                    </p>
                </div>
            </div>

            {/* Buscador y Filtros por Categoría */}
            <div className="container my-4">
                <div className="row g-3 align-items-center mb-4">
                    {/* Buscador de texto */}
                    <div className="col-12 col-md-5">
                        <div className="position-relative">
                            <input 
                                type="text"
                                className="form-control px-4 py-2.5 shadow-sm border"
                                style={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '0.9rem', backgroundColor: '#F8FAFC' }}
                                placeholder="Buscar por título, lugar o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            {busqueda && (
                                <button 
                                    onClick={() => setBusqueda('')} 
                                    className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y text-decoration-none me-2"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Chips de Categorías */}
                    <div className="col-12 col-md-7">
                        <div className="d-flex flex-wrap gap-2 justify-md-content-end">
                            <button
                                onClick={() => setSearchParams({})}
                                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${!categoriaSeleccionada ? 'btn-dark' : 'btn-outline-secondary'}`}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Todas
                            </button>
                            {categorias.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoriaChange(cat.id)}
                                    className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${String(categoriaSeleccionada) === String(cat.id) ? 'btn-dark' : 'btn-outline-secondary'}`}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Actividades en Cards Horizontales (Texto Izquierda / Imagen Derecha) */}
            <div className="container pb-5">
                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span>Cargando catálogo de actividades...</span>
                    </div>
                ) : actividadesFiltradas.length === 0 ? (
                    <div className="text-center py-5 border rounded-4 my-3 bg-light">
                        <h5 className="fw-bold text-dark mb-1">No encontramos actividades</h5>
                        <p className="text-muted small mb-3">Probá cambiando los términos de búsqueda o el filtro de categoría.</p>
                        <button 
                            onClick={() => { setBusqueda(''); setSearchParams({}); }} 
                            className="btn btn-outline-dark btn-sm fw-bold px-3 py-2 rounded-3"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {actividadesFiltradas.map((act) => {
                            const imagenUrl = act.imagen_url || act.imagen || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80';
                            const nombreCategoria = categorias.find(c => String(c.id) === String(act.categoria_id))?.nombre || 'Experiencia Serrano';

                            return (
                                <div 
                                    key={act.id} 
                                    className="card border-0 rounded-4 overflow-hidden shadow-sm bg-dark text-white"
                                    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                                >
                                    <div className="row g-0 align-items-stretch">
                                        
                                        {/* Columna Izquierda: Texto y Contenido */}
                                        <div className="col-12 col-md-7 p-4 p-md-5 d-flex flex-column justify-content-between position-relative z-1" style={{ backgroundColor: '#18181B' }}>
                                            <div>
                                                {/* Categoría y Ubicación */}
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span className="badge bg-white text-dark rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                                                        {nombreCategoria}
                                                    </span>
                                                    <span className="text-white-50 small">
                                                        Ubicación: {act.ubicacion || 'Calamuchita, Córdoba'}
                                                    </span>
                                                </div>

                                                {/* Título y Descripción */}
                                                <h3 className="fw-bold mb-2 text-white fs-3">
                                                    {act.titulo}
                                                </h3>

                                                <p className="text-white-50 small mb-4" style={{ lineHeight: '1.6', maxWidth: '580px' }}>
                                                    {act.descripcion || 'Disfrutá de un recorrido guiado inolvidable con guías experimentados e indumentaria de seguridad incluida.'}
                                                </p>

                                                {/* Atributos adicionales */}
                                                <div className="d-flex flex-wrap gap-2 mb-4" style={{ fontSize: '0.8rem' }}>
                                                    <span className="bg-secondary bg-opacity-25 px-3 py-1 rounded-pill text-white border border-secondary border-opacity-25">
                                                        Duración: {act.duracion ? act.duracion : 'Medio día'}
                                                    </span>
                                                    <span className="bg-secondary bg-opacity-25 px-3 py-1 rounded-pill text-white border border-secondary border-opacity-25">
                                                        Cupos: {act.cupo_disponible || 'Consultar'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Precio y Botón */}
                                            <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-3">
                                                <div>
                                                    <span className="d-block text-white-50 small text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                                        Desde
                                                    </span>
                                                    <span className="fw-bold fs-3 text-white">
                                                        ${Number(act.precio || 0).toLocaleString()} <span className="fs-6 fw-normal text-white-50">ARS</span>
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/actividades/${act.id}`)}
                                                    className="btn btn-light fw-bold px-4 py-2.5 text-nowrap shadow-sm"
                                                    style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                                                >
                                                    Ver detalle y reservar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Imagen */}
                                        <div className="col-12 col-md-5 position-relative" style={{ minHeight: '260px' }}>
                                            <img 
                                                src={imagenUrl} 
                                                alt={act.titulo}
                                                className="w-100 h-100 position-absolute top-0 start-0"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80';
                                                }}
                                            />
                                            {/* Gradiente suave en móvil/escritorio para integrarse con la tarjeta */}
                                            <div 
                                                className="position-absolute top-0 start-0 w-100 h-100 d-none d-md-block"
                                                style={{ background: 'linear-gradient(90deg, #18181B 0%, transparent 20%)' }}
                                            />
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};