var bool1=false;var bool2=false;
function match_email(){
    var username=document.getElementById("exampleInputEmail1");
    if(username.value.length==0){
        document.getElementById('exampleInputEmail1').style.border='1px solid gray';
        bool1=false;
        return;
    }
    if(username.value.length<13||username.value.substr(-12)!='@iiita.ac.in'){document.getElementById('exampleInputEmail1').style.border='2px solid red'; document.getElementById('submitbtn').disabled=true;bool1=false;}
    else{ document.getElementById('exampleInputEmail1').style.border='1px solid gray';
    bool1=true;}
}

function match_password(){
    var username=document.getElementById("exampleInputPassword1");
    if(username.value.length==0){
        document.getElementById('exampleInputPassword1').style.border='1px solid gray';
        bool2=false;
        return;
    }
    if(username.value.length<8||username.value.length>20){
        bool2=false;
        document.getElementById('exampleInputPassword1').style.border='2px solid red';}
    else{
        bool2=true;
        document.getElementById('exampleInputPassword1').style.border='1px solid gray';
    }
}

function both_true(){
    if(bool1&&bool2){
        document.getElementById('submitbtn').disabled=false;
    }else{
        document.getElementById('submitbtn').disabled=true;
    }
}
window.addEventListener("pageshow",function(){
    document.getElementById("exampleInputEmail1").value="";
    document.getElementById("exampleInputPassword1").value="";
})

setInterval(both_true,300);
setInterval(match_email,300);
setInterval(match_password,300);