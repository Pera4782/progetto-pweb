document.addEventListener('DOMContentLoaded',() => {
    init()
})


async function init(){

    let ranks = await get_ranks()
    let table = document.getElementById('ranks')

    for(let i = 0 ; i < 5 ; ++i){
        let tr = document.createElement('tr')
        for(let j = 0 ; j < 3 ; ++j){
            let td = document.createElement('td')
            let div = document.createElement('div')
            
            switch(j){
                case 0:
                    td.classList.toggle('first_col')
                    div.innerText = i + 1
                    break
                case 1:
                    td.classList.toggle('second_col')
                    if(i < ranks.length) div.innerText = ranks[i]['username']
                    else div.innerText = '/'
                    break
                default:
                    td.classList.toggle('third_col')
                    if(i < ranks.length) div.innerText = ranks[i]['elo']
                    else div.innerText = '/'
                    break

            }

            td.appendChild(div)
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }

    document.getElementById('home_page').addEventListener('click', () => {
        window.location.href = '../index.php'
    })

}

async function get_ranks() {
    
    try{
        const response = await fetch('../php/ranking_request.php')
        if(!response.ok) throw new Error(get_error_message(response.status))
        const data = await response.json()
        return data
    }catch(e){
        window.location.href = '../html/errors/' + e.message + '.html'
        return
    }

}

