import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Firestore imports
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy
} from "firebase/firestore";

// --- Checklist e info extra actualizados ---
const dispositivos = [
  {
    id: 'cama4700',
    nombre: 'Cama de maternidad Stryker ADEL 4700',
    checklist: [
      { id: 1, label: "Todos los tornillos y elementos de fijación están bien sujetos", info: "Herramientas apropiadas (Allen, Torx, llaves combinadas). En reemplazos o ajustes críticos, aplicar adhesivo tipo Loctite 242. Reapretar tras el mantenimiento." },
      { id: 2, label: "Todas las soldaduras están intactas, no agrietadas ni rotas", info: "Si se detectan grietas, porosidades o fracturas, no operar la cama y contactar al soporte técnico de Stryker. No se permite reparación local de soldaduras." },
      { id: 3, label: "No hay tubos ni láminas de metal dobladas o rotas", info: "Buscar dobleces, deformaciones o fracturas. Ante cualquier daño estructural, suspender el uso de la cama y contactar a soporte técnico de Stryker." },
      { id: 4, label: "No hay residuos en las ruedas", info: "Retirar cualquier obstrucción y limpiar según sea necesario para garantizar el libre movimiento." },
      { id: 5, label: "Todas las ruedas están seguras y giran correctamente", info: "Las ruedas deben girar sin ruidos, fricción excesiva o bloqueo. Reemplazar si hay desgaste o restricción de movimiento. Tipo de ruedas del dispositivo (P/N 0710-105-000 para ruedas con freno | P/N 0710-106-000 para ruedas de dirección)." },
      { id: 6, label: "Bloqueo correcto de las 4 ruedas al pisar el freno", info: "Presionar el pedal de freno hasta el fondo y verificar que las cuatro ruedas queden inmovilizadas. Intentar mover la cama para confirmar que los frenos están activos. Si alguna rueda gira, inspeccionar el sistema de frenos y enlaces mecánicos. Ajustar o reemplazar partes si es necesario. Las fallas comunes incluyen desalineación del pedal, cables flojos o desgaste en el ensamble de freno." },
      { id: 7, label: "Los seguros de dirección de las ruedas funcionan correctamente.", info: "Activar el seguro direccional desde el pedal correspondiente y empujar la cama hacia adelante. Verificar que la rueda guía mantenga un trayecto recto. Si hay desviaciones o vibraciones, revisar el mecanismo de bloqueo y reemplazar si hay desgaste. Usar repuesto original P/N 0710-106-000 si se requiere." },
      { id: 8, label: "Las barandillas se mueven y se traban correctamente.", info: "Verificar que las barandillas suban y bajen sin fricción excesiva y que el sistema de bloqueo enganche con firmeza. Si alguna barandilla queda floja o no se traba adecuadamente, inspeccionar y reemplazar el mecanismo de enganche o la barandilla completa." },
      { id: 9, label: "El respaldo Fowler se desliza correctamente", info: "Debe tener un rango de movimiento de entre 0° - 70°" },
      { id: 10, label: "La cama sube y baja correctamente", info: "Se desplaza dentro de un rango de 49-95 cm" },
      { id: 11, label: "La sección de pies funciona correctamente", info: "Verificar que se mueva sin ruidos anormales ni obstrucciones. Si no responde o presenta movimientos irregulares, revisar conexiones del actuador y realizar recalibración si es necesario." },
      { id: 12, label: "Funciona correctamente la posición de Trendelenburg", info: "La cama se inclina hasta un máximo de 8° con la cabeza más baja que los pies. Confirmar que no haya ruidos, bloqueos ni errores. Si hay fallas, revisar actuadores y realizar recalibración." },
      { id: 13, label: "El soporte para suero está intacto y funciona correctamente", info: "Se puede extender y retraer, y el mecanismo de bloqueo mantiene la posición deseada sin deslizamientos." },
      { id: 14, label: "Funda del colchón sin rasgaduras ni grietas", info: "Inspeccionar visualmente toda la superficie del colchón, incluyendo costuras, para detectar grietas, cortes, desgaste o pinchazos. Si se encuentra algún daño, reemplazar el colchón de inmediato." },
      { id: 15, label: "Lubricar donde sea necesario", info: "Lubricar puntos móviles (como guías del respaldo o ruedas) si presentan fricción. Usar lubricantes compatibles con equipos médicos (base silicona o litio blanco). Evitar aceites con solventes o base mineral." },
      { id: 16, label: "Reemplazo de la batería de 9V del llamado de enfermería", info: "Si el LED parpadea reemplazar batería. Se ubica en la cabecera del lado derecho del paciente. No se requieren herramientas. Verificar funcionamiento normal de luces tras el reemplazo." },
      { id: 17, label: "El cable de alimentación no está deshilachado", info: "Revisar toda la longitud del cable. No debe tener cortes, abrasión ni hilos expuestos. En caso de daño, reemplazar por repuesto autorizado (P/N 39–248 para 110V)." },
      { id: 18, label: "Ningún cable está desgastado o pinzado", info: "Revisar que ningún cable esté atrapado entre mecanismos móviles ni presente señales de presión o desgaste por torsión." },
      { id: 19, label: "Todas las conexiones eléctricas están firmes", info: "Verificar que todas las conexiones estén bien asentadas y no flojas. Inspeccionar conectores en placas internas y cableado visible." },
      { id: 20, label: "Todas las conexiones a tierra están aseguradas al bastidor", info: "Asegurar que los cables de tierra estén conectados al bastidor metálico, usando terminales firmes. Probar continuidad con multímetro si es necesario." },
      { id: 21, label: "La impedancia de tierra no supera los 100 miliohmios", info: "Medir con un micro-ohmímetro entre el punto de tierra de la cama y el receptáculo. Si excede 100 mΩ, revisar conexiones de tierra y limpiar contactos." },
      { id: 22, label: "La corriente de fuga no supera los 100 microamperios", info: "Realizar prueba con medidor de corriente de fuga entre chasis y tierra. Si supera 100 μA, suspender uso y revisar componentes eléctricos." },
    ]
  }
];

