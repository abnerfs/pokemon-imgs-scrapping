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

async function getImages() {
    const url = baseUrl + `/pokedex/all`;

    const body = await getBody(url);
    const dom = new JSDOM(body);

    const pokemons = dom.window.document.querySelectorAll('#pokedex > tbody > tr');
    console.log(pokemons.length);
    for (const pokemon of pokemons) {

        const urlPokemon = baseUrl + pokemon.querySelector('.ent-name').href;
        const pokeName = urlPokemon.replace(baseUrl + "/pokedex/", "").capitalize();

        console.log(pokeName);
        console.log(urlPokemon);

        const pokePage = (await getBody(urlPokemon));
        const domPage = new JSDOM(pokePage).window.document;
        const imgUrl = domPage.querySelector('img').src;

        const ext = path.extname(imgUrl);

        const dest = `${DEST}${pokeName}${ext}`;

        console.log(imgUrl);
        console.log(dest);

        await downloadImage(imgUrl, dest);
    }
}

getImages()
    .catch(console.log);