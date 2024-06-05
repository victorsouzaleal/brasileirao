import {obterDadosTabela, obterDadosRodadas} from './src/scrapper.js'


export async function obterDadosBrasileirao(rodadas = false){
    return new Promise(async(resolve, reject)=>{
        try{
            let resultado = {}
            resultado.tabela = await obterDadosTabela()
            if(rodadas){
                resultado.rodadas = await obterDadosRodadas()
            }
            resolve(resultado)
        } catch(err){
            reject({erro: err.message})
        }
    })
}
