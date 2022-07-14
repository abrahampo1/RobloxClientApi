const noblox = require('noblox.js')
var $ = require('jquery')
const axios = require('axios')
const { resolve } = require('path')
const nodeCmd = require('node-cmd')
var exec = require('child_process').execFile
const fs = require("fs");
const dayjs = require('dayjs')

async function GameVersion() {
  return (
    await axios.get(
      'https://clientsettings.roblox.com/v1/client-version/WindowsPlayer',
    )
  ).data.clientVersionUpload
}

async function AuthTicket(cookie, token) {
  await GameVersion()
  var myInit = {
    headers: {
      Cookie: '.ROBLOSECURITY=' + cookie + ';',
      Referer: 'https://www.roblox.com/games/606849621/Jailbreak',
      'X-CSRF-TOKEN': token,
    },

    cache: 'default',
  }
  let destination = 'https://auth.roblox.com/v1/authentication-ticket/'
  return (await axios.post(destination, {}, myInit)).headers[
    'rbx-authentication-ticket'
  ]
}

async function LaunchGame(
  cookie,
  placeID = '4670813246',
  followPlayer = false,
) {
  return new Promise(async (resolve, error)=>{
    let token = await getToken(cookie)
  let ticket = await AuthTicket(cookie, token)
  let version = await GameVersion()
  //let RPath = `"C:/Program Files (x86)/Roblox/Versions/` + version
  let RPath = '"' + process.env.LOCALAPPDATA + '/Roblox/Versions/' + version
  if(!fs.existsSync(process.env.LOCALAPPDATA + '/Roblox/Versions/' + version)){
    error('Roblox Needs an update!')
  }

  RPath = RPath + '/RobloxPlayerBeta.exe"'
  let time = dayjs().unix();
  resolve(`roblox-player:1+launchmode:play+gameinfo:${ticket}+launchtime:${time}+placelauncherurl:https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGame&browserTrackerId=${time}&placeId=${placeID}&isPlayTogetherGame=false+browsertrackerid:${time}+robloxLocale:en_us+gameLocale:en_us+channel:`);


  if (!followPlayer) {
    nodeCmd.run(
      RPath +
        ' --play -a https://auth.roblox.com/v1/authentication-ticket/redeem -t ' +
        ticket +
        ' -j "https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGame&placeId=' +
        placeID +
        '&gameId=&isPlayTogetherGame=false"',
    )
  } else {
    let playerID = await noblox.getIdFromUsername(followPlayer)
    nodeCmd.run(
      RPath +
        ' --play -a https://auth.roblox.com/v1/authentication-ticket/redeem -t ' +
        ticket +
        ' -j "https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestFollowUser&userId=' +
        playerID +
        '"',
    )
  }

  resolve('Successfully launched')
  })
}

async function getToken(cookie) {
  return new Promise((resolve, reject) => {
    var myInit = {
      headers: {
        Cookie: '.ROBLOSECURITY=' + cookie + ';',
        Referer: 'https://www.roblox.com/games/606849621/Jailbreak',
      },

      cache: 'default',
    }
    let destination = 'https://auth.roblox.com/v1/authentication-ticket/'
    axios.post(destination, {}, myInit).catch((error) => {
      resolve(error.response.headers['x-csrf-token'])
    })
  })
}
const formUrlEncoded = (x) =>
  Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
async function RobloxRequest(
  endpoint,
  cookie,
  method = 'GET',
  data = {},
  referer = 'https://www.roblox.com/games/606849621/Jailbreak',
) {
  return new Promise(async (resolve, reject) => {
    let token = await getToken(cookie)
    var myInit = {
      headers: {
        Cookie: '.ROBLOSECURITY=' + cookie + ';',
        'X-CSRF-TOKEN': token,
        Referer: referer,
      },
      baseURL: referer,
      cache: 'default',
    }

    let destination = endpoint
    if (method == 'POST') {
      myInit.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      axios
        .post(destination, formUrlEncoded(data), myInit)
        .then((r) => {
          resolve(r)
        })
        .catch((error) => {
          resolve(error)
        })
    } else if (method == 'GET') {
      axios
        .get(destination, myInit)
        .then((r) => {
          resolve(r)
        })
        .catch((error) => {
          resolve(error)
        })
    } else {
      resolve('INVALID METHOD "' + method + '"')
    }
  })
}

module.exports = { LaunchGame, RobloxRequest }
