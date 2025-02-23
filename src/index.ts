import axios from 'axios'
import {JSDOM} from 'jsdom'
import UserAgent from 'user-agents'

const URL_TABELA_A = "https://p1.trrsf.com/api/musa-soccer/ms-standings-light?idChampionship=1420&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
const URL_RODADAS_A = "https://p1.trrsf.com/api/musa-soccer/ms-standings-games-light?idChampionship=1420&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
const URL_TABELA_B = "https://p1.trrsf.com/api/musa-soccer/ms-standings-light?idChampionship=1419&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"
const URL_RODADAS_B = "https://p1.trrsf.com/api/musa-soccer/ms-standings-games-light?idChampionship=1419&idPhase=&language=pt-BR&country=BR&nav=N&timezone=BR"

export interface TimeTabela {
    nome: string,
    escudo: string,
    posicao: string,
    pontos: string,
    jogos: string,
    vitorias: string,
    empates: string,
    derrotas: string,
    gols_pro: string,
    gols_contra: string,
    saldo_gols: string,
    aproveitamento: string
}

export interface Rodada {
    rodada: string,
    inicio: string,
    rodada_atual: boolean,
    partidas : Partida[]
}

export interface Partida {
    partida : string,
    data: string,
    local: string,
    time_casa : string,
    time_fora : string,
    gols_casa : string,
    gols_fora : string,
    resultado_texto: string,
}

export interface DadosBrasileirao {
    tabela : TimeTabela[],
    rodadas? : Rodada[]
}

export async function obterBrasileiraoA(rodadas = true){
    try {
        const tabelaTimes = await obterDadosTabela(URL_TABELA_A)
        let resultado : DadosBrasileirao = {tabela: tabelaTimes}
        if(rodadas) resultado.rodadas = await obterDadosRodadas(URL_RODADAS_A)
        return resultado
    } catch(err){
        throw err
    }
}

export async function obterBrasileiraoB(rodadas = true){
    try {
        const tabelaTimes = await obterDadosTabela(URL_TABELA_B)
        let resultado : DadosBrasileirao = {tabela: tabelaTimes}
        if(rodadas) resultado.rodadas = await obterDadosRodadas(URL_RODADAS_B)
        return resultado
    } catch(err){
        throw err
    }
}

async function obterPagina(url: string){
    try{
        const userAgent = new UserAgent()
        const {data} = await axios.get(url, {headers: {'User-Agent': userAgent.toString()}})
        const { window } = new JSDOM(data)
        return window
    } catch(err){
        throw err
    }
}

async function obterDadosTabela(url : string){
    try{
        const { document } = await obterPagina(url)
        const times : TimeTabela[] = []
        const $times = document.querySelectorAll("table > tbody > tr")
    
        $times.forEach($time => {
            times.push({
                nome: $time.querySelector('.team-name > a')?.getAttribute("title") || '',
                escudo: $time.querySelector('.shield > a > img')?.getAttribute("src") || '',
                posicao: $time.querySelector('.position')?.innerHTML || '',
                pontos: $time.querySelector('.points')?.innerHTML || '',
                jogos: $time.querySelector('td[title="Jogos"]')?.innerHTML || '',
                vitorias: $time.querySelector('td[title="Vitórias"]')?.innerHTML || '',
                empates: $time.querySelector('td[title="Empates"]')?.innerHTML || '',
                derrotas: $time.querySelector('td[title="Derrotas"]')?.innerHTML || '',
                gols_pro: $time.querySelector('td[title="Gols Pró"]')?.innerHTML || '',
                gols_contra: $time.querySelector('td[title="Gols Contra"]')?.innerHTML || '',
                saldo_gols: $time.querySelector('td[title="Saldo de Gols"]')?.innerHTML || '',
                aproveitamento: $time.querySelector('td[title="Aproveitamento"]')?.innerHTML+"%",
            })
        })

        return times
    } catch(err){
        throw err
    }
}

async function obterDadosRodadas(url: string){
    try{
        const { document } = await obterPagina(url)
        let rodadas : Rodada[] = []
        const $rodadas = document.querySelectorAll("ul.rounds > li")
    
        $rodadas.forEach($rodada => {
            const dataRodada = $rodada.querySelector("br.date-round")?.getAttribute("data-date")
            if(!dataRodada) throw new Error("Erro ao obter informações da rodada")
            const [data] = dataRodada.split(" ") 
            const [ano, mes, dia] = data.split("-")
    
            let dadosRodada : Rodada = {
                rodada: $rodada.querySelector("h3")?.innerHTML || '',
                inicio: `${dia}/${mes}/${ano}`,
                rodada_atual: $rodada.getAttribute("class") === "round",
                partidas : []
            }
    
            const $partidas =  $rodada.querySelectorAll("li.match")
            $partidas.forEach($partida =>{
                const times = $partida.querySelector('meta[itemprop="name"]')?.getAttribute("content")
                if(!times) throw new Error("Erro ao obter informações da rodada")
                const [time_casa, time_fora] = times.split("x").map(time => time.trim())
                const gols_casa = $partida.querySelector('.goals.home')?.innerHTML || ''
                const gols_fora = $partida.querySelector('.goals.away')?.innerHTML || ''

                dadosRodada.partidas.push({
                    partida: times,
                    data: $partida.querySelector('div.details > strong.date-manager')?.innerHTML || '',
                    local: $partida.querySelector('div.details > span.stadium')?.innerHTML || '',
                    time_casa,
                    time_fora,
                    gols_casa,
                    gols_fora,
                    resultado_texto: `${time_casa} ${gols_casa} x ${gols_fora} ${time_fora}` 
                })
            })
            rodadas.push(dadosRodada)
        })
        return rodadas
    } catch(err){
        throw err
    }
}
