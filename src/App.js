import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BrowserMultiFormatReader } from '@zxing/browser';

// --- Checklist e Info Complementaria ---
const dispositivos = [
  {
    id: 'cama4700',
    nombre: 'Cama de maternidad Stryker ADEL 4700',
    checklist: [
      { id: 1, label: "Todos los tornillos y elementos de fijación están bien sujetos", info: "Verificar que todos los tornillos estén firmemente ajustados utilizando las herramientas apropiadas (Allen, Torx, llaves combinadas). En reemplazos o ajustes críticos, aplicar adhesivo tipo Loctite 242 si se indica. Reapretar tras el mantenimiento." },
      { id: 2, label: "Todas las soldaduras están intactas, no agrietadas ni rotas", info: "Si se detectan grietas, porosidades o fracturas, no operar la cama y contactar al soporte técnico de Stryker. No se permite reparación local de soldaduras." },
      { id: 3, label: "No hay tubos ni láminas de metal dobladas o rotas", info: "Buscar dobleces, deformaciones o fracturas. Ante cualquier daño estructural, suspender el uso de la cama y contactar a soporte técnico de Stryker." },
      { id: 4, label: "No hay residuos en las ruedas", info: "Revisar que las ruedas y ejes estén libres de residuos, cabellos, gasas u otros objetos extraños. Retirar cualquier obstrucción y limpiar según sea necesario para garantizar el libre movimiento" },
      { id: 5, label: "Todas las ruedas están seguras y giran correctamente", info: "Verificar que cada rueda esté firmemente sujeta a la estructura y que gire libremente sin ruidos, fricción excesiva o bloqueo. Inspeccionar los rodamientos y reemplazar si hay desgaste o restricción de movimiento.Tipo de ruedas del dispositivo (P/N 0710-105-000 para ruedas con freno | P/N 0710-106-000 para ruedas de dirección)" },
      { id: 6, label: "Bloqueo correcto de las 4 ruedas al pisar el freno", info: "Presionar el pedal de freno hasta el fondo y verificar que las cuatro ruedas queden inmovilizadas. Intentar mover la cama para confirmar que los frenos están activos. Si alguna rueda gira, inspeccionar el sistema de frenos y enlaces mecánicos. Ajustar o reemplazar partes si es necesario. Las fallas comunes incluyen desalineación del pedal, cables flojos o desgaste en el ensamble de freno" },
      { id: 7, label: "Los seguros de dirección de las ruedas funcionan correctamente.", info: "Activar el seguro direccional desde el pedal correspondiente y empujar la cama hacia adelante. Verificar que la rueda guía mantenga un trayecto recto. Si hay desviaciones o vibraciones, revisar el mecanismo de bloqueo y reemplazar si hay desgaste. Usar repuesto original P/N 0710-106-000 si se requiere." },
      { id: 8, label: "Las barandillas se mueven y se traban correctamente.", info: "Verificar que las barandillas suban y bajen sin fricción excesiva y que el sistema de bloqueo enganche con firmeza. Si alguna barandilla queda floja o no se traba adecuadamente, inspeccionar y reemplazar el mecanismo de enganche o la barandilla completa." },
      { id: 9, label: "El respaldo Fowler se desliza correctamente", info: "Debe tener un rango de movimiento de entre 0° - 70°" },
      { id: 10, label: "La cama sube y baja correctamente", info: "Se desplaza dentro de un rango de 49-95 cm" },
      { id: 11, label: "La sección de pies funciona correctamente", info: "Verificar que se mueva sin ruidos anormales ni obstrucciones. Si no responde o presenta movimientos irregulares, revisar conexiones del actuador y realizar recalibración si es necesario." },
      { id: 12, label: "Funciona correctamente la posición de Trendelenburg", info: "Verificar que la cama se incline suavemente hasta un máximo de 8° con la cabeza más baja que los pies. Confirmar que no haya ruidos, bloqueos ni errores. Si hay fallas, revisar actuadores y realizar recalibración" },
      { id: 13, label: "El soporte para suero está intacto y funciona correctamente", info: "Confirmar que se puede extender y retraer, y que su mecanismo de bloqueo mantiene la posición deseada sin deslizamientos." },
      { id: 14, label: "Funda del colchón sin rasgaduras ni grietas", info: "Inspeccionar visualmente toda la superficie del colchón, incluyendo costuras, para detectar grietas, cortes, desgaste o pinchazos. Si se encuentra algún daño, reemplazar el colchón de inmediato" },
      { id: 15, label: "Lubricar donde sea necesario", info: "Lubricar puntos móviles (como guías del respaldo o ruedas) si presentan fricción. Usar lubricantes compatibles con equipos médicos (base silicona o litio blanco). Evitar aceites con solventes o base mineral." },
      { id: 16, label: "Reemplazo de la batería de 9V del llamado de enfermería", info: "Reemplazar la batería de 9V ubicada en la cabecera del lado derecho del paciente si el LED parpadea. No se requieren herramientas. Verificar funcionamiento normal de luces tras el reemplazo." },
      { id: 17, label: "El cable de alimentación no está deshilachado", info: "Revisar el cable principal en toda su longitud. No debe tener cortes, abrasión ni hilos expuestos. En caso de daño, reemplazar por repuesto autorizado (P/N 39–248 para 110V)" },
      { id: 18, label: "Ningún cable está desgastado o pinzado", info: "Revisar que ningún cable esté atrapado entre mecanismos móviles ni presente señales de presión o desgaste por torsión." },
      { id: 19, label: "Todas las conexiones eléctricas están firmes", info: "Verificar que todas las conexiones estén bien asentadas y no flojas. Inspeccionar conectores en placas internas y cableado visible." },
      { id: 20, label: "Todas las conexiones a tierra están aseguradas al bastidor", info: "Asegurar que los cables de tierra estén conectados al bastidor metálico, usando terminales firmes. Probar continuidad con multímetro si es necesario." },
      { id: 21, label: "La impedancia de tierra no supera los 100 miliohmios", info: "Medir con un micro-ohmímetro entre el punto de tierra de la cama y el receptáculo. Si excede 100 mΩ, revisar conexiones de tierra y limpiar contactos." },
      { id: 22, label: "La corriente de fuga no supera los 100 microamperios", info: "Realizar prueba con medidor de corriente de fuga entre chasis y tierra. Si supera 100 μA, suspender uso y revisar componentes eléctricos." }
    ]
  }
];

