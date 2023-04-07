var fetchModel= require('model');
module.exports={
 
    fetchData:function(req, res){
      
      fetchModel.fetchData(function(data){
          res.render('Papers',{userData:data});
          console.log("hi");
      })
    }
}