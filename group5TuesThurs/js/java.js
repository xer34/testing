$(document).ready(function() {
  $("#successful").hide();
  $("#actorDump").hide();
  $("#reset").hide();
  $("#rotate").hide();
});

function reset() {
  $("#successful").hide();
  $("#actorDump").empty();
  $("#picDump").empty();
  $("#reset").hide();
  $("#fileButton").show();
  $("#uploader").show();
  $("#add-image").show();
}

function hideStuff() {
  $("#successful").hide();
  $("#actorDump").hide();
  $("#reset").hide();
}

//--------------------------------------------------------------------//
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBGjGVTi6NmmYBLwWLfetJ7nYEg7wbBls0",
  authDomain: "celebdata-248e0.firebaseapp.com",
  databaseURL: "https://celebdata-248e0.firebaseio.com",
  projectId: "celebdata-248e0",
  storageBucket: "celebdata-248e0.appspot.com",
  messagingSenderId: "371108570955"
};

firebase.initializeApp(config);
//--------------------------------------------------------------------//
const database = firebase.database();

//get elements
var uploader = document.getElementById("uploader");
var fileButton = document.getElementById("fileButton");

// on click, hide the placeholder image,
$("input[type='image']").click(function() {
  $("input[id='fileButton']").click();
  $("#add-image").hide();
  $("#rotate").show();
});
// display rotate gif,
//set timeout for a few seconds,
//then run firebase function

//listen for file selection
var uploadBar = fileButton.addEventListener("change", function(event) {
  $("#add-image").hide();
  //get file
  var file = event.target.files[0];
  //create storage ref
  var storageRef = firebase.storage().ref("celebImages/" + file.name);
  // upload file
  var task = storageRef.put(file);
  // upload progress bar

  task.on(
    "state_changed",
    // upload bar progress
    function progress(snapshot) {
      var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      uploader.value = percentage;
    },

    function error(err) {},
    //when the file is uploaded and the progress bar gets to 100% --
    function complete() {
      //get a snapshot of the download URL
      task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        //log it
        console.log("File available at", downloadURL);
        //initialize the API
        const app = new Clarifai.App({
          apiKey: "724ce3bc62704899808fc73f196edc8a"
        });
        app.models
          .predict("e466caa0619f444ab97497640cefc4dc", downloadURL)
          .then(
            function(response) {
              console.log(response);

              // Creating and storing a div tag
              var celebDiv = $("<div>");

              // Creating and storing an image tag
              var celebImg = $("<img class='celebPic'>");
              var celebText = $("<p class='celebtext'>").text(
                "We are " +
                  (
                    response.outputs[0].data.regions[0].data.face.identity
                      .concepts[0].value * 100
                  ).toFixed(1) +
                  "% sure it's " +
                  response.outputs[0].data.regions[0].data.face.identity
                    .concepts[0].name
              );
              //push the name to the DB
              database.ref().push({
                name:
                  response.outputs[0].data.regions[0].data.face.identity
                    .concepts[0].name
              });

              // Setting the src attribute of the image to a property pulled off the result item
              celebImg.attr("src", downloadURL);

              // Appending the paragraph and image tag to the div
              celebDiv.append(celebText);
              celebDiv.prepend(celebImg);

              $("#successful").hide();
              $("#rotate").hide()
              $("#reset").show();
              // Prependng the div to the HTML page in the
              $("#picDump").prepend(celebDiv);
              $("#celebButton").append(celebDiv);
            },
            function(err) {
              // there was an error
            }
          );
      });
    }
  );

  if ((percentage = 100)) {
    $("#uploader").hide();
    $("#fileButton").hide();
    $("#successful").show();
    uploader.value = 0;
  }
});
