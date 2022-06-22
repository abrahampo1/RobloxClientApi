const noblox = require('noblox.js')
var $ = require('jquery')
const axios = require('axios')
const { resolve } = require('path')
const nodeCmd = require('node-cmd')
var exec = require('child_process').execFile

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

async function LaunchGame(cookie, placeID = '4670813246') {
  let token = await getToken(cookie)
  let ticket = await AuthTicket(cookie, token)
  let version = await GameVersion()
  //let RPath = `"C:/Program Files (x86)/Roblox/Versions/` + version
  let RPath = '"' + process.env.LOCALAPPDATA + '/Roblox/Versions/' + version
  RPath = RPath + '/RobloxPlayerBeta.exe"'
  nodeCmd.run(
    RPath +
      ' --play -a https://auth.roblox.com/v1/authentication-ticket/redeem -t ' +
      ticket +
      ' -j "https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGame&placeId=' +
      placeID +
      '&gameId=&isPlayTogetherGame=false"',
  )
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

async function RobloxRequest(endpoint, cookie, method = 'GET', data = {}, referer = "https://www.roblox.com/games/606849621/Jailbreak") {
  return new Promise(async (resolve, reject) => {
    let token = await getToken(cookie);
    var myInit = {
      headers: {
        Cookie: '.ROBLOSECURITY=' + cookie + ';',
        'X-CSRF-TOKEN': token,
        Referer: referer,
      },
      baseURL: referer,
      cache: 'default',
    }
    var bodyFormData = new FormData();
    Object.entries(data).forEach(([key, value])=>{
      bodyFormData.append(key, value)
    })
    let destination = endpoint
    if (method == 'POST') {
      myInit.headers["Content-Type"] = "application/x-www-form-urlencoded"
      axios
        .post(destination, bodyFormData, myInit)
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
