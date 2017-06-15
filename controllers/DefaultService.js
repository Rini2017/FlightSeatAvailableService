'use strict';

exports.getSeatAvaliblity = function(args, res, next) {
  /**
   * gets the seat availability based on Source,Destination and Date
   * By passing the source and destination,seat availibility will be fetched. 
   *
   * date String Date
   * source String Origin Airport code
   * destination String Destination Airport code
   * returns inline_response_200
   **/
  
var myJSON = JSON.stringify(args);
var parsedResponse = JSON.parse(myJSON);
console.log("Args",parsedResponse);

var source= parsedResponse["Source"]["value"];
var dest= parsedResponse["Destination"]["value"];
      
console.log("Args.source",source);
console.log("Args.dest",dest);
var examples = {};
  
  var response ='';
  var extServerOptionsGet = {
    host: 'api.mlab.com',
    port: '443',
    path: `/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AvailableSeatsByRoute?q={"SeatAvailability.SourceAirport":"${source}","SeatAvailability.DestinationAirport":"${dest}"}&apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};
console.log(extServerOptionsGet);
var http = require('https');
var reqGet = http.request(extServerOptionsGet, function (resparam) {
        resparam.on('data', function (data) {
               response = JSON.parse(data.toString());
               
                        console.log(data.toString());
                        console.log('response received');
                        console.log(response);
                });
             resparam.on('end', function() {
                   console.log('response @ end received');
                console.log(response);
                //res.end(JSON.stringify(response));  
                if (Object.keys(response).length > 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response[Object.keys(response)[0]] || {}, null, 2));
                  } else {
                    res.end();
                  }
 
                 
             } );
                
            // res.end(JSON.stringify(response));  
        });
        
         
        
        
    /*res.on('end', function() {
      console.log(response);
      var responseObject = JSON.parse(response);
      success(responseObject);
    });*/
   /* if (response.length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response[Object.keys(response)[0]]  || {}, null, 2));
  } else {
    res.end();
  }*/
 
 
        
reqGet.end();
reqGet.on('error', function (e) {
    console.error(e);
});

   console.log(" out response");
    console.log(response);
  examples['application/json'] = {
  "Dest" : "aeiou",
  "Seat" : [ {
    "inventoryDetail" : [ {
      "InventoryCount" : "aeiou",
      "COS" : "aeiou"
    } ],
    "RouteId" : "aeiou"
  } ],
  "SourceAirport" : "aeiou",
  "DestinationAirport" : "aeiou",
  "Source" : "aeiou"
};
  /*if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
 */
 
}

exports.updateSeatInventory = function(args, res, next) {
  /**
   * updates the seat inventory after seat booking
   * By passing the Date,RouteId, class, NoOfSoldSeat,seat inventory will be updated. 
   *
   * date String Date
   * routeId String Route Id for which seat is booked
   * _class String Class Of Service
   * noOfSoldSeat String No Of Seat Sold
   * returns String
   **/
  var http = require('https');
  var Client = require('node-rest-client').Client;
  var myJSON = JSON.stringify(args);
  var parsedResponse = JSON.parse(myJSON);
  console.log(parsedResponse);
 
 var routeId =  parsedResponse["RouteId"]["value"];
 var classOfService = parsedResponse["Class"]["value"];
 var noOfSeats = parsedResponse["NoOfSeats"]["value"];
 var sourceAirport = parsedResponse["sourceAirport"]["value"];
 var destAirport = parsedResponse["destAirport"]["value"];
 var typeOfBooking = parsedResponse["TypeofBooking"]["value"];
 var documentID = "";
 var jsonResponse = "";
 var errorResponse = "";
 
 console.log("routeId-->"+routeId+" classOfService-->"+classOfService+" noOfSeats-->"+noOfSeats+" sourceAirport-->"+sourceAirport+" destAirport-->"+destAirport);
 
 var extServerOptionsGet = {
    host: 'api.mlab.com',
    port: '443',
    path: `/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AvailableSeatsByRoute?q={"SeatAvailability.SourceAirport":"${sourceAirport}","SeatAvailability.DestinationAirport":"${destAirport}"}&fo=true&apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`,
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
};

//Http call to GET with input parameters to check if the data exists in the database
var reqGet = http.request(extServerOptionsGet, function (resGet) {
    console.log("Inside get method to retrieve document details of update");
        resGet.on('data', function (data) {
                jsonResponse = JSON.parse(data.toString());
                if(jsonResponse){
                    documentID = jsonResponse._id.$oid;
                    console.log("Document ID -->"+jsonResponse._id.$oid);
                    console.log("Feteched the document");
                    console.log("Document retrieved "+data.toString());
                    console.log("Document retrieved "+jsonResponse.SeatAvailability.DestinationAirport );
                    
                    var result = false;
                    
                    if(noOfSeats === 0 || noOfSeats < 0){
                        res.end("No Seats should be greater than 0 to book or cancel the seats");
                        return false;
                    }
                    
                    for ( var i = 0; i < jsonResponse.SeatAvailability.Seat.length; i++) {
                        var obj = jsonResponse.SeatAvailability.Seat[i];
                        
                        if(obj.RouteId === routeId){
                            console.log("Route ID matched -->"+obj.RouteId);
                            for ( var j = 0; j < obj.inventoryDetail.length; j++) {
                                var objInternal = obj.inventoryDetail[j];
                                
                                if(objInternal.COS === classOfService){
                                    console.log("Class of service also matched and number of seats avilable is -->"+objInternal.InventoryCount);
                                    
                                    var noOfSeatsAvil = parseInt(objInternal.InventoryCount);
                                    
                                    if(noOfSeatsAvil !== "NaN"){
                                        if(noOfSeatsAvil > 0 && "Book" === typeOfBooking){
                                            if(noOfSeatsAvil > parseInt(noOfSeats)){
                                                noOfSeatsAvil = noOfSeatsAvil - parseInt(noOfSeats);
                                                result = true;
                                                errorResponse = "Successfully Booked the tickets";
                                            }else{
                                                result = false;
                                                errorResponse = "Number of Seats to book should be less then the avilable seats";
                                            }
                                        }else if(noOfSeatsAvil >= 0 && "Cancel" === typeOfBooking){
                                            noOfSeatsAvil = noOfSeatsAvil + parseInt(noOfSeats);
                                            result = true;
                                            errorResponse = "Successfully Canclled the tickets";
                                        }else{
                                            res.end("Error while Booking or Cancelling the tickets no Seats avilable to book/cancel");
                                            errorResponse = "Error while Booking or Cancelling the tickets no Seats avilable to book/cancel";
                                        }
                                        console.log("No of seats updated for the Route ID-->"+routeId+" And Seats Avilable -->"+noOfSeatsAvil);
                                        objInternal.InventoryCount = noOfSeatsAvil;
                                    }
                                }
                            }
                        }
                    }
                    
                    for ( var i = 0; i < jsonResponse.SeatAvailability.Seat.length; i++) {
                        var obj = jsonResponse.SeatAvailability.Seat[i];
                        
                        if(obj.RouteId === routeId){
                            for ( var j = 0; j < obj.inventoryDetail.length; j++) {
                                var objInternal = obj.inventoryDetail[j];
                                
                                if(objInternal.COS === classOfService){
                                    
                                    var noOfSeatsAvil = parseInt(objInternal.InventoryCount);
                                    
                                    console.log("No of seats avilable after update-->"+noOfSeatsAvil);
                                }
                            }
                        }
                    }
                    
                    if(result){
                        if("Book" === typeOfBooking){
                            console.log("Successfully updated the inventory count to json of Booked status");
                        }else if("Cancel" === typeOfBooking){
                            console.log("Successfully updated the inventory count to json of Canclled status");
                        }
                    }else{
                        res.end("Error in the execution");
                    }
                    
                     if(result){
                         console.log("Calling post function to write document to DB");
                         errorResponse = "Book/Cancel of Ticket is Success";
                         requestPost();
                     }else{
                         res.end("Error in the execution");
                         errorResponse = "Error in the execution";
                     }
                }else{
                 res.end("Document does not exists for route "+sourceAirport+" to "+destAirport);
                }
            });
        });                                                 
reqGet.end();
reqGet.on('error', function (e) {
    console.error(e);
});

var requestPost = function(){
    var extServerOptionsPost = {
        host: 'api.mlab.com',
        port: '443',
        path: '/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AvailableSeatsByRoute?apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i',
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
      };
     var post= http.request(extServerOptionsPost, function (resPost) {
        
        resPost.on('data', function (data) {
            console.log("POST"+data.toString());
            //res.setHeader('Content-Type', 'application/json');
            //var newJson = JSON.parse(data);
            //res.end(JSON.stringify(newJson));
            
            console.log("Response String-->"+errorResponse);
            
            if("Book" === typeOfBooking){
                //res.setHeader('Content-Type', 'application/json');
                res.end("Successfully Booked the ticket for Route ID-->"+routeId);
            }else if("Cancel" === typeOfBooking){
                //res.setHeader('Content-Type', 'application/json');
                res.end("Successfully Canclled the ticket for Route ID-->"+routeId);
                console.log("Sent success Canclled response");
            }

        });
        
    });
    
    post.write(JSON.stringify(jsonResponse));
    post.end();
    post.on('error', function (e) {
        console.error(e);
    });
}

}