var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { config } = require('process');
const { addListener } = require('nodemon');
const notifier = require('node-notifier')
const bcrypt = require('bcrypt');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin:xhBJxsjAn8oLKR6k@main.dttg1p4.mongodb.net/BDA_Labs");
const adminKey = 'admin';
const userKey = 'user';

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
    password: String,
    admin: Boolean
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
    ID: String,
    ArrayID: Array
});

var projectsSchema = new mongoose.Schema({
    title: String,
    objective : String,
    description: String,
    members: Array,
    instructor: String,
    date : Date,
    references: String
});

var coursesSchema = new mongoose.Schema({
    course_name: String,
    instructor: String,
    ta: Array,
    number_of_students: String,
   });

var publicationSchema = new mongoose.Schema({
    name: String,
    supervisor: String,
    abstract: String,
    authors: Array,
    pub_date: Date,
    publisher: String,
    location: String
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
const createAdminToken = (payload) => {
    return jwt.sign(payload, adminKey, { expiresIn: '1h' });
  };

const verifyAdminToken = (token) => {
    return jwt.verify(token, adminKey);
  };

const createUserToken = (payload) => {
    return jwt.sign(payload, userKey, { expiresIn: '1h' });
  };

const verifyUserToken = (token) => {
    return jwt.verify(token, userKey);
  };


var Login = mongoose.model("Login", loginSchema,"Login");
var SignUp = mongoose.model("SignUp", signUpSchema,"Login");
var UserProject = mongoose.model("User_Project_Relation", userProjectSchema,"User_Project_Relation");
var UserCourse = mongoose.model("User_Course_Relation", userCourseSchema,"User_Course_Relation");
var UserPublication = mongoose.model("User_Publication_Relation", userPublicationSchema,"User_Publication_Relation");
var courses = mongoose.model("Courses", coursesSchema,"Courses");
var projects = mongoose.model("Projects", projectsSchema,"Projects");
var publication = mongoose.model("Publications", publicationSchema,"Publications");

var app = express();
const port = 3000;

//app uses

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, "../public")));
app.use('/Images', express.static(path.join(__dirname, "../Images")));
app.use(cookieParser());

//functions

/*async function that deletes the field with _id = key from collection and it's connecting entry in dependant collection : dep
if admin is logged in. Example : course with _id = key removed from course and userCourse collections.
*/

