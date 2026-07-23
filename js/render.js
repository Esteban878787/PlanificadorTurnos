"use strict";

function renderTabla() {

    const thead = document.getElementById("thead");
    const tbody = document.getElementById("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (empleados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td>No hay datos cargados.</td>
            </tr>
        `;

        return;
    }

    crearCabecera();
    crearFilas();
}

function crearCabecera() {

    const thead = document.getElementById("thead");

    const filaSemana = document.createElement("tr");
    const filaDias = document.createElement("tr");

    const thEmpleado1 = document.createElement("th");
    thEmpleado1.textContent = "";
    filaSemana.appendChild(thEmpleado1);

    const thEmpleado2 = document.createElement("th");
    thEmpleado2.textContent = "Empleado";
    filaDias.appendChild(thEmpleado2);

    const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

    dias.forEach(dia => {

        if (dia.mes !== mesSeleccionado) return;

        // Primera fila: inicial del día de la semana
        const fecha = new Date(new Date().getFullYear(), dia.mes - 1, dia.dia);

        const thSemana = document.createElement("th");
        thSemana.textContent = diasSemana[fecha.getDay()];
        filaSemana.appendChild(thSemana);

        // Segunda fila: número del día
        const thDia = document.createElement("th");
        thDia.textContent = dia.dia;
        filaDias.appendChild(thDia);

    });

    thead.appendChild(filaSemana);
    thead.appendChild(filaDias);
}

function crearFilas() {

    const tbody = document.getElementById("tbody");

    empleados.forEach(emp => {

        if (
            filtroEmpleado.length > 0 &&
            !filtroEmpleado.some(nombre =>
                emp.nombre.toUpperCase().includes(nombre)
            )
        ) {
            return;
        }

        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.textContent = emp.nombre;

        tr.appendChild(tdNombre);

        emp.turnos.forEach((turno, indice) => {

            if (!dias[indice]) return;

            if (dias[indice].mes !== mesSeleccionado) return;

            const td = document.createElement("td");

            td.textContent = turno;

            const valor = String(turno).trim().toUpperCase();

            switch (valor) {

                case "M":
                    td.classList.add("turno-M");
                    break;

                case "T":
                    td.classList.add("turno-T");
                    break;

                case "N":
                    td.classList.add("turno-N");
                    break;

                case "V":
                case "-(V)":
                    td.classList.add("turno-V");
                    break;

                case "L":
                    td.classList.add("turno-L");
                    break;

                case "LPA":
                    td.classList.add("turno-LPA");
                    break;

                case "BAJA":
                    td.classList.add("turno-BAJA");
                    break;
            }

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    // Añadir las filas de totales al final
    crearFilaTotales();
}

function crearFilaTotales() {

    const tbody = document.getElementById("tbody");

    const turnos = ["M", "T", "N"];

    turnos.forEach(turnoBuscado => {

        const tr = document.createElement("tr");
        tr.classList.add("fila-total");

        const tdTitulo = document.createElement("td");
        tdTitulo.textContent = "Total " + turnoBuscado;
        tdTitulo.style.fontWeight = "bold";

        tr.appendChild(tdTitulo);

        dias.forEach((dia, indiceDia) => {

            if (dia.mes !== mesSeleccionado) return;

            let contador = 0;

            empleados.forEach(emp => {

                if (
                    filtroEmpleado.length > 0 &&
                    !filtroEmpleado.some(nombre =>
                        emp.nombre.toUpperCase().includes(nombre)
                    )
                ) {
                    return;
                }

                const turno = String(emp.turnos[indiceDia]).trim().toUpperCase();

                if (turno === turnoBuscado) {
                    contador++;
                }

            });

            const td = document.createElement("td");
            td.textContent = contador;
            td.style.fontWeight = "bold";

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

}