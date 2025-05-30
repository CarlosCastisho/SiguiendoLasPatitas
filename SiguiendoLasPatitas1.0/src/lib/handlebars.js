const helpers = {};

helpers.json = function (context) {
    return JSON.stringify(context);
};

//Convierte la fecha en formato dd/mm/aaaa
helpers.formatoFecha = function(fecha) {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

module.exports = helpers;