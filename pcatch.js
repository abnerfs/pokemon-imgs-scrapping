const request = require('request');
const looksSame = require('looks-same');
const path = require('path');
const imageDiff = require('image-diff');
const Rembrandt = require('rembrandt');

const { imgDiff } = require('img-diff-js');


const fs = require('fs');

const requestPromise = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if(error)
                reject(error);

            resolve({ body, response });
        });
    });
}

if(process.argv.lastIndexOf < 3) {
    console.log("pcatch <url>");
    process.exit(0);
}

const urlPokemon = process.argv[2];

console.log("url: " + urlPokemon);


function downloadImage(url, dest) {
    return new Promise(resolve => {
        var r = request(url);
    
        r.on('response',  function (res) {
            res.pipe(fs.createWriteStream(dest));
            resolve();
        });
    })
}

const ext = path.extname(urlPokemon);
const tmpUrl = "./tmp/pokemonurl"  + ext;

console.log("tmpURL " + tmpUrl);


const magic = {
    jpg: 'ffd8ffe0',
    png: '89504e47',
    gif: '47494638'
};



function checkExtension(imgPath) {
    const imgExt = path.extname(imgPath);
    const stream = fs.readFileSync(imgPath);

    const magigNumberInBody = stream.toString('hex',0,4);

    const nameWithouthExtension = imgPath.split('.').slice(0, -1).join('.');


    let oldPath = imgPath;

    if(magigNumberInBody == magic.jpg)
    {
        if(imgExt != ".jpg") {
            console.log(oldPath, imgPath);
            imgPath = nameWithouthExtension + ".jpg";
            fs.renameSync(oldPath, imgPath)
        }
    }
    else if(magigNumberInBody == magic.png) {
        if(imgExt != ".png") {
            imgPath = nameWithouthExtension + ".png";
            fs.renameSync(oldPath, imgPath)
        }
    }
    else {
        console.log(magigNumberInBody);
        throw new Error("Invalid file " + imgPath);
    }

    return imgPath;
}

function timeout(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}



function walk(dir, callback) {
    return new Promise(resolve => {
        fs.readdir(dir, function(err, files) {
            if (err) throw err;
            files.forEach(function(file) {
                var filepath = path.join(dir, file);
                fs.stat(filepath, function(err,stats) {
                    if (stats.isDirectory()) {
                        walk(filepath, callback);
                    } else if (stats.isFile()) {
                        callback(filepath, stats);
                    }
                });
            });
        });
    })

}



downloadImage(urlPokemon, tmpUrl)
    .then(async () => {
        console.log("Baixado");

        await timeout(1000);

        let lessDiff = 99999999;
        let lessDiffPath = undefined;

        const expectedFilename = checkExtension(tmpUrl);


        let imgs = fs.readdirSync('./images')
            .map(file => "./images/" +file);


        for(const file of imgs) {
            const imgLib = checkExtension(file);    
            await imgDiff({
                actualFilename: expectedFilename,
                expectedFilename: imgLib,
                diffFilename: './tmp/diff/' + path.basename(imgLib),
            })
            .then(({diffCount}) => {
                if(diffCount < lessDiff) {
                    lessDiff = diffCount;
                    lessDiffPath = file;
                }
                return diffCount;
            })
        }

        console.log(lessDiff, lessDiffPath);

        // const imgLib = checkExtension('./images/Braviary.jpg');
        // const expectedFilename = checkExtension(tmpUrl);

        // imgDiff({
        //     actualFilename: imgLib,
        //     expectedFilename: expectedFilename,
        //     diffFilename: './diff.png',
        //   }).then(result => console.log(result));
          

       
            
        // imageDiff({
        //     actualImage: './images/Braviary.jpg',
        //     expectedImage: tmpUrl,
        //     diffImage: 'difference.png',
        //   }, function (err, imagesAreSame) {
        //     console.log(err, imagesAreSame);            
        //   });

        // const img1 = PNG.sync.read(fs.readFileSync('./images/Braviary.jpg'));
        // const img2 = PNG.sync.read(fs.readFileSync(tmpUrl));


        // looksSame('./images/Braviary.jpg', tmpUrl, function(error, obj) {
        //     console.log(error);
        //     console.log(obj);
        // })
    });





