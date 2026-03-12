const express = require("express")
const path = require("path")
const session = require("express-session")
const fetch = require("node-fetch")
const fs = require("fs")
require("dotenv").config()

const app = express()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const BOT_TOKEN = process.env.BOT_TOKEN


/* MODULE FILE */

const modulesFile = path.join(__dirname, "..", "shared", "modules.json")

function loadModules(){

if(!fs.existsSync(modulesFile)){
fs.writeFileSync(modulesFile,"{}")
return {}
}

try{
return JSON.parse(fs.readFileSync(modulesFile))
}catch{
return {}
}

}

function saveModules(data){

fs.writeFileSync(modulesFile, JSON.stringify(data,null,2))

}


/* SESSION */

app.use(session({
secret: process.env.SESSION_SECRET,
resave: false,
saveUninitialized: false
}))


/* BODY PARSER */

app.use(express.json())


/* STATIC FILES */

app.use(express.static("public"))
app.use("/css", express.static(path.join(__dirname,"css")))


/* LOGIN */

app.get("/login",(req,res)=>{

const url =
`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`

res.redirect(url)

})


/* CALLBACK */

app.get("/callback", async (req,res)=>{

const code = req.query.code

if(!code) return res.send("No code provided")

try{

const data = new URLSearchParams()

data.append("client_id",CLIENT_ID)
data.append("client_secret",CLIENT_SECRET)
data.append("grant_type","authorization_code")
data.append("code",code)
data.append("redirect_uri",REDIRECT_URI)

const response = await fetch("https://discord.com/api/oauth2/token",{
method:"POST",
body:data,
headers:{
"Content-Type":"application/x-www-form-urlencoded"
}
})

const json = await response.json()

if(!json.access_token) return res.send("Login failed")

req.session.token = json.access_token

res.redirect("/servers")

}catch(err){

console.error(err)
res.send("OAuth error")

}

})


/* SERVERS PAGE */

app.get("/servers",(req,res)=>{
res.sendFile(path.join(__dirname,"public/servers.html"))
})


/* API SERVERS */

app.get("/api/servers", async (req,res)=>{

if(!req.session.token) return res.json([])

try{

const response = await fetch("https://discord.com/api/users/@me/guilds",{
headers:{
Authorization:`Bearer ${req.session.token}`
}
})

const guilds = await response.json()

if(!Array.isArray(guilds)){

console.error("Discord API error:", guilds)
return res.json([])

}

// MANAGE SERVER permission
const filtered = guilds.filter(guild => {

const perms = BigInt(guild.permissions)

return (perms & 0x20n) === 0x20n

})

res.json(filtered)

}catch(err){

console.error(err)
res.json([])

}

})


/* SINGLE SERVER INFO */

app.get("/api/server/:id", async (req,res)=>{

if(!req.session.token) return res.json(null)

try{

const response = await fetch("https://discord.com/api/users/@me/guilds",{
headers:{
Authorization:`Bearer ${req.session.token}`
}
})

const guilds = await response.json()

if(guilds.retry_after){

console.log("Discord rate limited")

setTimeout(()=>{

res.json(null)

}, guilds.retry_after * 1000)

return

}

if(!Array.isArray(guilds)){

console.error("Discord API error:", guilds)
return res.json(null)

}

const guild = guilds.find(g => g.id === req.params.id)

res.json(guild)

}catch(err){

console.error(err)
res.json(null)

}

})


/* BOT STATUS */

app.get("/api/bot/:id", async (req,res)=>{

try{

const response = await fetch(`https://discord.com/api/guilds/${req.params.id}`,{
headers:{
Authorization:`Bot ${BOT_TOKEN}`
}
})

if(response.status === 404){

return res.json({
inServer:false
})

}

if(!response.ok){

return res.json({
inServer:false
})

}

return res.json({
inServer:true
})

}catch(err){

console.error(err)

res.json({
inServer:false
})

}

})

const startTime = Date.now()

app.get("/api/botstats",(req,res)=>{

const uptime = Date.now() - startTime

const seconds = Math.floor(uptime/1000)
const minutes = Math.floor(seconds/60)
const hours = Math.floor(minutes/60)

res.json({

ping: Math.floor(Math.random()*40)+20,
uptime: hours+"h "+(minutes%60)+"m"

})

})

/* CHANNEL LIST */

app.get("/api/channels/:id", async (req,res)=>{

try{

const response = await fetch(`https://discord.com/api/guilds/${req.params.id}/channels`,{
headers:{
Authorization:`Bot ${BOT_TOKEN}`
}
})

const channels = await response.json()

const filtered = channels
.filter(c => c.type === 0 || c.type === 4)
.map(c => ({

id:c.id,
name: c.type === 4 ? "📁 "+c.name : "#"+c.name,
type:c.type

}))

res.json(filtered)

}catch(err){

console.error(err)
res.json([])

}

})

