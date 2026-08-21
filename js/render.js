"use strict";

/* =========================================================
   FILTRAR EMPLEADOS
   ========================================================= */

function obtenerEmpleadosFiltrados() {

    let resultado = Array.isArray(empleados)
        ? [...empleados]
        : [];

    /* =====================================================
       FILTRO POR NOMBRE
       ===================================================== */

    if (
        Array.isArray(filtroEmpleado) &&
        filtroEmpleado.length > 0
    ) {

        resultado = resultado.filter(emp => {

            const nombreEmpleado =
                String(emp?.nombre ?? "")
                    .trim()
                    .toUpperCase();

            return filtroEmpleado.some(nombreBuscado => {

                const buscado =
                    String(nombreBuscado ?? "")
                        .trim()
                        .toUpperCase();

                return (
                    buscado.length > 0 &&
                    nombreEmpleado.includes(buscado)
                );

            });

        });

    }

    /* =====================================================
       CHECKBOXES M / T / N
       ===================================================== */

    const filtroManana =
        document.getElementById("filtroManana");

    const filtroTarde =
        document.getElementById("filtroTarde");

    const filtroNoche =
        document.getElementById("filtroNoche");

    /*
       Si los filtros no existen todavía,
       devolvemos los empleados.
    */

    if (
        !filtroManana ||
        !filtroTarde ||
        !filtroNoche
    ) {
        return resultado;
    }

    const mananaActivo =
        filtroManana.checked;

    const tardeActivo =
        filtroTarde.checked;

    const nocheActivo =
        filtroNoche.checked;

    /* =====================================================
       NINGÚN TURNO SELECCIONADO
       ===================================================== */

    if (
        !mananaActivo &&
        !tardeActivo &&
        !nocheActivo
    ) {
        return [];
    }

    /* =====================================================
       RANGO DE DÍAS
       ===================================================== */

    const elementoDesde =
        document.getElementById("diaDesde");

    const elementoHasta =
        document.getElementById("diaHasta");

    let diaDesde =
        elementoDesde
            ? Number(elementoDesde.value)
            : 1;

    let diaHasta =
        elementoHasta
            ? Number(elementoHasta.value)
            : 31;

    if (
        !Number.isFinite(diaDesde) ||
        diaDesde < 1
    ) {
        diaDesde = 1;
    }

    if (
        !Number.isFinite(diaHasta) ||
        diaHasta < diaDesde
    ) {
        diaHasta = 31;
    }

    /* =====================================================
       MES
       ===================================================== */

    const selectMes =
        document.getElementById("meses");

    let mesActual =
        selectMes &&
        selectMes.value !== ""
            ? Number(selectMes.value)
            : Number(mesSeleccionado);

    if (
        !Number.isFinite(mesActual) ||
        mesActual < 1 ||
        mesActual > 12
    ) {
        mesActual = 1;
    }

    mesSeleccionado = mesActual;

    /* =====================================================
       DÍAS DEL RANGO
       ===================================================== */

    const diasDelRango =
        Array.isArray(dias)
            ? dias.filter(dia => {

                return (
                    Number(dia?.mes) === mesActual &&
                    Number(dia?.dia) >= diaDesde &&
                    Number(dia?.dia) <= diaHasta
                );

            })
            : [];

    /* =====================================================
       FILTRAR EMPLEADOS
       ===================================================== */

    resultado = resultado.filter(emp => {

        if (!Array.isArray(emp?.turnos)) {
            return false;
        }

        return diasDelRango.some(dia => {

            const indice =
                dias.indexOf(dia);

            if (indice < 0) {
                return false;
            }

            const turno =
                String(
                    emp.turnos[indice] ?? ""
                )
                    .trim()
                    .toUpperCase();

            if (
                turno === "M" &&
                mananaActivo
            ) {
                return true;
            }

            if (
                turno === "T" &&
                tardeActivo
            ) {
                return true;
            }

            if (
                turno === "N" &&
                nocheActivo
            ) {
                return true;
            }

            return false;

        });

    });

    return resultado;
}


/* =========================================================
   OBTENER FECHA DE UN DÍA
   ========================================================= */

