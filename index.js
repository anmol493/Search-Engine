var express = require('express');
var mongoose = require('mongoose');
var app = express();
var cityData = require('./models/cityData');
var request = require('request');
const util = require('util');
const axios=require('axios')
mongoose.connect('mongodb://localhost:27017/CityData', {useNewUrlParser: true, connectWithNoPrimary: true, useUnifiedTopology: true } , function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Connected to the database");
    }
  });



  app.listen(8000,function(err){
    if(err) throw err;
    console.log("Server is Running on port "+ (8000));
    console.log(Object.keys(cityData.schema.obj));
    // cityData.find({weightage:{$exists : true}}, (err, res) => {
    //   res.forEach(res => {
    //     if(res.weightage)
    //     {
    //       res.weightage = parseInt(res.weightage);
    //       res.save();
    //     }
    //   });
    // });
    // console.log("done!");
  });

  

// app.get('/', (req, res) => {
//   cityData.find().sort({weightage:-1}).limit(10).exec( (err, cityData) => {
//     if (err) return next(err);
//     console.log(cityData);
//   } ) ;
// });


let arr=[]
app.get('/', async (req, res) => {
  const qcity = req.query.city;
  if(qcity){
    const solrq = 'http://localhost:8983/solr/normal/select?q=cityName%3A' + qcity + '%20OR%20stateName%3A' + qcity + '%20OR%20aliasCityName%3A' + qcity + '&rows=10&sort=weightage%20asc';
 //   console.log(solrq);
    let body=await axios.get(solrq);
    //request.get(solrq, async function(error, response, body){
      arr=body.data.response.docs
     // console.log(arr[0].cityCode[0])
      let len=Math.min(qcity.length,9);
      
      while(arr.length<10 && len>0)
      {
        let temp="len"+len;
        const url='http://localhost:8983/solr/'+temp+'/select?q=cityName%3A' + qcity + '%20OR%20stateName%3A' + qcity + '%20OR%20aliasCityName%3A' + qcity + '&rows=10&sort=weightage%20asc';
      //  console.log(url);
        const newRequest = util.promisify(request.get);
        const body = await axios.get(url)
      //  console.log(body.data.response.docs)
        //console.log(JSON.parse(body))
        let arr1=body.data.response.docs
      //  console.log(url)
      //  console.log(arr1)
        let ans=[]
        for(let x of arr1)
        {
            let temp=0;
            for(let y of arr)
            {
                if(x.cityCode[0]==y.cityCode[0])
                {
                    temp=1;
                }
            }
            if(temp==0)
            ans.push(x)
        }
        arr=arr.concat(ans);
    //    console.log(arr)
        len--;
      }
    
  }
  else {
      //Invalid data
  }
 // console.log("hello!!!!!!!!!!!");

 res.send(arr);
 
});
// http://localhost:8983/solr/citydata/select?q=cityName%3ABangalore%20OR%20stateName%3ABangalore%20OR%20aliasCityName%3ABangalore&rows=10&sort=weightage%20desc

app.get('/update/:cityCode', (req, res) => {
  cityData.findOne({cityCode : req.params.cityCode}, (err, city) => {
    if(city){
      if(req.query.cityName)
        city.cityName = req.query.cityName;
      if(req.query.stateName)
        city.stateName = req.query.stateName;
      if(req.query.locationType)
        city.locationType = req.query.locationType;
      if(req.query.aliasCityName)
        city.aliasCityName = req.query.aliasCityName;
      if(req.query.weightage && Number.isInteger(req.query.weightage))
        city.weightage = parseInt(req.query.weightage);
      city.save((err) => {
        if(err) throw err;
      });
      
      }
  });
});
app.get("/array",(req,res)=>{
    console.log(arr)
})