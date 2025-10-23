// ======================= app.js - MEJORADO =======================

// ======================================================
// 🎨 EFECTO DEGRADADO HSL CON MOUSE MOVE (AZUL FUERTE)
// ======================================================

/**
 * Aplica un degradado HSL al fondo del body basado en la posición Y del ratón.
 * Arriba (Y=0) es un azul brillante y saturado; Abajo (Y=H) es un azul oscuro.
 * @param {MouseEvent} e - Evento de movimiento del ratón.
 */
document.addEventListener('mousemove', (e) => {
  const viewportHeight = window.innerHeight;
  
  // Posición vertical normalizada (0.0 en la parte superior, 1.0 en la parte inferior)
  const normalizedY = e.clientY / viewportHeight;
  
  // Matiz (H): Se mantiene en un tono azul claro (cercano a 220).
  const hue = 220; 
  
  // Luminosidad (L): Varia de 50% (Claro/Arriba) a 20% (Oscuro/Abajo).
  // La variación es de (1 - normalizedY) para que sea más claro en la parte superior.
  // Mapeamos el rango [0.0, 1.0] a [20, 50].
  const minL = 20; // Luminosidad mínima (más oscuro)
  const maxL = 50; // Luminosidad máxima (más claro)
  const luminosity = minL + (maxL - minL) * (1 - normalizedY); // 50 arriba, 20 abajo.
  
  // Saturación (S): Varia de 90% (Arriba/Brillante) a 70% (Abajo/Fuerte).
  // Mantenemos la saturación alta para un "azul fuerte" constante.
  const minS = 70; // Saturación mínima (aún fuerte)
  const maxS = 90; // Saturación máxima (muy fuerte/brillante)
  const saturation = minS + (maxS - minS) * (1 - normalizedY); // 90 arriba, 70 abajo.

  // Generamos el color HSL
  const color = `hsl(${hue}, ${saturation.toFixed(0)}%, ${luminosity.toFixed(0)}%)`;
  
  // Aplicamos al fondo del body
  document.body.style.backgroundColor = color;
});

// ======================================================
// Lógica Refactorizada: Pedido y Actividades DOM
// ======================================================

