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