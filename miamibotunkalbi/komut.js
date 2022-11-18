const { readdirSync } = require("fs"); 
const ascii = require("ascii-table");

let table = new ascii("Komutlar");
table.setHeading("Komut", "Yükleme durumu");

module.exports = (client) => {
        const commands = readdirSync(`./miamikomutlar/`).filter(file => file.endsWith(".js")); 
        for (let file of commands) { 
            let pull = require(`../miamikomutlar/${file}`); 
            if (pull.isim) { 
                client.komutlar.set(pull.isim, pull); 
                table.addRow(file, 'Hazır'); 
            } else {
                table.addRow(file, `Hata -> Komut klasöründe isim yazılmamış.`); 
                continue; 
            }
            if (pull.alternatifler && Array.isArray(pull.alternatifler)) pull.alternatifler.forEach(alias => client.alternatifler.set(alias, pull.isim)); 
        }
    console.log(table.toString()); 

}