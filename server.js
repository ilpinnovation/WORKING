var express = require('express');
var csv = require('csv-express')
var app = express();
var server = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
var HttpStatus = require('http-status');
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
var port = process.env.PORT || 2000;

var NlpManager = require('node-nlp').NlpManager;
var keyword_extractor = require("keyword-extractor");
var MongoClient = require('mongodb').MongoClient;
//var mongooseUri = 'mongodb://127.0.0.1:27017/emmauser';
var mongooseUri='mongodb://emma:yashvanth23@ds143594.mlab.com:43594/emmauser'
var mongo = require('mongodb');

// MongoClient.connect(mongooseUri,function(err,db){
//     var dbo = db.db('emmauser');
//     var time =new Date().getTime();
//     var dd={empid:"1111",password:"1234",time:new Date().getTime()};
//   dbo.collection("adminusers").insertOne(dd,function(err4,data4){
//     console.log(data4)
//    })
// //    dbo.collection("question").deleteOne({_id:new mongo.ObjectID("5bf4e31e0f61f8320b7ab99f")}, function(err, obj) {

// //    });
// });

app.use(express.static('public'));
var errorMsg = {
    UNEXP_ERROR: 'unexpected error in accessing data',
    USER_NOT_FOUND: 'user not found',
    EMAIL_IN_USE: 'email already in use',
    USERNAME_IN_USE: 'username already in use',
    MOBILE_IN_USE: 'mobile number in use',
    INVALID_PASS_U: 'username and password does not match',
    INVALID_PASS_E: 'email and password does not match'
}
var status = {
    SUCCESS: 'success',
    FAILURE: 'failure'
}

var httpStatus = {
    OK: HttpStatus.OK,
    ISE: HttpStatus.INTERNAL_SERVER_ERROR,
    BR: HttpStatus.BAD_REQUEST
}

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//var ser5ver=require("./server/user.js")(app);
//app.get('testing_user',ser5ver.sendFeedback);


var globalvalue = "";
var o = ""
var fs = require("fs");
var str = fs.readFileSync("nlu.json", "utf8");
var data = JSON.parse(str);
//new data
var newstr = fs.readFileSync("newNLP.json", "utf8");
var newdata = JSON.parse(newstr);

var newmanager = new NlpManager({ languages: ['en'] });
for (var e = 0; e < newdata.length; e++) {
    for (var h = 0; h < newdata[e].text.length; h++) {
        newmanager.addDocument('en', newdata[e].text[h], newdata[e].intent);
    }
    for (var h = 0; h < newdata[e].action.length; h++) {
        newmanager.addAnswer('en', newdata[e].intent, newdata[e].action[h]);
    }

    if (newdata.length - 1 == e) {
        newmanager.train();
        newmanager.save();
    }
}

var manager = new NlpManager({ languages: ['en'] });
for (var e = 0; e < data.length; e++) {
    for (var h = 0; h < data[e].text.length; h++) {
        manager.addDocument('en', data[e].text[h], data[e].intent);
    }
    for (var h = 0; h < data[e].action.length; h++) {
        manager.addAnswer('en', data[e].intent, data[e].action[h]);
    }

    if (data.length - 1 == e) {
        train_and_save();
    }
}

app.post('/newchat', function (req, res) {
    var reqdata=req.body.data;   
    (async() => {
        // await
        // newmanager.train();
        // newmanager.save();
        const response = await newmanager.process('en', reqdata);
        o = response;
            if (o.answer == undefined) {

                o["answer"] = "sorry i can't understand, can you repeat";
               
                res.send(o);
                return;
            } else {
                res.send(o)
                return ;
            }
       
        
    })();
});

app.post('/removefrom', function (req, res) {
   
    MongoClient.connect(mongooseUri, function (err, db) {
        var dbo = db.db('emmauser');
        var rra;
        dbo.collection("userd").findOne({ email: req.body.email }, function (ewww1, wwww1) {
            for (var e = 0; e < wwww1.question.length; e++) {
                if (wwww1.question[e] == req.body.ls) {

                    wwww1.question.splice(e, 1);
                    break;
                }
            }
            dbo.collection("userd").update(
                { email: req.body.email },
                { $set: { question: wwww1.question } }, function (ewww, wwww) {
                    dbo.collection("question").update({ _id: new mongo.ObjectID(req.body.ls) }, { $set: { userpop: true } }, function (errwq, datawq) {
                        res.send({ status: 200, data: "" });
                        return;
                    })
                })
        })
    });
});

