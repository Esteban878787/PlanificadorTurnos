"use strict";


let empleados = [];

let dias = [];


// Mes seleccionado

let mesSeleccionado = new Date().getMonth() + 1;


let filtroEmpleado = [];





document.addEventListener("DOMContentLoaded", () => {


    const selector =
        document.getElementById("meses");


    const buscar =
        document.getElementById("buscar");


    const diaConsulta =
        document.getElementById("diaConsulta");


    const btnConsultar =
        document.getElementById("btnConsultar");


    const resultadoDia =
        document.getElementById("resultadoDia");



    if (selector) {

        selector.value = mesSeleccionado;



        selector.addEventListener("change", function () {


            mesSeleccionado = Number(this.value);



            renderTabla();


            cargarDiasConsulta();



            if (resultadoDia) {

                resultadoDia.innerHTML = "";

            }


        });


    }





    if (buscar) {


        buscar.addEventListener("input", function () {



            filtroEmpleado = this.value

                .toUpperCase()

                .split(",")

                .map(nombre => nombre.trim())

                .filter(nombre => nombre !== "");



            renderTabla();



        });


    }






    if (btnConsultar) {


        btnConsultar.addEventListener("click", () => {



            const diaSeleccionado =
                Number(diaConsulta.value);



            let manana = [];

            let tarde = [];

            let noche = [];





            const indiceDia = dias.findIndex(d =>

                d.dia === diaSeleccionado &&

                d.mes === mesSeleccionado

            );




            if (indiceDia === -1) {

                resultadoDia.innerHTML =
                    "No hay datos para ese día.";

                return;

            }





            empleados.forEach(emp => {



                const turno =
                    String(emp.turnos[indiceDia] ?? "")
                    .trim()
                    .toUpperCase();




                switch(turno) {


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

? manana.map(nombre =>
`<span class="empleado-chip">${nombre}</span>`
).join("")

: "<span class='sin-personal'>Sin personal</span>"}

</div>

</div>





<div class="tarjeta-turno tarde">

<h3>🌆 Tarde (${tarde.length})</h3>


<div class="lista-empleados">

${tarde.length

? tarde.map(nombre =>
`<span class="empleado-chip">${nombre}</span>`
).join("")

: "<span class='sin-personal'>Sin personal</span>"}

</div>

</div>





<div class="tarjeta-turno noche">

<h3>🌙 Noche (${noche.length})</h3>


<div class="lista-empleados">

${noche.length

? noche.map(nombre =>
`<span class="empleado-chip">${nombre}</span>`
).join("")

: "<span class='sin-personal'>Sin personal</span>"}

</div>

</div>


</div>


`;



        });


    }


});








// =======================================
// CARGAR DÍAS DEL SELECTOR
// =======================================

function cargarDiasConsulta() {


    const selectorDia =
        document.getElementById("diaConsulta");


    if (!selectorDia) return;



    selectorDia.innerHTML = "";




    dias.forEach(dia => {



        if (dia.mes !== mesSeleccionado) {

            return;

        }



        const option =
            document.createElement("option");



        option.value = dia.dia;


        option.textContent = dia.dia;



        selectorDia.appendChild(option);



    });



}







// =======================================
// ACTUALIZAR TABLA
// =======================================

function actualizarCuadrante() {


    renderTabla();


    cargarDiasConsulta();



    const resultado =
        document.getElementById("resultadoDia");



    if (resultado) {

        resultado.innerHTML = "";

    }


}