/** Utilidad: formatea a moneda MXN */
function toMXN(num) {
  return Number(num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

/** Utilidad: toma precio desde data-precio (en selects/checks) */
function getPrecioFromDataset(el) {
  const raw = el?.dataset?.precio;
  return raw ? Number(raw) : 0;
}

/** Configura la lógica del formulario de pedido. */
function setupFormLogic() {
  // Referencias a elementos que usaremos:
  const form = document.getElementById('formPedido');
  const outNombre = document.getElementById('outNombre');
  const outLista = document.getElementById('outLista');
  const outTotal = document.getElementById('outTotal');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const confirmNombre = document.getElementById('confirmNombre');

  // Toast UX (aviso corto)
  const toastBtn = document.getElementById('btnToast');
  const toastEl = document.getElementById('toastAviso');
  // Usamos '?' para evitar error si no existe la librería o el elemento
  const toast = window.bootstrap?.Toast?.getOrCreateInstance(toastEl);
  toastBtn?.addEventListener('click', () => toast?.show());

  form?.addEventListener('submit', (e) => {
    e.preventDefault(); 

    // 1) Leemos campos base (Usamos Optional Chaining para seguridad)
    const nombre = document.getElementById('nombreCliente')?.value.trim();
    const selModelo = document.getElementById('selModelo');
    const selTalla = document.getElementById('selTalla');
    const selColor = document.getElementById('selColor');
    const cantidad = Number(document.getElementById('inpCantidad')?.value || 0);

    // Validación mínima:
    if (!nombre || !selModelo?.value || !selTalla?.value || !selColor?.value || cantidad < 1) {
      alert('Completa nombre, modelo, talla, color y cantidad (mínimo 1).');
      return;
    }

    // 2) Precios base
    const optModelo = selModelo.options[selModelo.selectedIndex];
    const precioModelo = getPrecioFromDataset(optModelo); 
    let total = precioModelo * cantidad;

    // 3) Extras / personalización
    const chkNombreNumero = document.getElementById('chkNombreNumero');
    const chkParcheLiga = document.getElementById('chkParcheLiga');

    const extrasSeleccionados = [];
    if (chkNombreNumero?.checked) {
      total += getPrecioFromDataset(chkNombreNumero) * cantidad; 
      extrasSeleccionados.push('Nombre y número');
    }
    if (chkParcheLiga?.checked) {
      total += getPrecioFromDataset(chkParcheLiga) * cantidad; 
      extrasSeleccionados.push('Parche de liga');
    }

    // Campos condicionales 
    const inpNombre = document.getElementById('inpNombre')?.value.trim();
    const inpNumero = document.getElementById('inpNumero')?.value.trim();

    // 4) Envío e instrucciones
    const selEnvio = document.getElementById('selEnvio');
    const optEnvio = selEnvio.options[selEnvio.selectedIndex];
    const costoEnvio = getPrecioFromDataset(optEnvio);
    total += costoEnvio;

    const txtInstr = document.getElementById('txtInstrucciones')?.value.trim();

    // 5) Pintamos resumen
    outNombre.textContent = nombre;

    // Lista HTML del pedido (Uso de Optional Chaining '?' y Nullish Coalescing '||' simplificado)
    outLista.innerHTML = `
      <li><strong>Modelo:</strong> ${selModelo.value} — ${toMXN(precioModelo)} c/u × ${cantidad}</li>
      <li><strong>Talla:</strong> ${selTalla.value}</li>
      <li><strong>Color:</strong> ${selColor.value}</li>
      <li><strong>Extras:</strong> ${extrasSeleccionados.length ? extrasSeleccionados.join(', ') : 'Ninguno'}</li>
      ${inpNombre || inpNumero ? `<li><strong>Personalización:</strong> ${inpNombre ? 'Nombre: ' + inpNombre : ''} ${inpNumero ? ' | Número: ' + inpNumero : ''}</li>` : ''}
      <li><strong>Envío:</strong> ${selEnvio.value} — ${toMXN(costoEnvio)}</li>
      ${txtInstr ? `<li><strong>Instrucciones:</strong> ${txtInstr}</li>` : ''}
    `;

    outTotal.textContent = toMXN(total);

    // Habilitamos confirmar y pasamos nombre al modal
    if (btnConfirmar && confirmNombre) {
        btnConfirmar.disabled = false;
        confirmNombre.textContent = nombre;
    }
  });

  // Reset: limpiar también el resumen
  form?.addEventListener('reset', () => {
    setTimeout(() => {
      outNombre.textContent = '—';
      outLista.innerHTML = '<li class="text-muted">Aún no has generado tu pedido.</li>';
      outTotal.textContent = '$0';
      btnConfirmar.disabled = true;
    }, 0);
  });
}

/** Configura las actividades DOM (Banner, Testimonios, Contacto) */
function setupDOMLogic() {
  // -------- Actividad 1: Banner con getElementById --------
  const banner = document.getElementById('banner');
  const btnPromo = document.getElementById('btnPromo');

  btnPromo?.addEventListener('click', () => {
    // Limpio y aplico fondo azul primario (más adecuado para el tema Perfumería Deluxe)
    banner.classList.remove('bg-dark', 'bg-primary', 'bg-success', 'bg-info', 'bg-danger', 'bg-warning');
    banner.classList.add('bg-primary');
    banner.classList.remove('text-dark');
    banner.classList.add('text-white');
  });

  // -------- Actividad 2: Testimonios --------
  // 2.1 VIP en azul (text-primary) usando getElementsByClassName
  const vipItems = document.getElementsByClassName('testimonio-vip');
  // Usamos Array.from y forEach para mayor compatibilidad con NodeList
  Array.from(vipItems).forEach(item => {
      item.classList.add('text-primary'); 
  });

  // 2.2 TODOS los párrafos en ROJO se cambia a color **muted** para la nueva estética
  const allParagraphs = document.getElementsByTagName('p');
  // Reemplazamos 'text-danger' por 'text-muted' (más acorde a la estética oscura)
  Array.from(allParagraphs).forEach(p => {
    p.classList.remove('text-danger');
    p.classList.add('text-muted'); // Color gris suave de Bootstrap
  });

  // -------- Actividad 3: Formulario de contacto --------
  // 3.1 Primer input de texto con querySelector
  const firstTextInput = document.querySelector('#formContacto input[type="text"]');
  firstTextInput?.classList.add('bg-secondary', 'bg-opacity-10'); // Fondo gris suave

  // 3.2 Todos los botones del formulario a btn-secondary
  const contactoButtons = document.querySelectorAll('#formContacto button');
  contactoButtons.forEach(btn => {
    btn.classList.remove('btn-primary', 'btn-danger', 'btn-outline-secondary');
    btn.classList.add('btn-secondary'); // Se usa un color secundario más neutro
  });

  // 3.3 Campo "nombre" via getElementsByName -> color de texto text-light
  const nombreInputs = document.getElementsByName('nombre');
  if (nombreInputs.length > 0) {
    const nombreInput = nombreInputs[0];
    nombreInput.classList.remove('text-warning');
    nombreInput.classList.add('text-light'); 
    
    // Opcional: también pinto el <label> asociado
    const label = document.querySelector('label[for="cNombre"]');
    label?.classList.remove('text-warning');
    label?.classList.add('text-light');
  }
}

// Ejecución de la lógica al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    setupFormLogic();
    setupDOMLogic();
});
// ===================== /app.js - MEJORADO ======================