module.exports = {
    
    isim: "site", 
    alternatifler: ["dc", "discord", "disc"],
     kullanımı:"site",

    çalıştır: async (client, message, args, user, text, prefix) => {
        message.channel.send({content: ":link: https://dsc.gg/milklist"});
    }
};