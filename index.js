import {obterBrasileiraoA, obterBrasileiraoB} from './src/scrapper.js'


export async function obterDadosBrasileiraoA(rodadas = true){
    return new Promise(async(resolve, reject)=>{
        try{
            const dadosBrasileiraoA = await obterBrasileiraoA(rodadas)
            resolve(dadosBrasileiraoA)
        } catch(err){
            reject({erro: err.message})
        }
    })
}

export async function obterDadosBrasileiraoB(rodadas = true){
    return new Promise(async(resolve, reject)=>{
        try{
            const dadosBrasileiraoB = await obterBrasileiraoB(rodadas)
            resolve(dadosBrasileiraoB)
        } catch(err){
            reject({erro: err.message})
        }
    })
}
