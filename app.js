const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const baseUrl = "https://pokemondb.net";
const path = require('path');

const requestPromise = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if(error)
                reject(error);

            resolve({ body, response });
        });
    });
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
  }


function downloadImage(url, dest) {
        var r = request(url);



        r.on('response',  function (res) {
            res.pipe(fs.createWriteStream(dest));
        });

        // requestPromise(url, function({response}) {
        //     console.log("done " + dest);
        //     resolve();
        //     response.pipe(file);
        // })

        // file.on('finish', function() {
        //     file.close(cb); 
        // })
        // .on('error', function(err) { // Handle errors
        //     fs.unlink(dest); // Delete the file async. (But we don't check the result)
        //     console.log(err);
        //     reject(err);
        // });
}

function obterConteudo() {
    const url = baseUrl + `/pokedex/all`;


    requestPromise(url)
        .then(async ({body}) => {
            const dom = new JSDOM(body);

            const pokemons = dom.window.document.querySelectorAll('#pokedex > tbody > tr');
            console.log(pokemons.length);
            for(const pokemon of pokemons) {

                const urlPokemon = baseUrl + pokemon.querySelector('.ent-name').href;
                const pokeName =   urlPokemon.replace(baseUrl + "/pokedex/", "").capitalize();

                console.log(pokeName);
                console.log(urlPokemon);
                
                const pokePage = (await requestPromise(urlPokemon)).body
                const domPage = new JSDOM(pokePage).window.document;
                const imgUrl = domPage.querySelector('img').src;

                const ext = path.extname(imgUrl);
                const dest = "./images/" + pokeName + ext;

                console.log(imgUrl);
                console.log(dest);

                await downloadImage(imgUrl, dest);
            }
        })
        .catch(error => {
            console.log(error);

        })
}

obterConteudo();