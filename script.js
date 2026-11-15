(function(){
  var apps=[["Social feed",1],["Video app",1],["Games",1],["Messaging",1],["Phone calls",0],["Notes",0]];
  var list=document.getElementById("apps"),clock=document.getElementById("clock"),state=document.getElementById("state"),
      bar=document.getElementById("bar"),go=document.getElementById("go"),chips=[].slice.call(document.querySelectorAll(".chip"));
  var C=326.7,total=1500,left=1500,t=null;
  function pad(n){return n<10?"0"+n:""+n}
  function show(){clock.textContent=pad(Math.floor(left/60))+":"+pad(Math.round(left%60));bar.style.strokeDashoffset=C*(1-left/total)}
  function paint(on){
    list.innerHTML="";
    apps.forEach(function(a){
      var li=document.createElement("li"),n=document.createElement("span"),s=document.createElement("span");
      n.textContent=a[0];s.className="st";
      if(a[1]){s.textContent=on?"Locked":"Available";if(on)li.className="locked"}
      else{s.textContent="Always open";li.className="open"}
      li.appendChild(n);li.appendChild(s);list.appendChild(li);
    });
  }
  function setLen(m){total=Math.round(m*60);left=total;show()}
  chips.forEach(function(c){c.addEventListener("click",function(){
    chips.forEach(function(x){x.setAttribute("aria-pressed","false")});
    c.setAttribute("aria-pressed","true");setLen(parseFloat(c.dataset.min));
  })});
  function stop(msg){clearInterval(t);t=null;go.textContent="Start focus session";state.textContent=msg;
    chips.forEach(function(c){c.disabled=false});paint(false)}
  go.addEventListener("click",function(){
    if(t){stop("Ended early");left=total;show();return}
    if(left<=0)left=total;
    state.textContent="Focusing";go.textContent="End demo";
    chips.forEach(function(c){c.disabled=true});paint(true);
    t=setInterval(function(){left--;show();if(left<=0){stop("Session complete");left=total;}},1000);
  });
  paint(false);show();
})();

(function(){
  var f=document.getElementById("join-form"); if(!f) return;
  var msg=document.getElementById("form-msg"), btn=f.querySelector("button");
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var email=f.email.value.trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg.textContent="Please enter a valid email address.";f.email.focus();return}
    btn.disabled=true; msg.textContent="Sending…";
    fetch(f.action,{method:"POST",body:new FormData(f),headers:{"Accept":"application/json"}})
      .then(function(r){return r.json()})
      .then(function(d){msg.textContent=d.message||"Something went wrong."; if(d.ok)f.reset()})
      .catch(function(){msg.textContent="Couldn’t reach the server. Please try again."})
      .then(function(){btn.disabled=false});
  });
})();
