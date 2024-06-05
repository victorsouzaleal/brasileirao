import axios from 'axios'
import {JSDOM} from 'jsdom'
import UserAgent from 'user-agents'


export async function obterBrasileiraoA(rodadas = false){
    try {
        const URL_TABELA = "https://p1.trrsf.com/api/musa-soccer/ms-standings-light?idChampionship=1420&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
        const URL_RODADAS = "https://p1.trrsf.com/api/musa-soccer/ms-standings-games-light?idChampionship=1420&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
        let resultado = {}
        resultado.tabela = await obterDadosTabela(URL_TABELA)
        if(rodadas){
            resultado.rodadas = await obterDadosRodadas(URL_RODADAS)
        }
        return resultado
    } catch(err){
        throw err
    }
}

export async function obterBrasileiraoB(rodadas = false){
    try {
        const URL_TABELA = "https://p1.trrsf.com/api/musa-soccer/ms-standings-light?idChampionship=1419&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
        const URL_RODADAS = "https://p1.trrsf.com/api/musa-soccer/ms-standings-games-light?idChampionship=1419&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
        let resultado = {}
        resultado.tabela = await obterDadosTabela(URL_TABELA)
        if(rodadas){
            resultado.rodadas = await obterDadosRodadas(URL_RODADAS)
        }
        return resultado
    } catch(err){
        throw err
    }
}

async function obterPagina(url){
    try{
        const userAgent = new UserAgent()
        const {data} = await axios.get(url, {headers: {'User-Agent': userAgent.toString()}})
        const { window } = new JSDOM(data)
        return window
    } catch(err){
        throw err
    }
}

async function obterDadosTabela(url){
    try{
        const { document } = await obterPagina(url)
        const times = []
        const $times = document.querySelectorAll("table > tbody > tr")
    
        $times.forEach($time => {
            const dadosTime = {
                nome: $time.querySelector('.team-name > a').title,
                escudo: $time.querySelector('.shield > a > img').src,
                posicao: $time.querySelector('.position').innerHTML,
                pontos: $time.querySelector('.points').innerHTML,
                jogos: $time.querySelector('td[title="Jogos"]').innerHTML,
                vitorias: $time.querySelector('td[title="Vitórias"]').innerHTML,
                empates: $time.querySelector('td[title="Empates"]').innerHTML,
                derrotas: $time.querySelector('td[title="Derrotas"]').innerHTML,
                gols_pro: $time.querySelector('td[title="Gols Pró"]').innerHTML,
                gols_contra: $time.querySelector('td[title="Gols Contra"]').innerHTML,
                saldo_gols: $time.querySelector('td[title="Saldo de Gols"]').innerHTML,
                aproveitamento: $time.querySelector('td[title="Aproveitamento"]').innerHTML+"%",
            }
            times.push(dadosTime)
        })

        return times
    } catch(err){
        throw err
    }
}

async function obterDadosRodadas(url){
    try{
        const { document } = await obterPagina(url)
        const rodadas = []
        const $rodadas = document.querySelectorAll("ul.rounds > li")
    
        $rodadas.forEach($rodada => {
            const [data] = $rodada.querySelector("br.date-round").getAttribute("data-date").split(" ")
            const [ano, mes, dia] = data.split("-")
    
            const dadosRodada = {
                rodada: $rodada.querySelector("h3").innerHTML,
                inicio: `${dia}/${mes}/${ano}`,
                rodada_atual: $rodada.getAttribute("class") === "round",
                partidas : []
            }
    
            const $partidas =  $rodada.querySelectorAll("li.match")
            $partidas.forEach($partida =>{
                const times = $partida.querySelector('meta[itemprop="name"]').getAttribute("content")
                const [time_casa, time_fora] = times.split("x").map(time => time.trim())
                const gols_casa = $partida.querySelector('.goals.home')?.innerHTML
                const gols_fora = $partida.querySelector('.goals.away')?.innerHTML
    
                const partida = {
                    partida: times,
                    data: $partida.querySelector('div.details > strong.date-manager').innerHTML,
                    local: $partida.querySelector('div.details > span.stadium').innerHTML,
                    time_casa,
                    time_fora,
                    gols_casa,
                    gols_fora,
                    resultado_texto: `${time_casa} ${gols_casa} x ${gols_fora} ${time_fora}` 
                }
                dadosRodada.partidas.push(partida)
            })
    
            rodadas.push(dadosRodada)
        })

        return rodadas
    } catch(err){
        throw err
    }
}
