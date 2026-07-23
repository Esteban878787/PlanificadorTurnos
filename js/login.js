"use strict";

const btnLogin = document.getElementById("btnLogin");
const estado = document.getElementById("estado");
const btnSubirExcel = document.getElementById("btnSubirExcel");

// Comprobar si ya existe una sesión guardada
(async () => {

    const {
        data: { session }
    } = await window.supabaseClient.auth.getSession();

    if (session) {

        estado.textContent = "🟢 Conectado como " + session.user.email;
        btnSubirExcel.disabled = false;

    }

})();

btnLogin.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    estado.textContent = "Conectando...";

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({

        email,
        password

    });

    if (error) {

        estado.textContent = "❌ " + error.message;
        return;

    }

    estado.textContent = "🟢 Conectado como " + data.user.email;

    btnSubirExcel.disabled = false;

});