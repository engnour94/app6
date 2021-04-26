'use strict';

const express = require ('express');
const pg = require ('pg');
const superagent = require ('superagent');
const methodOverride = require ('method-override');

require('dotenv').config();
const PORT = process.env.PORT||5000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false }
     });

//  **********************


app.get('/',getApiData);
app.get('/Random-Joke',randomJoke)
app.post('/Favorite-Jokes',insertToDB);
app.get('/Favorite-Jokes',getFromDB);
app.put('/details/:id', updateDetails);
app.delete('/details/:id', deleteDetails);
app.get('/details/:id', jokeDetails);


function getApiData(req,res){
    let url =`https://official-joke-api.appspot.com/jokes/programming/ten`;
    superagent.get(url)
        .then(result=>{
            // res.send(result.body);
            res.render('home',{info:result.body});
        });
}
function randomJoke(req,res){
    let url =`https://official-joke-api.appspot.com/jokes/programming/random`;
    superagent.get(url)
        .then(result=>{
            // res.send(result.body);
            res.render('random',{data:result.body[0]});
        });

}
function insertToDB(req,res){
    // console.log(req.body);
    let { number,type, setup, punchline}=req.body;
    let sql =   `INSERT INTO joke (number,type, setup,  punchline) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let safeValues =[ number,type, setup, punchline];
    client.query(sql,safeValues)
        .then((result)=>{
            console.log('hhhhhhhhh',result.rows);
            res.redirect('/Favorite-Jokes');
        });

}

function getFromDB (req,res){
    let sql =`SELECT * FROM joke ;`;
    client.query(sql)
        .then((result)=>{
            console.log('hhhhhhhhh',result.rows);
            res.render('Favorite-Jokes', {info:result.rows});
        });

}

function jokeDetails(req,res){
    let sql =`SELECT * FROM joke   WHERE id =$1 ;`;
    let safeValues=[req.params.id];
    client.query(sql,safeValues)
        .then((result)=>{
            // console.log('hhhhhhhhh',result.rows);
            res.render('details.ejs', {info:result.rows});
        });


}

function deleteDetails(req,res){
    let sql =`  DELETE FROM joke   WHERE id =$1 ;`;
    let safeValues=[req.params.id];
    client.query(sql,safeValues)
        .then(()=>{
            res.redirect(`/Favorite-Jokes`);
        });
}
function updateDetails(req,res){
    let { number,type, setup, punchline}=req.body;
    let sql =   ` UPDATE  joke SET number=$1,type=$2, setup=$3,  punchline=$4 WHERE id =$5;`
    let safeValues =[ number,type, setup, punchline, req.params.id];
    client.query(sql,safeValues)
        .then(()=>{
            res.redirect(`/details/${req.params.id}`);
        });
}
client.connect()
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`app is listening on port ${PORT}`);
        });
    });
