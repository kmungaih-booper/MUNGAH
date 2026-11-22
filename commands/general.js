
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];
  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");
  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function" ? raw.toNumber() : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded FEI XMD menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({ commands: ctx.commands, config: ctx.config, theme: ctx.theme });
      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption: "🤖 *𝐅𝐄𝐈 𝐗𝐌𝐃 — 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭 𝐛𝐲 𝐁𝐞𝐧𝐟𝐞𝐢 𝐓𝐞𝐜𝐡*\n" +
              "🌐 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐏𝐨𝐫𝐭𝐚𝐥: " + ctx.config.botUrl + "\n" +
              "⚡ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐁𝐞𝐧𝐟𝐞𝐢 𝐓𝐞𝐜𝐡"
          });
        } catch (error) {
          console.warn("FEI XMD menu artwork could not be sent; using the text menu:", error?.message || error);
        }
      }
      await ctx.reply(menu);
    }
  },
  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command => ctx.config.prefix + command.name + (command.description ? " — " + command.description : ""));
      const header = "📚 𝐅𝐄𝐈 𝐗𝐌𝐃 𝐇𝐄𝐋𝐏\n" + rows.length + " 𝐑𝐞𝐠𝐢𝐬𝐭𝐞𝐫𝐞𝐝 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n\n";
      const chunks = [];
      let current = header;
      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());
          current = "📚 𝐅𝐄𝐈 𝐗𝐌𝐃 𝐇𝐄𝐋𝐏 (𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐞𝐝)\n\n";
        }
        current += row + "\n";
      }
      if (current.trim()) chunks.push(current.trimEnd());
      for (const chunk of chunks) await ctx.reply(chunk);
    }
  },
  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null ? null : Math.max(0, Date.now() - timestamp);
      await ctx.reply([
        "╭━━〔 🏓 𝐅𝐄𝐈 𝐗𝐌𝐃 · 𝐏𝐎𝐍𝐆 〕━━┈⊷",
        "┃ ✦ 𝐒𝐭𝐚𝐭𝐮𝐬: " + (ctx.connectionOpen ? "𝐎𝐧𝐥𝐢𝐧𝐞 🟢" : "𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠 🟡"),
        "┃ ✦ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: " + (responseMs === null ? "𝐔𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞" : responseMs + " ms"),
        "┃ ✦ 𝐔𝐩𝐭𝐢𝐦𝐞: " + formatDuration(process.uptime()),
        "┃ ✦ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: " + ctx.config.version,
        "╰━━━━━━━━━━━━━━━━━━━━━━┈⊷"
      ].join("\n"));
    }
  },
  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply(
        "✅ " + ctx.config.name + " 𝐢𝐬 " + (ctx.connectionOpen ? "𝐎𝐧𝐥𝐢𝐧𝐞." : "𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠.") +
        "\n🔐 𝐌𝐨𝐝𝐞: " + String(ctx.mode || "public").toUpperCase() +
        "\n⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞: " + formatDuration(process.uptime()) +
        "\n⚡ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 " + ctx.config.ownerName
      );
    }
  },
  {
    name: "owner",
    category: "General",
    description: "Show Benfei Tech owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);
      await ctx.reply(
        "👑 𝐎𝐰𝐧𝐞𝐫: " + ctx.config.ownerName +
        (number ? "\n📱 𝐎𝐰𝐧𝐞𝐫 𝐍𝐮𝐦𝐛𝐞𝐫: +" + number : "")
      );
    }
  },
  {
    name: "support",
    category: "General",
    description: "Show support guidance for FEI XMD.",
    run: async ctx => {
      await ctx.reply(
        "🛟 " + ctx.config.name + " 𝐒𝐮𝐩𝐩𝐨𝐫𝐭\n𝐅𝐨𝐫 𝐬𝐞𝐭𝐮𝐩 𝐡𝐞𝐥𝐩 𝐨𝐫 𝐛𝐮𝐠 𝐫𝐞𝐩𝐨𝐫𝐭𝐬, 𝐜𝐨𝐧𝐭𝐚𝐜𝐭 " +
        ctx.config.ownerName + ".\n\n🌐 𝐆𝐢𝐭𝐇𝐮𝐛: https://github.com/Benfeitech/FEI-XMD"
      );
    }
  },
  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());
      await ctx.reply("🕒 𝐍𝐢𝐠𝐞𝐫𝐢𝐚 𝐓𝐢𝐦𝐞: " + value);
    }
  },
  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());
      await ctx.reply("📅 𝐃𝐚𝐭𝐞 𝐢𝐧 𝐍𝐢𝐠𝐞𝐫𝐢𝐚: " + value);
    }
  },
  {
    name: "version",
    category: "General",
    description: "Show FEI XMD version and connection status.",
    run: async ctx => {
      await ctx.reply(
        "🤖 " + ctx.config.name + " v" + ctx.config.version +
        "\n🟢 𝐒𝐭𝐚𝐭𝐮𝐬: " + (ctx.connectionOpen ? "𝐎𝐧𝐥𝐢𝐧𝐞" : "𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠") +
        "\n🔐 𝐌𝐨𝐝𝐞: " + String(ctx.mode || "public").toUpperCase() +
        "\n📦 𝐁𝐚𝐢𝐥𝐞𝐲𝐬: 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐖𝐡𝐢𝐬𝐤𝐞𝐲𝐒𝐨𝐜𝐤𝐞𝐭𝐬 𝐍𝐏𝐌 𝐏𝐚𝐜𝐤𝐚𝐠𝐞"
      );
    }
  },
  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply(
        "💬 𝐂𝐡𝐚𝐭 𝐈𝐃: " + ctx.jid +
        "\n👤 𝐒𝐞𝐧𝐝𝐞𝐫 𝐈𝐃: " + (ctx.senderJid || "𝐔𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞")
      );
    }
  },
  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply(
        "👤 𝐍𝐚𝐦𝐞: " + (ctx.msg?.pushName || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧") +
        "\n🆔 𝐘𝐨𝐮𝐫 𝐈𝐃: " + (ctx.senderJid || "𝐔𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞") +
        "\n👑 𝐎𝐰𝐧𝐞𝐫: " + (ctx.owner ? "𝐘𝐞𝐬" : "𝐍𝐨")
      );
    }
  }
];

export default commands;