const ADMIN_PASS = "biomed2024";
const motivosNoFinalizo = [
  "Falta de refacciones o piezas",
  "Falta de herramientas",
  "Finalizó la jornada laboral",
  "Requiere intervención de proveedor externo",
  "Equipo requerido urgentemente por el área clínica",
  "Interrupciones administrativas o cambio de prioridad"
];

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
  const videoRef = useRef(null);

  // Para escaneo y eliminación
  const [registroPendienteEliminar, setRegistroPendienteEliminar] = useState(null);
  const [showScanEliminar, setShowScanEliminar] = useState(false);
  const [codigoEliminador, setCodigoEliminador] = useState('');

  // Historial
  const [historial, setHistorial] = useState(() => {
    const saved = localStorage.getItem('historialMantenimientos');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Funciones generales ---
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

  const handleCheck = idx => {
    const newItems = [...items];
    newItems[idx].checked = !newItems[idx].checked;
    setItems(newItems);
    if (finalizado === "si" && newItems.some(it => !it.checked)) {
      setFinalizado(null);
    }
  };

  const handleShowComment = idx => {
    const newItems = [...items];
    newItems[idx].showComment = !newItems[idx].showComment;
    setItems(newItems);
  };

  const handleComment = (idx, value) => {
    const newItems = [...items];
    newItems[idx].comment = value;
    setItems(newItems);
  };

  const handleShowInfo = idx => {
    const newItems = [...items];
    newItems[idx].showInfo = !newItems[idx].showInfo;
    setItems(newItems);
  };

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

  // Validación mejorada: motivo y fecha obligatoria si no se finalizó
  const handleGuardar = (e) => {
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
    if (finalizado === "no") {
      if (motivoGeneral.trim() === "") {
        setMensaje('Indica el motivo general de por qué no se finalizó.');
        return;
      }
      if (!fechaGeneral) {
        setMensaje('Indica la fecha tentativa de solución.');
        return;
      }
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
      fecha: new Date().toLocaleString(),
      items: [...items],
      finalizado,
      motivoGeneral,
      fechaGeneral,
      firmadoPor: codigoEmpleado
    };

    const nuevoHistorial = [registro, ...historial];
    setHistorial(nuevoHistorial);
    localStorage.setItem('historialMantenimientos', JSON.stringify(nuevoHistorial));

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
  };

  // --- SCAN para firma ---
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

  // --- ESCANEO PARA ELIMINAR REGISTRO ---
  const handleScanEliminar = async () => {
    setScanning(true);
    setMensaje('');
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current);
      setCodigoEliminador(result.getText());
      setScanning(false);
    } catch (err) {
      setMensaje('No se pudo escanear el código. Intenta de nuevo.');
      setScanning(false);
    }
  };

  // Confirmar eliminación después de escanear el código de barras
  const handleConfirmarEliminar = () => {
    if (!codigoEliminador) {
      setMensaje("Escanea un código válido.");
      return;
    }
    const eliminadoPor = codigoEliminador;
    const fechaEliminado = new Date().toLocaleString();

    const nuevoHistorial = [...historial];
    const registroEliminado = nuevoHistorial.splice(registroPendienteEliminar, 1)[0];
    registroEliminado.eliminadoPor = eliminadoPor;
    registroEliminado.fechaEliminado = fechaEliminado;

    setHistorial(nuevoHistorial);
    localStorage.setItem('historialMantenimientos', JSON.stringify(nuevoHistorial));

    // Guardar registroEliminado en un historial aparte
    let eliminados = JSON.parse(localStorage.getItem('eliminadosMantenimientos') || "[]");
    eliminados.push(registroEliminado);
    localStorage.setItem('eliminadosMantenimientos', JSON.stringify(eliminados));

    setShowScanEliminar(false);
    setCodigoEliminador('');
    setRegistroPendienteEliminar(null);
    setMensaje('Registro eliminado correctamente.');
  };

  // --- PDF: Cada registro en una hoja + tabla de eliminados ---
  const exportarHistorialPDF = (device) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Historial de Mantenimiento`, 15, 15);
    doc.setFontSize(13);
    doc.text(`Dispositivo: ${device.nombre}`, 15, 25);

    // Filtra historial solo de ese dispositivo
    const registros = historial.filter(h => h.dispositivoId === device.id);

    if (registros.length === 0) {
      doc.text("Sin registros.", 15, 40);
    } else {
      let currentY = 32;
      registros.forEach((h, idx) => {
        if (idx !== 0) {
          doc.addPage(); // Cada registro empieza en nueva hoja
          currentY = 15;
          doc.setFontSize(16);
          doc.text(`Historial de Mantenimiento`, 15, currentY);
          doc.setFontSize(13);
          doc.text(`Dispositivo: ${device.nombre}`, 15, currentY + 10);
          currentY += 20;
        }
        doc.setFontSize(12);
        doc.text(`Registro ${idx + 1}:`, 15, currentY += 8);
        doc.text(`Fecha: ${h.fecha}`, 15, currentY += 6);
        doc.text(`N° Serie: ${h.numeroSerie || 'No registrado'}`, 15, currentY += 6);
        doc.text(`Firmado por: ${h.firmadoPor}`, 15, currentY += 6);
        doc.text(`¿Finalizado?: ${h.finalizado === "si" ? "Sí" : "No"}`, 15, currentY += 6);

        if (h.finalizado === "no") {
          doc.text(`Motivo: ${h.motivoGeneral || "-"}`, 15, currentY += 6);
          doc.text(`Fecha solución: ${h.fechaGeneral || "-"}`, 15, currentY += 6);
        }

        autoTable(doc, {
          startY: currentY + 2,
          head: [['Elemento', 'Estado', 'Comentario']],
          body: h.items.map(it => [
            it.label,
            it.checked ? 'Sí' : 'No',
            it.comment || ''
          ]),
          theme: 'grid',
          styles: { fontSize: 10 }
        });
        currentY = doc.lastAutoTable.finalY;

        // Si fue eliminado, muestra quién y cuándo
        if (h.eliminadoPor && h.fechaEliminado) {
          doc.text(`Eliminado por: ${h.eliminadoPor} el ${h.fechaEliminado}`, 15, currentY + 8);
        }
      });
    }

    // --- REGISTROS ELIMINADOS ---
    const eliminados = JSON.parse(localStorage.getItem('eliminadosMantenimientos') || "[]")
      .filter(e => e.dispositivoId === device.id);

    if (eliminados.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Registros eliminados', 15, 15);
      autoTable(doc, {
        startY: 22,
        head: [['Fecha', 'N° Serie', 'Firmado por', 'Motivo', 'Fecha solución', 'Eliminado por', 'Fecha de eliminación']],
        body: eliminados.map(e => [
          e.fecha || '',
          e.numeroSerie || '',
          e.firmadoPor || '',
          e.motivoGeneral || '',
          e.fechaGeneral || '',
          e.eliminadoPor || '',
          e.fechaEliminado || ''
        ]),
        theme: 'grid',
        styles: { fontSize: 10 }
      });
    }

    doc.save(`Historial_${device.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const historialPorDispositivo = dispositivos.map(dev => ({
    ...dev,
    registros: historial.filter(h => h.dispositivoId === dev.id)
  }));

  // Login para modo edición
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

  // --- UI ---
  return (
    <div style={{ maxWidth: 670, margin: '2rem auto', padding: '2rem', background: '#1a1a1a', color: '#fff', borderRadius: '20px' }}>
      <h2>Checklist de Mantenimiento</h2>
      {mensaje && (
        <div style={{ background: mensaje.includes('exitosamente') ? '#206020' : '#701515', padding: 10, marginBottom: 16, borderRadius: 8 }}>
          {mensaje}
        </div>
      )}

      {/* Botón para entrar/salir de edición */}
      <div style={{ marginBottom: 18 }}>
        {!modoEdicion ? (
          <>
            <button
              style={{
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '7px 18px',
                fontWeight: 'bold',
                marginRight: 10,
                cursor: 'pointer'
              }}
              onClick={() => setMostrarLogin(true)}
            >
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
                <button
                  style={{
                    background: '#2472a7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={handleLoginEdicion}
                >
                  Entrar
                </button>
                <button
                  style={{
                    background: '#a33',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    marginLeft: 5,
                    cursor: 'pointer'
                  }}
                  onClick={() => { setMostrarLogin(false); setLoginPass(''); }}
                >
                  Cancelar
                </button>
              </span>
            )}
          </>
        ) : (
          <button
            style={{
              background: '#a33',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setModoEdicion(false)}
          >
            Salir de edición
          </button>
        )}
      </div>

      {/* Modal para escaneo de eliminación */}
      {showScanEliminar && (
        <div style={{ background: "#242448", padding: 18, borderRadius: 14, marginBottom: 16, color: "#fff" }}>
          <h3>Escanear código para confirmar eliminación</h3>
          <video ref={videoRef} style={{ width: 210, borderRadius: 10, marginBottom: 8 }} />
          <br />
          <button
            onClick={handleScanEliminar}
            disabled={scanning}
            style={{
              background: '#267299',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 15px',
              cursor: 'pointer'
            }}
          >
            {scanning ? "Escaneando..." : "Iniciar escaneo"}
          </button>
          <button
            style={{
              background: '#911',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 15px',
              marginLeft: 12,
              cursor: 'pointer'
            }}
            onClick={() => { setShowScanEliminar(false); setCodigoEliminador(''); setRegistroPendienteEliminar(null); }}
          >
            Cancelar
          </button>
          <br />
          {codigoEliminador && (
            <div>
              <div style={{ margin: '10px 0', color: "#8ff08f" }}>Código capturado: <b>{codigoEliminador}</b></div>
              <button
                style={{
                  background: '#a33',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontWeight: 'bold',
                  marginTop: 8,
                  cursor: 'pointer'
                }}
                onClick={handleConfirmarEliminar}
              >
                Confirmar eliminación
              </button>
            </div>
          )}
        </div>
      )}

      {!showHistorial ? (
        <>
          {!selectedDevice ? (
            <>
              <h4>Selecciona un dispositivo:</h4>
              {dispositivos.map(device => (
                <button key={device.id}
                  style={{
                    display: 'block',
                    width: '100%',
                    margin: '1rem 0',
                    padding: '1rem',
                    background: '#232d3a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 18,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectDevice(device)}
                >
                  {device.nombre}
                </button>
              ))}
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  margin: '1rem 0 0 0',
                  padding: '0.8rem',
                  background: '#383889',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => setShowHistorial(true)}
              >
                Ver historial de mantenimientos
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBack} style={{ marginBottom: 12, background: '#333', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 8, cursor: 'pointer' }}>
                ← Cambiar dispositivo
              </button>
              {/* Número de serie arriba a la derecha */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="N° de serie del dispositivo"
                  value={numeroSerie}
                  onChange={e => setNumeroSerie(e.target.value)}
                  style={{
                    padding: 7,
                    borderRadius: 8,
                    border: '1.5px solid #aaa',
                    fontSize: 15,
                    background: '#222',
                    color: '#fff',
                    width: 220,
                    marginRight: 5
                  }}
                  required
                />
              </div>
              <h4>{selectedDevice.nombre}</h4>
              {/* --- CHECKLIST EN 4 COLUMNAS --- */}
              <form onSubmit={handleGuardar}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 2.5fr 100px 100px',
                  gap: '4px 8px',
                  alignItems: 'center',
                  background: '#191b26',
                  borderRadius: 18,
                  marginBottom: 24,
                  padding: '18px 24px 8px 18px'
                }}>
                  <div></div>
                  <div style={{ fontWeight: 'bold', color: '#10ffe0', fontSize: 20 }}>Descripción</div>
                  <div></div>
                  <div style={{ fontWeight: 'bold', color: '#7e9fff', fontSize: 18 }}>Comentario</div>
                  {items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {/* Col 1: Check */}
                      <div>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleCheck(idx)}
                          style={{ width: 28, height: 28, marginLeft: 7 }}
                        />
                      </div>
                      {/* Col 2: Descripción */}
                      <div style={{ fontWeight: 600, fontSize: 19, color: '#fff', wordBreak: 'break-word' }}>
                        {item.label}
                      </div>
                      {/* Col 3: Botón info alineado a la derecha */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          style={{
                            background: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 38,
                            height: 38,
                            fontWeight: 'bold',
                            fontSize: 20,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleShowInfo(idx)}
                          title="Ver información"
                        >i</button>
                      </div>
                      {/* Col 4: Botón + comentario alineado a la derecha */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          style={{
                            background: item.showComment ? '#555' : '#3b5998',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            width: 38,
                            height: 38,
                            fontSize: 22,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginBottom: 3,
                            padding: 0
                          }}
                          onClick={() => handleShowComment(idx)}
                          title="Agregar comentario"
                        >+</button>
                      </div>
                      {/* Info extra: Fila completa debajo */}
                      {item.showInfo && (
                        <div style={{
                          gridColumn: '1 / span 4',
                          background: '#191b44',
                          color: '#d1e6f4',
                          padding: '0.8rem 1.2rem',
                          borderRadius: '9px',
                          margin: '10px 0 0 70px',
                          maxWidth: '88%',
                          fontSize: 16
                        }}>
                          {item.info}
                        </div>
                      )}
                      {/* Comentario input debajo del botón + */}
                      {item.showComment && (
                        <div style={{ gridColumn: '4 / 5', marginTop: 5 }}>
                          <input
                            type="text"
                            placeholder="Comentario..."
                            value={item.comment}
                            onChange={e => handleComment(idx, e.target.value)}
                            style={{ width: '95%', padding: 8, borderRadius: 7, border: '1px solid #555', fontSize: 16, marginTop: 2 }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {/* Pregunta final de si se finalizó o no */}
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
                          style={{ width: '92%', padding: 8, margin: '6px 0', borderRadius: 6, border: '1px solid #555', fontSize: 16, color: motivoGeneral ? "#fff" : "#888", background: "#222" }}
                          required
                        >
                          <option value="" disabled>Selecciona un motivo</option>
                          {motivosNoFinalizo.map(motivo => (
                            <option value={motivo} key={motivo}>{motivo}</option>
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
                    style={{ width: 170, marginRight: 8, borderRadius: 8, border: '1.5px solid #aaa', padding: 6, background: '#222', color: '#fff' }}
                  />
                  <button
                    type="button"
                    style={{
                      background: '#1d4b30',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 15px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowFirma(true)}
                    disabled={scanning}
                  >
                    Escanear código
                  </button>
                  {showFirma && (
                    <div style={{ marginTop: 10 }}>
                      <video ref={videoRef} style={{ width: 210, borderRadius: 10, marginBottom: 8 }} />
                      <br />
                      <button
                        type="button"
                        style={{
                          background: '#267299',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 15px',
                          cursor: 'pointer'
                        }}
                        onClick={handleScan}
                        disabled={scanning}
                      >
                        {scanning ? "Escaneando..." : "Iniciar escaneo"}
                      </button>
                      <button
                        type="button"
                        style={{
                          background: '#911',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 15px',
                          marginLeft: 12,
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowFirma(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                <button type="submit"
                  style={{
                    marginTop: 15,
                    background: '#194d8a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 36px',
                    fontWeight: 'bold',
                    fontSize: 17,
                    cursor: 'pointer'
                  }}>
                  Guardar checklist
                </button>
              </form>
            </>
          )}
        </>
      ) : (
        <div>
          <button
            style={{
              marginBottom: 18,
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 22px',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={() => setShowHistorial(false)}
          >
            ← Volver
          </button>
          <h3>Historial de Mantenimientos</h3>
          {historialPorDispositivo.map(dev => (
            <div key={dev.id} style={{
              background: '#212a37',
              borderRadius: 14,
              marginBottom: 30,
              padding: 16,
              boxShadow: '0 0 8px #101418'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{dev.nombre}</h4>
                <button
                  style={{
                    marginBottom: 8,
                    background: '#194d8a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => exportarHistorialPDF(dev)}
                >
                  Exportar PDF
                </button>
              </div>
              {dev.registros.length === 0 ? (
                <div style={{ color: '#aab' }}>Sin registros aún.</div>
              ) : (
                dev.registros.map((h, i) => (
                  <div key={i} style={{
                    marginBottom: 12,
                    background: '#242c3a',
                    borderRadius: 10,
                    padding: 10,
                    marginTop: 10,
                    fontSize: 15,
                    position: 'relative'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>{h.fecha}</div>
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
                    {/* Info de eliminación, si aplica */}
                    {h.eliminadoPor && h.fechaEliminado && (
                      <div style={{ color: '#f08080', fontStyle: 'italic', marginTop: 7 }}>
                        Eliminado por: <b>{h.eliminadoPor}</b> el <b>{h.fechaEliminado}</b>
                      </div>
                    )}
                    {/* Botón eliminar solo en modo edición */}
                    {modoEdicion && (
                      <button
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: '#b20b0b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 14,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setRegistroPendienteEliminar(historial.findIndex(reg => reg.fecha === h.fecha && reg.firmadoPor === h.firmadoPor));
                          setShowScanEliminar(true);
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