app.post('/createadmin', function (req, res) {
    MongoClient.connect(mongooseUri, function (err, db) {
        var dbo = db.db('emmauser');
        var time = new Date().getTime();
        var dd = { empid: req.body.empid, password: req.body.password, time: new Date().getTime() };
        dbo.collection("adminusers").insertOne(dd, function (err4, data4) {
            res.send({ status: 200, msg: "May be user have added" });
            return;
        })
    })
});
app.post('/checklastlog', function (req, res) {

    MongoClient.connect(mongooseUri, function (err, db) {
        var dbo = db.db('emmauser');
        var qq = [];
        dbo.collection("userd").findOne({ "email": req.body.email }, function (e, data23) {
            if (data23 == null) {
                res.send({ status: 200, data: "", user: "new" });
                return;
            } else {
                if (data23.question.length > 0) {
                    for (var i = 0; i < data23.question.length; i++)
                        dbo.collection("question").findOne({ _id: new mongo.ObjectID(data23.question[i]), userpop: false, adminreply: true }, function (e, gdata) {
                            if (gdata != null)
                                qq.push(gdata);
                        })
                    dbo.collection("useranswered").findOne({ "email": req.body.email }, function (e, data43) {
                        data23["value"] = data43.value;
                        data23["valuetime"] = data43.time;
                        data23["questions"] = qq;
                        res.send({ status: 200, data: data23, user: "old_q" });
                        return;
                    })

                } else {
                    dbo.collection("useranswered").findOne({ "email": req.body.email }, function (e, data43) {
                        data23["value"] = data43.value;
                        data23["valuetime"] = data43.time;
                        data23["questions"] = qq;
                        res.send({ status: 200, data: data23, user: "old" });
                        return;
                    })
                }
            }
        });
    });

});


app.post('/updateprofile', function (req, res) {
    MongoClient.connect(mongooseUri, function (err, db) {
        if (err) throw err;
        var dbo = db.db('emmauser');
        dbo.collection("adminusers").update({ "empid": req.body.empid }, { $set: { "password": req.body.password } }, function (err5, data5) {
            if (err5) {
                res.send({ status: 400, msg: "Error in Update" });
                return;
            }
            res.send({ status: 200, msg: "successfully changed your password" });
            return;
        })
    });
});


app.get('/chatbot', function (req, res) {

    if (req.query.email != undefined)
        var email = req.query.email;
    else
        var email = "admin@tcs.com"
    var query = req.query.text;
    if (req.query.name == undefined)
        var username = "admin";
    else
        var username = req.query.name;
    var time = new Date().getTime();
    query = query.toLowerCase();
    if (query.search("i'm") == 0 || query.search("i am") == 0 || query.search("im") == 0 && query.length < 15) {

        var extraction_result = keyword_extractor.extract(query, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: false

        });
        if (extraction_result.length == 1)
            res.send({ "answer": "Welcome " + extraction_result[0] });
        if (extraction_result.length > 1)
            res.send({ "answer": "Welcome " + extraction_result[1] });
        return;
    }
    else {
        (async () => {
            const response = await manager.process('en', query);
            o = response;
            if (o.answer == undefined) {

                o["answer"] = "sorry i can't understand";
                globalvalue = ""
                res.send(o);
                return;
            } else {

                if (o.score > .90) {
                    globalvalue = ""
                    res.send(o);
                    return;
                } else if (o.score > .65) {
                    if (globalvalue == "") {
                        globalvalue = query;
                        o["answer"] = " Sorry looks like I could not answer you. Can you ask your question differently?"
                        res.send(o);
                        return;
                    } else {
                        globalvalue = query;
                        var dd = { question: globalvalue, username: username, time: time, answer: "", userpop: false, adminreply: false, responser_name: "", email: email };
                        MongoClient.connect(mongooseUri, function (err, db) {
                            var dbo = db.db('emmauser');
                            dbo.collection("question").insertOne(dd, function (err4, data4) {
                                var arrayadd = data4.ops[0]._id;

                                globalvalue = "";
                                if (email != "admin@tcs.com") {

                                    dbo.collection("userd").update({ "email": email }, { $push: { "question": arrayadd } }, function (errwq, datawq) {

                                        o["answer"] = "sorry i can't understand,but don't worry i'll ask these question to admin and get to you quickly"
                                        res.send(ouser);
                                        return;
                                    });
                                } else {
                                    o["answer"] = "sorry i can't understand,but don't worry i'll ask these question to admin and get to you quickly"
                                    res.send(o);
                                    return;
                                }


                            })
                        });


                    }
                } else {
                    o["answer"] = "sorry its irrelvant question can you ask something else!";
                    res.send(o);
                    return;
                }
            }
        })();
    }

});




