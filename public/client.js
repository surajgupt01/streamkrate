var socket = io()


var email = document.querySelector('.email')
var Remail = document.querySelector('.Remail')
var share = document.querySelector('#share')


let heading = document.createElement('h1')
let body = document.querySelector('body')



socket.on('name' , (name)=>{
    const user = document.querySelector('.User')
    if(user.innerText ==  ''){
    user.innerText += ` Hey ${name}`
    }
})


document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
   let load = document.querySelector('.loader')
   let loadText = document.querySelector('.load-text')
   let overlay = document.querySelector('.overlay')
   let body = document.querySelector('body')
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
      try {
        // Request a pre-signed URL from the server
        const response = await fetch(`/generate?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
        const { url } = await response.json();
        
        // Upload the file directly to S3 using the pre-signed URL
        load.style.display = 'flex';
        loadText.style.display = 'block';
        overlay.style.display = 'block';
        
        const uploadResponse = await fetch(`${url}`, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed.');
         
        }

        // Notify the user of success
        alert('File uploaded successfully!');
        load.style.display = 'none';
        overlay.style.display = 'none';
        loadText.style.display = 'none';
        
      } catch (error) {
        console.error('There was a problem with the upload operation:', error);
        alert('Error uploading file.');
      }
    } else {
      alert('No file selected.');
    }

   
  });



share.addEventListener('click' , async(e)=>{
  const fileName = document.getElementById('fileInput').value;
  if (fileName) {
    try {
      // Request a pre-signed URL from the server
      const response = await fetch(`/generate-download-url?fileName=${encodeURIComponent(fileName)}`);
      const { url } = await response.json();
     
      if (url) {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.textContent = 'Download File';
        downloadLink.style.display = 'inline'; // Show the link
      //   downloadLink.click()

      Sender = email.value 
      Rec = Remail.value 
      download = downloadLink.href
      console.log(download)
      console.log(Sender , " " , Rec)
      socket.emit('shareFile',{Sender , Rec , download})
      } else {
        alert('Failed to get download link.');
      }
    } catch (error) {
      console.error('There was a problem with the download operation:', error);
      alert('Error getting download link.');
    }
  }

   
})

socket.on('shareFile' , ({Sender,download})=>{
  let downloads =  document.querySelector('.link')
  // let button = document.querySelector('.Download')
  // button.style.display = 'flex'
  // button.style.backgroundColor  = "green"
  let box = document.createElement('div')
  box.className = 'receiver-mssg'
  // box.appendChild(downloads)
  alert(`${Sender} is sharing a file`)
   downloads.href = download
   downloads.click()
    
    
    // downloads.innerText =' Download File'
    // body.appendChild(downloads)
    
   

})









  
