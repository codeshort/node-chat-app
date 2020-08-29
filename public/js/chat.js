const socket= io()
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton= document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//option
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true})
const autoscroll = () => {
  //new message Elemnet
  const $newMessage =$messages.lastElementChild

  //Height of the new messages
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin= parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //veisible Height
  const visibleHeight = $messages.offsetHeight
  const containerHeight = $messages.scrollHeight

  //how far I have scrolled;
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight-newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
  console.log(newMessageMargin)
}

socket.on('message',(message)=>{
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

socket.on('locationMessage',(url)=>{
  console.log(url)
  const html = Mustache.render(locationMessageTemplate,{
    username: url.username,
    url:url.url,
    createdAt:moment(url.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  })

socket.on('roomData' ,({room, users}) =>{
const html = Mustache.render(sidebarTemplate,{
  room,
  users
  })
document.querySelector('#sidebar').innerHTML = html
autoscroll()
})

$messageForm.addEventListener('submit',(e) =>{
  e.preventDefault()
  const message = e.target.elements.message.value
  //disable
  $messageFormButton.setAttribute('disabled','disabled')

  socket.emit('sendMessage',message, (error)=>{

    //enable
    console.log(message)
   $messageFormButton.removeAttribute('disabled')
   $messageFormInput.value =''
   $messageFormInput.focus()

   if(error)
   {
     return console.log(error)
   }
   console.log('message delieverd')
  })
})

$sendLocationButton.addEventListener('click',() =>{
  if(!navigator.geolocation)
  {
    return alert('geolocation is not supoorted by your browser')
  }

 $sendLocationButton.setAttribute('disabled','disabled')
  navigator.geolocation.getCurrentPosition((position)=>{

    socket.emit('sendLocation',{
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      console.log('Location is shared')
      $sendLocationButton.removeAttribute('disabled')
    })

  })
})

socket.emit('join',{username,room} , (error) =>{
  if(error)
  {
    alert(error)
    location.href ='/'
  }
})