app.post("/savenewintent", function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;

    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {
            for (var e = 0; e < req.body.data.length; e++) {
                data.push(req.body.data[e]);
                for (var h = 0; h < req.body.data[e].text.length; h++) {
                    manager.addDocument('en', req.body.data[e].text[h], req.body.data[e].intent);
                }
                for (var h = 0; h < req.body.data[e].action.length; h++) {
                    manager.addAnswer('en', req.body.data[e].intent, req.body.data[e].action[h]);
                }

            }

            setTimeout(function () {
                fs.writeFile('nlu.json', JSON.stringify(data), 'utf8', function () {
                    train_and_save();
                    res.send({ status: 200, data: "Saving new data" });
                    return;
                });
            }, 2000)
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
})


app.post("/getdata", function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;

    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {
            res.send(data)
            return;
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
})

app.get("/downloaduser", function (req, res) {

    var filename = new Date() + ".csv";
    MongoClient.connect(mongooseUri, function (err, db) {
        if (err) throw err;
        var dbo = db.db('emmauser');
        dbo.collection("useranswered").find({ "value": "yes" }, { _id: 0, name: 1, email: 1, value: 1, time: 1 }).toArray(function (e, data23) {
            var asas = [];
            if (data23)
                data23.forEach(element => {
                    asas.push({ Name: element.name, Email: element.email, Interview_Accepted: element.value, Time: new Date(element.time).toLocaleString() })
                });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader("Content-Disposition", 'attachment; filename=' + filename);
            res.csv(asas, true);
        })
    });

});

app.get("/reset", function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {
            MongoClient.connect(mongooseUri, function (err, db) {
                if (err) throw err;
                var dbo = db.db('emmauser');
                dbo.collection("useranswered").update({ "value": "yes" }, { $set: { "value": "no" } }, { multi: true }, function (err5, data5) {
                    console.log(err5);
                    res.send(data5)
                })

            });
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
});



app.post("/savethis", function (req, res) {

    var go = {
        "name": req.body.name,
        "email": req.body.email,
        "value": req.body.value
    }

    MongoClient.connect(mongooseUri, function (err, db) {
        if (err) throw err;
        var dbo = db.db('emmauser');
        dbo.collection("userd").findOne({ "email": req.body.email }, function (e, data23) {
            if (data23 == null) {
                // dbo.collection("userd").insertOne({ name: go.name, email: go.email, time: new Date().getTime(), question: [] }, function (err4, data4) {
                //     dbo.collection("useranswered").insertOne({ name: go.name, email: go.email, value: go.value, time: new Date().getTime() }, function (err4, data4) {
                //         res.send({ save: "success" });
                //         return;
                //     })
                // })
                res.send({status:403});
                return;
            } else {

                dbo.collection("useranswered").updateOne({ "email": req.body.email }, { $set: { value: req.body.value, time: new Date().getTime() } }, function (err5, data5) {
                    res.send({status:200});
                    return;
                })
            }
        })
    })

})

