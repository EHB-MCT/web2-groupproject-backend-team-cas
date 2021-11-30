const express = require('express')
const app = express()
const port = 3000

app.use(express.static("public"));

app.get('/', (req, res) => {
    console.log("local root called");
    res.redirect('/info.html')
})
app.get('/challenges', (req, res) => {

    res.send('All the challenges')
})
app.post('/challenges', (req, res) => {

})

app.put('/challenges/:id', (req, res) => {

})

app.delete(' /challenges/:id', (req, res) => {

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})