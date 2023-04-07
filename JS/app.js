var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { config } = require('process');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin:xhBJxsjAn8oLKR6k@main.dttg1p4.mongodb.net/BDA_Labs");

const secretKey = 'secret';

var signUpSchema = new mongoose.Schema({
    email: String,
    fname: String,
    lname: String,
    phno: String,
    admin: Boolean,
    password: String
   });

var loginSchema = new mongoose.Schema({
    email: String,
    password: String
   });

var callForTutorialSchema = new mongoose.Schema({
    name: String,
    id: String,
    dept: String,
    college: String,
    yearofpassing: Number,
    heading: String
   });

var callForPaperSchema = new mongoose.Schema({
    name: String,
    dept: String,
    college: String,
    yearofpassing: Number,
    Paper: String
   });

var callForWorkshopSchema = new mongoose.Schema({
    name: String,
    id: String,
    dept: String,
    college: String,
    yearofpassing: Number,
    heading: String
   });

var projectsSchema = new mongoose.Schema({
    name: String,
    description: String
});

var coursesSchema = new mongoose.Schema({
    course_name: String,
    instructor: String,
    phd_ta: String,
    mtech_ta: String,
    number_of_students: String,
    no_of_it_student: String,
    mba_student: String,
    publications_of_lab: String
   });

var peopleSchema = new mongoose.Schema({
    name: String,
    post: String,
    course_name: String
})

var tutorialSchema = new mongoose.Schema({
    heading: String,
    abstract: String,
    speaker: String
   });

var workshopSchema = new mongoose.Schema({
    heading: String,
    details: String,
    link: String,
   });

var participateSchema = new mongoose.Schema({
    id: String,
    headingofworkshop: String,
   });

var takesSchema = new mongoose.Schema({
    id: String,
    headingoftutorial: String,
   });

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
var callForTutorial = mongoose.model("Call_For_Tutorial", callForTutorialSchema,"Call_For_Tutorial");
var callForPaper = mongoose.model("Call_For_Paper", callForPaperSchema,"Call_For_Paper");
var callForWorkshop = mongoose.model("Call_For_Workshop", callForWorkshopSchema,"Call_For_Workshop");
var courses = mongoose.model("Courses", coursesSchema,"Courses");
var projects = mongoose.model("Projects", projectsSchema,"Projects");
var people = mongoose.model("People", peopleSchema,"People");
var tutorial = mongoose.model("Tutorials", tutorialSchema,"Tutorials");
var workshop = mongoose.model("Workshops", workshopSchema,"Workshops");
var participate = mongoose.model("Participate", participateSchema,"Participate");
var takes = mongoose.model("Takes", takesSchema,"Takes");


var app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, "../public")));
app.use('/Images', express.static(path.join(__dirname, "../Images")));

app.post('/projectdelete', (req, res) => {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new projects(req.body);
        projects.findOneAndDelete({name:req.body.name}).then(item => {
        res.send("project deleted");
        })
        .catch(err => {
        res.status(400).send("Unable to delete project");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/peopledelete', (req, res) => {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new projects(req.body);
        people.findOneAndDelete({"name":req.body.name,"post":req.body.post}).then(item => {
        res.send("person deleted");
        })
        .catch(err => {
        res.status(400).send("Unable to delete person");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

app.post('/coursedelete', (req, res) => {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new projects(req.body);
        courses.findOneAndDelete({"course_name":req.body.course_name}).then(item => {
        res.send("course deleted");
        })
        .catch(err => {
        res.status(400).send("Unable to delete course");
        });
        }
        catch (error) {
            res.status(400).send('Error: Admin Login not detected.');
        }
});

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

app.post('/login_admin', (req, res) => {
    SignUp.find({"email":req.body.email,"password":req.body.password,"admin":true}).then((User) => {
        console.log(User)
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
    SignUp.find({email:req.body.email},{password:req.body.password}).then((User) => {
        console.log(User)
        res.redirect('/');
    }).catch((error)=>{
        res.json({
            error: "Account not found!"  
        }).status(400);
    })
});

app.post('/callForCoursesInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new Courses(req.body);
        myData.save()
        .then(item => {
        res.send("Course added");
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

app.post('/callForPaperInput', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new callForPaper(req.body);
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

app.post('/tutorials', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new tutorial(req.body);
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

app.post('/participate', function (req, res) {
    var myData = new participate(req.body);
    myData.save()
    .then(item => {
    res.send("Signup successful");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
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

app.post('/courses', function (req, res) {
    try {
        console.log(token);
        const decoded = verifyToken(token);
        console.log('Decoded:', decoded);
        var myData = new courses(req.body);
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

app.get('/tutorials', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    tutorial.find().then(( allTutorials) => {
        console.log(allTutorials)
        res.status(200).json(allTutorials)
    }).catch((e)=>{
        console.log("Unable to load tutorials!")
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

app.get('/workshop', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    workshop.find().then(( allWorkshops) => {
        console.log(allWorkshops)
        res.status(200).json(allWorkshops)
    }).catch((e)=>{
        console.log("Unable to load workshop!")
        res.status(400).send(e)
    })
});

app.delete('/projects/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    projects.findOneAndDelete({name: req.body.name}).then((jt)=>{
        console.log("Done it!")
        res.send("DELTED SUCCESSFULLY")
    }).catch((e)=>{console.log(e)});
});

app.delete('/courses/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    courses.findOneAndDelete({course_name: req.body.name}).then((jt)=>{
        console.log("Done it!")
        res.send("DELTED SUCCESSFULLY")
    }).catch((e)=>{console.log(e)});
});

app.delete('/people/delete', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    people.findOneAndDelete({name: req.body.name}).then((jt)=>{
        console.log("Done it!")
        res.send("DELTED SUCCESSFULLY")
    }).catch((e)=>{console.log(e)});
});

app.listen(port, () => console.log(`This app is listening on port ${port}`));