function obtenerFechaDia(dia) {

    if (!dia) {
        return null;
    }

    if (dia.fecha instanceof Date) {

        if (
            isNaN(
                dia.fecha.getTime()
            )
        ) {
            return null;
        }

        return new Date(
            dia.fecha.getFullYear(),
            dia.fecha.getMonth(),
            dia.fecha.getDate()
        );
    }

    if (
        dia.fecha !== undefined &&
        dia.fecha !== null
    ) {

        return convertirFechaFestivo(
            dia.fecha
        );
    }

    /*
       Por si el objeto dia no tiene fecha
       pero sí día, mes y año.
    */

    const diaNumero =
        Number(dia.dia);

    const mesNumero =
        Number(dia.mes);

    const anioNumero =
        Number(
            dia.anio ??
            dia.año ??
            2026
        );

    if (
        Number.isFinite(diaNumero) &&
        Number.isFinite(mesNumero) &&
        Number.isFinite(anioNumero)
    ) {

        const fecha =
            new Date(
                anioNumero,
                mesNumero - 1,
                diaNumero
            );

        if (
            fecha.getFullYear() === anioNumero &&
            fecha.getMonth() === mesNumero - 1 &&
            fecha.getDate() === diaNumero
        ) {
            return fecha;
        }
    }

    return null;
}


/* =========================================================
   PINTAR TABLA COMPLETA
   ========================================================= */

