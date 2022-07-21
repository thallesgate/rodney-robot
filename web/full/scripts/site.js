/* Menu Navbar: Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

function showConfigMenu(){
  document.getElementById("myDropdown").classList.toggle("show");
}
/*
window.onclick = function(event){
  if(!event.target.matches('.dropbtn')){
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for(i=0;i<dropdowns.length;i++){
      var openDropdown = dropdowns[i];
      if(openDropdown.classList.contains('show')){
        openDropdown.classList.remove('show');
      }
    }
  }
}
*/


