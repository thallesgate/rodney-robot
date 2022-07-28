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

/*slider _ Sobre*/

var prev = document.getElementById('prev');
var next = document.getElementById('next');
var slider = document.getElementById('slider');
var total = 0, step = 100;

prev.addEventListener('click', slide);
next.addEventListener('click', slide);

function slide()
{
  if(this.getAttribute('id') == 'prev')
  {
    if(total == 0)
    {
      total = -400;
      slider.style.left = total + '%';
    }
    else
    {
      total += step;
      slider.style.left = total + '%';
    }
  }
  else
  {
    if(total == -400)
    {
      total = 0;
      slider.style.left = total;
    }
    else
    {
      total -= step;
      slider.style.left = total + '%';
    }
  }
}