const motivosNoFinalizacion = [
  "Falta de refacciones o piezas",
  "Falta de herramientas",
  "Finalizó la jornada laboral",
  "Requiere intervención de proveedor externo",
  "Equipo requerido urgentemente por el área clínica",
  "Interrupciones administrativas o cambio de prioridad"
];

const ADMIN_PASS = "Clinica_603";

function formatFecha(fechaStr) {
  try {
    return new Date(fechaStr).toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch {
    return fechaStr;
  }
}

function App() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [items, setItems] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
  const [finalizado, setFinalizado] = useState(null);
  const [motivoGeneral, setMotivoGeneral] = useState('');
  const [fechaGeneral, setFechaGeneral] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [showFirma, setShowFirma] = useState(false);
  const [codigoEmpleado, setCodigoEmpleado] = useState('');
  const [scanning, setScanning] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [eliminaciones, setEliminaciones] = useState([]);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [codigoEliminar, setCodigoEliminar] = useState('');
  const [scanningEliminar, setScanningEliminar] = useState(false);
  const [registroEliminar, setRegistroEliminar] = useState(null);
  const videoRef = useRef(null);
  const videoEliminarRef = useRef(null);

  const isMobile = window.innerWidth < 600;

  // --- Historial desde Firestore ---
  const [historial, setHistorial] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "historial"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setHistorial(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // --- Eliminaciones desde Firestore ---
  useEffect(() => {
    const q = query(collection(db, "eliminaciones"), orderBy("fechaEliminacion", "desc"));
    const unsub = onSnapshot(q, snap => setEliminaciones(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  // --- Seleccionar dispositivo ---
  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setItems(device.checklist.map(item => ({
      ...item,
      checked: true,
      showComment: false,
      comment: '',
      showInfo: false,
    })));
    setFinalizado(null);
    setMotivoGeneral('');
    setFechaGeneral('');
    setCodigoEmpleado('');
    setNumeroSerie('');
    setMensaje('');
    setShowFirma(false);
    setScanning(false);
  };

  // --- Checkbox toggle ---
  const handleCheck = idx => {
    const newItems = [...items];
    newItems[idx].checked = !newItems[idx].checked;
    setItems(newItems);
    if (finalizado === "si" && newItems.some(it => !it.checked)) {
      setFinalizado(null);
    }
  };

  // --- Mostrar comentario / info ---
  const handleShowComment = idx => {
    const newItems = [...items];
    newItems[idx].showComment = !newItems[idx].showComment;
    setItems(newItems);
  };
  const handleShowInfo = idx => {
    const newItems = [...items];
    newItems[idx].showInfo = !newItems[idx].showInfo;
    setItems(newItems);
  };
  const handleComment = (idx, value) => {
    const newItems = [...items];
    newItems[idx].comment = value;
    setItems(newItems);
  };

  // --- Back (volver a selección) ---
  const handleBack = () => {
    setSelectedDevice(null);
    setItems([]);
    setMensaje('');
    setFinalizado(null);
    setMotivoGeneral('');
    setFechaGeneral('');
    setCodigoEmpleado('');
    setNumeroSerie('');
    setShowFirma(false);
    setScanning(false);
  };

  // --- Guardar checklist en Firestore ---
  const handleGuardar = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setMensaje('Llena el checklist primero.');
      return;
    }
    if (!numeroSerie.trim()) {
      setMensaje('Indica el número de serie del dispositivo.');
      return;
    }
    if (!finalizado) {
      setMensaje('Indica si se finalizó el mantenimiento.');
      return;
    }
    if (finalizado === "no" && (motivoGeneral.trim() === "" || fechaGeneral.trim() === "")) {
      setMensaje('Indica el motivo y la fecha tentativa de solución para guardar.');
      return;
    }
    if (!codigoEmpleado.trim()) {
      setMensaje('Escanea o ingresa tu código de empleado para firmar.');
      setShowFirma(true);
      return;
    }
    if (finalizado === "si" && items.some(it => !it.checked)) {
      setMensaje('No puedes finalizar si hay elementos sin check.');
      return;
    }

    const registro = {
      dispositivo: selectedDevice.nombre,
      dispositivoId: selectedDevice.id,
      numeroSerie,
      fecha: new Date().toISOString(),
      items: [...items],
      finalizado,
      motivoGeneral,
      fechaGeneral,
      firmadoPor: codigoEmpleado
    };

    try {
      await addDoc(collection(db, "historial"), registro);
      setMensaje('¡Checklist guardado exitosamente!');
      setSelectedDevice(null);
      setItems([]);
      setFinalizado(null);
      setMotivoGeneral('');
      setFechaGeneral('');
      setCodigoEmpleado('');
      setNumeroSerie('');
      setShowFirma(false);
      setScanning(false);
      setTimeout(() => setMensaje(''), 2000);
    } catch (e) {
      setMensaje('Error al guardar en Firestore: ' + e.message);
    }
  };

  // --- Escaneo de código (firma) ---
  const handleScan = async () => {
    setScanning(true);
    setMensaje('');
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current);
      setCodigoEmpleado(result.getText());
      setShowFirma(false);
      setScanning(false);
      setMensaje('¡Código escaneado con éxito!');
      codeReader.reset();
    } catch (err) {
      setMensaje('No se pudo escanear el código. Intenta de nuevo o ingresa manualmente.');
      setScanning(false);
    }
  };

  // --- Escaneo de código (eliminar) ---
  const handleScanEliminar = async () => {
    setScanningEliminar(true);
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoEliminarRef.current);
      setCodigoEliminar(result.getText());
      setScanningEliminar(false);
      codeReader.reset();
    } catch (err) {
      setMensaje('No se pudo escanear el código. Intenta de nuevo o ingresa manualmente.');
      setScanningEliminar(false);
    }
  };

  // --- Exportar historial PDF (formato MX) ---
  const exportarHistorialPDF = (device) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Historial de Mantenimiento`, 15, 15);
    doc.setFontSize(13);
    doc.text(`Dispositivo: ${device.nombre}`, 15, 25);
    const registros = historial.filter(h => h.dispositivoId === device.id);
    if (registros.length === 0) {
      doc.text("Sin registros.", 15, 40);
    } else {
      registros.forEach((h, idx) => {
        if (idx !== 0) doc.addPage();
        doc.setFontSize(12);
        doc.text(`Registro ${idx + 1}:`, 15, 30);
        doc.text(`Fecha: ${formatFecha(h.fecha)}`, 15, 38);
        doc.text(`N° Serie: ${h.numeroSerie || 'No registrado'}`, 15, 44);
        doc.text(`Firmado por: ${h.firmadoPor}`, 15, 50);
        doc.text(`¿Finalizado?: ${h.finalizado === "si" ? "Sí" : "No"}`, 15, 56);
        if (h.finalizado === "no") {
          doc.text(`Motivo: ${h.motivoGeneral || "-"}`, 15, 62);
          doc.text(`Fecha solución: ${h.fechaGeneral || "-"}`, 15, 68);
        }
        autoTable(doc, {
          startY: 75,
          head: [['Elemento', 'Estado', 'Comentario']],
          body: h.items.map(it => [
            it.label,
            it.checked ? 'Sí' : 'No',
            it.comment || ''
          ]),
          theme: 'grid',
          styles: { fontSize: 9 }
        });
      });
    }
    if (eliminaciones.length > 0) {
      doc.addPage();
      doc.setFontSize(15);
      doc.text("Registros eliminados", 15, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'N° Serie', 'Motivo', 'Fecha solución', 'Eliminado por']],
        body: eliminaciones
          .filter(e => e.dispositivoId === device.id)
          .map(e => [formatFecha(e.fecha), e.numeroSerie, e.motivoGeneral || '-', e.fechaGeneral || '-', e.eliminadoPor || '-']),
        theme: 'grid',
        styles: { fontSize: 9 }
      });
    }
    doc.save(`Historial_${device.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  // --- MODAL para eliminar registro ---
  const openEliminarModal = (reg) => {
    setCodigoEliminar('');
    setShowEliminarModal(true);
    setRegistroEliminar(reg);
  };
  const closeEliminarModal = () => {
    setShowEliminarModal(false);
    setCodigoEliminar('');
    setScanningEliminar(false);
    setRegistroEliminar(null);
  };
  const confirmarEliminar = async () => {
    if (!codigoEliminar.trim()) {
      setMensaje('Ingresa o escanea tu código de empleado para eliminar.');
      return;
    }
    if (!registroEliminar) return;
    const eliminado = {
      ...registroEliminar,
      eliminadoPor: codigoEliminar
    };

    try {
      await addDoc(
        collection(db, "eliminaciones"),
        { ...eliminado, fechaEliminacion: new Date().toISOString() }
      );
      await deleteDoc(doc(db, "historial", registroEliminar.id));
      setMensaje('Registro eliminado correctamente.');
    } catch (e) {
      setMensaje('Error al eliminar en Firestore: ' + e.message);
    }
    closeEliminarModal();
  };

  // --- Login para modo edición ---
  const handleLoginEdicion = () => {
    if (loginPass === ADMIN_PASS) {
      setModoEdicion(true);
      setMostrarLogin(false);
      setLoginPass('');
      setMensaje('¡Modo edición activado!');
      setTimeout(() => setMensaje(''), 1500);
    } else {
      setMensaje('Contraseña incorrecta.');
    }
  };

  // --- Agrupa historial por dispositivo ---
  const historialPorDispositivo = dispositivos.map(dev => ({
    ...dev,
    registros: historial.filter(h => h.dispositivoId === dev.id)
  }));

  // --- Interfaz principal ---
  return (
    <div style={{
      maxWidth: 670,
      width: '100%',
      minHeight: '100vh',
      margin: '0 auto',
      padding: isMobile ? '0.5rem' : '2rem',
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: isMobile ? '0' : '20px',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <h2 style={{ fontSize: isMobile ? 22 : 32, marginBottom: 10 }}>Checklist de Mantenimiento</h2>
      {/* Mensajes de alerta */}
      {mensaje && (
        <div style={{
          background: mensaje.includes('exitosamente') ? '#206020' : '#701515',
          padding: 10,
          marginBottom: 16,
          borderRadius: 8
        }}>{mensaje}</div>
      )}
      {/* MODAL eliminación */}
      {showEliminarModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(30,30,45,0.86)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#282e4b', padding: 22, borderRadius: 14, minWidth: 310, boxShadow: '0 3px 16px #222' }}>
            <h3 style={{ color: '#ffa' }}>Eliminar registro</h3>
            <div style={{ marginBottom: 7 }}>Escanea o ingresa tu código para autorizar:</div>
            <input
              type="text"
              value={codigoEliminar}
              onChange={e => setCodigoEliminar(e.target.value)}
              placeholder="Código de empleado"
              style={{ fontSize: 17, padding: 8, borderRadius: 8, border: '1.5px solid #bbb', marginBottom: 10, width: '95%' }}
              autoFocus
            />
            <div>
              <button
                type="button"
                style={{ background: '#237b47', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', marginRight: 7, fontWeight: 'bold' }}
                onClick={confirmarEliminar}
                disabled={scanningEliminar}
              >Eliminar</button>
              <button
                type="button"
                style={{ background: '#828', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 'bold' }}
                onClick={closeEliminarModal}
                disabled={scanningEliminar}
              >Cancelar</button>
              <button
                type="button"
                style={{ background: '#1464ad', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', marginLeft: 8, fontWeight: 'bold' }}
                onClick={handleScanEliminar}
                disabled={scanningEliminar}
              >{scanningEliminar ? "Escaneando..." : "Escanear"}</button>
            </div>
            {showEliminarModal && (
              <div style={{ marginTop: 10 }}>
                <video ref={videoEliminarRef} style={{ width: 210, borderRadius: 10, marginBottom: 8 }} />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Botón modo edición */}
      <div style={{ marginBottom: 18 }}>
        {!modoEdicion ? (
          <>
            <button style={{
              background: '#444', color: '#fff', border: 'none', borderRadius: 8,
              padding: '7px 18px', fontWeight: 'bold', marginRight: 10, cursor: 'pointer'
            }} onClick={() => setMostrarLogin(true)}>
              Modo edición
            </button>
            {mostrarLogin && (
              <span style={{ marginLeft: 10 }}>
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="Contraseña"
                  style={{ padding: 6, borderRadius: 6, border: '1px solid #555', marginRight: 6 }}
                  autoFocus
                />
                <button style={{
                  background: '#2472a7', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer'
                }} onClick={handleLoginEdicion}>Entrar</button>
                <button style={{
                  background: '#a33', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '6px 12px', marginLeft: 5, cursor: 'pointer'
                }} onClick={() => { setMostrarLogin(false); setLoginPass(''); }}>Cancelar</button>
              </span>
            )}
          </>
        ) : (
          <button style={{
            background: '#a33', color: '#fff', border: 'none', borderRadius: 8,
            padding: '7px 18px', fontWeight: 'bold', cursor: 'pointer'
          }} onClick={() => setModoEdicion(false)}>Salir de edición</button>
        )}
      </div>
      {/* Vistas principales */}
      {!showHistorial ? (
        <>
          {!selectedDevice ? (
            <>
              <h4>Selecciona un dispositivo:</h4>
              {dispositivos.map(device => (
                <button key={device.id}
                  style={{
                    display: 'block', width: '100%', margin: '1rem 0',
                    padding: isMobile ? '0.6rem' : '1rem', background: '#232d3a', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: isMobile ? 16 : 18, fontWeight: 'bold', cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDevice(device)}
                >
                  {device.nombre}
                </button>
              ))}
              <button style={{
                display: 'block', width: '100%', margin: '1rem 0 0 0',
                padding: isMobile ? '0.5rem' : '0.8rem', background: '#383889', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: isMobile ? 14 : 16, fontWeight: 'bold', cursor: 'pointer'
              }} onClick={() => setShowHistorial(true)}>
                Ver historial de mantenimientos
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBack}
                style={{
                  marginBottom: 12, background: '#333', color: '#fff', border: 'none',
                  padding: isMobile ? '5px 14px' : '6px 18px', borderRadius: 8, cursor: 'pointer'
                }}>
                ← Cambiar dispositivo
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="N° de serie del dispositivo"
                  value={numeroSerie}
                  onChange={e => setNumeroSerie(e.target.value)}
                  style={{
                    padding: isMobile ? 6 : 7, borderRadius: 8, border: '1.5px solid #aaa',
                    fontSize: isMobile ? 14 : 15, background: '#222', color: '#fff',
                    width: isMobile ? 150 : 220, marginRight: 5
                  }}
                  required
                />
              </div>
              <h4 style={{ fontSize: isMobile ? 16 : 22 }}>{selectedDevice.nombre}</h4>
              {/* --- CHECKLIST GRID RESPONSIVO --- */}
              <div style={{
                background: '#191b26',
                borderRadius: 18,
                marginBottom: 24,
                padding: isMobile ? '7px 4px 5px 4px' : '18px 24px 8px 18px',
                overflowX: 'auto'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '36px 1.7fr 44px 44px' : '56px 2.5fr 100px 100px',
                  gap: '4px 8px',
                  alignItems: 'center',
                  marginBottom: isMobile ? 6 : 16
                }}>
                  <span></span>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? 18 : 22, color: '#1be8cb' }}>Descripción</span>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? 16 : 20 }}></span>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? 16 : 20, color: '#91aaff' }}>Comentario</span>
                </div>
                {items.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '36px 1.7fr 44px 44px' : '56px 2.5fr 100px 100px',
                    gap: '4px 8px', alignItems: 'center',
                    minHeight: isMobile ? 38 : 46,
                    borderBottom: '1px solid #222'
                  }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheck(idx)}
                      style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, margin: 0 }}
                    />
                    <span style={{
                      fontWeight: 600, fontSize: isMobile ? 15.5 : 19, color: '#fff', wordBreak: 'break-word'
                    }}>{item.label}</span>
                    <button type="button"
                      style={{
                        background: '#56585a', color: '#fff', border: 'none',
                        borderRadius: '50%', width: isMobile ? 28 : 38, height: isMobile ? 28 : 38,
                        fontWeight: 'bold', fontSize: isMobile ? 16 : 20, cursor: 'pointer', margin: '0 auto'
                      }}
                      onClick={() => handleShowInfo(idx)}
                      title="Ver información">i</button>
                    <button type="button"
                      style={{
                        background: '#4366bc', color: '#fff', border: 'none', borderRadius: 10,
                        width: isMobile ? 28 : 38, height: isMobile ? 28 : 38,
                        fontWeight: 'bold', fontSize: isMobile ? 18 : 22, cursor: 'pointer', margin: '0 auto'
                      }}
                      onClick={() => handleShowComment(idx)}
                      title="Agregar comentario">+</button>
                    {item.showInfo && (
                      <div style={{
                        gridColumn: '2 / 5',
                        background: '#222', color: '#1be8cb',
                        padding: '8px 10px', margin: '7px 0 3px 0', borderRadius: '9px',
                        fontSize: isMobile ? 13 : 16, zIndex: 30
                      }}>{item.info}</div>
                    )}
                    {item.showComment && (
                      <div style={{ gridColumn: '4 / 5', marginTop: 5 }}>
                        <input
                          type="text"
                          placeholder="Comentario..."
                          value={item.comment}
                          onChange={e => handleComment(idx, e.target.value)}
                          style={{
                            width: '95%', padding: 8, borderRadius: 7, border: '1px solid #555',
                            fontSize: isMobile ? 13 : 15
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* --- Se finalizó el mantenimiento --- */}
              <form onSubmit={handleGuardar}>
                <div style={{
                  marginTop: 20, background: '#242448', padding: 18, borderRadius: 14,
                  marginBottom: 16, color: '#fff'
                }}>
                  <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 17 }}>
                    ¿Se finalizó el mantenimiento?
                  </div>
                  <label style={{ marginRight: 24 }}>
                    <input
                      type="radio"
                      name="finalizado"
                      value="si"
                      checked={finalizado === "si"}
                      onChange={() => setFinalizado("si")}
                      disabled={items.some(it => !it.checked)}
                    /> Sí
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="finalizado"
                      value="no"
                      checked={finalizado === "no"}
                      onChange={() => setFinalizado("no")}
                    /> No
                  </label>
                  {finalizado === "no" && (
                    <>
                      <div style={{ marginTop: 10 }}>
                        <label><b>Motivo por el cual no se realizó:</b></label>
                        <select
                          value={motivoGeneral}
                          onChange={e => setMotivoGeneral(e.target.value)}
                          style={{ width: '90%', padding: 6, margin: '6px 0', borderRadius: 6, border: '1px solid #555' }}
                          required
                        >
                          <option value="">Selecciona un motivo</option>
                          {motivosNoFinalizacion.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label><b>Fecha tentativa de solución:</b></label>
                        <input
                          type="date"
                          value={fechaGeneral}
                          onChange={e => setFechaGeneral(e.target.value)}
                          style={{ width: '60%', padding: 6, borderRadius: 6, border: '1px solid #555' }}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                {/* Firma/código de empleado */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 'bold', marginRight: 7 }}>Código empleado (firma):</label>
                  <input
                    type="text"
                    placeholder="Escanea o escribe tu código"
                    value={codigoEmpleado}
                    onChange={e => setCodigoEmpleado(e.target.value)}
                    style={{
                      width: 170, marginRight: 8, borderRadius: 8, border: '1.5px solid #aaa',
                      padding: 6, background: '#222', color: '#fff'
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      background: '#1d4b30', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '6px 15px', cursor: 'pointer'
                    }}
                    onClick={() => setShowFirma(true)}
                    disabled={scanning}
                  >Escanear código</button>
                  {showFirma && (
                    <div style={{ marginTop: 10 }}>
                      <video ref={videoRef} style={{ width: 210, borderRadius: 10, marginBottom: 8 }} />
                      <br />
                      <button
                        type="button"
                        style={{
                          background: '#267299', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '6px 15px', cursor: 'pointer'
                        }}
                        onClick={handleScan}
                        disabled={scanning}
                      >{scanning ? "Escaneando..." : "Iniciar escaneo"}</button>
                      <button
                        type="button"
                        style={{
                          background: '#911', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '6px 15px', marginLeft: 12, cursor: 'pointer'
                        }}
                        onClick={() => setShowFirma(false)}
                      >Cancelar</button>
                    </div>
                  )}
                </div>
                <button type="submit"
                  style={{
                    marginTop: 15, background: '#194d8a', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '11px 36px', fontWeight: 'bold',
                    fontSize: 17, cursor: 'pointer'
                  }}>Guardar checklist</button>
              </form>
            </>
          )}
        </>
      ) : (
        <div>
          <button style={{
            marginBottom: 18, background: '#333', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 22px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer'
          }} onClick={() => setShowHistorial(false)}>
            ← Volver
          </button>
          <h3>Historial de Mantenimientos</h3>
          {historialPorDispositivo.map(dev => (
            <div key={dev.id} style={{
              background: '#212a37', borderRadius: 14, marginBottom: 30,
              padding: 16, boxShadow: '0 0 8px #101418'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{dev.nombre}</h4>
                <button style={{
                  marginBottom: 8, background: '#194d8a', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '7px 16px',
                  fontWeight: 'bold', cursor: 'pointer'
                }} onClick={() => exportarHistorialPDF(dev)}>
                  Exportar PDF
                </button>
              </div>
              {dev.registros.length === 0 ? (
                <div style={{ color: '#aab' }}>Sin registros aún.</div>
              ) : (
                dev.registros.map((h, i) => (
                  <div key={i} style={{
                    marginBottom: 12, background: '#242c3a',
                    borderRadius: 10, padding: 10, marginTop: 10, fontSize: 15, position: 'relative'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>{formatFecha(h.fecha)}</div>
                    <div style={{ color: '#7da9ee' }}>N° Serie: <b>{h.numeroSerie}</b></div>
                    <div style={{ color: '#c4f27d', marginBottom: 6 }}>Firmado por: {h.firmadoPor}</div>
                    <div style={{ color: '#e7e96d', marginBottom: 8 }}>
                      <b>¿Finalizado?</b> {h.finalizado === "si" ? "Sí" : "No"}
                      {h.finalizado === "no" && (
                        <div style={{ marginLeft: 0, marginTop: 4 }}>
                          <div style={{ color: '#e5b44b', marginBottom: 3 }}>
                            <b>Motivo general:</b><br />{h.motivoGeneral}
                          </div>
                          {h.fechaGeneral && (
                            <div style={{ color: '#b2b8ff' }}>
                              <b>Fecha solución:</b> {h.fechaGeneral}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ul>
                      {h.items.map((it, j) => (
                        <li key={j} style={{ marginBottom: it.checked ? 2 : 10 }}>
                          <span style={{ fontWeight: 'bold', color: it.checked ? '#4be54b' : '#e65c5c' }}>
                            {it.checked ? 'Sí' : 'No'}
                          </span>{" "}
                          {it.label}
                          {it.comment && (
                            <span style={{ color: '#e5e54b', marginLeft: 8 }}>📝 {it.comment}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {modoEdicion && (
                      <button style={{
                        position: 'absolute', top: 10, right: 10, background: '#b20b0b',
                        color: '#fff', border: 'none', borderRadius: 7,
                        padding: '4px 10px', fontSize: 14, cursor: 'pointer'
                      }}
                        onClick={() => openEliminarModal(h)}
                      >Eliminar</button>
                    )}
                  </div>
                ))
              )}
              {/* Tabla de eliminaciones */}
              {eliminaciones.filter(e => e.dispositivoId === dev.id).length > 0 && (
                <div style={{
                  marginTop: 18, background: '#3d2347', borderRadius: 9, padding: 8, color: '#fff'
                }}>
                  <b>Registros eliminados:</b>
                  <ul>
                    {eliminaciones.filter(e => e.dispositivoId === dev.id).map((e, i) => (
                      <li key={i} style={{ fontSize: 13, marginTop: 2 }}>
                        [{formatFecha(e.fecha)}] N° Serie: <b>{e.numeroSerie}</b> — Motivo: {e.motivoGeneral || '-'} — <span style={{ color: '#ffb' }}>Eliminado por: {e.eliminadoPor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
