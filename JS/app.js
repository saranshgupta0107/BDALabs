var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { config } = require('process');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin:xhBJxsjAn8oLKR6k@main.dttg1p4.mongodb.net/BDA_Labs");
var loginemail = "";
const secretKey = 'secret';

var signUpSchema = new mongoose.Schema({
    email: String,
    fname: String,
    lname: String,
    phno: String,
    admin: Boolean,
    password: String,
    roll: String
   });

var loginSchema = new mongoose.Schema({
    email: String,
    password: String
   });

var userProjectSchema = new mongoose.Schema({
    ID: String,
    ArrayID: Array
});

var userCourseSchema = new mongoose.Schema({
    ID: String,
    ArrayID: Array
});

var userPublicationSchema = new mongoose.Schema({
    userID: String,
    publicationID: Array
});

var projectsSchema = new mongoose.Schema({
    name: String,
    description: String,
    instructor: String
});

var coursesSchema = new mongoose.Schema({
    course_name: String,
    instructor: String,
    ta: Array,
    number_of_students: String,
    no_of_it_student: String,
    mba_student: String,
   });

var publicationSchema = new mongoose.Schema({
    name:String,
    supervisor:String,
    courseName:String,
    abstract:String,
    authors:Array,
    pub_date:Date,
    publisher:String,
    location:String
})

var peopleSchema = new mongoose.Schema({
    name: String,
    post: String,
    course_name: String
})

module.exports={     
    fetchData:function(callback){
       var Login = Login.find({});
       userData.exec(function(err, data){
           if(err) throw err;
           return callback(data);
       })
    }
}
const createToken = (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
  };

const verifyToken = (token) => {
    return jwt.verify(token, secretKey);
  };
var token = "";
var Login = mongoose.model("Login", loginSchema,"Login");
var SignUp = mongoose.model("SignUp", signUpSchema,"Login");
var UserProject = mongoose.model("User_Project_Relation", userProjectSchema,"User_Project_Relation");
var UserCourse = mongoose.model("User_Course_Relation", userCourseSchema,"User_Course_Relation");
var UserPublication = mongoose.model("User_Publication_Relation", userPublicationSchema,"User_Publication_Relation");
var courses = mongoose.model("Courses", coursesSchema,"Courses");
var projects = mongoose.model("Projects", projectsSchema,"Projects");
var publication = mongoose.model("Publications", publicationSchema,"Publications");
var people = mongoose.model("People", peopleSchema,"People");


var app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, "../public")));
app.use('/Images', express.static(path.join(__dirname, "../Images")));

async function DelOne(collection,res,query,token,dep)
{
    try {
        verifyToken(token);
        var myData = await collection.findOneAndDelete(query);
        var doc = await dep.find({ArrayID:myData._id})
        for(i = 0;i<doc.length;i++)
        {
            var x = doc[i].ArrayID;
            var y = myData._id;
            for(var j = 0;j<x.length;j++)
            {
                var a = JSON.stringify(x[j]);
                var b = JSON.stringify(y);
                console.log(a == b);
                console.log(a);
                if(a == b)
                {
                    if(j == x.length-1)
                    {
                        x.pop();
                    }
                    else
                    {
                        x.splice(j,1);
                    }
                    break;
                }
            }
            dep.findOneAndDelete(doc[i]);
            doc[i].ArrayID = x;
            doc[i].save();
        }
        res.send("Deleted Successfully")
        }
    catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
    }
}

