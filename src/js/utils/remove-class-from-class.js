function removeClassFromClass(groupClass,badClass) {
  var things = document.querySelectorAll("." + groupClass);
  for(i=0;i<things.length;i++) {
    var thing = things[i];
    thing.classList.remove(badClass);
  }
}
module.exports=removeClassFromClass;
