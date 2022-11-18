const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
const fs = require("fs");
const config = require("./config.json");
const prefix = config.prefix;
const discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
client.db = new JsonDatabase({ databasePath: "./mydatabase.json" })
client.komutlar = new Collection();
client.alternatifler = new Collection();

["command"].forEach(handler => {
  require(`./miamibotunkalbi/komut`)(client);
});

client.on('ready', () => {
  console.log(`BOT: ${client.user.tag} isimli bot aktif!`);
});



client.login(process.env.token);

client.on("guildMemberAdd", member => {
  let channel = client.channels.cache.get("1037008208709030028")
  let btn = new discord.MessageButton()
    .setStyle("PRIMARY")
    .setLabel("👋 Selam ver!")
    .setCustomId("selam_ver")
  let row = new discord.MessageActionRow()
    .addComponents([btn])
  channel.send({ content: `${member}, aramıza katıldı!`, components: [row] })
})

client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId == "selam_ver") {
      let memberContent = interaction.message.content.split(",")[0]
      let id = memberContent.replaceAll("<@!", "").replaceAll("<@", "").replaceAll(">", "")
      if (id == interaction.user.id) return interaction.reply({ content: ":x: Kendine selam mı veriyorsun?", ephemeral: true })
      interaction.deferUpdate();
      let btn = new discord.MessageButton()
        .setStyle("PRIMARY")
        .setLabel("👋 Selam ver!")
        .setCustomId("selam_ver")
        .setDisabled(true)

      let row = new discord.MessageActionRow()
        .addComponents([btn])
      interaction.message.edit({ components: [row] })
      interaction.message.reply({ content: `**${interaction.user.username}:** Selam ${memberContent}, hoş geldin!` })
    }
    let name = interaction.customId
    if (name == "öneri_olumlu") {
      let message = interaction.message
      // Get numbers
      let field = message.embeds[0].fields[0].value
      let s = []
      let sa = field.split("\n").filter(x => x.match(/\d+/g))
      sa.forEach(ss => {
        ss = ss.replace(/[^0-9]/g, "")
        s.push(ss)
      })

      let veri = client.db.get(`öneri.${interaction.message.id}.${interaction.user.id}`)

      if (veri && veri.oy == "olumlu") {
        await interaction.deferUpdate();
        // Oy vermiş anlamına gelir, olumlu öneriyi -1 yapıyoruz.
        client.db.delete(`öneri.${interaction.message.id}.${interaction.user.id}`)
        message.embeds[0].fields = hee(Number(s[0]) - 1, Number(s[1]))
        message.edit({ embeds: [message.embeds[0]] })
      } else if (!veri) {
        await interaction.deferUpdate();
        // Oy vermemiş anlamına gelir, olumlu öneriyi +1 yapıyoruz.
        client.db.set(`öneri.${interaction.message.id}.${interaction.user.id}`, { oy: "olumlu" })
        message.embeds[0].fields = hee(Number(s[0]) + 1, Number(s[1]))
        message.edit({ embeds: [message.embeds[0]] })
      } else {
        // Oy vermiş fakat oy olumsuz anlamına gelir.
        return interaction.reply({ content: `Bu öneriye zaten bir oy vermişsin (Olumsuz)`, ephemeral: true })
      }

      function hee(a, b) {
        return [{ name: "Oylar", value: `Olumlu: **\`${a}\`**\nOlumsuz: **\`${b}\`**`, inline: false }]
      }
    }
    if (name == "öneri_olumsuz") {
      let message = interaction.message
      // Get numbers
      let field = message.embeds[0].fields[0].value
      let s = []
      let sa = field.split("\n").filter(x => x.match(/\d+/g))
      sa.forEach(ss => {
        ss = ss.replace(/[^0-9]/g, "")
        s.push(ss)
      })

      let veri = client.db.get(`öneri.${interaction.message.id}.${interaction.user.id}`)
      if (veri && veri.oy == "olumsuz") {
        await interaction.deferUpdate();
        // Oy vermiş anlamına gelir, olumsuz öneriyi -1 yapıyoruz.
        client.db.delete(`öneri.${interaction.message.id}.${interaction.user.id}`)
        message.embeds[0].fields = hee(Number(s[0]), Number(s[1]) - 1)
        message.edit({ embeds: [message.embeds[0]] })
      } else if (!veri) {
        await interaction.deferUpdate();
        // Oy vermemiş anlamına gelir, olumsuz öneriyi +1 yapıyoruz.
        client.db.set(`öneri.${interaction.message.id}.${interaction.user.id}`, { oy: "olumsuz" })
        message.embeds[0].fields = hee(Number(s[0]), Number(s[1]) + 1)
        message.edit({ embeds: [message.embeds[0]] })
      } else {
        // Oy vermiş fakat oy olumlu anlamına gelir.
        return interaction.reply({ content: `Bu öneriye zaten bir oy vermişsin (Olumlu)`, ephemeral: true })
      }
      function hee(a, b) {
        return [{ name: "Oylar", value: `Olumlu: **\`${a}\`**\nOlumsuz: **\`${b}\`**`, inline: false }]
      }

    }
    if (name == "öneri_ayarlar") {
      let yetkiliRol = "1035986001027416125"
      let message = interaction.message
      let user = interaction.user
      let guild = message.guild
      let yetkili = guild.roles.cache.find(role => role.id == yetkiliRol)
      if (!yetkili) return interaction.reply({ content: `I can't find the role **\`${yetkiliRol}\`**.`, ephemeral: true })
      if (!guild.members.cache.get(user.id).roles.cache.has(yetkili.id)) return interaction.reply({ content: `You don't have the role **\`${yetkili.name}\`**.`, ephemeral: true })

      if (message.components[1]) {
        message.edit({ components: [message.components[0]] })
      } else {
        let row1 = message.components[0]
        let kabulet = new discord.MessageButton()
          .setStyle("SUCCESS")
          .setLabel("Öneriyi kabul et")
          .setCustomId("öneri_kabul")
        let red = new discord.MessageButton()
          .setStyle("DANGER")
          .setLabel("Öneriyi reddet")
          .setCustomId("öneri_red")
        let row2 = new discord.MessageActionRow().addComponents([kabulet, red])
        message.edit({ components: [row1, row2] })
        interaction.deferUpdate();
      }
    }
    if (name == "öneri_kabul") {
      let yetkiliRol = "1035986001027416125"
      let message = interaction.message
      let user = interaction.user
      let guild = message.guild
      let yetkili = guild.roles.cache.find(role => role.id == yetkiliRol)
      if (!yetkili) return interaction.reply({ content: `I can't find the role **\`${yetkiliRol}\`**.`, ephemeral: true })
      if (!guild.members.cache.get(user.id).roles.cache.has(yetkili.id)) return interaction.reply({ content: `You don't have the role **\`${yetkili.name}\`**.`, ephemeral: true })
      // Change color to green
      message.embeds[0].color = "GREEN"
      message.embeds[0].fields = [{ name: "Öneri kabul edildi", value: message.embeds[0].fields[0].value, inline: false }]
      const thread = await message.channel.threads.cache.get(client.db.get(`öneri.threads.${message.id}`))
      if (thread) await thread.delete()
      client.db.delete(`öneri.threads.${message.id}`)
      client.db.delete(`öneri.${message.id}`)
      message.edit({ embeds: [message.embeds[0]], components: [] })
      interaction.reply({ content: `Öneri başarıyla kabul edildi.`, ephemeral: true })
    }
    if (name == "öneri_red") {
      let yetkiliRol = "1035986001027416125"
      let message = interaction.message
      let user = interaction.user
      let guild = message.guild
      let yetkili = guild.roles.cache.find(role => role.id == yetkiliRol)
      if (!yetkili) return interaction.reply({ content: `I can't find the role **\`${yetkiliRol}\`**.`, ephemeral: true })
      if (!guild.members.cache.get(user.id).roles.cache.has(yetkili.id)) return interaction.reply({ content: `You don't have the role **\`${yetkili.name}\`**.`, ephemeral: true })
      // Change color to green
      message.embeds[0].color = "RED"
      message.embeds[0].fields = [{ name: "Öneri Reddedildi", value: message.embeds[0].fields[0].value, inline: false }]

      message.edit({ embeds: [message.embeds[0]], components: [] })
      const thread = await message.channel.threads.cache.get(client.db.get(`öneri.threads.${message.id}`))
      if (thread) await thread.delete()
      client.db.delete(`öneri.threads.${message.id}`)
      client.db.delete(`öneri.${message.id}`)
      interaction.reply({ content: `Öneri başarıyla Reddedildi.`, ephemeral: true })
    }
    if (name == "isim_kabul") {
      let isimYetkili = "1035986001027416125"
      let guild = interaction.message.guild
      let rol = guild.roles.cache.get(isimYetkili)
      if (!isimYetkili) return interaction.reply({ content: `I can't find the role **\`${isimYetkili}\`**.`, ephemeral: true })
      if (!guild.members.cache.get(interaction.user.id).roles.cache.has(rol.id)) return interaction.reply({ content: `You don't have the role **\`${rol.name}\`**.`, ephemeral: true })
      let data = client.db.get(`isim.${interaction.message.id}`)
      if (!data) return interaction.message.delete();
      let member = guild.members.cache.get(data.user)
      if (!member) {
        interaction.reply({ content: `I can't find the user **\`${data.user}\`** in this guild.`, ephemeral: true })
        client.db.delete(`isim.${interaction.message.id}`)
        interaction.message.delete();
        return;
      }
      // Set name to data.isim
      await member.setNickname(data.isim)
        .catch(() => { interaction.message.edit({ content: `Hata oluştu`, embeds: [], components: [] }) })
      let embed = new discord.MessageEmbed()
        .setColor("GREEN")
        .setAuthor({ name: `${member.user.displayName}`, iconURL: member.user.displayAvatarURL() })
        .setDescription(`${member} adlı kullanıcısının ismi **\`(${data.isim})\`**, ${interaction.user} tarafından değiştirildi.`)
        .setTimestamp()
      interaction.message.edit({ embeds: [embed], components: [] })
      try {
        member.send({ content: `Merhaba değerli kullanıcımız, isteğiniz olan **\`${data.isim}\`** isminiz, ${interaction.user} tarafından kabul edildi.\n> İyi günler dileriz.` })
      } catch (e) { }
      client.db.delete(`isim.${interaction.message.id}`)
    }
    if (name == "isim_red") {
      let isimYetkili = "1035986001027416125"
      let guild = interaction.message.guild
      let rol = guild.roles.cache.get(isimYetkili)
      if (!isimYetkili) return interaction.reply({ content: `I can't find the role **\`${isimYetkili}\`**.`, ephemeral: true })
      if (!guild.members.cache.get(interaction.user.id).roles.cache.has(rol.id)) return interaction.reply({ content: `You don't have the role **\`${rol.name}\`**.`, ephemeral: true })
      let data = client.db.get(`isim.${interaction.message.id}`)
      if (!data) return interaction.message.delete();

      let member = guild.members.cache.get(data.user)
      if (!member) {
        interaction.reply({ content: `I can't find the user **\`${data.user}\`** in this guild.`, ephemeral: true })
        client.db.delete(`isim.${interaction.message.id}`)
        interaction.message.delete();
        return;
      }
      let embed = new discord.MessageEmbed()
        .setColor("RED")
        .setAuthor({ name: `${member.user.displayName}`, iconURL: member.user.displayAvatarURL() })
        .setDescription(`${member} adlı kullanıcının **\`${data.isim}\`** isim isteği ${interaction.user} tarafından reddedildi.`)
        .setTimestamp()
      interaction.message.edit({ embeds: [embed], components: [] })
      try {
        member.send({ content: `Merhaba değerli kullanıcımız, isteğiniz olan **\`${data.isim}\`** isminiz ${interaction.user} tarafından reddedildi.\n> İyi günler dileriz.` })
      } catch (e) { }
      client.db.delete(`isim.${interaction.message.id}`)
    }
  }
})