function AddOne(collection,res,req,token)
{
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new collection(req.body);
        myData.save()
        .then(item => {
        res.send(collection + " successful");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
}

app.post('/signup', function (req, res) {
    var myData = new SignUp(req.body);
    var x;
    var flag = true;
    myData.save()
    .then(item => {
    res.send("Signup successful");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

app.post('/publicationInput', function (req, res) {
    var myData = new publication(req.body);
    myData.save()
    .then(item => {
    res.send("Publication successful");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

app.post('/login_admin', (req, res) => {
    SignUp.find({"email":req.body.email,"password":req.body.password,"admin":true}).then((User) => {
        console.log(User)
        loginemail = req.body.email;
        token = createToken({User},config.secretKey);
        console.log('Token:', token);
        res.redirect('/admin');
    }).catch((error)=>{
        console.log(error);
        res.json({
            error: "Account not found"
        }).status(400);
    })
});

app.post('/login_user', (req, res) => {
    SignUp.find({email:req.body.email,password:req.body.password}).then((User) => {
        console.log(User)
        loginemail = req.body.email;
        token = createToken({User},config.secretKey);
        console.log('Token:', token);
        res.redirect('/login_user1');
    }).catch((error)=>{
        res.json({
            error: "Account not found!"  
        }).status(400);
    })
});

app.post('/coursesInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new courses(req.body);
        const options = {
            projection: { _id: 1}
          };    
        addUserDep(UserCourse,myData._id,req.body.ta,res,options);
        myData.save().then(item => {
        res.send("Course successful");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/callForTutorialInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new callForTutorial(req.body);
        myData.save()
        .then(item => {
        res.send("Signup successful");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/callForWorkshopInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new callForWorkshop(req.body);
        myData.save()
        .then(item => {
        res.send("Signup successful");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/publications', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new publication(req.body);
        myData.save().then(item => {
        res.send("Publication successful");
        for(var i = 0;i<req.body.authors.length;i++)
        {
            var x = Signup.findOne({email:req.body.authors[i]});
            var y = Publication.findOne({mydata});
            var userpubrel = userPublicationSchema({
                userID: x.__id,
                PublicationID: y.__id
            })
        }
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/workshops', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new workshop(req.body);
        myData.save()
        .then(item => {
        res.send("Signup successful");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/people', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new people(req.body);
        myData.save()
        .then(item => {
        res.send("Data entered successfully");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/projects', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new projects(req.body);
        const options = {
            projection: { _id: 1}
          };    
        addUserDep(UserProject,myData._id,req.body.authors,res,options);
        myData.save().then(item => {
        res.send("Publication successful");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

async function addUserDep(Relation,myData,req,res,options)
{
    try{
        for(var i = 0;i<req.length;i++)
        {
            var x = await SignUp.findOne({email:req[i]},options);
            if(x == null)
            {
                res.status(200).send("User entry invalid. No user with email id" + req[i]);
                return;
            }
        }
        for(var i = 0;i<req.length;i++)
        {
            var x = await SignUp.findOne({email:req[i]},options);
            console.log(x);
            doc = await Relation.findOne({ID:x._id});
            if(doc === null){
                var userrel = Relation({
                    ID: x._id,
                    ArrayID: myData
                })
                userrel.save();
                console.log(userrel);
            }
            else
            {
                doc.ArrayID.push(myData);
                userrel = await Relation.findOneAndUpdate({ID:x._id},doc,{new: true});
            }
        }
    }
    catch(e)
    {
        console.log(e);
        return false;
    }
    return true;
}

app.post('/courses', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new courses(req.body);
        const options = {
            projection: { _id: 1}
            };    
        if(addUserDep(Courses,myData._id,req,options))
        {
            myData.save().then(item => {
            res.send("Course successful");
            })
            .catch(err => {
                res.status(400).send("unable to save to database");
            });
        }
        else
        {
            res.send("unknown error");
        }
    }
    catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
    }
});

app.post('/takes', function (req, res) {
    var myData = new takes(req.body);
    myData.save()
    .then(item => {
    res.send("Signup successful");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

app.get('/', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/index.html');
});

app.get('/login_admin', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/login_admin.html');
});

app.get('/login_user1', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/user1.html');
      }
      catch (error) {
        res.status(400).send('Error: User Login not detected.');
      }
});

app.get('/publicationInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new publication(req.body);
        const options = {
            projection: { _id: 1}
            };    
        addUserDep(UserPublication,myData._id,req,options)
        myData.save().then(item => {
        res.send("Publication successful");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
    }
    catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
    }
});

app.get('/projectdelete', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/projectdelete.html');
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/login_user', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/login_user.html');
});

app.get('/coursedelete', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/coursedelete.html');
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/admin', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/admin.html');
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/signup', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/signup.html');
});

app.get('/courseInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/courses.html');
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});
app.get('/publications', function (req, res) {
    try {
        console.log(token);
        publication.find().then(( allUsers) => {
            console.log(allUsers)
            res.status(200).json(allUsers)
        }).catch((e)=>{
            console.log("Unable to load users!")
            res.status(400).send(e)
    })
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/peopleInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/people.html');
      }
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/projectInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/projects.html');
      } 
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/peopledelete', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/peopledelete.html');
      } 
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/users', (req, res) => {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        res.setHeader('Access-Control-Allow-Origin', '*');
        SignUp.find().then(( allUsers) => {
            console.log(allUsers)
            res.status(200).json(allUsers)
        }).catch((e)=>{
            console.log("Unable to load users!")
            res.status(400).send(e)
    })
      } 
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});
app.get('/user', (req, res) => {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        if(loginemail !==""){
        res.setHeader('Access-Control-Allow-Origin', '*');
        SignUp.find({}).then(( allUsers) => {
            console.log(allUsers)
            res.status(200).json(allUsers)
        }).catch((e)=>{
            console.log("Unable to load users!")
            res.status(400).send(e)
        
    })
   }
   else{
    res.status(400).send("NO DATA")
   }
      } 
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});
app.get('/courses', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    courses.find().then(( allCourses) => {
        console.log(allCourses)
        res.status(200).json(allCourses)
    }).catch((e)=>{
        console.log("Unable to load courses!")
        res.status(400).send(e)
    })
});
app.get('/projects', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    projects.find().then(( allProjects) => {
        console.log(allProjects)
        res.status(200).json(allProjects)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});

app.get('/people', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    people.find().then(( allPeoples) => {
        console.log(allPeoples)
        res.status(200).json(allPeoples)
    }).catch((e)=>{
        console.log("Unable to load people!")
        res.status(400).send(e)
    })
});

app.get('/logged',(req,res) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    if(loginemail !== "" ){
 const logJSON = {
    loginemail 
 }
 res.status(200).json(logJSON);
}
else{
    res.status(400).send("NO DATA");
}
}
)
app.delete('/projects/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    DelOne(projects,res,{name:req.body.name},token,UserProject);
});

app.delete('/courses/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    DelOne(courses,res,{course_name: req.body.name},token,UserCourse);
});

app.delete('/publication/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    DelOne(publication,res,{name: req.body.name},token,UserPublication);
});

app.listen(port, () => console.log(`This app is listening on port ${port}`));