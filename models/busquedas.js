const fs = require('fs')
const {get} = require("axios");
const axios = require("axios");
require('dotenv').config()

class Busquedas {
    historial = []
    dbPath = './db/database.json'

    constructor() {
        this.leerBD()
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPEN_WEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1))

            return palabras.join(' ')
        })
    }

    async ciudad (lugar = ''){
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })

            const resp = await instance.get()

            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name_es,
                lat: lugar.center[1],
                lng: lugar.center[0],
            }))
        }catch (error) {
            return []
        }
    }

    async clima (lat, lng){
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat: lat, lon: lng}
            })

            const resp = await instance.get()

            const {weather, main} = resp.data

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            }
        }catch (error) {
            return []
        }
    }

    agregarHistorial(lugar = '') {
        if (this.historial.includes(lugar.toLocaleLowerCase())){
            return
        }

        //Para mantener 6 registros en el historial
        this.historial = this.historial.splice(0, 5)

        this.historial.unshift(lugar)

        //Graba en BD
        this.guardarBD()
    }

    guardarBD() {
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerBD() {
        if (fs.existsSync(this.dbPath)){
            return
        }

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'})
        const data = JSON.parse(info)

        this.historial = data.historial
    }
}

module.exports = Busquedas