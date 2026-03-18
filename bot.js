// Aternos Discord Bot - Fixed for Railway deployment
const { Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer');
require('dotenv').config();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAternosServer(message) {
  let browser;
  let statusMessage;
  try {
    statusMessage = await message.reply('⏳ Connecting to Aternos and starting the server...');

    browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process',
    '--no-zygote'
  ]
});
```

`executablePath` **bilkul nahi** — Docker image mein Chrome already hota hai! ✅

---

## Railway Variable Delete Karo:
```
PUPPETEER_EXECUTABLE_PATH  ← delete karo
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ← delete karo  
NIXPACKS_APT_PKGS ← delete karo
```

Sirf yeh rakho:
```
DISCORD_TOKEN
ATERNOS_USER
ATERNOS_PASS

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Handle login or redirect
    const alreadyLoggedIn = await page.$('a[href="/servers/"]');
    if (alreadyLoggedIn) {
      await alreadyLoggedIn.click();
    } else {
      await page.waitForSelector('input#user', { timeout: 10000 });
      await page.type('input#user', process.env.ATERNOS_USER, { delay: 50 });
      await page.type('input#password', process.env.ATERNOS_PASS, { delay: 50 });
      await page.click('button[type="submit"]');
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch {
        console.log('⚠️ Login navigation timeout, continuing.');
      }
    }

    await page.goto('https://aternos.org/servers/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const serverSelector = 'div.server-body';
    await page.waitForSelector(serverSelector, { timeout: 15000 });
    await page.click(serverSelector);

    await page.waitForSelector('#start', { timeout: 20000 });

    await handleGoogleVignette(page);
    await clickStartButton(page);
    await handleDialogs(page);
    await handleAdStartPopup(page);

    await statusMessage.edit('⏳ Server is starting, please wait...');
    await delay(15000);

    const info = await getServerInfo(page);
    await statusMessage.edit(`✅ Server started!\n**Status:** ${info.status}\n**IP:** \`${info.ip}\`\n**Players:** ${info.players}\n**Version:** ${info.version}`);

  } catch (err) {
    console.error('Error starting Aternos server:', err);
    if (statusMessage) await statusMessage.edit('❌ Failed to start Aternos server. Check logs for details.');
  } finally {
    if (browser) await browser.close();
  }
}

async function stopAternosServer(message) {
  let browser;
  let statusMessage;
  try {
    statusMessage = await message.reply('⏳ Connecting to Aternos and stopping the server...');

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ],
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const alreadyLoggedIn = await page.$('a[href="/servers/"]');
    if (alreadyLoggedIn) {
      await alreadyLoggedIn.click();
    } else {
      await page.waitForSelector('input#user', { timeout: 10000 });
      await page.type('input#user', process.env.ATERNOS_USER, { delay: 50 });
      await page.type('input#password', process.env.ATERNOS_PASS, { delay: 50 });
      await page.click('button[type="submit"]');
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch {
        console.log('⚠️ Login navigation timeout, continuing.');
      }
    }

    await page.goto('https://aternos.org/servers/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const serverSelector = 'div.server-body';
    await page.waitForSelector(serverSelector, { timeout: 15000 });
    await page.click(serverSelector);

    await page.waitForSelector('#stop', { timeout: 20000 });
    await page.click('#stop');

    await statusMessage.edit('✅ Server stop command sent!');

  } catch (err) {
    console.error('Error stopping Aternos server:', err);
    if (statusMessage) await statusMessage.edit('❌ Failed to stop Aternos server. Check logs for details.');
  } finally {
    if (browser) await browser.close();
  }
}

async function handleGoogleVignette(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector('#google_vignette');
      if (el) el.remove();
    });
  } catch (e) {
    console.log('No vignette to dismiss.');
  }
}

async function clickStartButton(page) {
  const startButton = await page.$('#start');
  if (startButton) {
    await startButton.click();
    console.log('✅ Clicked start button.');
  } else {
    throw new Error('❌ Start button not found.');
  }
}

async function handleDialogs(page) {
  try {
    const isDialog = await page.$('dialog.alert.alert-danger');
    if (isDialog) {
      await page.click('dialog.alert.alert-danger button.btn.btn-danger');
      console.log('🛑 Dismissed alert-danger dialog');
    }
  } catch (e) {
    console.log('No alert-danger dialog found.');
  }
}

async function handleAdStartPopup(page) {
  try {
    const adDialog = await page.$('dialog.alert.alert-success');
    if (adDialog) {
      const startBtn = await page.$('dialog.alert.alert-success button.btn-success');
      if (startBtn) {
        await startBtn.click();
        console.log('📺 Dismissed advertisement dialog');
      }
    }
  } catch (e) {
    console.log('No advertisement dialog found.');
  }
}

async function getServerInfo(page) {
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusText = await page.evaluate(() => {
        if (document.querySelector('div.status.online')) return 'Online';
        if (document.querySelector('div.status.offline')) return 'Offline';
        if (document.querySelector('div.status.loading')) return 'Loading';
        if (document.querySelector('div.status.preparing')) return 'Preparing';
        if (document.querySelector('div.status.queue')) return 'In Queue';
        return 'Unknown';
      });

      const ip = await page.$eval('span#ip', el => el.textContent.trim()).catch(() => 'N/A');
      const players = await page.$eval('div.live-status-box-value.js-players', el => el.textContent.trim()).catch(() => 'N/A');
      const version = await page.$eval('span#version', el => el.textContent.trim()).catch(() => 'N/A');

      if (statusText === 'Online' || statusText === 'Offline') {
        return { status: statusText, ip, players, version };
      }

      console.log(`🔄 Waiting for server... (Attempt ${attempt + 1})`);
      await delay(2000);
    } catch (err) {
      console.log('⚠️ Error while checking server info:', err);
    }
  }

  return { status: 'Timeout', ip: 'N/A', players: 'N/A', version: 'N/A' };
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const cmd = message.content.trim().toLowerCase();

  if (cmd === '!start') {
    await startAternosServer(message);
  } else if (cmd === '!stop') {
    await stopAternosServer(message);
  } else if (cmd === '!help') {
    await message.reply('**Commands:**\n`!start` - Start Aternos server\n`!stop` - Stop Aternos server');
  }
});

client.login(process.env.DISCORD_TOKEN);
