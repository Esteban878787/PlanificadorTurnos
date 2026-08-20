"use strict";

// =======================================
// FILTRAR EMPLEADOS
// =======================================

function obtenerEmpleadosFiltrados() {

    let resultado = Array.isArray(empleados)
        ? [...empleados]
        : [];

    // =======================================
    // FILTRO POR NOMBRE
    // =======================================

    if (
        Array.isArray(filtroEmpleado) &&
        filtroEmpleado.length > 0
    ) {

        resultado = resultado.filter(emp => {

            const nombreEmpleado =
                String(emp.nombre ?? "")
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

    // =======================================
    // CHECKS M / T / N
    // =======================================

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
        return resultado;
    }

    const mananaActivo =
        filtroManana.checked;

    const tardeActivo =
        filtroTarde.checked;

    const nocheActivo =
        filtroNoche.checked;

    // =======================================
    // NINGÚN TURNO SELECCIONADO
    // =======================================

    if (
        !mananaActivo &&
        !tardeActivo &&
        !nocheActivo
    ) {
        return [];
    }

    // =======================================
    // RANGO
    // =======================================

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

    // =======================================
    // MES
    // =======================================

    const selectMes =
        document.getElementById("meses");

    const mesActual =
        selectMes && selectMes.value
            ? Number(selectMes.value)
            : mesSeleccionado;

    mesSeleccionado = mesActual;

    // =======================================
    // DÍAS DEL RANGO
    // =======================================

    const diasDelRango =
        Array.isArray(dias)
            ? dias.filter(dia =>
                Number(dia.mes) === mesActual &&
                Number(dia.dia) >= diaDesde &&
                Number(dia.dia) <= diaHasta
            )
            : [];

    // =======================================
    // FILTRAR EMPLEADOS
    // =======================================

    resultado = resultado.filter(emp => {

        if (!Array.isArray(emp.turnos)) {
            return false;
        }

        return diasDelRango.some(dia => {

            const indice =
                dias.indexOf(dia);

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


// =======================================
// PINTAR TABLA COMPLETA
// =======================================

function renderTabla() {

    const selectMes =
        document.getElementById("meses");

    const mesActual =
        selectMes && selectMes.value
            ? Number(selectMes.value)
            : mesSeleccionado;

    mesSeleccionado =
        mesActual;

    // =======================================
    // RANGO
    // =======================================

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

    // =======================================
    // DÍAS DEL MES
    // =======================================

    const diasMes =
        Array.isArray(dias)
            ? dias.filter(d =>
                Number(d.mes) === mesActual &&
                Number(d.dia) >= diaDesde &&
                Number(d.dia) <= diaHasta
            )
            : [];

    const thead =
        document.getElementById("thead");

    const tbody =
        document.getElementById("tbody");

    if (!thead || !tbody) {
        return;
    }

    thead.innerHTML = "";
    tbody.innerHTML = "";

    // =======================================
    // SIN EMPLEADOS
    // =======================================

    if (
        !Array.isArray(empleados) ||
        empleados.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td>No hay datos cargados.</td>
            </tr>
        `;

        return;
    }

    // =======================================
    // CREAR TABLA
    // =======================================

    crearCabecera(diasMes);

    crearFilas(diasMes);

}


// =======================================
// COMPROBAR TURNO VISIBLE
// =======================================

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

    return true;
}


// =======================================
// CONVERTIR FECHA FESTIVO
// =======================================

function convertirFechaFestivo(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    // =======================================
    // YA ES DATE
    // =======================================

    if (valor instanceof Date) {

        if (isNaN(valor.getTime())) {
            return null;
        }

        return new Date(
            valor.getFullYear(),
            valor.getMonth(),
            valor.getDate()
        );

    }

    // =======================================
    // NÚMERO EXCEL
    // =======================================

    if (typeof valor === "number") {

        if (
            typeof XLSX !== "undefined" &&
            XLSX.SSF
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

    }

    // =======================================
    // TEXTO
    // =======================================

    if (typeof valor === "string") {

        const texto =
            valor.trim();

        // DD/MM/YYYY
        const partes =
            texto.match(
                /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
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

        // YYYY-MM-DD
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

    }

    return null;
}


// =======================================
// COMPROBAR SI UNA FECHA ES FESTIVA
//
// IMPORTANTE:
// leerFestivos() YA convierte los datos
// de Excel en:
//
// {
//   dia: 1,
//   mes: 1,
//   anio: 2026,
//   fecha: Date
// }
//
// Por eso aquí NO buscamos festivo[1].
// =======================================

function esFechaFestiva(fecha) {

    if (
        !(fecha instanceof Date) ||
        isNaN(fecha.getTime())
    ) {
        return false;
    }

    // =======================================
    // SOLO AÑO 2026
    // =======================================

    if (
        fecha.getFullYear() !== 2026
    ) {
        return false;
    }

    if (
        !Array.isArray(festivos)
    ) {
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

        // ===================================
        // FORMATO QUE GENERA leerFestivos()
        // ===================================

        if (
            Number(festivo.dia) === dia &&
            Number(festivo.mes) === mes &&
            Number(festivo.anio) === anio
        ) {
            return true;
        }

        // ===================================
        // POR SI ALGÚN FESTIVO VIENE CON FECHA
        // ===================================

        const fechaFestivo =
            convertirFechaFestivo(
                festivo.fecha ??
                festivo.Fecha ??
                festivo.FECHA
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
// =======================================
// CREAR CABECERA
// =======================================

function crearCabecera(diasMes) {

    const thead = document.getElementById("thead");

    if (!thead) {
        console.error("❌ No existe #thead");
        return;
    }

    const filaSemana = document.createElement("tr");
    const filaDias = document.createElement("tr");

    // =======================================
    // PRIMERA CELDA
    // =======================================

    const thVacio = document.createElement("th");
    thVacio.textContent = "";
    filaSemana.appendChild(thVacio);

    const thEmpleado = document.createElement("th");
    thEmpleado.textContent = "Empleado";
    filaDias.appendChild(thEmpleado);

    // =======================================
    // DÍAS DE LA SEMANA
    // =======================================

    const diasSemana = [
        "D",
        "L",
        "M",
        "X",
        "J",
        "V",
        "S"
    ];

    // =======================================
    // CREAR CADA DÍA
    // =======================================

    diasMes.forEach(dia => {

        const fecha = dia.fecha instanceof Date
            ? dia.fecha
            : new Date(dia.fecha);

        if (isNaN(fecha.getTime())) {
            console.error("❌ Fecha inválida:", dia);
            return;
        }

        // ===================================
        // COMPROBAR FESTIVO
        // ===================================

        const diaNumero = fecha.getDate();
        const mesNumero = fecha.getMonth() + 1;
        const anioNumero = fecha.getFullYear();

        const esFestivo =
            Array.isArray(festivos) &&
            festivos.some(festivo => {

                return (
                    Number(festivo.dia) === diaNumero &&
                    Number(festivo.mes) === mesNumero &&
                    Number(festivo.anio) === anioNumero
                );

            });

        console.log(
            "DÍA:",
            diaNumero,
            "/",
            mesNumero,
            "/",
            anioNumero,
            "→ FESTIVO:",
            esFestivo
        );

        // ===================================
        // COLUMNA DÍA DE LA SEMANA
        // ===================================

        const thSemana = document.createElement("th");

        thSemana.textContent =
            diasSemana[fecha.getDay()];

        if (esFestivo) {
            thSemana.classList.add("dia-festivo");
            thSemana.title = "DÍA FESTIVO";
        }

        filaSemana.appendChild(thSemana);

        // ===================================
        // COLUMNA NÚMERO DEL DÍA
        // ===================================

        const thDia = document.createElement("th");

        thDia.textContent = diaNumero;

        if (esFestivo) {
            thDia.classList.add("dia-festivo");
            thDia.title = "DÍA FESTIVO";
        }

        filaDias.appendChild(thDia);

    });

    // =======================================
    // AÑADIR CABECERA
    // =======================================

    thead.appendChild(filaSemana);
    thead.appendChild(filaDias);
}

// =======================================
// CREAR FILAS DE EMPLEADOS
// =======================================

function crearFilas(diasMes) {

    const tbody =
        document.getElementById("tbody");

    if (!tbody) {
        return;
    }

    const empleadosFiltrados =
        obtenerEmpleadosFiltrados();

    empleadosFiltrados.forEach(emp => {

        const tr =
            document.createElement("tr");

        // ===================================
        // NOMBRE
        // ===================================

        const tdNombre =
            document.createElement("td");

        tdNombre.textContent =
            emp.nombre ?? "";

        tr.appendChild(
            tdNombre
        );

        // ===================================
        // DÍAS
        // ===================================

        diasMes.forEach(dia => {

            const indice =
                dias.indexOf(dia);

            const turno =
                Array.isArray(emp.turnos)
                    ? emp.turnos[indice]
                    : "";

            const td =
                document.createElement("td");

            const valor =
                String(turno ?? "")
                    .trim()
                    .toUpperCase();

            // ===================================
            // MOSTRAR / OCULTAR TURNO
            // ===================================

            if (turnoVisible(turno)) {

                td.textContent =
                    turno ?? "";

            } else {

                td.textContent =
                    "";

            }

            // ===================================
            // COLORES TURNOS
            // ===================================

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

            // ===================================
            // SI ES FESTIVO
            //
            // NO CAMBIAMOS EL COLOR DEL TURNO.
            // Solo añadimos una clase para poder
            // marcar la columna.
            // ===================================

            const fecha =
                dia.fecha instanceof Date
                    ? dia.fecha
                    : convertirFechaFestivo(
                        dia.fecha
                    );

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

    crearFilaTotales(
        diasMes,
        empleadosFiltrados
    );

}


// =======================================
// TOTALES M / T / N
// =======================================

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

        // ===================================
        // TÍTULO
        // ===================================

        const tdTitulo =
            document.createElement("td");

        tdTitulo.textContent =
            "Total " + turnoBuscado;

        tdTitulo.style.fontWeight =
            "bold";

        tr.appendChild(
            tdTitulo
        );

        // ===================================
        // CONTAR
        // ===================================

        diasMes.forEach(dia => {

            const indiceDia =
                dias.indexOf(dia);

            let contador = 0;

            empleadosFiltrados.forEach(emp => {

                const turno =
                    String(
                        emp.turnos?.[indiceDia] ?? ""
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

            // ===================================
            // FESTIVO EN TOTALES
            // ===================================

            const fecha =
                dia.fecha instanceof Date
                    ? dia.fecha
                    : convertirFechaFestivo(
                        dia.fecha
                    );

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


// =======================================
// ACTUALIZAR TABLA
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ===================================
        // FILTROS M / T / N
        // ===================================

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

                }
            );

        });

        // ===================================
        // CAMBIO DE MES
        // ===================================

        const selectMes =
            document.getElementById("meses");

        if (selectMes) {

            selectMes.addEventListener(
                "change",
                () => {

                    renderTabla();

                }
            );

        }

        // ===================================
        // CAMBIO DESDE
        // ===================================

        const elementoDesde =
            document.getElementById("diaDesde");

        if (elementoDesde) {

            elementoDesde.addEventListener(
                "change",
                () => {

                    renderTabla();

                }
            );

        }

        // ===================================
        // CAMBIO HASTA
        // ===================================

        const elementoHasta =
            document.getElementById("diaHasta");

        if (elementoHasta) {

            elementoHasta.addEventListener(
                "change",
                () => {

                    renderTabla();

                }
            );

        }

    }
);