function renderTabla() {

    const thead =
        document.getElementById("thead");

    const tbody =
        document.getElementById("tbody");

    if (!thead || !tbody) {
        return;
    }

    /* =====================================================
       MES
       ===================================================== */

    const selectMes =
        document.getElementById("meses");

    let mesActual =
        selectMes &&
        selectMes.value !== ""
            ? Number(selectMes.value)
            : Number(mesSeleccionado);

    if (
        !Number.isFinite(mesActual) ||
        mesActual < 1 ||
        mesActual > 12
    ) {
        mesActual = 1;
    }

    mesSeleccionado = mesActual;

    /* =====================================================
       RANGO
       ===================================================== */

    const elementoDesde =
        document.getElementById("diaDesde");

    const elementoHasta =
        document.getElementById("diaHasta");

    let diaDesde =
        elementoDesde
            ? Number(elementoDesde.value)
            : 1;

    let diaHasta =
        elementoHasta
            ? Number(elementoHasta.value)
            : 31;

    if (
        !Number.isFinite(diaDesde) ||
        diaDesde < 1
    ) {
        diaDesde = 1;
    }

    if (
        !Number.isFinite(diaHasta) ||
        diaHasta < diaDesde
    ) {
        diaHasta = 31;
    }

    /* =====================================================
       DÍAS DEL MES
       ===================================================== */

    const diasMes =
        Array.isArray(dias)
            ? dias.filter(d => {

                return (
                    Number(d?.mes) === mesActual &&
                    Number(d?.dia) >= diaDesde &&
                    Number(d?.dia) <= diaHasta
                );

            })
            : [];

    /* =====================================================
       LIMPIAR
       ===================================================== */

    thead.innerHTML = "";
    tbody.innerHTML = "";

    /* =====================================================
       SIN EMPLEADOS
       ===================================================== */

    if (
        !Array.isArray(empleados) ||
        empleados.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="100%">
                    No hay datos cargados.
                </td>
            </tr>
        `;

        return;
    }

    /* =====================================================
       CREAR TABLA
       ===================================================== */

    crearCabecera(diasMes);
    crearFilas(diasMes);
}


/* =========================================================
   COMPROBAR TURNO VISIBLE
   ========================================================= */

function turnoVisible(turno) {

    const valor =
        String(turno ?? "")
            .trim()
            .toUpperCase();

    const filtroManana =
        document.getElementById("filtroManana");

    const filtroTarde =
        document.getElementById("filtroTarde");

    const filtroNoche =
        document.getElementById("filtroNoche");

    if (
        !filtroManana ||
        !filtroTarde ||
        !filtroNoche
    ) {
        return true;
    }

    if (valor === "M") {
        return filtroManana.checked;
    }

    if (valor === "T") {
        return filtroTarde.checked;
    }

    if (valor === "N") {
        return filtroNoche.checked;
    }

    /*
       V, L, LPA, BAJA, etc.
       siguen siendo visibles.
    */

    return true;
}


/* =========================================================
   CONVERTIR FECHA FESTIVO
   ========================================================= */

function convertirFechaFestivo(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    /* =====================================================
       YA ES DATE
       ===================================================== */

    if (valor instanceof Date) {

        if (
            isNaN(
                valor.getTime()
            )
        ) {
            return null;
        }

        return new Date(
            valor.getFullYear(),
            valor.getMonth(),
            valor.getDate()
        );
    }

    /* =====================================================
       NÚMERO EXCEL
       ===================================================== */

    if (typeof valor === "number") {

        if (
            typeof XLSX !== "undefined" &&
            XLSX.SSF &&
            typeof XLSX.SSF.parse_date_code === "function"
        ) {

            const fechaExcel =
                XLSX.SSF.parse_date_code(valor);

            if (fechaExcel) {

                return new Date(
                    fechaExcel.y,
                    fechaExcel.m - 1,
                    fechaExcel.d
                );
            }
        }

        /*
           Si no está disponible XLSX,
           intentamos convertir el número
           como timestamp solo si parece uno.
        */

        const fechaTimestamp =
            new Date(valor);

        if (
            !isNaN(
                fechaTimestamp.getTime()
            )
        ) {
            return new Date(
                fechaTimestamp.getFullYear(),
                fechaTimestamp.getMonth(),
                fechaTimestamp.getDate()
            );
        }
    }

    /* =====================================================
       TEXTO
       ===================================================== */

    if (typeof valor === "string") {

        const texto =
            valor.trim();

        /* =================================================
           DD/MM/YYYY
           DD-MM-YYYY
           ================================================= */

        const partes =
            texto.match(
                /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
            );

        if (partes) {

            const dia =
                Number(partes[1]);

            const mes =
                Number(partes[2]);

            const anio =
                Number(partes[3]);

            const fecha =
                new Date(
                    anio,
                    mes - 1,
                    dia
                );

            if (
                fecha.getFullYear() === anio &&
                fecha.getMonth() === mes - 1 &&
                fecha.getDate() === dia
            ) {
                return fecha;
            }
        }

        /* =================================================
           YYYY-MM-DD
           ================================================= */

        const partesISO =
            texto.match(
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/
            );

        if (partesISO) {

            const anio =
                Number(partesISO[1]);

            const mes =
                Number(partesISO[2]);

            const dia =
                Number(partesISO[3]);

            const fecha =
                new Date(
                    anio,
                    mes - 1,
                    dia
                );

            if (
                fecha.getFullYear() === anio &&
                fecha.getMonth() === mes - 1 &&
                fecha.getDate() === dia
            ) {
                return fecha;
            }
        }

        /*
           Último intento con Date().
        */

        const fechaGenerica =
            new Date(texto);

        if (
            !isNaN(
                fechaGenerica.getTime()
            )
        ) {

            return new Date(
                fechaGenerica.getFullYear(),
                fechaGenerica.getMonth(),
                fechaGenerica.getDate()
            );
        }
    }

    return null;
}


/* =========================================================
   COMPROBAR SI UNA FECHA ES FESTIVA
   ========================================================= */

function esFechaFestiva(fecha) {

    if (
        !(fecha instanceof Date) ||
        isNaN(fecha.getTime())
    ) {
        return false;
    }

    if (!Array.isArray(festivos)) {
        return false;
    }

    const dia =
        fecha.getDate();

    const mes =
        fecha.getMonth() + 1;

    const anio =
        fecha.getFullYear();

    return festivos.some(festivo => {

        if (!festivo) {
            return false;
        }

        /* =================================================
           FORMATO:
           {
               dia: 1,
               mes: 1,
               anio: 2026,
               fecha: Date
           }
           ================================================= */

        if (
            Number(festivo.dia) === dia &&
            Number(festivo.mes) === mes &&
            Number(festivo.anio) === anio
        ) {
            return true;
        }

        /* =================================================
           POR SI VIENE SOLO LA FECHA
           ================================================= */

        const valorFecha =
            festivo.fecha ??
            festivo.Fecha ??
            festivo.FECHA;

        const fechaFestivo =
            convertirFechaFestivo(
                valorFecha
            );

        if (!fechaFestivo) {
            return false;
        }

        return (
            fechaFestivo.getFullYear() === anio &&
            fechaFestivo.getMonth() + 1 === mes &&
            fechaFestivo.getDate() === dia
        );
    });
}


/* =========================================================
   CREAR CABECERA
   ========================================================= */

function crearCabecera(diasMes) {

    const thead =
        document.getElementById("thead");

    if (!thead) {
        console.error(
            "❌ No existe #thead"
        );
        return;
    }

    const filaSemana =
        document.createElement("tr");

    const filaDias =
        document.createElement("tr");

    /* =====================================================
       PRIMERA CELDA
       ===================================================== */

    const thVacio =
        document.createElement("th");

    thVacio.textContent = "";

    filaSemana.appendChild(
        thVacio
    );

    const thEmpleado =
        document.createElement("th");

    thEmpleado.textContent =
        "Empleado";

    filaDias.appendChild(
        thEmpleado
    );

    /* =====================================================
       DÍAS DE LA SEMANA
       ===================================================== */

    const diasSemana = [
        "D",
        "L",
        "M",
        "X",
        "J",
        "V",
        "S"
    ];

    /* =====================================================
       CREAR DÍAS
       ===================================================== */

    diasMes.forEach(dia => {

        const fecha =
            obtenerFechaDia(dia);

        if (!fecha) {

            console.error(
                "❌ Fecha inválida:",
                dia
            );

            return;
        }

        const diaNumero =
            fecha.getDate();

        const esFestivo =
            esFechaFestiva(fecha);

        /* ===============================================
           DÍA SEMANA
           =============================================== */

        const thSemana =
            document.createElement("th");

        thSemana.textContent =
            diasSemana[
                fecha.getDay()
            ];

        if (esFestivo) {

            thSemana.classList.add(
                "dia-festivo"
            );

            thSemana.title =
                "DÍA FESTIVO";
        }

        filaSemana.appendChild(
            thSemana
        );

        /* ===============================================
           NÚMERO DÍA
           =============================================== */

        const thDia =
            document.createElement("th");

        thDia.textContent =
            diaNumero;

        if (esFestivo) {

            thDia.classList.add(
                "dia-festivo"
            );

            thDia.title =
                "DÍA FESTIVO";
        }

        filaDias.appendChild(
            thDia
        );
    });

    /* =====================================================
       AÑADIR
       ===================================================== */

    thead.appendChild(
        filaSemana
    );

    thead.appendChild(
        filaDias
    );
}


/* =========================================================
   CREAR FILAS DE EMPLEADOS
   ========================================================= */

function crearFilas(diasMes) {

    const tbody =
        document.getElementById("tbody");

    if (!tbody) {
        return;
    }

    const empleadosFiltrados =
        obtenerEmpleadosFiltrados();

    /* =====================================================
       EMPLEADOS
       ===================================================== */

    empleadosFiltrados.forEach(emp => {

        const tr =
            document.createElement("tr");

        /* =================================================
           NOMBRE
           ================================================= */

        const tdNombre =
            document.createElement("td");

        tdNombre.textContent =
            emp?.nombre ?? "";

        tr.appendChild(
            tdNombre
        );

        /* =================================================
           DÍAS
           ================================================= */

        diasMes.forEach(dia => {

            const indice =
                dias.indexOf(dia);

            let turno = "";

            if (
                Array.isArray(emp?.turnos) &&
                indice >= 0
            ) {
                turno =
                    emp.turnos[indice] ?? "";
            }

            const td =
                document.createElement("td");

            const valor =
                String(turno ?? "")
                    .trim()
                    .toUpperCase();

            /* =============================================
               MOSTRAR / OCULTAR
               ============================================= */

            if (
                turnoVisible(turno)
            ) {
                td.textContent =
                    turno ?? "";
            } else {
                td.textContent =
                    "";
            }

            /* =============================================
               COLORES TURNOS
               ============================================= */

            switch (valor) {

                case "M":

                    td.classList.add(
                        "turno-M"
                    );

                    break;

                case "T":

                    td.classList.add(
                        "turno-T"
                    );

                    break;

                case "N":

                    td.classList.add(
                        "turno-N"
                    );

                    break;

                case "V":
                case "-(V)":

                    td.classList.add(
                        "turno-V"
                    );

                    break;

                case "L":

                    td.classList.add(
                        "turno-L"
                    );

                    break;

                case "LPA":

                    td.classList.add(
                        "turno-LPA"
                    );

                    break;

                case "BAJA":

                    td.classList.add(
                        "turno-BAJA"
                    );

                    break;
            }

            /* =============================================
               FESTIVO
               ============================================= */

            const fecha =
                obtenerFechaDia(dia);

            if (
                fecha &&
                esFechaFestiva(fecha)
            ) {

                td.classList.add(
                    "celda-festiva"
                );
            }

            tr.appendChild(
                td
            );
        });

        tbody.appendChild(
            tr
        );
    });

    /* =====================================================
       TOTALES
       ===================================================== */

    crearFilaTotales(
        diasMes,
        empleadosFiltrados
    );
}


/* =========================================================
   TOTALES M / T / N
   ========================================================= */

function crearFilaTotales(
    diasMes,
    empleadosFiltrados
) {

    const tbody =
        document.getElementById("tbody");

    if (!tbody) {
        return;
    }

    const turnos = [
        "M",
        "T",
        "N"
    ];

    turnos.forEach(turnoBuscado => {

        const tr =
            document.createElement("tr");

        tr.classList.add(
            "fila-total"
        );

        /* =================================================
           TÍTULO
           ================================================= */

        const tdTitulo =
            document.createElement("td");

        tdTitulo.textContent =
            "Total " + turnoBuscado;

        tdTitulo.style.fontWeight =
            "bold";

        tr.appendChild(
            tdTitulo
        );

        /* =================================================
           CONTAR CADA DÍA
           ================================================= */

        diasMes.forEach(dia => {

            const indiceDia =
                dias.indexOf(dia);

            let contador = 0;

            empleadosFiltrados.forEach(emp => {

                const turno =
                    String(
                        emp?.turnos?.[indiceDia] ?? ""
                    )
                        .trim()
                        .toUpperCase();

                if (
                    turno === turnoBuscado
                ) {
                    contador++;
                }
            });

            const td =
                document.createElement("td");

            td.textContent =
                contador;

            td.classList.add(
                "total-" + turnoBuscado
            );

            /* =============================================
               FESTIVO
               ============================================= */

            const fecha =
                obtenerFechaDia(dia);

            if (
                fecha &&
                esFechaFestiva(fecha)
            ) {

                td.classList.add(
                    "celda-festiva-total"
                );
            }

            tr.appendChild(
                td
            );
        });

        tbody.appendChild(
            tr
        );
    });
}


/* =========================================================
   AVISO DE FALTA DE PERSONAL
   ========================================================= */

function comprobarFaltaPersonal() {

    const aviso =
        document.getElementById(
            "avisoPersonal"
        );

    const contenido =
        document.getElementById(
            "contenidoAvisoPersonal"
        );

    if (
        !aviso ||
        !contenido
    ) {
        return;
    }

    /* =====================================================
       REINICIAR
       ===================================================== */

    const faltas = [];

    /* =====================================================
       MES
       ===================================================== */

    const selectMes =
        document.getElementById("meses");

    let mesActual =
        selectMes &&
        selectMes.value !== ""
            ? Number(selectMes.value)
            : Number(mesSeleccionado);

    if (
        !Number.isFinite(mesActual)
    ) {
        mesActual = 1;
    }

    /* =====================================================
       RANGO
       ===================================================== */

    const elementoDesde =
        document.getElementById("diaDesde");

    const elementoHasta =
        document.getElementById("diaHasta");

    let diaDesde =
        elementoDesde
            ? Number(elementoDesde.value)
            : 1;

    let diaHasta =
        elementoHasta
            ? Number(elementoHasta.value)
            : 31;

    if (
        !Number.isFinite(diaDesde) ||
        diaDesde < 1
    ) {
        diaDesde = 1;
    }

    if (
        !Number.isFinite(diaHasta) ||
        diaHasta < diaDesde
    ) {
        diaHasta = 31;
    }

    /* =====================================================
       HOY
       ===================================================== */

    const hoy =
        new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    /* =====================================================
       DÍAS A COMPROBAR
       SOLO HOY Y FUTURO
       ===================================================== */

    const diasComprobar =
        Array.isArray(dias)
            ? dias.filter(dia => {

                const fecha =
                    obtenerFechaDia(dia);

                if (!fecha) {
                    return false;
                }

                fecha.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    Number(dia?.mes) === mesActual &&
                    Number(dia?.dia) >= diaDesde &&
                    Number(dia?.dia) <= diaHasta &&
                    fecha >= hoy
                );

            })
            : [];

    /* =====================================================
       COMPROBAR CADA DÍA
       ===================================================== */

    diasComprobar.forEach(dia => {

        const indiceDia =
            dias.indexOf(dia);

        if (indiceDia < 0) {
            return;
        }

        const fecha =
            obtenerFechaDia(dia);

        if (!fecha) {
            return;
        }

        /* =================================================
           FIN DE SEMANA
           ================================================= */

        const diaSemana =
            fecha.getDay();

        const esFinDeSemana =
            diaSemana === 0 ||
            diaSemana === 6;

// =======================================
// MÍNIMOS DE PERSONAL
// =======================================

let minimoM;
let minimoT;
let minimoN;

if (diaSemana === 6) {

    // SÁBADO
    minimoM = 2;
    minimoT = 2;
    minimoN = 2;

} else if (diaSemana === 5) {

    // VIERNES
    minimoM = 10;
    minimoT = 9;
    minimoN = 2;

} else if (diaSemana === 0) {

    // DOMINGO
    minimoM = 2;
    minimoT = 2;
    minimoN = 5;

} else {

    // LUNES - JUEVES
    minimoM = 10;
    minimoT = 9;
    minimoN = 5;
}

        /* =================================================
           CONTAR
           ================================================= */

        let manana = 0;
        let tarde = 0;
        let noche = 0;

        if (
            Array.isArray(empleados)
        ) {

            empleados.forEach(emp => {

                const turno =
                    String(
                        emp?.turnos?.[indiceDia] ?? ""
                    )
                        .trim()
                        .toUpperCase();

                if (turno === "M") {
                    manana++;
                }

                if (turno === "T") {
                    tarde++;
                }

                if (turno === "N") {
                    noche++;
                }

            });
        }

        /* =================================================
           FALTAS
           ================================================= */

        /*
           IMPORTANTE:
           Los 0 NO generan aviso.
        */

        if (
            manana > 0 &&
            manana < minimoM
        ) {

            faltas.push({
                dia,
                turno: "M",
                cantidad: manana,
                minimo: minimoM
            });
        }

        if (
            tarde > 0 &&
            tarde < minimoT
        ) {

            faltas.push({
                dia,
                turno: "T",
                cantidad: tarde,
                minimo: minimoT
            });
        }

        if (
            noche > 0 &&
            noche < minimoN
        ) {

            faltas.push({
                dia,
                turno: "N",
                cantidad: noche,
                minimo: minimoN
            });
        }

    });

    /* =====================================================
       SIN FALTAS
       ===================================================== */
if (faltas.length === 0) {

    aviso.classList.remove("parpadeando");
    aviso.classList.remove("cerrado");

    aviso.dataset.aceptado = "false";

    contenido.innerHTML = "";

    return;
}

    /* =====================================================
       NOMBRES
       ===================================================== */

    const nombresTurnos = {

        M: "Mañana",

        T: "Tarde",

        N: "Noche"
    };

    const iconosTurnos = {

        M: "☀️",

        T: "🌇",

        N: "🌙"
    };

    /* =====================================================
       CREAR HTML
       ===================================================== */

    let html = "";

    faltas.forEach(falta => {

        const fecha =
            obtenerFechaDia(
                falta.dia
            );

        if (!fecha) {
            return;
        }

        const diaTexto =
            String(
                fecha.getDate()
            ).padStart(2, "0");

        const mesTexto =
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0");

        const diferencia =
            falta.minimo -
            falta.cantidad;

        html += `
            <div class="item-falta-personal">

                <span class="fecha-falta">
                    ${diaTexto}/${mesTexto}
                </span>

                <span class="turno-falta">
                    ${iconosTurnos[falta.turno]}
                    ${nombresTurnos[falta.turno]}
                </span>

                <span class="cantidad-falta">
                    ${falta.cantidad}/${falta.minimo}
                </span>

                <span class="faltan-falta">
                    faltan ${diferencia}
                </span>

            </div>
        `;
    });

    contenido.innerHTML =
        html;

// =======================================
// MOSTRAR AVISO
// =======================================

aviso.classList.remove("cerrado");

// =======================================
// PARPADEAR SI NO SE HA ACEPTADO
// =======================================

if (aviso.dataset.aceptado !== "true") {

    aviso.classList.add("parpadeando");

}

}


// =======================================
// CREAR AVISO DE FALTA DE PERSONAL
// =======================================

function crearAvisoPersonal() {

    if (document.getElementById("avisoPersonal")) {
        return;
    }

    const aviso = document.createElement("div");

    aviso.id = "avisoPersonal";

    aviso.innerHTML = `
        <!-- PESTAÑA CERRADA -->
        <button
            type="button"
            id="botonAbrirAviso"
            class="boton-abrir-aviso"
            title="Abrir aviso"
        >
            ⚠️
        </button>

        <!-- VENTANA -->
        <div class="ventana-aviso-personal">

            <div class="cabecera-aviso-personal">

                <span class="titulo-aviso-personal">
                    ⚠️ Falta de personal
                </span>

                <div class="botones-aviso">

                    <button
                        type="button"
                        id="botonAvisoPersonal"
                        class="boton-aviso-personal"
                    >
                        Aceptar
                    </button>

                    <button
                        type="button"
                        id="botonCerrarAviso"
                        class="boton-cerrar-aviso"
                        title="Cerrar"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div
                id="contenidoAvisoPersonal"
                class="contenido-aviso-personal"
            ></div>

        </div>
    `;

    document.body.appendChild(aviso);

    // =======================================
    // ACEPTAR
    // =======================================

    const botonAceptar =
        document.getElementById("botonAvisoPersonal");

    botonAceptar.addEventListener("click", () => {

        // Recordar que el usuario lo ha aceptado
        aviso.dataset.aceptado = "true";

        // PARAR PARPADEO
        aviso.classList.remove("parpadeando");
    });

    // =======================================
    // CERRAR
    // =======================================

    const botonCerrar =
        document.getElementById("botonCerrarAviso");

    botonCerrar.addEventListener("click", () => {

        aviso.classList.add("cerrado");
    });

    // =======================================
    // ABRIR
    // =======================================

    const botonAbrir =
        document.getElementById("botonAbrirAviso");

    botonAbrir.addEventListener("click", () => {

        aviso.classList.remove("cerrado");
    });
}

/* =========================================================
   EVENTOS
   ========================================================= */

function inicializarEventosTabla() {

    /* =====================================================
       FILTROS M / T / N
       ===================================================== */

    const filtros = [
        "filtroManana",
        "filtroTarde",
        "filtroNoche"
    ];

    filtros.forEach(id => {

        const checkbox =
            document.getElementById(id);

        if (!checkbox) {
            return;
        }

        checkbox.addEventListener(
            "change",
            () => {

                renderTabla();
                comprobarFaltaPersonal();

            }
        );
    });

    /* =====================================================
       MES
       ===================================================== */

    const selectMes =
        document.getElementById("meses");

    if (selectMes) {

        selectMes.addEventListener(
            "change",
            () => {

                renderTabla();
                comprobarFaltaPersonal();

            }
        );
    }

    /* =====================================================
       DESDE
       ===================================================== */

    const elementoDesde =
        document.getElementById("diaDesde");

    if (elementoDesde) {

        elementoDesde.addEventListener(
            "change",
            () => {

                renderTabla();
                comprobarFaltaPersonal();

            }
        );
    }

    /* =====================================================
       HASTA
       ===================================================== */

    const elementoHasta =
        document.getElementById("diaHasta");

    if (elementoHasta) {

        elementoHasta.addEventListener(
            "change",
            () => {

                renderTabla();
                comprobarFaltaPersonal();

            }
        );
    }
}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        crearAvisoPersonal();

        inicializarEventosTabla();

        /*
           Esperamos un poco por si los datos
           empleados / dias / festivos se cargan
           desde Excel u otro script.
        */

        setTimeout(() => {

            renderTabla();
            comprobarFaltaPersonal();

        }, 500);

    }
);
