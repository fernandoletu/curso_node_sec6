const {
    inquirerMenu,
    pausa,
    leerInput,
    listarLugares,
    confirmar,
    mostrarListadoChecklist,
} = require("./helpers/inquirer")
const Busquedas = require("./models/busquedas");

const main = async() => {
    const busquedas = new Busquedas()

    let opt

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1:
                //Lo que ingresa el usuario
                const busqueda = await leerInput('Ciudad: ')

                //Busca en Mapbox el lugar
                const lugares = await busquedas.ciudad(busqueda)

                //Selecciona lugar
                const idElegido = await listarLugares(lugares)
                if (idElegido === '0') continue

                //Toma el lugar seleccionado
                const lugarSel = lugares.find(l => l.id === idElegido)

                //Guardar en BD
                busquedas.agregarHistorial(lugarSel.nombre)

                //Busca en OpenWeatherMaps info del clima
                const clima = await busquedas.clima(lugarSel.lat, lugarSel.lng)

                console.clear()
                console.log('\nInformación de la ciudad\n'.green)
                console.log('Ciudad:', lugarSel.nombre.green)
                console.log('Lat:', lugarSel.lat)
                console.log('Lng:', lugarSel.lng)
                console.log('Temperatura:', clima.temp)
                console.log('Mínima:', clima.min)
                console.log('Máxima:', clima.max)
                console.log('Como está el clima:', clima.desc.green)
                break

            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
                break
        }

        if (opt !== 0) await pausa()
    }while(opt !== 0)
}

main()