client.on('messageCreate', async message => {
  // isim-değiştir sistemi
  if (!message.author.bot && message.content.toLowerCase().startsWith("!isim-değiştir")) {
    let logChannel = "1037011219753742447"
    let isim = message.content.split(" ").slice(1).join(" ")
    let data = client.db.get(`isim`)
    let bool = false;
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key].user === message.author.id) bool = true
      })
    }
    let roles = ["1035986001027416125", "", "", ""]
    if (!roles.some(rol => message.member.roles.cache.has(rol))) return message.reply({ content: `:x: Bu komutu kullanmak için yetkiniz bulunmamaktadır.` })
    if (bool) return message.reply({ content: `:x: Şu anda bir isim değiştirme isteğiniz bulunmakta, daha sonra tekrar deneyiniz.` })
    if (!isim) return message.reply({ content: `:x: Lütfen bir isim girip öyle deneyin!` })

    if (isim.match(/[^a-zA-Z0-9- ]/g)) return message.reply({ content: `:x: İsimde sayı ve harften başka karakter kullanılamaz!` })

    if (isim.length > 22) return message.reply({ content: `:x: İsim en fazla 22 karakter olabilir!` })
    message.reply({ content: `:white_check_mark: İsminiz **\`${isim}\`** olarak değiştirilecektir, yetkililerimiz ilgileniyor.` })

    let embed = new discord.MessageEmbed()
      .setColor("BLUE")
      .setAuthor({ name: `${message.author.username} bir isim değiştirme isteği yolladı!`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(`${message.author} adlı kullanıcının isminin **\`${isim}\`** olarak değiştirilmesini kabul ediyor musunuz?`)
      .setFooter({ text: `Waffle`, iconURL: message.guild.iconURL() })
      .setTimestamp()

    let kabulet = new discord.MessageButton()
      .setStyle("SUCCESS")
      .setLabel("Kabul et")
      .setCustomId("isim_kabul")
    let red = new discord.MessageButton()
      .setStyle("DANGER")
      .setLabel("Reddet")
      .setCustomId("isim_red")
    let row = new discord.MessageActionRow().addComponents([kabulet, red])
    client.channels.cache.get(logChannel).send({ embeds: [embed], components: [row] })
      .then(msg => {
        client.db.set(`isim.${msg.id}`, { user: message.author.id, isim: isim })
      })
  }
  // Öneri sistemi
  if (message.channel.id == "1035978196312666122" && !message.author.bot) {
    await message.delete()
    if (!message.content || message.content.length < 5) return;
    if (message.content.length > 1500) return;

    let sa = new discord.MessageEmbed()
      .setColor("BLUE")
      .setAuthor({ name: `${message.author.username}, bir öneride bulundu`, iconURL: message.author.avatarURL() })
      .setDescription(`${message.content}`)
      .addField("Oylar", `Olumlu: **\`0\`**\nOlumsuz: **\`0\`** `)
      .setFooter({ text: `${message.author.username}`, iconURL: message.author.avatarURL() })
      .setTimestamp()

    let olumlu = new discord.MessageButton()
      .setStyle("SUCCESS")
      .setLabel("Olumlu")
      .setCustomId("öneri_olumlu")
    let olumsuz = new discord.MessageButton()
      .setStyle("DANGER")
      .setLabel("Olumsuz")
      .setCustomId("öneri_olumsuz")
    let ayarlar = new discord.MessageButton()
      .setStyle("PRIMARY")
      .setLabel("Ayarlar")
      .setCustomId("öneri_ayarlar")
    let row = new discord.MessageActionRow()
      .addComponents([olumlu, olumsuz, ayarlar])

    message.channel.send({ embeds: [sa], components: [row] })
      .then(async msg => {
        await msg.startThread({
          name: 'Öneri tartışma',
          autoArchiveDuration: 60,
        })
          .then(async thread => {
            client.db.set(`öneri.threads.${msg.id}`, thread.id)
          })

      })
  }


  if (message.author.id !== '745286954752671744') return;
  if (!message.content.startsWith('!yaz')) return;
  message.channel.send(message.content.substring(4));
  message.delete();
});
//söz-bırak
client.on("messageCreate", message => {
  if (message.author.bot || message.channel.id !== "1036277698592510122") return;

  var embed = new discord.MessageEmbed()
    .setThumbnail(message.author.avatarURL())
    .setDescription(`${message.author} bir şeyler söylemek istiyor,\n${message.content}`)

  message.delete();
  message.channel.send({ embeds: [embed] })
    .then(msg => msg.react("🔥"))
})

