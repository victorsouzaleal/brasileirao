import {obterDadosBrasileirao} from './index.js'

obterDadosBrasileirao().then(dados =>{
    console.log(dados)
}).catch(err =>{
    console.log(err)
})