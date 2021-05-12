var addTodo=document.getElementById("addTodo")
var inputText=document.getElementById("addInput")
var listTodo=document.getElementById(`listTodo`)

addTodo.addEventListener("click",function(){
    var todoText=inputText.value
    inputText.value=""

    var todo=document.createElement("DIV") 
    todo.classList.add("alert","alert-primary")
    todo.innerHTML=todoText+" "
    //add button remove
    var removeBtn=document.createElement("BUTTON")
    removeBtn.classList.add("btn","btn-danger")
    removeBtn.innerHTML="Remove"
    
    removeBtn.addEventListener("click",function(){
        todo.parentNode.removeChild(todo)
    })

    todo.append(removeBtn)
    listTodo.append(todo)
})