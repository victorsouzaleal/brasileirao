import {obterDadosBrasileiraoA, obterDadosBrasileiraoB} from './index.js'


obterDadosBrasileiraoB(true).then(dados =>{
    console.log(dados)
}).catch(err =>{
    console.log(err)
})