async function DelOne(collection,res,key,token,dep)
{
    try {
        verifyAdminToken(token);
        var myData = await collection.findOneAndDelete(key);
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

//function to add req.body fields from a form to a collection as an admin and create the links between collections using AddUserDep().

function AddOne(collection,dep,res,req,query)
{
    try {
        console.log(req.body);
        var token = req.cookies.auth;
        verifyAdminToken(token);
        var myData = new collection(req.body);
        const options = {
            projection: { _id: 1}
          };
        addUserDep(dep,myData._id,query,res,options);
        myData.save().then(item => {
            res.redirect("/admin");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
}

/*
async function addUserDep links user to a collection(course,publication,etc.) by adding entries in dependancy collections userCourse,
userPublication,etc.
*/

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

//app.post begins here.

app.post('/signup', async function (req, res) {
    var myData = new SignUp(req.body);
    var salt = await bcrypt.genSalt();
    myData.password = await bcrypt.hash(req.body.password, salt);
    if(myData.email.startsWith("IIT") || myData.email.startsWith("IEC"))
    {
        myData.roll = "B. Tech."
    }
    else if(myData.email.startsWith("RSI"))
    {
        myData.roll = "PHD"
    }
    else if(myData.email.startsWith("MEC") || myData.email.startsWith("MIT") || myData.email.startsWith("MDE") || myData.email.startsWith("MBI"))
    {
        myData.roll = "M. Tech."
    }
    myData.save()
    .then(item => {
        res.redirect("/");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

app.post('/login_admin', async (req, res) => {
    await Login.find({"email":req.body.email, "admin":true}).then(async (User) => {
        if(User != '')
        {
            if (await bcrypt.compare(req.body.password,User[0].password)) {
                token = createAdminToken({User},config.adminKey);
                console.log('Token:', token);
                res.cookie('loginemail',req.body.email);
                res.cookie('auth',token);
                res.redirect('/admin');
            }
            else
            {
                notifier.notify(
                    {
                      title: 'BDA Labs',
                      message: 'Invalid Credentials',
                    });
                res.redirect("/login_admin");
            }
        }
        else
        {
            notifier.notify(
                {
                  title: 'BDA Labs',
                  message: 'Invalid Credentials',
                });
            res.redirect("/login_admin");
        }
    }).catch((error)=>{
        console.log(error);
        res.json({
            error: "Account not found"
        }).status(400);
    })
});

app.post('/login_user', (req, res) => {
    Login.find({"email":req.body.email}).then(async (User) => {
        if(User != '')
        {
            if (await bcrypt.compare(req.body.password,User[0].password)) {
            token = createUserToken({User},config.userKey);
            console.log('Token:', token);
            res.cookie('loginemail',req.body.email);
            res.cookie('email',req.body.email);
            res.cookie('auth',token);
            res.redirect('/userdashboard');
            }
        }
        else
        {
            notifier.notify(
                {
                  title: 'BDA Labs',
                  message: 'Invalid Credentials',
                });
            res.redirect("/login_user");
        }
    }).catch((error)=>{
        console.log(error);
        res.json({
            error: "Account not found"
        }).status(400);
    })
});

app.post('/search_user', async (req, res) => {
    if(req.body.query != '')
    {
        if(req.body.query.includes('@'))
        {
                SignUp.find({email:req.body.query}).then((User) => {
                    console.log(User)
                    res.cookie('email',req.body.query);
                    res.redirect('/search_user1');
                }).catch((error)=>{
                res.json({
                    error: "Account not found!"
                }).status(400);
            })
        }
        else
        {
            req.body.query = req.body.query.split(' ');
            var fn = req.body.query[0];
            if(req.body.query.length == 1)
            {
                res.cookie("fname",fn);
                res.redirect("/search_people_fname");
            }
            else
            {
                var ln = req.body.query[1];
                SignUp.find({fname:fn,lname:ln}).then((User) => {
                if(User[0] != '')
                {
                    res.cookie("email",User[0].email);
                    console.log(User[0].email);
                    res.redirect('/search_user1');
                }
                }).catch((error)=>{
                    console.log(error);
                res.json({
                    error: "Person not found!"
                }).status(400);
                })
            }
        }
    }
    else if(req.cookies.loginemail != '')
    {
        Login.find({email:req.cookies.loginemail}).then((User) => {
            console.log(User)
            res.cookie('email',loginemail);
            res.redirect('/userdashboard');
         }).catch((error)=>{
            res.json({
                error: "Account not found!"
             }).status(400);
         })
    }
    else
    {
        console.log('error');
    }
});

app.post('/publications', function (req, res) {
    var x = req.body.authors.toString();
    req.body.authors = x.split(',');
    AddOne(publication,UserPublication,res,req,req.body.authors);
});

app.post('/projects', function (req, res) {
    var x = req.body.members.toString();
    req.body.members = x.split(',');
    AddOne(projects,UserProject,res,req,req.body.members);
});

app.post('/courses', function (req, res) {
    var x = req.body.ta.toString();
    req.body.ta = x.split(',');
    AddOne(courses,UserCourse,res,req,req.body.ta);
});

//app.get begins here

app.get('/', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/index.html');
});

app.get('/login_admin', function (req, res) {
    let x = path.join(__dirname,'../');
    res.sendFile(x + '/login_admin.html');
});

app.get('/logout',(req,res)=>{
    res.cookie('loginemail','');
    res.cookie('email','');
    res.cookie('auth','');
    res.redirect('/');
})

app.get('/userdashboard', function (req, res) {
    try {
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyUserToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/user1.html');
      }
      catch (error) {
        res.status(400).send('Error: User Login not detected.');
      }
});

app.get('/search_people_fname', function (req, res) {
    try {
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/peoplefname.html');
      }
      catch (error) {
        res.status(400).send('Error: Unknown');
      }
});

app.get('/search_people_name', function (req, res) {
    try {
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/peoplename.html');
      }
      catch (error) {
        res.status(400).send('Error: Unknown');
      }
});

app.get('/search_user1', function (req, res) {
    try {
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/search1.html');
      }
      catch (error) {
        res.status(400).send('Error: Unknown');
      }
});

app.get('/publicationInput', function (req, res) {
    try {
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/publication.html');
      }
      catch (error) {
        res.status(400).send('Error: User Login not detected.');
      }
});

app.get('/projectdelete', function (req, res) {
    try {
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
        console.log('Decoded:', decoded);
        let x = path.join(__dirname,'../');
        res.sendFile(x + '/project.html');
      } 
      catch (error) {
        res.status(400).send('Error: Admin Login not detected.');
      }
});

app.get('/peopledelete', function (req, res) {
    try {
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyAdminToken(token);
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
        const decoded = verifyAdminToken(token);
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
        var token = req.cookies.auth;
        console.log(token);
        const decoded = verifyUserToken(token);
        console.log('Decoded:', decoded);
        loginemail = req.cookies.loginemail;
        if(loginemail !==""){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log("email is " + loginemail)
        Login.findOne({email: loginemail}).then(( allUsers) => {
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
        res.status(400).send('Error: User Login not detected.');
      }
});
app.get('/searchUser', (req, res) => {
    try {
        var searchemail = req.cookies.email;
        if(searchemail !==""){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log("email is " + searchemail)
        SignUp.findOne({email: searchemail}).then(( allUsers) => {
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
app.get('/userMail', (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        Login.find({email: req.query.email}).then(( user) => {
            console.log(user)
            res.status(200).json(user)
        }).catch((e)=>{
            console.log("Unable to load users!")
            res.status(400).send(e)
        
    })
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
app.get('/project', (req, res) => {
    const id = req.query.id ; 
    res.setHeader('Access-Control-Allow-Origin', '*');
    projects.findOne({_id: id }).then(( allProjects) => {
        console.log(allProjects)
        res.status(200).json(allProjects)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/publication', (req, res) => {
    const id = req.query.id ; 
    res.setHeader('Access-Control-Allow-Origin', '*');
    publication.find({_id: id }).then(( allProjects) => {
        console.log(allProjects)
        res.status(200).json(allProjects)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/Course', (req, res) => {
    const id = req.query.id ; 
    res.setHeader('Access-Control-Allow-Origin', '*');
    courses.findOne({_id: id }).then(( allProjects) => {
        console.log(allProjects)
        res.status(200).json(allProjects)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/project', (req, res) => {
    const id = req.query.id ; 
    res.setHeader('Access-Control-Allow-Origin', '*');
    projects.find({_id: id }).then(( allProjects) => {
        console.log(allProjects)
        res.status(200).json(allProjects)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/userPublication', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var searchemail = req.cookies.email;
    const linker = await  Login.findOne({email: searchemail}).then((user)=>{
        return user 
      })
     
    UserPublication.find({ID: linker._id}).then(( allPublication) => {
        console.log("linked publication is "+ allPublication)
        res.status(200).json(allPublication)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/userProject', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var searchemail = req.cookies.email;
    const linker = await  Login.findOne({email: searchemail}).then((user)=>{
        return user 
      })
     
    UserProject.find({ID: linker._id}).then(( allPublication) => {
        console.log("linked publication is "+ allPublication)
        res.status(200).json(allPublication)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});
app.get('/userCourse', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var searchemail = req.cookies.email;
    const linker = await  Login.findOne({email: searchemail}).then((user)=>{
        return user 
      })
     
    UserCourse.find({ID: linker._id}).then(( allPublication) => {
        console.log("linked publication is "+ allPublication)
        res.status(200).json(allPublication)
    }).catch((e)=>{
        console.log("Unable to load projects!")
        res.status(400).send(e)
    })
});

app.get('/people', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var arr = []
    SignUp.find({}).then(( allPeoples) => {
        allPeoples.forEach((Element)=>{
            if(Element.roll === "PHD" || Element.roll === "M. Tech."){
                arr.push(Element)
            }
        })
        res.status(200).json(arr)

    }).catch((e)=>{
        console.log(e)
        res.status(400).send(e)
    })
});

app.get('/peoplebyemail', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    await SignUp.find({email:req.cookies.email}).then(( allPeoples) => {
        console.log(allPeoples[0]);
        if(allPeoples != '')
        {
            res.cookie("email",allPeoples[0].email);
            res.redirect('/search_user1');
        }
    }).catch((e)=>{
        console.log(e)
        res.status(400).send(e)
    })
});

app.get('/peoplebyfname', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("fname is"  + req.cookies.fname);
    var arr = []
    await SignUp.find({fname: req.cookies.fname}).then(( allPeoples) => {
        allPeoples.forEach((Element)=>{
                arr.push(Element)
        })
        console.log("arr is "  + arr)
        res.status(200).json(arr)

    }).catch((e)=>{
        console.log(e)
        res.status(400).send(e)
    })
});

app.get('/admins', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var arr = []
    SignUp.find({admin:true}).then(( allPeoples) => {
        allPeoples.forEach((Element)=>{
            arr.push(Element)
        })
        res.status(200).json(arr)

    }).catch((e)=>{
        console.log(e)
        res.status(400).send(e)
    })
});

app.delete('/projects/delete', (req, res) => {
    var token = req.cookies.auth;
    res.setHeader('Access-Control-Allow-Origin', '*');
    DelOne(projects,res,{name:req.body.title},token,UserProject);
});

app.delete('/courses/delete', (req, res) => {
    var token = req.cookies.auth;
    res.setHeader('Access-Control-Allow-Origin', '*');
    DelOne(courses,res,{course_name: req.body.name},token,UserCourse);
});

app.delete('/publication/delete', (req, res) => {
    var token = req.cookies.auth;
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("id is " + req.body.id)
    DelOne(publication,res,{_id: req.body.id},token,UserPublication);
});

app.listen(port, () => console.log(`This app is listening on port ${port}`));