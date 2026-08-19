"use strict";

function obtenerEmpleadosFiltrados() {

    if (!filtroEmpleado || filtroEmpleado.length === 0) {
        return empleados;
    }

    return empleados.filter(emp => {

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
// PINTAR TABLA COMPLETA
// =======================================

function renderTabla() {


    const selectMes = document.getElementById("meses");


    const mesSeleccionado = selectMes && selectMes.value
        ? Number(selectMes.value)
        : new Date().getMonth() + 1;



    const diasMes = dias.filter(d => d.mes === mesSeleccionado);



    console.log(
        "MES SELECCIONADO:",
        mesSeleccionado,
        "DIAS:",
        diasMes.length
    );



    const thead = document.getElementById("thead");
    const tbody = document.getElementById("tbody");



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
// CREAR CABECERA
// =======================================

function crearCabecera(diasMes) {


    const thead = document.getElementById("thead");


    const filaSemana = document.createElement("tr");

    const filaDias = document.createElement("tr");



    const thVacio = document.createElement("th");

    thVacio.textContent = "";

    filaSemana.appendChild(thVacio);



    const thEmpleado = document.createElement("th");

    thEmpleado.textContent = "Empleado";

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



        const fecha = dia.fecha;



        const thSemana = document.createElement("th");

        thSemana.textContent =
            diasSemana[fecha.getDay()];

        filaSemana.appendChild(thSemana);




        const thDia = document.createElement("th");

        thDia.textContent = dia.dia;


        filaDias.appendChild(thDia);



    });



    thead.appendChild(filaSemana);

    thead.appendChild(filaDias);


}




// =======================================
// CREAR FILAS EMPLEADOS
// =======================================

function crearFilas(diasMes) {


    const tbody = document.getElementById("tbody");



   const empleadosFiltrados = obtenerEmpleadosFiltrados();

empleadosFiltrados.forEach(emp => {



        const tr = document.createElement("tr");



        const tdNombre = document.createElement("td");

        tdNombre.textContent = emp.nombre;


        tr.appendChild(tdNombre);



        diasMes.forEach(dia => {



            const indice = dias.indexOf(dia);


            const turno = emp.turnos[indice];



            const td = document.createElement("td");



            td.textContent = turno || "";



            const valor =
                String(turno)
                .trim()
                .toUpperCase();




            switch(valor) {


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



   crearFilaTotales(diasMes, empleadosFiltrados);


}







// =======================================
// TOTALES
// =======================================

function crearFilaTotales(diasMes, empleadosFiltrados) {


    const tbody = document.getElementById("tbody");


    const turnos = [
        "M",
        "T",
        "N"
    ];



    turnos.forEach(turnoBuscado => {



        const tr = document.createElement("tr");

        tr.classList.add("fila-total");



        const tdTitulo = document.createElement("td");


        tdTitulo.textContent =
            "Total " + turnoBuscado;


        tdTitulo.style.fontWeight = "bold";


        tr.appendChild(tdTitulo);




        diasMes.forEach(dia => {



            const indiceDia = dias.indexOf(dia);



            let contador = 0;



           empleadosFiltrados.forEach(emp => {



                const turno =
                    String(emp.turnos[indiceDia] || "")
                    .trim()
                    .toUpperCase();



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