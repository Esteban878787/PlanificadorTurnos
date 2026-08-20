"use strict";


// =======================================
// FILTRAR EMPLEADOS SOLO POR NOMBRE
// =======================================

function obtenerEmpleadosFiltrados() {

    let resultado = empleados;


    // =======================================
    // FILTRO POR NOMBRE
    // =======================================

    if (filtroEmpleado && filtroEmpleado.length > 0) {

        resultado = resultado.filter(emp => {

            const nombreEmpleado =
                String(emp.nombre)
                    .trim()
                    .toUpperCase();

            return filtroEmpleado.some(nombreBuscado =>
                nombreEmpleado.includes(
                    nombreBuscado.trim().toUpperCase()
                )
            );

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


    // Ningún turno seleccionado

    if (
        !mananaActivo &&
        !tardeActivo &&
        !nocheActivo
    ) {

        return [];

    }


    // =======================================
    // RANGO DESDE / HASTA
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


    if (!diaDesde || diaDesde < 1) {
        diaDesde = 1;
    }


    if (!diaHasta || diaHasta < diaDesde) {
        diaHasta = 31;
    }


    console.log(
        "RANGO APLICADO:",
        diaDesde,
        "→",
        diaHasta
    );


    // =======================================
    // DÍAS DEL RANGO
    // =======================================

    const diasDelRango =
        dias.filter(dia =>

            dia.mes === mesSeleccionado &&

            dia.dia >= diaDesde &&

            dia.dia <= diaHasta

        );


    console.log(
        "DÍAS DEL RANGO:",
        diasDelRango.map(d => d.dia)
    );


    // =======================================
    // FILTRAR EMPLEADOS
    // =======================================

    resultado = resultado.filter(emp => {

        return diasDelRango.some(dia => {

            const indice =
                dias.indexOf(dia);


            const turno =
                String(
                    emp.turnos[indice] ?? ""
                )
                .trim()
                .toUpperCase();


            // Mañana
            if (
                turno === "M" &&
                mananaActivo
            ) {
                return true;
            }


            // Tarde
            if (
                turno === "T" &&
                tardeActivo
            ) {
                return true;
            }


            // Noche
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
            : new Date().getMonth() + 1;

    // Guardamos también el mes global
    mesSeleccionado = mesActual;


    // =======================================
    // DÍAS DEL MES + RANGO
    // =======================================

    const elementoDesde =
        document.getElementById("diaDesde");

    const elementoHasta =
        document.getElementById("diaHasta");

    let diaDesde = elementoDesde
        ? Number(elementoDesde.value)
        : 1;

    let diaHasta = elementoHasta
        ? Number(elementoHasta.value)
        : 31;


    if (!diaDesde) {
        diaDesde = 1;
    }

    if (!diaHasta) {
        diaHasta = 31;
    }


    const diasMes =
        dias.filter(d =>
            d.mes === mesActual &&
            d.dia >= diaDesde &&
            d.dia <= diaHasta
        );


    console.log(
        "MES:",
        mesActual,
        "DESDE:",
        diaDesde,
        "HASTA:",
        diaHasta,
        "DÍAS:",
        diasMes.map(d => d.dia)
    );


    const thead =
        document.getElementById("thead");

    const tbody =
        document.getElementById("tbody");


    if (!thead || !tbody) return;


    thead.innerHTML = "";
    tbody.innerHTML = "";


    if (!empleados || empleados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td>No hay datos cargados.</td>
            </tr>
        `;

        return;
    }


    crearCabecera(diasMes);

    crearFilas(diasMes);

}


// =======================================
// COMPROBAR SI UN TURNO ESTÁ ACTIVADO
// =======================================

function turnoVisible(turno) {

    const valor =
        String(turno)
            .trim()
            .toUpperCase();


    const filtroManana =
        document.getElementById("filtroManana");

    const filtroTarde =
        document.getElementById("filtroTarde");

    const filtroNoche =
        document.getElementById("filtroNoche");


    // Si los filtros todavía no existen,
    // mostramos todo.

    if (
        !filtroManana ||
        !filtroTarde ||
        !filtroNoche
    ) {
        return true;
    }


    if (
        valor === "M" &&
        filtroManana.checked
    ) {
        return true;
    }


    if (
        valor === "T" &&
        filtroTarde.checked
    ) {
        return true;
    }


    if (
        valor === "N" &&
        filtroNoche.checked
    ) {
        return true;
    }


    // Los demás tipos de turno
    // siempre permanecen visibles.

    if (
        valor !== "M" &&
        valor !== "T" &&
        valor !== "N"
    ) {
        return true;
    }


    return false;

}


// =======================================
// CREAR CABECERA
// =======================================

function crearCabecera(diasMes) {

    const thead =
        document.getElementById("thead");


    const filaSemana =
        document.createElement("tr");

    const filaDias =
        document.createElement("tr");


    const thVacio =
        document.createElement("th");

    thVacio.textContent = "";

    filaSemana.appendChild(thVacio);


    const thEmpleado =
        document.createElement("th");

    thEmpleado.textContent =
        "Empleado";

    filaDias.appendChild(thEmpleado);


    const diasSemana = [
        "D",
        "L",
        "M",
        "X",
        "J",
        "V",
        "S"
    ];


    diasMes.forEach(dia => {

        const fecha =
            dia.fecha;


        const thSemana =
            document.createElement("th");

        thSemana.textContent =
            diasSemana[fecha.getDay()];

        filaSemana.appendChild(thSemana);


        const thDia =
            document.createElement("th");

        thDia.textContent =
            dia.dia;

        filaDias.appendChild(thDia);

    });


    thead.appendChild(filaSemana);

    thead.appendChild(filaDias);

}


// =======================================
// CREAR FILAS EMPLEADOS
// =======================================

function crearFilas(diasMes) {

    const tbody =
        document.getElementById("tbody");


    // AQUÍ SOLO SE FILTRA POR NOMBRE
    const empleadosFiltrados =
        obtenerEmpleadosFiltrados();


    empleadosFiltrados.forEach(emp => {

        const tr =
            document.createElement("tr");


        // -------------------------------
        // NOMBRE
        // -------------------------------

        const tdNombre =
            document.createElement("td");

        tdNombre.textContent =
            emp.nombre;

        tr.appendChild(tdNombre);


        // -------------------------------
        // DÍAS
        // -------------------------------

        diasMes.forEach(dia => {

            const indice =
                dias.indexOf(dia);


            const turno =
                emp.turnos[indice];


            const td =
                document.createElement("td");


            const valor =
                String(turno)
                    .trim()
                    .toUpperCase();


            // --------------------------------
            // MOSTRAR / OCULTAR M T N
            // --------------------------------

            if (turnoVisible(turno)) {

                td.textContent =
                    turno || "";

            } else {

                td.textContent =
                    "";

            }


            // --------------------------------
            // COLORES
            // --------------------------------

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


            tr.appendChild(td);

        });


        tbody.appendChild(tr);

    });


    crearFilaTotales(
        diasMes,
        empleadosFiltrados
    );

}


// =======================================
// TOTALES
// =======================================

function crearFilaTotales(
    diasMes,
    empleadosFiltrados
) {

    const tbody =
        document.getElementById("tbody");


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


        const tdTitulo =
            document.createElement("td");

        tdTitulo.textContent =
            "Total " + turnoBuscado;

        tdTitulo.style.fontWeight =
            "bold";

        tr.appendChild(tdTitulo);


        diasMes.forEach(dia => {

            const indiceDia =
                dias.indexOf(dia);


            let contador = 0;


            empleadosFiltrados.forEach(emp => {

                const turno =
                    String(
                        emp.turnos[indiceDia] || ""
                    )
                    .trim()
                    .toUpperCase();


                if (
                    turno === turnoBuscado &&
                    turnoVisible(turno)
                ) {

                    contador++;

                }

            });


            const td =
                document.createElement("td");

            td.textContent =
                contador;

            td.style.fontWeight =
                "bold";


            tr.appendChild(td);

        });


        tbody.appendChild(tr);

    });

}


// =======================================
// ACTUALIZAR TABLA AL CAMBIAR M/T/N
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const filtros = [
            "filtroManana",
            "filtroTarde",
            "filtroNoche"
        ];


        filtros.forEach(id => {

            const checkbox =
                document.getElementById(id);


            if (!checkbox) return;


            checkbox.addEventListener(
                "change",
                () => {

                    renderTabla();

                }
            );

        });

    }
);