//anonim-sohbet
client.on("messageCreate", message => {
  if (message.author.bot || message.channel.id !== "1035995151354564659") return;

  var embed = new discord.MessageEmbed()
    //    .setColor("BLURPLE")
    .setTitle("Anonim birisi diyor ki;")
    .setDescription(`${message.content}`)

  message.delete();
  message.channel.send({ embeds: [embed] })
})

//anonim-itiraf
client.on("messageCreate", message => {
  if (message.author.bot || message.channel.id !== "1036276961762365470") return;

  var embed = new discord.MessageEmbed()
    //    .setColor("BLURPLE")
    .setTitle("Anonim birisi diyor ki;")
    .setDescription(`${message.content}`)

  message.delete();
  message.channel.send({ embeds: [embed] })
})

/*
client.on("message",async(message) => {
if(message.author.bot) return;
let member = [
"<@745286954752671744>",
"<@!745286954752671744>"
]
            let foundInText = false;
            for (var i in member) {
if(message.author.id === "745286954752671744") return
                if (message.content.toLowerCase().includes(member[i].toLowerCase())) foundInText = true;
            }
        if (foundInText) 
        {
            message.delete();
message.channel.send({content: `${message.author} Bu kullanıcıyı etiketlemek yasak!`}); // v13

}})  



client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sea') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'selam') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'slm') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'mrb') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'merhaba') {
   msg.reply('Aleyküm selam, hoş geldin.');
  }
});
*/


