const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const baseUrl = "https://pokemondb.net";
const path = require('path');

const DEST = './images/';

if (!fs.existsSync(DEST))
    fs.mkdirSync(DEST);

const getBody = (url) =>
    fetch(url)
        .then(res => res.text());


String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

const downloadImage = (url, dest) => 
    fetch(url)
        .then(res => res.arrayBuffer())
        .then(buffer =>  new Promise((resolve, reject) => {
            fs.writeFile(dest, Buffer.from(buffer), (err) => {
                if(err)
                    reject(err);
                else
                    resolve(dest);
            })
        }))

const findBestImage = (pokeName, el) => {
    for(const split of pokeName.split(' ')) 
        if(el.innerHTML.toUpperCase().trim().indexOf(split.toUpperCase().trim()) == -1)
            return false;
            
    return true;
}

async function getImages() {
    const url = baseUrl + `/pokedex/all`;

    const body = await getBody(url);
    const dom = new JSDOM(body);

    const pokemons = dom.window.document.querySelectorAll('#pokedex > tbody > tr');
    console.log(pokemons.length);
    for (const pokemon of pokemons) {
        const urlPokemon = baseUrl + pokemon.querySelector('.ent-name').href;
        const pokedexNumber = pokemon.querySelector('.infocard-cell-data').innerHTML;
        let evolution = pokemon.querySelector('.text-muted');
        let evolutionName = evolution ? evolution.innerHTML : "";

        const pokeName = evolutionName || urlPokemon.replace(baseUrl + "/pokedex/", "").capitalize();

        console.log(`#${pokedexNumber} - ${pokeName} (${urlPokemon})`);
        const pokePage = (await getBody(urlPokemon));
        const domPage = new JSDOM(pokePage).window.document;


        const imgSection = Array.prototype.slice.call(domPage.querySelectorAll('.tabs-tab') || []).find(x => findBestImage(pokeName, x));
        let imgUrl = '';

        if(imgSection) {
            let sectionId = '#' + imgSection.href.split('#').slice(-1)[0];        
            imgUrl = domPage.querySelector(sectionId)
                                .querySelector('img')
                                .src;
        } else {
            imgUrl = domPage.querySelector('img').src;
        }

        const ext = path.extname(imgUrl);
        const dest = `${DEST}${pokedexNumber}_${pokeName}${ext}`;
        await downloadImage(imgUrl, dest);
    }
}

getImages()
    .catch(console.log);