app.get("/keywordextract", function (req, res) {

    var data = req.query.keyword;
    var extraction_result1 = keyword_extractor.extract(data, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false
    });
    res.send({ data: extraction_result1 });


})
app.post('/savequery', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {

            var intent = req.body.data.intent;
            var answer = req.body.data.answer;
            var question = req.body.data.question;
            var list = req.body.data.list;
            var a = {
                intent: intent,
                text: [question],
                action: [answer],
                edit: false
            }
            data.push(a)
            manager.addDocument('en', question, intent);
            manager.addAnswer('en', intent, answer);
            MongoClient.connect(mongooseUri, function (err, db) {
                var dbo = db.db('emmauser');
                dbo.collection("question").updateOne({ _id: new mongo.ObjectID(list) }, { $set: { adminreply: true, responser_name: "admin", answer: answer } }, function (err, obj) {
                    fs.writeFile('nlu.json', JSON.stringify(data), 'utf8', function () {
                        train_and_save();
                        res.send({ status: "reseting for single query is over" })
                        return;
                    });
                });
            })
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }

});

app.get("/deletequestion", function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {
            var rra = 0;
            MongoClient.connect(mongooseUri, function (err, db) {
                var dbo = db.db('emmauser');
                dbo.collection("question").findOne({ _id: new mongo.ObjectID(req.query.list) }, function (erw, DataTr) {
                    dbo.collection("userd").findOne({ email: DataTr.email }, function (ewww1, wwww1) {
                        for (var e = 0; e < wwww1.question.length; e++) {

                            if (wwww1.question[e] == req.query.list) {
                                rra = e;
                                wwww1.question.splice(rra, 1);
                                break;
                            }
                        }


                        dbo.collection("userd").update(
                            { email: DataTr.email },
                            { $set: { question: wwww1.question } }, function (ewww, wwww) {

                            })
                    })
                })
                dbo.collection("question").deleteOne({ _id: new mongo.ObjectID(req.query.list) }, function (err, obj) {
                    res.send({ status: "reseting for single query is over" })
                    return;
                });
            });
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
});

app.post('/addandedit', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {

            var a = JSON.parse(req.body.data);
            for (var t = 0; t < data[a.key].text.length; t++)
                removeintent(data[a.key].intent, data[a.key].text[t]);
            for (var t = 0; t < data[a.key].action.length; t++)
                removeanswer(data[a.key].intent, data[a.key].action[t]);

            data[a.key].text = a.ss.text;
            data[a.key].action = a.ss.action;

            for (var t = 0; t < data[a.key].text.length; t++)
                addintent(data[a.key].intent, data[a.key].text[t]);
            for (var t = 0; t < data[a.key].action.length; t++)
                addanswer(data[a.key].intent, data[a.key].action[t]);
            train_and_save();

            fs.writeFile('nlu.json', JSON.stringify(data), 'utf8', function () {
                res.send({ status: "reseting is over" })
                return;
            })
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
});



app.post('/writedata', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {

            var a = JSON.parse(req.body.data);
            fs.writeFile('nlu.json', JSON.stringify(a.ss), 'utf8', function () {
                res.send({ status: "reseting is over" })
                return;
            })
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }
});

app.get('/questions', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    if (token) {
        var texta = Buffer.from(token, 'base64').toString('ascii');
        if ("adminyashvanthadmin" == texta) {
            MongoClient.connect(mongooseUri, function (err, db) {
                var dbo = db.db('emmauser');
                dbo.collection("question").find({ adminreply: false }).toArray(function (e, data23) {

                    res.send(data23);
                    return;
                })
            });
        } else {
            res.send({ status: "Authendication error please try to login" });
            return;
        }
    } else {
        res.send({ status: "Authendication error please try to login" });
        return;
    }

});



function addintent(intent, b) {
    manager.addDocument('en', b, intent);
}
function addanswer(intent, answer) {
    manager.addAnswer('en', intent, answer);
}

function removeintent(intent, b) {
    manager.removeDocument('en', b, intent);
}
function removeanswer(intent, answer) {
    manager.removeAnswer('en', intent, answer);
}
function train_and_save() {
    manager.train();
    manager.save();
}
require('./user')(app);

server.listen(port);
console.log('App is listening on port: ' + port);
