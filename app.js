
document.ready(function(){
  
  function displayTime() {

    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();
    
    //for 12hour clock, define a variable meridiem and default to ante meridiem (AM) 
    var meridiem = " AM";
    
    //since this is a 12 hour clock, once hours increase past 11, i.e., 12 -23, subtract 12 and set the meridiem
    //variable to post meridiem (PM) 
    if (hours>11){
      hours = hours - 12;
      meridiem = " PM";
    }
    
    //at 12PM, the above if statement is set to subtract 12, making the hours read 0. 
    //create a statement that sets the hours back to 12 whenever it's 0.
    if (hours === 0){
      hours = 12;
    }
    
    //keep hours, seconds, and minutes at two digits all the time by adding a 0.
    if (hours<10){
      hours = "0" + hours;
    }
 
    if (minutes<10){
      minutes = "0" + minutes;
    }
    
    if (seconds<10){
      seconds = "0" + seconds;
    }
    
    //jquery to change text of clockDiv html element
    ("#clockDiv").text(hours +":"+ minutes +":"+ seconds + meridiem);
    
    //could also write this with vanilla JS as follows
    //var clock = document.getElesmentById('clockDiv');
   //clock.innerText = hours +":"+ minutes +":"+ seconds + meridiem;
    
  }
  //run displayTime function
  displayTime();
  //set interval to 1000ms (1s), so that info updates every second
  setInterval(displayTime, 1000);
});
