# RobloxClientApi
## Open Roblox Client With a cookie using Node JS!

### Install


> npm i robloxlauncherapi



## Functions

#### LaunchGame(COOKIE , PLACEID, FOLLOW )

##### COOKIE

-  Roblox Account Cookie

##### PLACEID

-   Roblox Game PlaceID

##### FOLLOW

-  OPTIONAL

-  Roblox Account Username to follow (default: false)

## Usage

```
const { LaunchGame } = require('robloxclientapi')

var LaunchLink = LaunchGame(COOKIE, GAMEPLACEID, PLAYERTOFOLLOW);

//When you open the link, roblox will be automatically opened


```
