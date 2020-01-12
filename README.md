# mcmgr - Minecraft Manager
## Dev Installation / Setup
1. `git clone https://github.com/ecuyle/mcmgr`
2. To setup server:
   - `cd ./server`
   - `touch ./src/config/secrets.ts`
   - Inside of `./src/config/secrets.ts`, paste the following:
     ```js
     export const SECRETS = {
       SESSION_SECRET: '<YOUR_SECRET_HERE>'
     };
     ```
   - `npm run setup`
3. To setup front end:
   - `cd ./app/mcmgr`
   - `npm i --save-dev`

## Running the dev server
1. `cd ./server`
2. `npm run dev` (Runs on port 3000)

## Running the dev front end
1. `cd ./app/mcmgr`
2. `npm run serve` (Should run on port 8080 / 8081)

## Running server tests
1. `cd ./server`
2. `npm run test`

## TODO Items:
Maintenance / Cleaup:
[] Move create server into its own route
[] Rearrage Current Servers and Managing Server side by side for easy viewing
[] Fix scrolling issue with server logs not scrolling to bottom of log line
[] Make "Login" button submit on "Enter" keypress

Feature Development:
[] Implement server import / export
[] Implement server backup / snapshot
[] Implement create/update server properties functionality
[] Add further details to servers list (ie. RAM usage, # players connected)