client.on("messageCreate", message => {
  if (message.author.bot) return;
  let bl = ["sa", "selam", "selamlarr", "selamlar", "selamün aleyküm", "sea", "s.a", "slm", "mrb", "merhaba", "meraba", "selam."]
  if (bl.includes(message.content.toLowerCase())) {
    let btn = new discord.MessageButton().setStyle("PRIMARY").setLabel(`${message.author.username.slice(0, 20)} Kullanıcısına selam ver!`).setCustomId("slm_" + message.id).setEmoji("👋")
    let row = new discord.MessageActionRow().addComponents([btn])
    message.reply({ content: `Aleyküm selam, hoş geldin!`, components: [row] })
      .then(msg => {
        var c = 0;
        let users = []
        msg.channel.createMessageComponentCollector({ componentType: 'BUTTON' })
          .on('collect', async (i) => {
            if (i.customId === "slm_" + message.id) {

              if (i.user.id == message.author.id) return i.reply({ content: `:x: Kendine selam veremezsin dostum, hadi ama!`, ephemeral: true })
              if (users.includes(i.user.id)) return i.reply({ content: `:x: Zaten selam verdin!`, ephemeral: true })
              await i.deferUpdate();
              c++;
              users.push(i.user.id)
              message.reply({ content: `**${i.user.username}**: Aleyküm selam, hoş geldin!` })
                .catch(() => {
                  msg.edit({ content: `:x: Bu mesaj bulunamadı.`, components: [new discord.MessageActionRow().addComponents([btn.setDisabled(true)])] })
                })

              if (c === 3) {
                msg.edit({ components: [new discord.MessageActionRow().addComponents([btn.setDisabled(true)])] })
                return;
              }
            }
          })
          .on('end', () => {
            msg.edit({ components: [new discord.MessageActionRow().addComponents([btn.setDisabled(true)])] })
          })
      })
  }
})

//suey#7700 <3