/* ROLE LIST */

app.get("/api/roles/:id", async (req,res)=>{

try{

const response = await fetch(`https://discord.com/api/guilds/${req.params.id}/roles`,{
headers:{
Authorization:`Bot ${BOT_TOKEN}`
}
})

const roles = await response.json()

const filtered = roles
.filter(r => r.name !== "@everyone")
.map(r => ({
id:r.id,
name:r.name
}))

res.json(filtered)

}catch(err){

console.error(err)
res.json([])

}

})

/* GET TICKET CONFIG */

app.get("/api/tickets/config/:id",(req,res)=>{

const data = loadTickets()

res.json(data[req.params.id] || {})

})


/* SAVE TICKET CONFIG */

app.post("/api/tickets/config/:id",(req,res)=>{

const data = loadTickets()

data[req.params.id] = {
category:req.body.category,
role:req.body.role
}

saveTickets(data)

res.json({success:true})

})



/* MODULE GET */

app.get("/api/modules/:id",(req,res)=>{

const data = loadModules()

const guildId = req.params.id

if(!data[guildId]){

data[guildId] = {
moderation:true,
automod:false,
tickets:false,
welcome:false,
logs:false
}

saveModules(data)

}

res.json(data[guildId])

})

app.get("/api/activity/:id",(req,res)=>{

const labels = [
"Mon","Tue","Wed","Thu","Fri","Sat","Sun"
]

function random(){

return Math.floor(Math.random()*40)+5

}

res.json({

labels,

joins:[
random(),
random(),
random(),
random(),
random(),
random(),
random()
],

messages:[
random(),
random(),
random(),
random(),
random(),
random(),
random()
],

commands:[
random(),
random(),
random(),
random(),
random(),
random(),
random()
]

})

})



/* MODULE SAVE */

app.post("/api/modules/:id",(req,res)=>{

const data = loadModules()

const guildId = req.params.id

data[guildId] = req.body

saveModules(data)

res.json({success:true})

})

/* TICKET FILE */

const ticketFile = path.join(__dirname, "..", "shared", "tickets.json")

function loadTickets(){

if(!fs.existsSync(ticketFile)){
fs.writeFileSync(ticketFile,"{}")
return {}
}

try{
return JSON.parse(fs.readFileSync(ticketFile))
}catch{
return {}
}

}

function saveTickets(data){

fs.writeFileSync(ticketFile, JSON.stringify(data,null,2))

}


/* SEND TICKET PANEL */

app.post("/api/tickets/send/:id", async (req,res)=>{

const {channel,title,description,button,role} = req.body

try{

await fetch(`https://discord.com/api/channels/${channel}/messages`,{

method:"POST",

headers:{
Authorization:`Bot ${BOT_TOKEN}`,
"Content-Type":"application/json"
},

body:JSON.stringify({

content: role ? `<@&${role}>` : "",

embeds:[{

title:title,
description:description,
color:5793266

}],

components:[{

type:1,
components:[{

type:2,
label:button,
style:1,
custom_id:"ticket_create"

}]

}]

})

})

res.json({success:true})

}catch(err){

console.error(err)
res.json({success:false})

}

})





/* DASHBOARD PAGE */

app.get("/dashboard/:id",(req,res)=>{

res.sendFile(path.join(__dirname,"public/server.html"))

})


/* OTHER PAGES */

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/dashboard.html"))
})

app.get("/modules", (req, res) => {
res.sendFile(path.join(__dirname, "public/modules.html"))
})

app.get("/commands", (req, res) => {
res.sendFile(path.join(__dirname, "public/commands.html"))
})

app.get("/stats", (req, res) => {
res.sendFile(path.join(__dirname, "public/stats.html"))
})

app.get("/logs", (req, res) => {
res.sendFile(path.join(__dirname, "public/logs.html"))
})

app.get("/settings", (req, res) => {
res.sendFile(path.join(__dirname, "public/settings.html"))
})


/* MODERATION PAGE */

app.get("/moderation/:id",(req,res)=>{
res.sendFile(path.join(__dirname,"public","moderation.html"))
})

/* TICKETS PAGE */

app.get("/tickets/:id",(req,res)=>{
res.sendFile(path.join(__dirname,"public","tickets.html"))
})



/* START SERVER */

app.listen(3000, () => {

console.log("Dashboard v2 running on http://localhost:3000")

})