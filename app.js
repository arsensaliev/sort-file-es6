const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const del = require("del");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const link = util.promisify(fs.link);
const argv = yargs
    .usage("Usage: $0 [option]")
    .help("help")
    .alias("help", "h")
    .version("0.0.1")
    .alias("version", "v")
    .example("$0 --entry ./filesSort --output ./dist -D y/n => Sortings folder")
    .option("entry", {
        alias: "e",
        describe: "Путь к читаемой директории",
        demandOption: true
    })
    .option("output", {
        alias: "o",
        describe: "Путь куда выложить",
        default: "./output/"
    })
    .option("delete", {
        alias: "D",
        describe: "Удалять ли ?",
        default: "n"
    })
    .epilog("homework 1").argv;

const source = path.normalize(path.join(__dirname, argv.entry));
const dist = path.normalize(path.join(__dirname, argv.output));
const deleteSource = argv.delete;

(async () => {
    if (!fs.existsSync(dist)) {
        try {
            await mkdir(dist);
        } catch (error) {
            console.log(error);
        }
    }

    async function fileSort(url) {
        try {
            const file = await readdir(url);
            file.forEach(async item => {
                const currentUrl = path.join(url, item);
                const state = await stat(currentUrl);
                if (state.isDirectory()) {
                    fileSort(currentUrl);
                } else {
                    const fileName = path.basename(currentUrl);
                    const directory = path.join(
                        dist,
                        fileName[0].toUpperCase()
                    );
                    const newPath = path.join(directory, fileName);

                    if (!fs.existsSync(directory)) {
                        await mkdir(directory);
                    }

                    await link(currentUrl, newPath);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    fileSort(source);

    if (deleteSource === "y") {
        const deletedPath = await del([`${source}`]);
        console.log(deletedPath);
    }
})();
