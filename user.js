var MongoClient = require('mongodb').MongoClient;
//var mongooseUri = 'mongodb://127.0.0.1:27017/emmauser';
var mongooseUri='mongodb://emma:yashvanth23@ds143594.mlab.com:43594/emmauser'

module.exports = function(app){
    app.post('/uploaddrivewithuser', function (req, res) {
   
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
        if (token) {
            var texta = Buffer.from(token, 'base64').toString('ascii');
            if ("adminyashvanthadmin" == texta) {
                MongoClient.connect(mongooseUri, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('emmauser');
                    var data={
                        name:req.body.name+"_"+new Date().getTime(),
                        bot:req.body.bot,
                        drivetype:req.body.drivetype,
                        date:req.body.date,
                        image:[req.body.image],
                        imagetime:{start:req.body.starttime,end:req.body.endtime},
                        userlist:req.body.user23.length,
                        OnCreate:new Date().getTime()
                    }
                    var adduser =req.body.user23;
                    var adduserd =req.body.user23;
                    for(var i=0;i<adduser.length;i++){
                        adduser[i]["question"] =[];
                        adduser[i]["bot"] =req.body.bot;
                        adduser[i]["drivedate"] =req.body.date;
                        adduser[i]["time"] =new Date().getTime();
                        adduser[i]["driveID"] =req.body.name+"_"+new Date().getTime()   
                        adduserd[i]["time"] =new Date().getTime();
                        adduserd[i]["driveID"] =req.body.name+"_"+new Date().getTime()   
                        adduserd[i]["value"] ="no";


                    }
                    dbo.collection("drive").insertOne(data,function(req1,res1){
                        
                        dbo.collection("userd").insertMany(adduser,function(req2,res2){
                        dbo.collection("useranswered").insertMany(adduserd, function (err4, data4) {
                        res.send({status:200, save: "success" });
                        return;
                    })
                           

                        })
                    })

                });

            }else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }

    });

    app.get('/drivedata', function (req, res) {
   
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
        if (token) {
            var texta = Buffer.from(token, 'base64').toString('ascii');
            if ("adminyashvanthadmin" == texta) {

                MongoClient.connect(mongooseUri, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('emmauser');
                    dbo.collection("drive").find({}).toArray(function(err,result){
                        var datatosend=[]
                        if(result){
                            var count=0;                            
                         
                                result.forEach(function(element){
                            dbo.collection("userd").find({ driveID: element.name}).toArray(function(err1,resdata){
                                element["userdata"]=resdata;
                                datatosend.push(element);
                                count++;                            
                            if(count==result.length){
                                res.send(result)
                                return;
                            }
                        });
                    });
                        
                        
                        }

                    })
                });
            }else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }

    });

    app.post('/login', function (req, res) {

        var datac = Buffer.from("adminyashvanthadmin").toString('base64');
        var dd = { empid: req.body.name, password: req.body.password };
        if (req.body.name == "1424613" && req.body.password == "admin") {
    
            res.send({ status: 200, msg: "successfully loggedin", token: datac });
            return;
        } else {
            MongoClient.connect(mongooseUri, function (err, db) {
                if (err) throw err;
                var dbo = db.db('emmauser');
                dbo.collection("adminusers").findOne(dd, function (err4, data4) {
    
                    if (err4) {
                        res.send({ status: 400, msg: "Error in login" });
                        return;
                    }
                    if (data4 == null) {
                        res.send({ status: 403, msg: "Error in login" });
                        return;
                    }
                    res.send({ status: 200, msg: "successfully loggedin", token: datac });
                    return;
    
                });
            });
    
        }
    });



    app.get('/alluser', function (req, res) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
        if (token) {
            var texta = Buffer.from(token, 'base64').toString('ascii');
            if ("adminyashvanthadmin" == texta) {
                MongoClient.connect(mongooseUri, function (err, db) {
                    var dbo = db.db('emmauser');
                   dbo.collection("userd").find({}).toArray(function (err, obj) {
                      
                       if(err){
                           res.send("Error occur in user list");
                           return;
                       }else{
                           res.send(obj);
                           return;
                       }
                   })
                });
    
    
                }else {
                        res.send({ status: "Authendication error please try to login" });
                        return;
                    }
      } else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
        });

        app.post('/deleteuser', function (req, res) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
            if (token) {
                var texta = Buffer.from(token, 'base64').toString('ascii');
                if ("adminyashvanthadmin" == texta) {
                    MongoClient.connect(mongooseUri, function (err, db) {
                        var dbo = db.db('emmauser');
                        dbo.collection("userd").remove({email:req.body.email}, function (err, obj) {
                            dbo.collection("useranswered").remove({email:req.body.email}, function (err, obj) {
                            res.send({status:200,code:"success"});
                            return;
                            });
    
                        });

                    });
    
    
                }else {
                        res.send({ status: "Authendication error please try to login" });
                        return;
                    }
      } else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
        });


        app.post('/deletedrive', function (req, res) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
            if (token) {
                var texta = Buffer.from(token, 'base64').toString('ascii');
                if ("adminyashvanthadmin" == texta) {
                    MongoClient.connect(mongooseUri, function (err, db) {
                        var dbo = db.db('emmauser');
                        dbo.collection("drive").remove({name:req.body.drive}, function (err, obj) {
                        dbo.collection("userd").remove({driveID:req.body.drive}, function (err1, obj1) {
                            dbo.collection("useranswered").remove({driveID:req.body.drive}, function (err1, obj1) {
                            res.send({status:200,code:"success"});
                            return;
                            });
                        });
    
                        });

                    });
    
    
                }else {
                        res.send({ status: "Authendication error please try to login" });
                        return;
                    }
                } else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
        });

        app.post('/imagedrive', function (req, res) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
            if (token) {
                var texta = Buffer.from(token, 'base64').toString('ascii');
                if ("adminyashvanthadmin" == texta) {
                    MongoClient.connect(mongooseUri, function (err, db) {
                        var dbo = db.db('emmauser');
                        dbo.collection("drive").update(
                            {name:req.body.drive},
                            { $set: { image: [req.body.image],imagetime:req.body.imagetime } },function (err, obj) {
                                res.send({status:200,code:"success"});
                                return;
                                });
                    });
    
    
                }else {
                        res.send({ status: "Authendication error please try to login" });
                        return;
                    }
                } else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
        });
        app.post('/updateselecteduser', function (req, res) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
            if (token) {
                var texta = Buffer.from(token, 'base64').toString('ascii');
                if ("adminyashvanthadmin" == texta) {
                    MongoClient.connect(mongooseUri, function (err, db) {
                        var dbo = db.db('emmauser');
                      var datatoupdata = req.body.user;
                      datatoupdata.forEach(function(ele){                     
                        dbo.collection("userd").update(
                            {email:ele.email,driveID:req.body.drive},
                            { $set: { userstatus: ele.status,driveID:null }},function (err, obj) {
                                res.send({status:200,code:"success"});
                                return;
                                });
                            })
                    });
    
    
                }else {
                        res.send({ status: "Authendication error please try to login" });
                        return;
                    }
                } else {
                res.send({ status: "Authendication error please try to login" });
                return;
            }
        });

 app.get('/viewtest', function (req, res) {
            MongoClient.connect(mongooseUri, function (err, db) {
                var dbo = db.db('emmauser');
                var data = [];
                var time =new Date().getTime();
                dbo.collection("drive").find({}).toArray( function (err, obj) {
                        if(obj){
                            obj.forEach(function(element){
                            if(time>element.imagetime.start && time <element.imagetime.end){
                                element.image.forEach(function(element1){
                                data.push(element);
                                res.send(data)
                                return;
                                });
                            }
                            });
                        }
                });
            });
        });
       
}
