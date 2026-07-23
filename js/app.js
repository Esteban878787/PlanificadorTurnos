"use strict";

let empleados = [];
let dias = [];

// Mes actual (1-12)
let mesSeleccionado = new Date().getMonth() + 1;

let filtroEmpleado = [];

document.addEventListener("DOMContentLoaded", () => {

    const selector = document.getElementById("meses");
    const buscar = document.getElementById("buscar");
    const diaConsulta = document.getElementById("diaConsulta");
    const btnConsultar = document.getElementById("btnConsultar");
    const resultadoDia = document.getElementById("resultadoDia");

    selector.value = mesSeleccionado;

    selector.addEventListener("change", function () {

        mesSeleccionado = Number(this.value);

        renderTabla();
        cargarDiasConsulta();

    });

    buscar.addEventListener("input", function () {

        filtroEmpleado = this.value
            .toUpperCase()
            .split(",")
            .map(nombre => nombre.trim())
            .filter(nombre => nombre !== "");

        renderTabla();

    });

    if (btnConsultar) {

        btnConsultar.addEventListener("click", () => {

            const diaSeleccionado = Number(diaConsulta.value);

            let manana = [];
            let tarde = [];
            let noche = [];

            empleados.forEach(emp => {

                const indice = dias.findIndex(d =>
                    d.dia === diaSeleccionado &&
                    d.mes === mesSeleccionado
                );

                if (indice === -1) return;

                const turno = String(emp.turnos[indice])
                    .trim()
                    .toUpperCase();

                switch (turno) {

                    case "M":
                        manana.push(emp.nombre);
                        break;

                    case "T":
                        tarde.push(emp.nombre);
                        break;

                    case "N":
                        noche.push(emp.nombre);
                        break;

                }

            });

            resultadoDia.innerHTML = `

<div class="turnos-container">

<div class="tarjeta-turno manana">
<h3>☀️ Mañana (${manana.length})</h3>

<div class="lista-empleados">
${manana.length
? manana.map(nombre=>`<span class="empleado-chip">${nombre}</span>`).join("")
: "<span class='sin-personal'>Sin personal</span>"}
</div>

</div>

<div class="tarjeta-turno tarde">
<h3>🌆 Tarde (${tarde.length})</h3>

<div class="lista-empleados">
${tarde.length
? tarde.map(nombre=>`<span class="empleado-chip">${nombre}</span>`).join("")
: "<span class='sin-personal'>Sin personal</span>"}
</div>

</div>

<div class="tarjeta-turno noche">
<h3>🌙 Noche (${noche.length})</h3>

<div class="lista-empleados">
${noche.length
? noche.map(nombre=>`<span class="empleado-chip">${nombre}</span>`).join("")
: "<span class='sin-personal'>Sin personal</span>"}
</div>

</div>

</div>
`;

        });

    }

});

function cargarDiasConsulta() {

    const selectorDia = document.getElementById("diaConsulta");

    if (!selectorDia) return;

    selectorDia.innerHTML = "";

    dias.forEach(dia => {

        if (dia.mes !== mesSeleccionado) return;

        const option = document.createElement("option");

        option.value = dia.dia;
        option.textContent = dia.dia;

        selectorDia.appendChild(option);

    });

}

function actualizarCuadrante() {

    renderTabla();
    cargarDiasConsulta();

    const resultado = document.getElementById("resultadoDia");

    if (resultado) {
        resultado.innerHTML = "";
    }

}